/* ============================================================
   BrainHub — Discussion / Comments System
   Works on any page that has a <div id="discussionSection">
   Backed by Supabase — falls back to localStorage when offline
   ============================================================ */

(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────
  const SUPABASE_URL  = 'https://pdkslovwbbytfexguteo.supabase.co';
  const SUPABASE_ANON = 'sb_publishable_klXl7mVNAefz2aC-UfCQ2w_E0r7PP1h';
  const PAGE_ID       = window.location.pathname.replace(/\\/g, '/');
  const LS_KEY        = 'bh-disc-' + btoa(PAGE_ID).replace(/=/g, '');
  const MAX_OFFLINE   = 50;

  let db       = null;   // Supabase client (loaded async)
  let session  = null;   // current user session
  let comments = [];     // in-memory list
  let replyTo  = null;   // {id, author} if replying

  // ── Inject styles ─────────────────────────────────────────
  if (!document.getElementById('disc-styles')) {
    const s = document.createElement('style');
    s.id = 'disc-styles';
    s.textContent = `
      /* ── Container ── */
      .disc-section {
        margin: 3rem 0 2rem;
        max-width: 780px;
      }
      .disc-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 1.5rem; flex-wrap: wrap; gap: .75rem;
      }
      .disc-title {
        font-family: var(--font-display);
        font-size: 1.2rem; font-weight: 800;
        color: var(--text-900); letter-spacing: -.02em;
        display: flex; align-items: center; gap: .6rem;
      }
      .disc-count {
        background: var(--primary-light); color: var(--primary);
        font-size: .72rem; font-weight: 800;
        padding: .2rem .6rem; border-radius: 60px;
      }
      .disc-sort {
        display: flex; gap: .35rem;
      }
      .disc-sort-btn {
        padding: .3rem .75rem; border-radius: 60px;
        border: 1.5px solid var(--border); background: transparent;
        color: var(--text-500); font-size: .72rem; font-weight: 700;
        cursor: pointer; font-family: inherit; transition: all .15s;
      }
      .disc-sort-btn.active, .disc-sort-btn:hover {
        border-color: var(--primary); color: var(--primary);
        background: var(--primary-light);
      }

      /* ── Compose box ── */
      .disc-compose {
        background: var(--card); border: 1.5px solid var(--border);
        border-radius: 16px; padding: 1.25rem;
        margin-bottom: 2rem; transition: border-color .2s;
      }
      .disc-compose:focus-within { border-color: var(--primary); }
      .disc-compose-top {
        display: flex; gap: .75rem; align-items: flex-start;
        margin-bottom: .85rem;
      }
      .disc-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: .8rem; font-weight: 800; flex-shrink: 0;
        background: linear-gradient(135deg, var(--primary), #7c3aed);
        color: white;
      }
      .disc-avatar img {
        width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
      }
      .disc-avatar-sm {
        width: 30px; height: 30px; font-size: .65rem;
      }
      .disc-name-input {
        flex: 1; padding: .55rem .85rem;
        border: 1.5px solid var(--border); border-radius: 10px;
        background: var(--bg); color: var(--text-900);
        font-size: .85rem; font-family: inherit; outline: none;
        transition: border-color .2s;
      }
      .disc-name-input:focus { border-color: var(--primary); }
      .disc-textarea {
        width: 100%; min-height: 88px; max-height: 240px;
        padding: .75rem 1rem;
        border: 1.5px solid var(--border); border-radius: 12px;
        background: var(--bg); color: var(--text-900);
        font-size: .9rem; line-height: 1.6; font-family: inherit;
        outline: none; resize: vertical; transition: border-color .2s;
        box-sizing: border-box;
      }
      .disc-textarea:focus { border-color: var(--primary); }
      .disc-textarea::placeholder { color: var(--text-400); }
      .disc-reply-banner {
        display: flex; align-items: center; gap: .6rem;
        background: var(--primary-light); border: 1px solid rgba(37,99,235,.15);
        border-radius: 10px; padding: .5rem .85rem;
        font-size: .8rem; color: var(--primary); font-weight: 600;
        margin-bottom: .65rem;
      }
      .disc-reply-banner button {
        margin-left: auto; background: none; border: none;
        color: var(--text-400); cursor: pointer; font-size: .75rem;
        transition: color .15s;
      }
      .disc-reply-banner button:hover { color: var(--text-700); }
      .disc-compose-footer {
        display: flex; align-items: center; justify-content: space-between;
        margin-top: .75rem; flex-wrap: wrap; gap: .5rem;
      }
      .disc-char-count { font-size: .72rem; color: var(--text-400); }
      .disc-char-count.warn { color: #f59e0b; }
      .disc-char-count.over { color: #ef4444; }
      .disc-submit-btn {
        display: inline-flex; align-items: center; gap: .4rem;
        background: var(--primary); color: white;
        border: none; border-radius: 10px;
        padding: .6rem 1.25rem; font-size: .85rem; font-weight: 700;
        cursor: pointer; font-family: inherit; transition: all .2s;
      }
      .disc-submit-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
      .disc-submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
      .disc-login-note {
        font-size: .78rem; color: var(--text-400);
        display: flex; align-items: center; gap: .4rem;
      }
      .disc-login-note a { color: var(--primary); text-decoration: none; font-weight: 600; }
      .disc-login-note a:hover { text-decoration: underline; }

      /* ── Comment list ── */
      .disc-list { display: flex; flex-direction: column; gap: 1.25rem; }
      .disc-empty {
        text-align: center; padding: 3rem 1rem;
        color: var(--text-400);
      }
      .disc-empty i { font-size: 2.5rem; display: block; margin-bottom: .75rem; opacity: .3; }
      .disc-empty p { font-size: .9rem; }

      /* ── Single comment ── */
      .disc-comment {
        display: flex; gap: .85rem;
        animation: discIn .3s ease;
      }
      @keyframes discIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .disc-comment-body { flex: 1; min-width: 0; }
      .disc-comment-header {
        display: flex; align-items: center; gap: .6rem;
        margin-bottom: .35rem; flex-wrap: wrap;
      }
      .disc-author {
        font-family: var(--font-display); font-size: .88rem;
        font-weight: 800; color: var(--text-900);
      }
      .disc-author.is-admin {
        color: var(--primary);
      }
      .disc-admin-badge {
        background: var(--primary); color: white;
        font-size: .58rem; font-weight: 800; padding: .1rem .4rem;
        border-radius: 4px; text-transform: uppercase; letter-spacing: .06em;
      }
      .disc-time {
        font-size: .72rem; color: var(--text-400);
        margin-left: auto;
      }
      .disc-text {
        font-size: .88rem; color: var(--text-700);
        line-height: 1.65; margin-bottom: .5rem;
        word-break: break-word;
      }
      .disc-reply-to {
        font-size: .75rem; color: var(--primary); font-weight: 600;
        margin-bottom: .3rem; display: flex; align-items: center; gap: .3rem;
      }
      .disc-actions {
        display: flex; align-items: center; gap: .85rem;
      }
      .disc-action-btn {
        background: none; border: none; cursor: pointer;
        font-size: .75rem; color: var(--text-400); font-family: inherit;
        display: flex; align-items: center; gap: .3rem;
        transition: color .15s; padding: 0;
      }
      .disc-action-btn:hover { color: var(--primary); }
      .disc-action-btn.liked { color: var(--primary); font-weight: 700; }
      .disc-action-btn.liked i { color: var(--primary); }

      /* Thread replies */
      .disc-replies {
        margin-top: .85rem; margin-left: 1rem;
        padding-left: 1rem;
        border-left: 2px solid var(--border);
        display: flex; flex-direction: column; gap: 1rem;
      }
      .disc-reply-comment { display: flex; gap: .7rem; }
      .disc-show-replies {
        background: none; border: none; cursor: pointer;
        font-size: .78rem; color: var(--primary); font-weight: 700;
        font-family: inherit; padding: .3rem 0; display: inline-flex;
        align-items: center; gap: .35rem; margin-top: .4rem;
        transition: opacity .15s;
      }
      .disc-show-replies:hover { opacity: .75; }

      /* ── Loading / error states ── */
      .disc-loading {
        display: flex; align-items: center; gap: .75rem;
        padding: 1.5rem; color: var(--text-400); font-size: .88rem;
      }
      .disc-spinner {
        width: 18px; height: 18px; border-radius: 50%;
        border: 2px solid var(--border); border-top-color: var(--primary);
        animation: spin .7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      .disc-toast {
        position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%) translateY(20px);
        background: var(--text-900); color: var(--card);
        padding: .65rem 1.25rem; border-radius: 60px;
        font-size: .85rem; font-weight: 600;
        z-index: 9999; opacity: 0;
        transition: opacity .3s, transform .3s;
        white-space: nowrap;
        pointer-events: none;
      }
      .disc-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

      /* ── Load more ── */
      .disc-load-more {
        text-align: center; margin-top: 1.5rem;
      }
      .disc-load-more-btn {
        background: transparent; border: 1.5px solid var(--border);
        color: var(--text-600); border-radius: 60px;
        padding: .6rem 1.5rem; font-size: .85rem; font-weight: 700;
        cursor: pointer; font-family: inherit; transition: all .2s;
      }
      .disc-load-more-btn:hover { border-color: var(--primary); color: var(--primary); }

      @media(max-width: 600px) {
        .disc-compose-top { flex-wrap: wrap; }
        .disc-name-input  { width: 100%; }
        .disc-time        { margin-left: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── Wait for Supabase + auth ──────────────────────────────
  async function waitForSupabase(timeout = 6000) {
    const start = Date.now();
    return new Promise(resolve => {
      const t = setInterval(() => {
        if (window.BrainHubAuth?.db) {
          clearInterval(t);
          db = window.BrainHubAuth.db;
          session = window.BrainHubAuth._session;
          resolve(true);
        }
        if (Date.now() - start > timeout) { clearInterval(t); resolve(false); }
      }, 100);
    });
  }

  // ── Local storage fallback ────────────────────────────────
  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
  }
  function saveLocal(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, MAX_OFFLINE))); } catch {}
  }

  // ── Cloud CRUD ────────────────────────────────────────────
  async function fetchComments() {
    if (!db) return loadLocal();
    try {
      const { data, error } = await db
        .from('discussions')
        .select('*')
        .eq('page_id', PAGE_ID)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      // Merge with local (cloud wins, but keep any pending offline posts)
      const cloud = data || [];
      const local = loadLocal();
      const cloudIds = new Set(cloud.map(c => c.id));
      const pendingLocal = local.filter(c => c._pending && !cloudIds.has(c.id));
      return [...cloud, ...pendingLocal];
    } catch (e) {
      console.warn('[Disc] Cloud fetch failed, using local:', e);
      return loadLocal();
    }
  }

  async function postComment(text, author, parentId) {
    const comment = {
      id:         crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
      page_id:    PAGE_ID,
      author:     author.trim() || 'Anonymous',
      text:       text.trim(),
      parent_id:  parentId || null,
      user_id:    session?.user?.id || null,
      likes:      0,
      created_at: new Date().toISOString(),
      _pending:   true,
    };

    // Optimistic local save
    const local = loadLocal();
    local.unshift(comment);
    saveLocal(local);
    comments.unshift(comment);
    renderComments();

    // Push to cloud
    if (db) {
      try {
        const { data, error } = await db.from('discussions').insert([{
          id:        comment.id,
          page_id:   comment.page_id,
          author:    comment.author,
          text:      comment.text,
          parent_id: comment.parent_id,
          user_id:   comment.user_id,
          likes:     0,
        }]).select().single();
        if (!error && data) {
          // Remove pending flag
          comment._pending = false;
          comment.created_at = data.created_at;
          saveLocal(loadLocal().map(c => c.id === comment.id ? comment : c));
        }
      } catch (e) {
        console.warn('[Disc] Cloud post failed, saved locally:', e);
      }
    }

    return comment;
  }

  async function likeComment(id) {
    // Toggle like in localStorage per user/device
    const likedKey = 'bh-disc-liked-' + id;
    const liked    = localStorage.getItem(likedKey);
    const delta    = liked ? -1 : 1;
    if (liked) localStorage.removeItem(likedKey);
    else       localStorage.setItem(likedKey, '1');

    // Update in memory
    const c = comments.find(x => x.id === id);
    if (c) c.likes = Math.max(0, (c.likes || 0) + delta);

    // Push to cloud
    if (db && c) {
      try {
        await db.from('discussions').update({ likes: c.likes }).eq('id', id);
      } catch {}
    }

    renderComments();
  }

  async function deleteComment(id) {
    if (!confirm('Delete this comment?')) return;
    comments = comments.filter(c => c.id !== id);
    saveLocal(loadLocal().filter(c => c.id !== id));
    if (db) {
      try { await db.from('discussions').delete().eq('id', id); } catch {}
    }
    renderComments();
    showDiscToast('Comment deleted.');
  }

  // ── Render helpers ────────────────────────────────────────
  function timeAgo(iso) {
    const d = Date.now() - new Date(iso).getTime();
    if (d < 60000)    return 'just now';
    if (d < 3600000)  return Math.floor(d / 60000) + 'm ago';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h ago';
    if (d < 2592000000) return Math.floor(d / 86400000) + 'd ago';
    return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }

  function getInitials(name) {
    return (name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function isOwnComment(c) {
    if (session?.user?.id && c.user_id === session.user.id) return true;
    // Check local author name match
    const savedName = localStorage.getItem('bh-disc-name');
    return savedName && c.author === savedName && c._pending;
  }

  function isAdmin(c) {
    return c.author === 'BrainHub' || c.user_id === 'admin';
  }

  function avatarHtml(name, size = '') {
    const user = session?.user;
    const avatarUrl = user?.user_metadata?.avatar_url;
    const initials  = getInitials(name);
    const sClass    = size ? ` disc-avatar-${size}` : '';
    if (avatarUrl && session?.user?.user_metadata?.full_name === name) {
      return `<div class="disc-avatar${sClass}"><img src="${avatarUrl}" alt="${initials}"></div>`;
    }
    return `<div class="disc-avatar${sClass}">${initials}</div>`;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Render ────────────────────────────────────────────────
  let sortBy    = 'newest';
  let showCount = 10;

  function renderComments() {
    const container = document.getElementById('discList');
    const countEl   = document.getElementById('discCount');
    if (!container) return;

    // Build top-level + replies map
    const topLevel = comments.filter(c => !c.parent_id);
    const replies  = comments.filter(c =>  c.parent_id);

    // Sort top-level
    const sorted = [...topLevel].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'top')    return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

    if (countEl) countEl.textContent = topLevel.length;

    if (!sorted.length) {
      container.innerHTML = `
        <div class="disc-empty">
          <i class="fas fa-comments"></i>
          <p>No comments yet. Be the first to ask a question or share a note!</p>
        </div>`;
      document.getElementById('discLoadMore')?.remove();
      return;
    }

    const visible = sorted.slice(0, showCount);

    container.innerHTML = visible.map(c => renderCommentHtml(c, replies, false)).join('');

    // Load more
    let lm = document.getElementById('discLoadMore');
    if (sorted.length > showCount) {
      if (!lm) {
        lm = document.createElement('div');
        lm.className = 'disc-load-more';
        lm.id = 'discLoadMore';
        container.after(lm);
      }
      lm.innerHTML = `<button class="disc-load-more-btn" onclick="window._discLoadMore()">
        <i class="fas fa-chevron-down"></i> Show ${sorted.length - showCount} more comment${sorted.length - showCount !== 1 ? 's' : ''}
      </button>`;
    } else {
      lm?.remove();
    }

    // Re-observe for scroll reveal
    document.querySelectorAll('.disc-comment').forEach(el => {
      if (!el.dataset.observed) {
        el.dataset.observed = '1';
      }
    });
  }

  function renderCommentHtml(c, replies, isReply) {
    const liked     = !!localStorage.getItem('bh-disc-liked-' + c.id);
    const canDelete = isOwnComment(c);
    const admin     = isAdmin(c);
    const threadReplies = replies.filter(r => r.parent_id === c.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const repliesHtml = threadReplies.map(r => `
      <div class="disc-reply-comment" id="disc-${r.id}">
        ${avatarHtml(r.author, 'sm')}
        <div class="disc-comment-body">
          <div class="disc-comment-header">
            <span class="disc-author${admin ? ' is-admin' : ''}">${escHtml(r.author)}</span>
            ${admin ? '<span class="disc-admin-badge">Team</span>' : ''}
            ${r._pending ? '<span style="font-size:.68rem;color:var(--text-400)">posting…</span>' : ''}
            <span class="disc-time">${timeAgo(r.created_at)}</span>
          </div>
          <p class="disc-text">${escHtml(r.text)}</p>
          <div class="disc-actions">
            <button class="disc-action-btn ${liked ? 'liked' : ''}" onclick="window._discLike('${r.id}')">
              <i class="fas fa-heart"></i> ${r.likes || 0}
            </button>
            ${!isReply ? `<button class="disc-action-btn" onclick="window._discReply('${c.id}','${escHtml(c.author)}')"><i class="fas fa-reply"></i> Reply</button>` : ''}
            ${canDelete ? `<button class="disc-action-btn" onclick="window._discDelete('${r.id}')"><i class="fas fa-trash"></i></button>` : ''}
          </div>
        </div>
      </div>`).join('');

    return `
      <div class="disc-comment" id="disc-${c.id}">
        ${avatarHtml(c.author)}
        <div class="disc-comment-body">
          <div class="disc-comment-header">
            <span class="disc-author${admin ? ' is-admin' : ''}">${escHtml(c.author)}</span>
            ${admin ? '<span class="disc-admin-badge">Team</span>' : ''}
            ${c._pending ? '<span style="font-size:.68rem;color:var(--text-400)">posting…</span>' : ''}
            <span class="disc-time">${timeAgo(c.created_at)}</span>
          </div>
          <p class="disc-text">${escHtml(c.text)}</p>
          <div class="disc-actions">
            <button class="disc-action-btn ${liked ? 'liked' : ''}" onclick="window._discLike('${c.id}')">
              <i class="fas fa-heart"></i> ${c.likes || 0}
            </button>
            <button class="disc-action-btn" onclick="window._discReply('${c.id}','${escHtml(c.author)}')">
              <i class="fas fa-reply"></i> Reply
            </button>
            ${canDelete ? `<button class="disc-action-btn" onclick="window._discDelete('${c.id}')"><i class="fas fa-trash"></i></button>` : ''}
          </div>
          ${threadReplies.length ? `<div class="disc-replies">${repliesHtml}</div>` : ''}
        </div>
      </div>`;
  }

  // ── Compose UI ────────────────────────────────────────────
  function buildCompose() {
    const user = session?.user;
    const savedName = localStorage.getItem('bh-disc-name') || '';
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || savedName;
    const isLoggedIn  = !!user;

    return `
      <div class="disc-compose" id="discCompose">
        <div id="discReplyBanner" style="display:none" class="disc-reply-banner">
          <i class="fas fa-reply"></i>
          <span>Replying to <strong id="discReplyName"></strong></span>
          <button onclick="window._discCancelReply()"><i class="fas fa-times"></i></button>
        </div>
        <div class="disc-compose-top">
          ${avatarHtml(displayName || 'A')}
          ${isLoggedIn
            ? `<div style="display:flex;align-items:center;gap:.5rem;font-size:.85rem;font-weight:700;color:var(--text-700);padding:.55rem 0">
                 <span>${escHtml(displayName)}</span>
                 <span style="font-size:.72rem;color:var(--text-400);font-weight:400">· signed in</span>
               </div>`
            : `<input class="disc-name-input" id="discNameInput" type="text"
                 placeholder="Your name (or leave blank for Anonymous)"
                 value="${escHtml(savedName)}"
                 oninput="localStorage.setItem('bh-disc-name',this.value)" />`
          }
        </div>
        <textarea class="disc-textarea" id="discTextarea"
          placeholder="Ask a question, share a note, or help a fellow student…"
          maxlength="2000"
          oninput="window._discUpdateChar(this)"></textarea>
        <div class="disc-compose-footer">
          <div class="disc-char-count" id="discCharCount">0 / 2000</div>
          <div style="display:flex;align-items:center;gap:.85rem;flex-wrap:wrap">
            ${!isLoggedIn ? `<span class="disc-login-note"><i class="fas fa-info-circle"></i> <a href="/pages/auth.html">Sign in</a> to track your comments</span>` : ''}
            <button class="disc-submit-btn" id="discSubmitBtn" onclick="window._discSubmit()">
              <i class="fas fa-paper-plane"></i> Post comment
            </button>
          </div>
        </div>
      </div>`;
  }

  // ── Global handlers (attached to window for inline HTML) ──
  window._discLike = likeComment;
  window._discDelete = deleteComment;

  window._discReply = function(parentId, authorName) {
    replyTo = { id: parentId, author: authorName };
    const banner = document.getElementById('discReplyBanner');
    const nameEl = document.getElementById('discReplyName');
    if (banner) banner.style.display = 'flex';
    if (nameEl) nameEl.textContent = authorName;
    document.getElementById('discTextarea')?.focus();
    document.getElementById('discCompose')?.scrollIntoView({ behavior:'smooth', block:'nearest' });
  };

  window._discCancelReply = function() {
    replyTo = null;
    const banner = document.getElementById('discReplyBanner');
    if (banner) banner.style.display = 'none';
  };

  window._discUpdateChar = function(ta) {
    const len = ta.value.length;
    const el  = document.getElementById('discCharCount');
    if (!el) return;
    el.textContent = `${len} / 2000`;
    el.className   = 'disc-char-count' + (len > 1800 ? ' over' : len > 1500 ? ' warn' : '');
  };

  window._discSubmit = async function() {
    const ta     = document.getElementById('discTextarea');
    const nameEl = document.getElementById('discNameInput');
    const btn    = document.getElementById('discSubmitBtn');
    const text   = ta?.value.trim();
    const user   = session?.user;

    if (!text) { showDiscToast('Please write something first.'); ta?.focus(); return; }
    if (text.length > 2000) { showDiscToast('Comment too long. Max 2000 characters.'); return; }

    const author = user?.user_metadata?.full_name
                || user?.email?.split('@')[0]
                || nameEl?.value.trim()
                || 'Anonymous';

    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting…'; }

    await postComment(text, author, replyTo?.id || null);

    if (ta) ta.value = '';
    window._discCancelReply();
    window._discUpdateChar(ta || { value: '' });
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Post comment'; }

    showDiscToast('Comment posted!');
    document.getElementById('discList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window._discSort = function(type) {
    sortBy = type;
    document.querySelectorAll('.disc-sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === type));
    renderComments();
  };

  window._discLoadMore = function() {
    showCount += 10;
    renderComments();
  };

  // ── Toast ─────────────────────────────────────────────────
  function showDiscToast(msg) {
    let t = document.getElementById('discToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'discToast';
      t.className = 'disc-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ── Mount ─────────────────────────────────────────────────
  async function mount() {
    const section = document.getElementById('discussionSection');
    if (!section) return;

    // Show loading
    section.innerHTML = `
      <div class="disc-section">
        <div class="disc-loading"><div class="disc-spinner"></div> Loading discussion…</div>
      </div>`;

    // Wait for auth SDK
    await waitForSupabase(5000);

    // Refresh session from BrainHubAuth if available
    if (window.BrainHubAuth) {
      session = window.BrainHubAuth._session;
    }

    // Load comments
    comments = await fetchComments();

    // Render
    section.innerHTML = `
      <div class="disc-section">
        <div class="disc-header">
          <div class="disc-title">
            <i class="fas fa-comments" style="color:var(--primary)"></i>
            Discussion
            <span class="disc-count" id="discCount">${comments.filter(c=>!c.parent_id).length}</span>
          </div>
          <div class="disc-sort">
            <button class="disc-sort-btn active" data-sort="newest" onclick="window._discSort('newest')">Newest</button>
            <button class="disc-sort-btn" data-sort="top" onclick="window._discSort('top')">Top</button>
            <button class="disc-sort-btn" data-sort="oldest" onclick="window._discSort('oldest')">Oldest</button>
          </div>
        </div>
        ${buildCompose()}
        <div class="disc-list" id="discList"></div>
      </div>`;

    renderComments();

    // Listen for auth changes (user signs in after page loads)
    window.addEventListener('brainhub:signin', async () => {
      session = window.BrainHubAuth?._session;
      // Refresh compose area
      const compose = document.getElementById('discCompose');
      if (compose) compose.outerHTML = buildCompose();
    });
    window.addEventListener('brainhub:signout', () => {
      session = null;
      const compose = document.getElementById('discCompose');
      if (compose) compose.outerHTML = buildCompose();
    });
  }

  // ── Boot ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();