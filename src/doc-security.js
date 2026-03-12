/* ============================================================
   BrainHub — Document Security Client 
   ============================================================ */

(function () {
  const WORKER = 'https://brainhub-docs.gabrieljoshuabanda81.workers.dev';
  const R2_HOST = 'pub-77e8c9a874374a75b212f4fc51d1d859.r2.dev';
  // ── Token cache ───────────────────────────────────────
  let _tokenPromise = null;

  async function getToken() {
    // Only fetch once per page load — reuse the same promise
    if (!_tokenPromise) {
      _tokenPromise = _fetchToken();
    }
    return _tokenPromise;
  }

  async function _fetchToken() {
    // Check sessionStorage first
    const cached = sessionStorage.getItem('bh-doc-token');
    if (cached) {
      try {
        const ts = parseInt(atob(cached).split('.')[0]);
        // Refresh if more than 1h45m old (token lasts 2h)
        if (Date.now() - ts < 105 * 60 * 1000) return cached;
      } catch {}
    }

    try {
      const res  = await fetch(`${WORKER}/token`);
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem('bh-doc-token', data.token);
        return data.token;
      }
    } catch (e) {
      console.warn('[BrainHub Docs] Token fetch failed:', e.message);
    }
    return null;
  }

  // ── Extract the bucket key from a full R2 URL ─────────

  function urlToKey(r2Url) {
    try {
      const u = new URL(r2Url);
      if (u.hostname !== R2_HOST) return null;
      // Remove leading slash, decode percent-encoding
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    } catch { return null; }
  }

  // ── Build secure URLs ─────────────────────────────────
  // readUrl   → opens inline in the PDF viewer
  // dlUrl     → forces browser download
  async function secureReadUrl(r2Url) {
    const key   = urlToKey(r2Url);
    const token = await getToken();
    if (!key || !token) return r2Url; // fallback
    return `${WORKER}/doc?key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`;
  }

  async function secureDownloadUrl(r2Url) {
    const key   = urlToKey(r2Url);
    const token = await getToken();
    if (!key || !token) return r2Url; // fallback
    return `${WORKER}/download?key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`;
  }

  // ── Public API used by main.js ────────────────────────
  window.BrainHubDocs = {
    secureReadUrl,
    secureDownloadUrl,
    getToken,
    urlToKey,
    WORKER,
  };

  // Warm up the token as soon as the page loads
  document.addEventListener('DOMContentLoaded', getToken);

})();