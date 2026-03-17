// BrainHub Service Worker v4.0
const CACHE_NAME     = 'brainhub-v4';
const STATIC_CACHE   = 'brainhub-static-v4';
const DYNAMIC_CACHE  = 'brainhub-dynamic-v4';
const DOC_CACHE      = 'brainhub-docs-v2';
const MAX_CACHED_DOCS = 20;

// App shell — HTML + images only. JS/CSS always fetched fresh.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/public/assets/images/favicon.png',
  '/404.html',
];

// ── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Cache install error:', err))
  );
});

// ── Activate — delete ALL old caches ─────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== DOC_CACHE)
          .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Never cache: API calls, Supabase, worker endpoints
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('workers.dev') ||
    url.hostname === 'api.anthropic.com' ||
    url.hostname === 'formspree.io' ||
    url.pathname.includes('/v1/messages') ||
    url.pathname.includes('/auth/')
  ) return;

  // JS and CSS — always network first, update cache in background
  // This ensures code changes are always picked up immediately
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(networkFirstUpdateCache(request));
    return;
  }

  // Worker doc requests — serve from doc cache when offline
  if (url.hostname.includes('workers.dev') && url.pathname === '/doc') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache  = await caches.open(DOC_CACHE);
        const cached = await cache.match(request.url);
        return cached || new Response(
          '<h2 style="font-family:sans-serif;padding:2rem">Not available offline.</h2>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // Images + fonts — cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML — network first
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// ── Strategies ────────────────────────────────────────────
async function networkFirstUpdateCache(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return await cache.match(request) || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return await caches.match(request) ||
           await caches.match('/index.html') ||
           await caches.match('/404.html') ||
           new Response('<h1>Offline</h1>', { status: 503, headers: { 'Content-Type': 'text/html' } });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  const fetchP = fetch(request).then(r => { if (r.ok) cache.put(request, r.clone()); return r; }).catch(() => cached);
  return cached || fetchP;
}

function isStaticAsset(url) {
  return (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2|gif|webp)$/) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdnjs.cloudflare.com'
  );
}

// ── Messages ──────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SKIP_WAITING') { self.skipWaiting(); return; }

  if (event.data?.type === 'CACHE_DOCUMENT') {
    const { url, title } = event.data;
    try {
      const cache = await caches.open(DOC_CACHE);
      const keys  = await cache.keys();
      if (keys.length >= MAX_CACHED_DOCS) await cache.delete(keys[0]);
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        event.source?.postMessage({ type: 'DOC_CACHED', url, title, success: true });
      }
    } catch { event.source?.postMessage({ type: 'DOC_CACHED', url, title, success: false }); }
    return;
  }

  if (event.data?.type === 'REMOVE_CACHED_DOCUMENT') {
    const cache = await caches.open(DOC_CACHE);
    await cache.delete(event.data.url);
    event.source?.postMessage({ type: 'DOC_REMOVED', url: event.data.url });
    return;
  }

  if (event.data?.type === 'GET_CACHED_DOCS') {
    const cache = await caches.open(DOC_CACHE);
    const keys  = (await cache.keys()).map(r => r.url).filter(u => !u.includes('__meta__'));
    event.source?.postMessage({ type: 'CACHED_DOCS_LIST', docs: keys });
    return;
  }
});

// ── Push Notifications ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: 'BrainHub', body: event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'BrainHub', {
    body:    data.body || 'New update from BrainHub',
    icon:    '/public/assets/images/favicon.png',
    badge:   '/public/assets/images/favicon.png',
    tag:     data.tag || 'brainhub-notif',
    data:    { url: data.url || '/' },
    actions: [{ action: 'view', title: '📖 View' }, { action: 'dismiss', title: '✕ Dismiss' }],
    vibrate: [100, 50, 100],
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) { c.navigate(url); return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});