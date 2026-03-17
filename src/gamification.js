/* ============================================================
   BrainHub — Gamification System v2 (Fixed)
   ============================================================ */

// ── Config ────────────────────────────────────────────────
const XP_TABLE = {
  page_visit:        5,
  resource_opened:  10,
  doc_completed:    25,
  course_completed: 100,
  challenge_correct: 50,
  challenge_wrong:   10,
  streak_bonus:      20,
  bookmark_added:     5,
  share:             15,
  search:             5,
};

const LEVELS = [
  { min: 0,    name: 'Freshman',     icon: '🎒', color: '#94a3b8' },
  { min: 100,  name: 'Scholar',      icon: '📖', color: '#3b82f6' },
  { min: 300,  name: 'Achiever',     icon: '⭐', color: '#8b5cf6' },
  { min: 600,  name: 'Expert',       icon: '🔬', color: '#f59e0b' },
  { min: 1000, name: 'Top Student',  icon: '🏆', color: '#ef4444' },
  { min: 2000, name: 'BrainHub Pro', icon: '🧠', color: '#10b981' },
];

const BADGES = [
  { id: 'first_visit',   name: 'First Step',    desc: 'Visited BrainHub for the first time', icon: '👋', condition: s => s.totalVisits >= 1 },
  { id: 'bookworm',      name: 'Bookworm',      desc: 'Opened 5 documents',                  icon: '📚', condition: s => s.docsOpened >= 5 },
  { id: 'completionist', name: 'Completionist', desc: 'Marked 5 resources as done',          icon: '✅', condition: s => s.docsCompleted >= 5 },
  { id: 'challenger',    name: 'Challenger',    desc: 'Answered a weekly challenge',          icon: '⚡', condition: s => s.challengesAttempted >= 1 },
  { id: 'streak_3',      name: 'On Fire',       desc: '3-day study streak',                  icon: '🔥', condition: s => s.maxStreak >= 3 },
  { id: 'streak_7',      name: 'Dedicated',     desc: '7-day study streak',                  icon: '💪', condition: s => s.maxStreak >= 7 },
  { id: 'sharer',        name: 'Ambassador',    desc: 'Shared BrainHub with someone',        icon: '📣', condition: s => s.shares >= 1 },
  { id: 'searcher',      name: 'Explorer',      desc: 'Used search 10 times',                icon: '🔍', condition: s => s.searches >= 10 },
  { id: 'bio_master',    name: 'Bio Master',    desc: 'Completed all BIO110 resources',      icon: '🧬', condition: s => Array.isArray(s.coursesCompleted) && s.coursesCompleted.includes('bio110') },
  { id: 'century',       name: 'Century',       desc: 'Earned 100 XP',                       icon: '💯', condition: s => s.xp >= 100 },
  { id: 'scholar_badge', name: 'Scholar',       desc: 'Reached 300 XP',                      icon: '🎓', condition: s => s.xp >= 300 },
  { id: 'night_owl',     name: 'Night Owl',     desc: 'Studied after midnight',              icon: '🦉', condition: s => s.nightSessions >= 1 },
];

// ── Storage ───────────────────────────────────────────────
function _defaults() {
  return {
    xp: 0,
    totalVisits: 0,
    docsOpened: 0,
    docsCompleted: 0,
    challengesAttempted: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastVisitDate: null,
    shares: 0,
    searches: 0,
    nightSessions: 0,
    coursesCompleted: [],
    earnedBadges: [],
    xpLog: [],
  };
}

function _load() {
  try {
    const raw = localStorage.getItem('bh-gamification');
    if (!raw) return _defaults();
    // Merge so new fields are always present on old saves
    return Object.assign(_defaults(), JSON.parse(raw));
  } catch(e) {
    return _defaults();
  }
}

function _save(s) {
  localStorage.setItem('bh-gamification', JSON.stringify(s));
  window.dispatchEvent(new Event('brainhub:xpchange'));
}

// ── Core engine — ONE read, ONE save ─────────────────────
// mutatorFn receives stats, mutates counters, returns stats
// action is the XP key
// label is the popup text
function _commit(mutatorFn, action, label) {
  // 1. Read once
  const s = _load();

  // 2. Mutate counters
  mutatorFn(s);

  // 3. Add XP
  const xpAmount = XP_TABLE[action] || 0;
  if (xpAmount) {
    s.xp += xpAmount;
    s.xpLog = [
      { action, amount: xpAmount, label: label || action, ts: Date.now() },
      ...s.xpLog
    ].slice(0, 50);
  }

  // 4. Check EVERY badge against the now-fully-updated stats
  const newBadges = [];
  BADGES.forEach(badge => {
    if (!s.earnedBadges.includes(badge.id) && badge.condition(s)) {
      s.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });

  // 5. Save once
  _save(s);

  // 6. UI side-effects (never block the save)
  if (xpAmount) _showXPPopup('+' + xpAmount + ' XP', label || action.replace(/_/g, ' '));
  newBadges.forEach((b, i) => setTimeout(() => _showBadgeToast(b), i * 700));
  _updateHUD();
}

// ── Daily visit / streak ──────────────────────────────────
function _trackDailyVisit() {
  const s         = _load();
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const isNewDay  = s.lastVisitDate !== today;

  // Always count the visit
  s.totalVisits++;

  if (isNewDay) {
    // Streak logic
    if (s.lastVisitDate === yesterday) {
      s.currentStreak++;
    } else {
      s.currentStreak = 1;
    }
    s.maxStreak       = Math.max(s.maxStreak, s.currentStreak);
    s.lastVisitDate   = today;

    // Night owl
    if (new Date().getHours() < 5) s.nightSessions++;

    // Streak bonus XP (in addition to page_visit below)
    if (s.currentStreak > 1) {
      s.xp += XP_TABLE.streak_bonus;
      s.xpLog = [{ action: 'streak_bonus', amount: XP_TABLE.streak_bonus, label: s.currentStreak + '-day streak!', ts: Date.now() }, ...s.xpLog].slice(0, 50);
    }
  }

  // Page visit XP
  s.xp += XP_TABLE.page_visit;
  s.xpLog = [{ action: 'page_visit', amount: XP_TABLE.page_visit, label: 'Page visited', ts: Date.now() }, ...s.xpLog].slice(0, 50);

  // Check ALL badges on final state
  const newBadges = [];
  BADGES.forEach(badge => {
    if (!s.earnedBadges.includes(badge.id) && badge.condition(s)) {
      s.earnedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });

  // Save once
  _save(s);

  // UI
  if (isNewDay && s.currentStreak > 1) {
    _showXPPopup('+' + XP_TABLE.streak_bonus + ' XP', '🔥 ' + s.currentStreak + '-day streak!');
  }
  _showXPPopup('+' + XP_TABLE.page_visit + ' XP', 'Page visited');
  newBadges.forEach((b, i) => setTimeout(() => _showBadgeToast(b), i * 700));

  // Build HUD after state is ready
  setTimeout(() => { _injectHUD(); _updateHUD(); }, 60);
}

// ── Level helpers ─────────────────────────────────────────
function _getLevel(xp) {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) lv = l;
  return lv;
}

function _getNextLevel(xp) {
  for (const l of LEVELS) if (xp < l.min) return l;
  return null;
}

function _levelProgress(xp) {
  const cur  = _getLevel(xp);
  const next = _getNextLevel(xp);
  if (!next) return 100;
  return Math.round(((xp - cur.min) / (next.min - cur.min)) * 100);
}

// ── HUD ───────────────────────────────────────────────────
function _injectHUD() {
  if (document.getElementById('bhHUD')) return;
  const wrap = document.createElement('div');
  wrap.id = 'bhHUD';
  wrap.innerHTML = `
    <div id="bhHUDInner" class="bh-hud">
      <div class="hud-top" onclick="window._hudToggle()">
        <span class="hud-level-icon">🎒</span>
        <div class="hud-info">
          <div class="hud-level-name">Freshman</div>
          <div class="hud-xp">0 XP</div>
        </div>
        <div class="hud-streak">🔥 0</div>
      </div>
      <div class="hud-bar-wrap"><div class="hud-bar" style="width:0%"></div></div>
      <div class="hud-next-txt">100 XP to 📖 Scholar</div>
      <div id="hudExpanded" style="display:none">
        <div class="hud-divider"></div>
        <div class="hud-stats-grid">
          <div class="hud-stat"><strong id="hStat_docs">0</strong><span>Completed</span></div>
          <div class="hud-stat"><strong id="hStat_streak">0</strong><span>Best streak</span></div>
          <div class="hud-stat"><strong id="hStat_badges">0</strong><span>Badges</span></div>
          <div class="hud-stat"><strong id="hStat_visits">0</strong><span>Visits</span></div>
        </div>
        <a href="/pages/profile.html" class="hud-profile-btn">View full profile →</a>
      </div>
    </div>`;
  document.body.appendChild(wrap);
}

window._hudToggle = function() {
  const el = document.getElementById('hudExpanded');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

function _updateHUD() {
  const inner = document.getElementById('bhHUDInner');
  if (!inner) return;
  const s    = _load();
  const lv   = _getLevel(s.xp);
  const next = _getNextLevel(s.xp);
  const pct  = _levelProgress(s.xp);

  inner.querySelector('.hud-level-icon').textContent = lv.icon;
  inner.querySelector('.hud-level-name').textContent = lv.name;
  inner.querySelector('.hud-xp').textContent         = s.xp + ' XP';
  inner.querySelector('.hud-streak').textContent     = '🔥 ' + s.currentStreak;
  inner.querySelector('.hud-bar').style.width        = pct + '%';
  inner.querySelector('.hud-next-txt').textContent   = next
    ? (next.min - s.xp) + ' XP to ' + next.icon + ' ' + next.name
    : 'Max level reached! 🎉';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('hStat_docs',   s.docsCompleted);
  set('hStat_streak', s.maxStreak);
  set('hStat_badges', s.earnedBadges.length);
  set('hStat_visits', s.totalVisits);
}

// ── XP Popup ──────────────────────────────────────────────
function _showXPPopup(xpText, label) {
  const el = document.createElement('div');
  el.className = 'bh-xp-popup';
  el.innerHTML = '<strong>' + xpText + '</strong><span>' + label + '</span>';
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2200);
}

// ── Badge Toast ───────────────────────────────────────────
function _showBadgeToast(badge) {
  const el = document.createElement('div');
  el.className = 'bh-badge-toast';
  el.innerHTML =
    '<div class="bbt-icon">' + badge.icon + '</div>' +
    '<div class="bbt-info"><strong>🏅 Badge unlocked!</strong><span>' + badge.name + ' — ' + badge.desc + '</span></div>';
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4500);
}

// ── Auto-hooks: attach XP tracking to existing UI ────────
function _attachHooks() {
  // Doc cards → trackDocOpen
  document.querySelectorAll('.doc-card:not([data-gami])').forEach(card => {
    card.dataset.gami = '1';
    card.addEventListener('click', () => window.BrainHubXP.trackDocOpen());
  });

  // Mark-done / progress buttons → trackDocComplete
  document.querySelectorAll('.mark-done-btn:not([data-gami])').forEach(btn => {
    btn.dataset.gami = '1';
    btn.addEventListener('click', () => {
      setTimeout(() => {
        if (btn.classList.contains('done') || btn.textContent.includes('Done')) {
          window.BrainHubXP.trackDocComplete();
        }
      }, 120);
    });
  });

  // Share buttons (all variants) → trackShare
  document.querySelectorAll('.share-pill:not([data-gami]), .share-btn:not([data-gami]), .tct-btn:not([data-gami])').forEach(btn => {
    btn.dataset.gami = '1';
    btn.addEventListener('click', () => window.BrainHubXP.trackShare());
  });

  // Search inputs → trackSearch (debounced, fires after 1.5s of no typing)
  document.querySelectorAll('#globalSearch, #searchInput, #uniSearchInput, .search-input:not([data-gami])').forEach(input => {
    if (input.dataset.gami) return;
    input.dataset.gami = '1';
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      if (input.value.trim().length >= 2)
        timer = setTimeout(() => window.BrainHubXP.trackSearch(), 1500);
    });
  });

  // Weekly challenge submit button
  document.querySelectorAll('#submitChallenge:not([data-gami])').forEach(btn => {
    btn.dataset.gami = '1';
    btn.addEventListener('click', () => {
      // The challenge widget sets a result class — check after it runs
      setTimeout(() => {
        const result = document.getElementById('challengeResult');
        if (result && result.classList.contains('correct')) {
          window.BrainHubXP.trackChallengeCorrect();
        } else if (result) {
          window.BrainHubXP.trackChallengeWrong();
        }
      }, 200);
    });
  });
}

// Re-run hooks whenever DOM changes (doc viewer renders cards dynamically)
function _observeAndHook() {
  _attachHooks();
  new MutationObserver(() => _attachHooks())
    .observe(document.body, { childList: true, subtree: true });
}

// ── Public API ────────────────────────────────────────────
window.BrainHubXP = {

  trackDocOpen() {
    _commit(s => { s.docsOpened++; }, 'resource_opened', 'Resource opened');
  },

  trackDocComplete(courseId) {
    _commit(s => {
      s.docsCompleted++;
      if (courseId && !s.coursesCompleted.includes(courseId)) {
        s.coursesCompleted.push(courseId);
      }
    }, 'doc_completed', 'Resource completed ✅');
  },

  trackShare() {
    _commit(s => { s.shares++; }, 'share', 'Shared BrainHub 📣');
  },

  trackSearch() {
    _commit(s => { s.searches++; }, 'search', 'Search used 🔍');
  },

  trackChallengeCorrect() {
    _commit(s => { s.challengesAttempted++; }, 'challenge_correct', 'Challenge correct! ⚡');
  },

  trackChallengeWrong() {
    _commit(s => { s.challengesAttempted++; }, 'challenge_wrong', 'Challenge attempted');
  },

  trackBookmark() {
    _commit(s => s, 'bookmark_added', 'Bookmark saved 🔖');
  },

  award(action, label) {
    _commit(s => s, action, label);
  },

  // Expose internals for profile.html
  getStats:      _load,
  getLevel:      _getLevel,
  getNextLevel:  _getNextLevel,
  levelProgress: _levelProgress,
  BADGES,
  LEVELS,
};

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _injectStyles();
  _trackDailyVisit();
  _observeAndHook();
});

// ── Styles ────────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('bh-gami-css')) return;
  const s = document.createElement('style');
  s.id = 'bh-gami-css';
  s.textContent = `
  /* ── HUD ── */
  #bhHUD {
    position: fixed; bottom: 80px; right: 1.25rem;
    z-index: 700; width: 210px;
  }
  @media (max-width: 768px) { #bhHUD { bottom: 72px; right: 0.6rem; width: 188px; } }

  .bh-hud {
    background: var(--card, #fff);
    border: 1.5px solid var(--border, #e2e8f0);
    border-radius: 16px;
    padding: 0.9rem 1rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.13);
    transition: box-shadow 0.2s;
  }
  .bh-hud:hover { box-shadow: 0 14px 44px rgba(0,0,0,0.2); }

  .hud-top {
    display: flex; align-items: center; gap: 0.6rem;
    margin-bottom: 0.65rem; cursor: pointer; user-select: none;
  }
  .hud-level-icon { font-size: 1.4rem; flex-shrink: 0; line-height: 1; }
  .hud-info { flex: 1; min-width: 0; }
  .hud-level-name {
    font-size: 0.8rem; font-weight: 800;
    color: var(--text-900, #0f172a);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hud-xp { font-size: 0.7rem; color: #2563eb; font-weight: 700; }
  .hud-streak { font-size: 0.78rem; font-weight: 800; color: #f59e0b; flex-shrink: 0; }

  .hud-bar-wrap {
    height: 6px; background: var(--bg-muted, #f1f5f9);
    border-radius: 60px; overflow: hidden; margin-bottom: 0.4rem;
  }
  .hud-bar {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #06b6d4);
    border-radius: 60px; min-width: 4px;
    transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
  }
  .hud-next-txt { font-size: 0.68rem; color: var(--text-500, #64748b); }

  .hud-divider { height: 1px; background: var(--border, #e2e8f0); margin: 0.75rem 0; }
  .hud-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.7rem; }
  .hud-stat { text-align: center; }
  .hud-stat strong { display: block; font-size: 1.05rem; font-weight: 900; color: var(--text-900, #0f172a); line-height: 1; }
  .hud-stat span   { font-size: 0.65rem; color: var(--text-500, #64748b); }

  .hud-profile-btn {
    display: block; text-align: center;
    font-size: 0.78rem; font-weight: 700;
    color: #2563eb; text-decoration: none;
    padding: 0.4rem; border-radius: 8px;
    background: #eff6ff; transition: all 0.2s;
  }
  .hud-profile-btn:hover { background: #2563eb; color: #fff; }

  [data-theme="dark"] .bh-hud { background: #131929; border-color: #1e293b; }
  [data-theme="dark"] .hud-profile-btn { background: #1e3a5f; }

  /* ── XP Popup ── */
  .bh-xp-popup {
    position: fixed; bottom: 155px; right: 1.5rem;
    background: #2563eb; color: #fff;
    padding: 0.45rem 1rem; border-radius: 60px;
    font-size: 0.82rem; font-weight: 700;
    display: flex; flex-direction: column; align-items: center; gap: 1px;
    box-shadow: 0 8px 24px rgba(37,99,235,0.45);
    opacity: 0; transform: translateY(14px) scale(0.85);
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    z-index: 9999; pointer-events: none;
  }
  .bh-xp-popup strong { font-size: 0.95rem; line-height: 1; }
  .bh-xp-popup span   { font-size: 0.68rem; opacity: 0.88; }
  .bh-xp-popup.show   { opacity: 1; transform: translateY(0) scale(1); }

  @media (max-width: 480px) { .bh-xp-popup { right: 0.75rem; bottom: 130px; } }

  /* ── Badge Toast ── */
  .bh-badge-toast {
    position: fixed; top: 1.25rem; right: 1.25rem;
    background: var(--card, #fff);
    border: 1.5px solid #fcd34d;
    border-radius: 16px; padding: 0.9rem 1.1rem;
    display: flex; align-items: center; gap: 0.85rem;
    box-shadow: 0 12px 40px rgba(0,0,0,0.16);
    z-index: 9999; max-width: 300px;
    opacity: 0; transform: translateX(28px);
    transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bh-badge-toast.show { opacity: 1; transform: translateX(0); }
  .bbt-icon { font-size: 1.9rem; flex-shrink: 0; line-height: 1; }
  .bbt-info strong {
    display: block; font-size: 0.82rem; font-weight: 800;
    color: var(--text-900, #0f172a); margin-bottom: 0.15rem;
  }
  .bbt-info span { font-size: 0.76rem; color: var(--text-500, #64748b); }

  [data-theme="dark"] .bh-badge-toast { background: #131929; border-color: #fcd34d; }

  @media (max-width: 480px) {
    .bh-badge-toast { right: 0.5rem; left: 0.5rem; max-width: none; top: 0.75rem; }
  }
  `;
  document.head.appendChild(s);
}