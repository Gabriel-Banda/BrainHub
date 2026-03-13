// BrainHub Service Worker v2.0
// Handles offline caching for PWA support
// IMPORTANT: Bump CACHE_VERSION on every deploy to force cache refresh

const CACHE_VERSION  = 'v2';
const CACHE_NAME     = `brainhub-${CACHE_VERSION}`;
const STATIC_CACHE   = `brainhub-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE  = `brainhub-dynamic-${CACHE_VERSION}`;

// Files to cache immediately on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/style.css',
  '/src/additions.css',
  '/src/main.js',
  '/manifest.json',
  '/public/assets/images/favicon.png',
  '/pages/universities.html',
  '/pages/flashcards.html',
  '/pages/quizzes.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/privacy-policy.html',
  '/pages/terms.html',
  '/pages/universities/cbu.html',
  '/pages/universities/cbu/programs/natural-sciences.html',
  '/404.html',
  // External fonts and icons (cached on first load)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Failed to cache some static assets:', err))
  );
});

// ── Activate — wipe ALL old caches on version bump ───────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !key.includes(CACHE_VERSION))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ────────────────────────────────────────
// - Static assets: Cache first, then network
// - API calls (Anthropic, Formspree): Network only
// - Everything else: Network first, fallback to cache, then offline page

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and Worker calls — always use network
  if (
    url.hostname === 'api.anthropic.com' ||
    url.hostname === 'formspree.io' ||
    url.hostname === 'embed.tawk.to' ||
    url.hostname === 'brainhub-docs.gabrieljoshuabanda81.workers.dev' ||
    url.pathname.includes('/v1/messages')
  ) {
    return; // let browser handle normally
  }

  // JS and CSS — network first so users always get latest code
  // Falls back to cache only when offline
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Other static assets (images, fonts, icons) — cache first is fine
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages — network first, fallback to cache, then 404
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Everything else — stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ── Caching Strategies ────────────────────────────────────

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
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
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
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback to cached index for SPA-like navigation
    const fallback = await caches.match('/index.html');
    return fallback || await caches.match('/404.html') || new Response('<h1>Offline</h1><p>Please check your connection.</p>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ── Helpers ───────────────────────────────────────────────

function isStaticAsset(url) {
  return (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdnjs.cloudflare.com'
  );
}

// ── Background Sync (future: bookmark sync) ───────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});