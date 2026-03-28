/* ============================================================
   BrainHub — Supabase Client & Auth System
   ============================================================ */

const SUPABASE_URL  = window.BrainHubConfig?.supabase?.url || 'https://pdkslovwbbytfexguteo.supabase.co';
const SUPABASE_ANON = window.BrainHubConfig?.supabase?.anonKey || 'sb_publishable_klXl7mVNAefz2aC-UfCQ2w_E0r7PP1h';

// ── Load Supabase SDK from CDN ───────────────────────────
(function loadSupabaseSDK() {
  if (window.__supabaseLoaded) return;
  window.__supabaseLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.onload = () => initBrainHubAuth();
  document.head.appendChild(s);
})();

function initBrainHubAuth() {
  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON);

  // ── Auth helpers ─────────────────────────────────────────

  async function signUp(email, password, fullName) {
    const { data, error } = await db.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signInWithGoogle() {
    const { data, error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/pages/profile.html'
      }
    });
    return { data, error };
  }

  async function signOut() {
    const { error } = await db.auth.signOut();
    if (!error) window.location.href = '/index.html';
    return { error };
  }

  async function resetPassword(email) {
    const { data, error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/pages/auth.html?mode=update'
    });
    return { data, error };
  }

  async function updatePassword(newPassword) {
    const { data, error } = await db.auth.updateUser({ password: newPassword });
    return { data, error };
  }

  async function getSession() {
    const { data: { session } } = await db.auth.getSession();
    return session;
  }

  async function getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  }

  // ── Profile ──────────────────────────────────────────────

  async function getProfile(userId) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  async function upsertProfile(userId, updates) {
    const { data, error } = await db
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });
    return { data, error };
  }

  // ── Progress sync ────────────────────────────────────────
  // Progress stored as: { doc_id: true/false }
  // We flatten to rows: (user_id, doc_id, completed)

  async function syncProgressToCloud(userId) {
    try {
      const local = JSON.parse(localStorage.getItem('bh-progress') || '{}');
      const rows  = Object.entries(local).map(([doc_id, completed]) => ({
        user_id: userId, doc_id, completed: !!completed,
        updated_at: new Date().toISOString()
      }));
      if (!rows.length) return;
      await db.from('progress').upsert(rows, { onConflict: 'user_id,doc_id' });
    } catch (e) { console.warn('[BrainHub] Progress sync failed:', e); }
  }

  async function loadProgressFromCloud(userId) {
    try {
      const { data } = await db
        .from('progress')
        .select('doc_id, completed')
        .eq('user_id', userId);
      if (!data?.length) return;
      const obj = {};
      data.forEach(r => { if (r.completed) obj[r.doc_id] = true; });
      // Merge with local (cloud wins)
      const local = JSON.parse(localStorage.getItem('bh-progress') || '{}');
      localStorage.setItem('bh-progress', JSON.stringify({ ...local, ...obj }));
    } catch (e) { console.warn('[BrainHub] Progress load failed:', e); }
  }

  // ── Bookmarks sync ───────────────────────────────────────

  async function syncBookmarksToCloud(userId) {
    try {
      const local = JSON.parse(localStorage.getItem('bh-bookmarks') || '[]');
      if (!local.length) return;
      const rows = local.map(b => ({
        user_id: userId,
        doc_id:  b.id || b,
        title:   b.title || '',
        url:     b.url   || '',
        created_at: b.savedAt || new Date().toISOString()
      }));
      await db.from('bookmarks').upsert(rows, { onConflict: 'user_id,doc_id' });
    } catch (e) { console.warn('[BrainHub] Bookmark sync failed:', e); }
  }

  async function loadBookmarksFromCloud(userId) {
    try {
      const { data } = await db
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!data?.length) return;
      const bookmarks = data.map(r => ({
        id: r.doc_id, title: r.title, url: r.url, savedAt: r.created_at
      }));
      localStorage.setItem('bh-bookmarks', JSON.stringify(bookmarks));
    } catch (e) { console.warn('[BrainHub] Bookmark load failed:', e); }
  }

  // ── Gamification sync ────────────────────────────────────

  async function syncGamificationToCloud(userId) {
    try {
      const local = JSON.parse(localStorage.getItem('bh-gamification') || '{}');
      if (!Object.keys(local).length) return;
      await db.from('gamification').upsert({
        user_id:             userId,
        xp:                  local.xp                    || 0,
        current_streak:      local.currentStreak         || 0,
        max_streak:          local.maxStreak             || 0,
        docs_opened:         local.docsOpened            || 0,
        docs_completed:      local.docsCompleted         || 0,
        total_visits:        local.totalVisits           || 0,
        searches:            local.searches              || 0,
        shares:              local.shares                || 0,
        night_sessions:      local.nightSessions         || 0,
        challenges_attempted:local.challengesAttempted   || 0,
        earned_badges:       JSON.stringify(local.earnedBadges || []),
        xp_log:              JSON.stringify((local.xpLog || []).slice(-200)),
        last_visit_date:     local.lastVisitDate         || null,
        updated_at:          new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (e) { console.warn('[BrainHub] Gamification sync failed:', e); }
  }

  async function loadGamificationFromCloud(userId) {
    try {
      const { data } = await db
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!data) return;
      const cloud = {
        xp:                  data.xp                   || 0,
        currentStreak:       data.current_streak        || 0,
        maxStreak:           data.max_streak             || 0,
        docsOpened:          data.docs_opened            || 0,
        docsCompleted:       data.docs_completed         || 0,
        totalVisits:         data.total_visits           || 0,
        searches:            data.searches               || 0,
        shares:              data.shares                 || 0,
        nightSessions:       data.night_sessions         || 0,
        challengesAttempted: data.challenges_attempted   || 0,
        earnedBadges:        JSON.parse(data.earned_badges || '[]'),
        xpLog:               JSON.parse(data.xp_log      || '[]'),
        lastVisitDate:       data.last_visit_date        || null,
      };
      // Merge: keep highest XP between local and cloud
      const local = JSON.parse(localStorage.getItem('bh-gamification') || '{}');
      const merged = (cloud.xp >= (local.xp || 0)) ? cloud : local;
      localStorage.setItem('bh-gamification', JSON.stringify(merged));
    } catch (e) { console.warn('[BrainHub] Gamification load failed:', e); }
  }

  // ── Full sync on login ───────────────────────────────────

  async function onSignIn(userId) {
    // Load cloud data into localStorage first
    await Promise.all([
      loadProgressFromCloud(userId),
      loadBookmarksFromCloud(userId),
      loadGamificationFromCloud(userId),
    ]);
    // Then push any newer local data up
    await Promise.all([
      syncProgressToCloud(userId),
      syncBookmarksToCloud(userId),
      syncGamificationToCloud(userId),
    ]);
    updateNavUI();
    window.dispatchEvent(new CustomEvent('brainhub:signin', { detail: { userId } }));
  }

  // ── Nav UI ───────────────────────────────────────────────

  function updateNavUI() {
    const session = window.BrainHubAuth?._session;
    const loggedIn = !!session;

    // Apply immediately
    _applyNavUI(session, loggedIn);

    // Retry a few times to catch elements injected by i18n.js or components
    let attempts = 0;
    const retry = setInterval(() => {
      _applyNavUI(session, loggedIn);
      if (++attempts >= 6) clearInterval(retry);
    }, 250);
  }

  function _applyNavUI(session, loggedIn) {
    document.querySelectorAll('[data-auth-show]').forEach(el => {
      const mode = el.dataset.authShow;
      el.style.display = (mode === 'authed' ? loggedIn : !loggedIn) ? '' : 'none';
    });
    if (loggedIn && session) {
      const name = session.user?.user_metadata?.full_name ||
                   session.user?.email?.split('@')[0] || 'Student';
      document.querySelectorAll('[data-auth-name]').forEach(el => el.textContent = name);
      const avatar = session.user?.user_metadata?.avatar_url;
      document.querySelectorAll('[data-auth-avatar]').forEach(el => {
        if (avatar) { el.src = avatar; el.style.display = ''; }
      });
    }
  }

  // ── Periodic cloud sync (every 5 min while logged in) ───

  function startPeriodicSync(userId) {
    setInterval(async () => {
      await syncProgressToCloud(userId);
      await syncGamificationToCloud(userId);
    }, 5 * 60 * 1000);
  }

  // ── Listen for auth state changes ────────────────────────

  db.auth.onAuthStateChange(async (event, session) => {
    window.BrainHubAuth._session = session;
    if (event === 'SIGNED_IN' && session) {
      await onSignIn(session.user.id);
      startPeriodicSync(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      updateNavUI();
      window.dispatchEvent(new Event('brainhub:signout'));
    } else if (event === 'PASSWORD_RECOVERY') {
      if (window.location.pathname.includes('auth')) return;
      window.location.href = '/pages/auth.html?mode=update';
    }
  });

  // ── Public API ───────────────────────────────────────────

  window.BrainHubAuth = {
    db,
    _session: null,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    getSession,
    getUser,
    getProfile,
    upsertProfile,
    syncProgressToCloud,
    syncBookmarksToCloud,
    syncGamificationToCloud,
    isLoggedIn: () => !!window.BrainHubAuth._session,
    getUserId:  () => window.BrainHubAuth._session?.user?.id || null,
  };

  // Init session on page load — wait for DOM before touching nav elements
  function initSession() {
    getSession().then(session => {
      window.BrainHubAuth._session = session;
      updateNavUI();
      if (session) {
        onSignIn(session.user.id);
        startPeriodicSync(session.user.id);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSession);
  } else {
    initSession();
  }

  // Sync to cloud when progress/bookmarks change
  window.addEventListener('brainhub:progresschange', () => {
    const uid = window.BrainHubAuth.getUserId();
    if (uid) syncProgressToCloud(uid);
  });
  window.addEventListener('brainhub:bookmarkchange', () => {
    const uid = window.BrainHubAuth.getUserId();
    if (uid) syncBookmarksToCloud(uid);
  });
  window.addEventListener('brainhub:xpchange', () => {
    const uid = window.BrainHubAuth.getUserId();
    if (uid) syncGamificationToCloud(uid);
  });
}