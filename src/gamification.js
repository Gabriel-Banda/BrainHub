/* ============================================================
   BrainHub — Gamification System
   Points, Badges, Streaks, Level, Leaderboard
   ============================================================ */

// ── Config ───────────────────────────────────────────────
const XP = {
  page_visit:       5,
  resource_opened:  10,
  doc_completed:    25,
  course_completed: 100,
  challenge_correct:50,
  challenge_wrong:  10,
  streak_bonus:     20,
  bookmark_added:   5,
  share:            15,
  search:           5,
};

const LEVELS = [
  { min: 0,    name: 'Freshman',    icon: '🎒', color: '#94a3b8' },
  { min: 100,  name: 'Scholar',     icon: '📖', color: '#3b82f6' },
  { min: 300,  name: 'Achiever',    icon: '⭐', color: '#8b5cf6' },
  { min: 600,  name: 'Expert',      icon: '🔬', color: '#f59e0b' },
  { min: 1000, name: 'Top Student', icon: '🏆', color: '#ef4444' },
  { min: 2000, name: 'BrainHub Pro',icon: '🧠', color: '#10b981' },
];

const BADGES = [
  { id: 'first_visit',      name: 'First Step',      desc: 'Visited BrainHub for the first time',     icon: '👋', condition: s => s.totalVisits >= 1 },
  { id: 'bookworm',         name: 'Bookworm',         desc: 'Opened 5 documents',                      icon: '📚', condition: s => s.docsOpened >= 5 },
  { id: 'completionist',    name: 'Completionist',    desc: 'Marked 5 resources as done',              icon: '✅', condition: s => s.docsCompleted >= 5 },
  { id: 'challenger',       name: 'Challenger',       desc: 'Answered your first weekly challenge',    icon: '⚡', condition: s => s.challengesAttempted >= 1 },
  { id: 'streak_3',         name: 'On Fire',          desc: '3-day study streak',                      icon: '🔥', condition: s => s.maxStreak >= 3 },
  { id: 'streak_7',         name: 'Dedicated',        desc: '7-day study streak',                      icon: '💪', condition: s => s.maxStreak >= 7 },
  { id: 'sharer',           name: 'Ambassador',       desc: 'Shared BrainHub with someone',            icon: '📣', condition: s => s.shares >= 1 },
  { id: 'searcher',         name: 'Explorer',         desc: 'Used the search 10 times',                icon: '🔍', condition: s => s.searches >= 10 },
  { id: 'bio_master',       name: 'Bio Master',       desc: 'Completed all BIO110 resources',          icon: '🧬', condition: s => s.coursesCompleted?.includes('bio110') },
  { id: 'century',          name: 'Century',          desc: 'Earned 100 XP',                           icon: '💯', condition: s => s.xp >= 100 },
  { id: 'scholar_badge',    name: 'Scholar',          desc: 'Reached Scholar level',                   icon: '🎓', condition: s => s.xp >= 300 },
  { id: 'night_owl',        name: 'Night Owl',        desc: 'Studied after midnight',                  icon: '🦉', condition: s => s.nightSessions >= 1 },
];

// ── Storage helpers ───────────────────────────────────────
function getStats() {
  return JSON.parse(localStorage.getItem('bh-gamification') || JSON.stringify({
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
  }));
}

function saveStats(stats) {
  localStorage.setItem('bh-gamification', JSON.stringify(stats));
}

// ── Core: Award XP ────────────────────────────────────────
function awardXP(action, label = '') {
  const amount = XP[action] || 0;
  if (!amount) return;

  const stats = getStats();
  stats.xp += amount;
  stats.xpLog = [{ action, amount, label, ts: Date.now() }, ...(stats.xpLog || [])].slice(0, 50);
  saveStats(stats);

  // Show XP popup
  showXPPopup(`+${amount} XP`, label || action.replace(/_/g,' '));

  // Check badges
  checkBadges(stats);

  // Update HUD if visible
  updateHUD();
}

// ── Streak tracking ───────────────────────────────────────
function trackDailyVisit() {
  const stats = getStats();
  const today = new Date().toDateString();

  if (stats.lastVisitDate === today) {
    // Already visited today — just increment visit count
    stats.totalVisits++;
    saveStats(stats);
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (stats.lastVisitDate === yesterday) {
    stats.currentStreak++;
  } else if (stats.lastVisitDate !== today) {
    stats.currentStreak = 1;
  }

  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
  stats.lastVisitDate = today;
  stats.totalVisits++;

  // Night owl
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) stats.nightSessions++;

  // Streak bonus XP
  if (stats.currentStreak > 1) {
    stats.xp += XP.streak_bonus;
    showXPPopup(`+${XP.streak_bonus} XP`, `🔥 ${stats.currentStreak}-day streak!`);
  }

  saveStats(stats);
  checkBadges(stats);
  awardXP('page_visit', 'Daily visit');
}

// ── Badge checker ─────────────────────────────────────────
function checkBadges(stats) {
  BADGES.forEach(badge => {
    if (!stats.earnedBadges.includes(badge.id) && badge.condition(stats)) {
      stats.earnedBadges.push(badge.id);
      saveStats(stats);
      showBadgeToast(badge);
    }
  });
}

// ── Level calculator ──────────────────────────────────────
function getLevel(xp) {
  let level = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.min) level = l; }
  return level;
}

function getNextLevel(xp) {
  for (const l of LEVELS) { if (xp < l.min) return l; }
  return null;
}

function getLevelProgress(xp) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = xp - current.min;
  return Math.round((progress / range) * 100);
}

// ── HUD (heads-up display in corner) ─────────────────────
function injectHUD() {
  if (document.getElementById('bhHUD')) return;

  const stats = getStats();
  const level = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const next = getNextLevel(stats.xp);

  const hud = document.createElement('div');
  hud.id = 'bhHUD';
  hud.innerHTML = `
    <div id="bhHUDInner" class="bh-hud">
      <div class="hud-top" onclick="toggleHUDExpand()">
        <span class="hud-level-icon">${level.icon}</span>
        <div class="hud-info">
          <div class="hud-level-name">${level.name}</div>
          <div class="hud-xp">${stats.xp} XP</div>
        </div>
        <div class="hud-streak" title="Study streak">🔥 ${stats.currentStreak}</div>
      </div>
      <div class="hud-progress-wrap">
        <div class="hud-progress-bar" style="width:${progress}%"></div>
      </div>
      ${next ? `<div class="hud-next">${next.min - stats.xp} XP to ${next.icon} ${next.name}</div>` : '<div class="hud-next">Max level reached! 🎉</div>'}

      <div class="hud-expanded" id="hudExpanded" style="display:none">
        <div class="hud-divider"></div>
        <div class="hud-stats-grid">
          <div class="hud-stat"><strong>${stats.docsCompleted}</strong><span>Completed</span></div>
          <div class="hud-stat"><strong>${stats.maxStreak}</strong><span>Best streak</span></div>
          <div class="hud-stat"><strong>${stats.earnedBadges.length}</strong><span>Badges</span></div>
          <div class="hud-stat"><strong>${stats.totalVisits}</strong><span>Visits</span></div>
        </div>
        <a href="/pages/profile.html" class="hud-profile-btn">View full profile →</a>
      </div>
    </div>
  `;

  document.body.appendChild(hud);
}

function updateHUD() {
  const stats = getStats();
  const level = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const next = getNextLevel(stats.xp);
  const inner = document.getElementById('bhHUDInner');
  if (!inner) return;
  inner.querySelector('.hud-level-icon').textContent = level.icon;
  inner.querySelector('.hud-level-name').textContent = level.name;
  inner.querySelector('.hud-xp').textContent = stats.xp + ' XP';
  inner.querySelector('.hud-streak').textContent = '🔥 ' + stats.currentStreak;
  inner.querySelector('.hud-progress-bar').style.width = progress + '%';
  inner.querySelector('.hud-next').textContent = next ? `${next.min - stats.xp} XP to ${next.icon} ${next.name}` : 'Max level reached! 🎉';
}

function toggleHUDExpand() {
  const el = document.getElementById('hudExpanded');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ── XP Popup ──────────────────────────────────────────────
function showXPPopup(xpText, label) {
  const el = document.createElement('div');
  el.className = 'xp-popup';
  el.innerHTML = `<strong>${xpText}</strong><span>${label}</span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 2000);
}

// ── Badge Toast ───────────────────────────────────────────
function showBadgeToast(badge) {
  const el = document.createElement('div');
  el.className = 'badge-toast';
  el.innerHTML = `
    <div class="badge-toast-icon">${badge.icon}</div>
    <div class="badge-toast-info">
      <strong>Badge unlocked!</strong>
      <span>${badge.name} — ${badge.desc}</span>
    </div>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4000);
}

// ── Public API — call these from other parts of the site ──
window.BrainHubXP = {
  award: awardXP,
  trackSearch: () => {
    const s = getStats(); s.searches++; saveStats(s);
    awardXP('search', 'Search used');
  },
  trackDocOpen: () => {
    const s = getStats(); s.docsOpened++; saveStats(s);
    awardXP('resource_opened', 'Resource opened');
  },
  trackDocComplete: (courseId) => {
    const s = getStats(); s.docsCompleted++; saveStats(s);
    awardXP('doc_completed', 'Resource completed');
    checkBadges(s);
  },
  trackShare: () => {
    const s = getStats(); s.shares++; saveStats(s);
    awardXP('share', 'Shared BrainHub');
  },
  trackChallengeCorrect: () => {
    const s = getStats(); s.challengesAttempted++; saveStats(s);
    awardXP('challenge_correct', 'Challenge correct!');
  },
  trackChallengeWrong: () => {
    const s = getStats(); s.challengesAttempted++; saveStats(s);
    awardXP('challenge_wrong', 'Challenge attempted');
  },
  getStats,
  getLevel,
  BADGES,
  LEVELS,
};

// ── Auto-init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  trackDailyVisit();
  injectHUD();
  injectGamificationStyles();
});

// ── Inject CSS ────────────────────────────────────────────
function injectGamificationStyles() {
  if (document.getElementById('bh-gami-styles')) return;
  const style = document.createElement('style');
  style.id = 'bh-gami-styles';
  style.textContent = `
    /* HUD */
    #bhHUD {
      position: fixed;
      bottom: 80px;
      right: 1.25rem;
      z-index: 700;
      width: 200px;
    }
    @media (max-width: 768px) { #bhHUD { bottom: 76px; right: 0.75rem; width: 180px; } }

    .bh-hud {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 0.85rem 1rem;
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      transition: var(--transition);
    }
    .bh-hud:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.15); }

    .hud-top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }
    .hud-level-icon { font-size: 1.4rem; flex-shrink: 0; }
    .hud-info { flex: 1; min-width: 0; }
    .hud-level-name { font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; color: var(--text-900); }
    .hud-xp { font-size: 0.72rem; color: var(--primary); font-weight: 600; }
    .hud-streak { font-size: 0.78rem; font-weight: 700; color: #f59e0b; flex-shrink: 0; }

    .hud-progress-wrap {
      height: 5px;
      background: var(--bg-muted);
      border-radius: 60px;
      overflow: hidden;
      margin-bottom: 0.35rem;
    }
    .hud-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 60px;
      transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .hud-next { font-size: 0.68rem; color: var(--text-500); }
    .hud-divider { height: 1px; background: var(--border); margin: 0.75rem 0; }
    .hud-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem; }
    .hud-stat { text-align: center; }
    .hud-stat strong { display: block; font-family: var(--font-display); font-size: 1rem; font-weight: 800; color: var(--text-900); }
    .hud-stat span { font-size: 0.68rem; color: var(--text-500); }
    .hud-profile-btn {
      display: block; text-align: center;
      font-size: 0.78rem; font-weight: 700;
      color: var(--primary); text-decoration: none;
      padding: 0.4rem;
      border-radius: var(--radius-sm);
      background: var(--primary-light);
      transition: var(--transition);
    }
    .hud-profile-btn:hover { background: var(--primary); color: white; }

    /* XP Popup */
    .xp-popup {
      position: fixed;
      bottom: 140px;
      right: 1.5rem;
      background: var(--primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 60px;
      font-size: 0.82rem;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 8px 24px rgba(37,99,235,0.35);
      opacity: 0;
      transform: translateY(10px) scale(0.9);
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 9999;
      pointer-events: none;
      font-family: var(--font-display);
    }
    .xp-popup strong { font-size: 1rem; }
    .xp-popup span { font-size: 0.72rem; opacity: 0.85; }
    .xp-popup.show { opacity: 1; transform: translateY(0) scale(1); }

    /* Badge toast */
    .badge-toast {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.35s ease, transform 0.35s ease;
      max-width: 320px;
    }
    .badge-toast.show { opacity: 1; transform: translateX(0); }
    .badge-toast-icon { font-size: 2rem; flex-shrink: 0; }
    .badge-toast-info { flex: 1; }
    .badge-toast-info strong { display: block; font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; color: var(--text-900); margin-bottom: 0.15rem; }
    .badge-toast-info span { font-size: 0.8rem; color: var(--text-500); }
  `;
  document.head.appendChild(style);
}
