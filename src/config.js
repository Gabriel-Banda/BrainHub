/* ============================================================
   BrainHub — Central Configuration
   ONE place for all URLs, keys, and feature flags.
   Import this file before any other src/ script.
   ============================================================ */

window.BrainHubConfig = {

  // ── App ───────────────────────────────────────────────────
  app: {
    name:    'BrainHub',
    version: '4.1.0',
    url:     'https://brainhub.pages.dev',
    tagline: 'Free study resources for Zambian university students',
  },

  // ── Supabase ──────────────────────────────────────────────
  supabase: {
    url:     'https://pdkslovwbbytfexguteo.supabase.co',
    anonKey: 'sb_publishable_klXl7mVNAefz2aC-UfCQ2w_E0r7PP1h',
  },

  // ── Cloudflare Workers ────────────────────────────────────
  workers: {
    ai:   'https://brainhub-ai.gabrieljoshuabanda81.workers.dev',
    docs: 'https://brainhub-docs.gabrieljoshuabanda81.workers.dev',
  },

  // ── Storage ───────────────────────────────────────────────
  storage: {
    r2Public: 'https://pub-77e8c9a874374a75b212f4fc51d1d859.r2.dev',
  },

  // ── Third-party ───────────────────────────────────────────
  thirdParty: {
    formspree: 'https://formspree.io/f/xzdazvwz',
    vapidPublic: 'BNfPyqxX4bPh_ZW49oFHv4KmF2z8Ad6xalQ_P7Wsm8G_lXiStqCTqJSV8DHdoBpNlJnmqku8me-ZPCrFKEFgDgM',
  },

  // ── Feature flags ─────────────────────────────────────────
  // Set false to disable a feature site-wide without deleting code
  features: {
    gamification:  true,
    aiChatbot:     true,
    discussions:   true,
    pushNotifs:    true,
    offlineCache:  true,
    analytics:     false,   // flip to true when GA/Plausible is set up
    studyGroups:   false,   // coming soon
    lecturerPortal:false,   // coming soon
  },

  // ── Contact ───────────────────────────────────────────────
  contact: {
    email: 'gabrieljoshuabanda81@gmail.com',
    github: 'https://github.com/Gabriel-Banda/BrainHub',
  },

};
