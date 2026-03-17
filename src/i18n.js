/* ============================================================
   BrainHub — i18n (Internationalisation) Engine
   Supports: English, Français, Ichibemba, Chinyanja, Chitonga
   ============================================================

   HOW TO USE ON ANY PAGE:
   1. Add data-i18n="key" to any element whose text should translate
      e.g. <span data-i18n="nav_home">Home</span>
   2. Add data-i18n-placeholder="key" for input placeholders
   3. Add data-i18n-title="key" for title attributes
   The engine finds all these elements and swaps text on language change.
   ============================================================ */

(function() {
  'use strict';

  const LANGS = ['en', 'fr', 'bem', 'nya', 'toi'];
  const LANG_META = {
    en:  { name: 'English',    flag: '🇬🇧', nativeName: 'English'    },
    fr:  { name: 'French',     flag: '🇫🇷', nativeName: 'Français'   },
    bem: { name: 'Bemba',      flag: '🇿🇲', nativeName: 'Ichibemba'  },
    nya: { name: 'Nyanja',     flag: '🇿🇲', nativeName: 'Chinyanja'  },
    toi: { name: 'Tonga',      flag: '🇿🇲', nativeName: 'Chitonga'   },
  };

  let translations = {};
  let currentLang  = localStorage.getItem('brainhub-lang') || 'en';

  // ── Load a language file ─────────────────────────────────
  async function loadLang(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const base = getBasePath();
      const res  = await fetch(`${base}/i18n/${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      translations[lang] = await res.json();
      return translations[lang];
    } catch (e) {
      console.warn(`[BrainHub i18n] Could not load ${lang}:`, e);
      return null;
    }
  }

  // Work out root path regardless of page depth
  function getBasePath() {
    const path  = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    if (depth <= 0) return '';
    return Array(depth).fill('..').join('/');
  }

  // ── Apply translations to the DOM ────────────────────────
  function applyTranslations(dict) {
    if (!dict) return;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
    });

    // Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
    });

    // HTML lang attribute
    document.documentElement.lang = dict.lang || 'en';

    // Update toggle button label
    const btn = document.getElementById('langToggleBtn');
    if (btn) {
      const meta = LANG_META[dict.lang] || LANG_META.en;
      btn.innerHTML = `${meta.flag} <span class="lang-btn-name">${meta.nativeName}</span> <i class="fas fa-chevron-down lang-chevron"></i>`;
    }
  }

  // ── Switch language ──────────────────────────────────────
  async function setLanguage(lang) {
    if (!LANGS.includes(lang)) lang = 'en';
    currentLang = lang;
    localStorage.setItem('brainhub-lang', lang);

    const dict = await loadLang(lang);
    applyTranslations(dict);

    // Update dropdown item states
    document.querySelectorAll('.lang-option').forEach(el => {
      el.classList.toggle('active', el.dataset.lang === lang);
    });

    // Fire custom event so pages can react if needed
    window.dispatchEvent(new CustomEvent('brainhub:langchange', { detail: { lang, dict } }));
  }

  // ── Get a translated string imperatively ─────────────────
  function t(key, fallback) {
    const dict = translations[currentLang] || translations.en || {};
    return dict[key] || fallback || key;
  }

  // ── Build the navbar language toggle ─────────────────────
  function buildToggle() {
    // Don't build if already exists
    if (document.getElementById('langToggleBtn')) return;

    const meta = LANG_META[currentLang] || LANG_META.en;

    const wrapper = document.createElement('li');
    wrapper.id = 'langToggleWrapper';
    wrapper.className = 'lang-toggle-wrapper';
    wrapper.innerHTML = `
      <button id="langToggleBtn" class="lang-toggle-btn" aria-haspopup="true" aria-expanded="false">
        ${meta.flag} <span class="lang-btn-name">${meta.nativeName}</span>
        <i class="fas fa-chevron-down lang-chevron"></i>
      </button>
      <div class="lang-dropdown" id="langDropdown" role="menu">
        ${LANGS.map(l => `
          <button class="lang-option${l === currentLang ? ' active' : ''}"
            data-lang="${l}" role="menuitem">
            <span class="lang-opt-flag">${LANG_META[l].flag}</span>
            <span class="lang-opt-native">${LANG_META[l].nativeName}</span>
            <span class="lang-opt-eng">${LANG_META[l].name}</span>
          </button>`).join('')}
      </div>
    `;

    // Insert before theme toggle in nav-links
    const navLinks = document.querySelector('.nav-links');
    const themeItem = navLinks?.querySelector('#theme-toggle')?.closest('li');
    if (themeItem) {
      navLinks.insertBefore(wrapper, themeItem);
    } else if (navLinks) {
      navLinks.appendChild(wrapper);
    }

    // Toggle dropdown
    const btn = document.getElementById('langToggleBtn');
    const dd  = document.getElementById('langDropdown');

    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dd.classList.toggle('show');
      btn.setAttribute('aria-expanded', open);
    });

    // Option click
    wrapper.addEventListener('click', (e) => {
      const opt = e.target.closest('.lang-option');
      if (!opt) return;
      setLanguage(opt.dataset.lang);
      dd.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    });

    // Close on outside click
    document.addEventListener('click', () => {
      dd?.classList.remove('show');
      btn?.setAttribute('aria-expanded', 'false');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dd?.classList.remove('show');
        btn?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Inject CSS ───────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'i18n-styles';
    style.textContent = `
      .lang-toggle-wrapper { position: relative; }

      .lang-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        border-radius: 8px;
        border: 1.5px solid var(--border);
        background: var(--bg-muted);
        color: var(--text-700);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .lang-toggle-btn:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(37,99,235,0.06);
      }
      .lang-btn-name {
        max-width: 72px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      @media(max-width:768px){ .lang-btn-name { display:none; } }

      .lang-chevron {
        font-size: 0.6rem;
        transition: transform 0.2s;
      }
      .lang-toggle-btn[aria-expanded="true"] .lang-chevron {
        transform: rotate(180deg);
      }

      .lang-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 0.4rem;
        min-width: 190px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 9999;
        flex-direction: column;
        gap: 2px;
        animation: langDrop 0.18s ease;
      }
      .lang-dropdown.show { display: flex; }

      @keyframes langDrop {
        from { opacity:0; transform:translateY(-6px); }
        to   { opacity:1; transform:translateY(0); }
      }

      .lang-option {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.55rem 0.75rem;
        border-radius: 9px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        text-align: left;
        width: 100%;
        transition: background 0.15s;
      }
      .lang-option:hover { background: var(--bg-muted); }
      .lang-option.active {
        background: rgba(37,99,235,0.08);
        color: var(--primary);
      }
      .lang-opt-flag { font-size: 1.1rem; flex-shrink:0; }
      .lang-opt-native {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-900);
        flex: 1;
      }
      .lang-option.active .lang-opt-native { color: var(--primary); }
      .lang-opt-eng {
        font-size: 0.72rem;
        color: var(--text-300);
        flex-shrink: 0;
      }

      /* Mobile — show in full-width mobile menu */
      @media(max-width:768px) {
        .lang-dropdown {
          right: auto;
          left: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Boot ─────────────────────────────────────────────────
  async function boot() {
    injectStyles();

    // Wait for DOM
    if (document.readyState === 'loading') {
      await new Promise(r => document.addEventListener('DOMContentLoaded', r));
    }

    buildToggle();

    // Load and apply saved language
    const dict = await loadLang(currentLang);
    if (dict) applyTranslations(dict);

    // Also preload English as fallback
    if (currentLang !== 'en') loadLang('en');
  }

  boot();

  // ── Public API ────────────────────────────────────────────
  window.BrainHubI18n = {
    t,
    setLanguage,
    getCurrentLang: () => currentLang,
    getTranslations: (lang) => translations[lang || currentLang] || {},
  };

})();
