document.addEventListener('DOMContentLoaded', () => {
  // Core
  initMobileMenu();
  initScrollEffects();
  initDarkMode();
  initScrollReveal();
  initBackToTop();
  initProgressBar();
  initAnnounceBanner();
  // Study tools
  initFlashcards();
  initLiveSearch();
  initPomodoroTimer();
  initWhatsNewModal();
  // User features
  initProgressTracker();
  initBookmarks();
  initSocialShare();
  initAIChatbot();
  initNewsletterForm();
  validateContactForm();
  // v3 features
  initMobileBottomNav();
  initKeyboardShortcuts();
  initSkeletonLoader();
  initStudyChallenge();
  initSuggestResource();
  initCompletionCertificate();
  initAlsoViewed();
  highlightActiveBottomNav();
});

// ==================== MOBILE MENU ====================
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav-links');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (icon) icon.className = nav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove('active');
      const icon = btn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  });
}

// ==================== SCROLL EFFECTS ====================
function initScrollEffects() {
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.boxShadow = window.scrollY > 0 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none';
  });
}

// ==================== PROGRESS BAR ====================
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0) + '%';
  });
}

// ==================== BACK TO TOP ====================
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

// ==================== ANNOUNCE BANNER ====================
function initAnnounceBanner() {
  const banner = document.getElementById('announceBanner');
  const closeBtn = document.getElementById('announceClose');
  if (!banner || !closeBtn) return;
  if (localStorage.getItem('bh-announce-closed') === '1') { banner.style.display = 'none'; return; }
  closeBtn.addEventListener('click', () => {
    banner.style.display = 'none';
    localStorage.setItem('bh-announce-closed', '1');
  });
}

// ==================== DARK MODE ====================
function initDarkMode() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  const saved = localStorage.getItem('brainhub-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('brainhub-theme', next);
    updateThemeIcon(next);
  });
}
function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ==================== FLASHCARDS ====================
function initFlashcards() {
  const flashcard = document.getElementById('flashcard');
  if (!flashcard) return;
  const questionEl = document.getElementById('flashcard-question');
  const answerEl = document.getElementById('flashcard-answer');
  const explanationEl = document.getElementById('flashcard-explanation');
  const currentCardEl = document.getElementById('currentCard');
  const totalCardsEl = document.getElementById('totalCards');
  const nextBtn = document.getElementById('nextCard');
  const prevBtn = document.getElementById('prevCard');
  const topicTags = document.querySelectorAll('.topic-tag');

  const flashcards = {
    geography: [
      { question: "What is the capital of Zambia?", answer: "Lusaka", explanation: "Lusaka is the capital and largest city of Zambia, located in the southern part of the central plateau." },
      { question: "Which river forms part of Zambia's border with Zimbabwe?", answer: "Zambezi River", explanation: "The Zambezi River forms the border between Zambia and Zimbabwe, famous for Victoria Falls." },
      { question: "What is the highest point in Zambia?", answer: "Mafinga Central", explanation: "Mafinga Central is the highest peak in Zambia at 2,339 metres above sea level." },
      { question: "Which country borders Zambia to the north?", answer: "Democratic Republic of Congo", explanation: "Zambia shares its longest border (1,930 km) with the DRC." },
      { question: "What is Zambia's largest national park?", answer: "Kafue National Park", explanation: "Kafue covers about 22,400 km², making it Zambia's largest national park." }
    ],
    science: [
      { question: "What is the chemical symbol for gold?", answer: "Au", explanation: "Au comes from the Latin word 'aurum', meaning gold." },
      { question: "What planet is known as the Red Planet?", answer: "Mars", explanation: "Mars appears red due to iron oxide (rust) on its surface." },
      { question: "What is the hardest natural substance on Earth?", answer: "Diamond", explanation: "Diamond scores 10 on the Mohs scale of mineral hardness." },
      { question: "What is the speed of light?", answer: "299,792,458 m/s", explanation: "Light travels at approximately 3 × 10⁸ metres per second in a vacuum." }
    ],
    mathematics: [
      { question: "What is the value of π to 4 decimal places?", answer: "3.1416", explanation: "π is the ratio of a circle's circumference to its diameter." },
      { question: "What is 15 squared?", answer: "225", explanation: "15 × 15 = 225" },
      { question: "What is the sum of angles in a triangle?", answer: "180°", explanation: "The interior angles of any triangle always add up to 180 degrees." }
    ],
    history: [
      { question: "In what year did Zambia gain independence?", answer: "1964", explanation: "Zambia gained independence from British rule on 24 October 1964." },
      { question: "Who was Zambia's first President?", answer: "Kenneth Kaunda", explanation: "Kenneth Kaunda led Zambia from independence in 1964 until 1991." }
    ],
    general: [
      { question: "How many bytes are in a kilobyte?", answer: "1,024 bytes", explanation: "1 KB = 1,024 bytes in binary computing." },
      { question: "What does HTML stand for?", answer: "HyperText Markup Language", explanation: "HTML is the standard markup language for creating web pages." }
    ]
  };

  const saved = JSON.parse(localStorage.getItem('brainhub-flashcards') || '{}');
  let currentDeck = saved.currentDeck || 'geography';
  let currentIndex = saved.currentIndex || 0;
  if (!flashcards[currentDeck]) { currentDeck = 'geography'; currentIndex = 0; }
  if (currentIndex >= flashcards[currentDeck].length) currentIndex = 0;

  updateActiveTopic(); updateFlashcard();
  flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
  nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); flashcard.classList.remove('flipped'); currentIndex = (currentIndex + 1) % flashcards[currentDeck].length; saveProgress(); updateFlashcard(); });
  prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); flashcard.classList.remove('flipped'); currentIndex = (currentIndex - 1 + flashcards[currentDeck].length) % flashcards[currentDeck].length; saveProgress(); updateFlashcard(); });
  topicTags.forEach(tag => tag.addEventListener('click', () => {
    const topic = tag.textContent.trim().toLowerCase();
    if (flashcards[topic]) { currentDeck = topic; currentIndex = 0; updateActiveTopic(); saveProgress(); updateFlashcard(); flashcard.classList.remove('flipped'); }
  }));

  function updateFlashcard() {
    const card = flashcards[currentDeck][currentIndex];
    if (!card) return;
    questionEl.textContent = card.question;
    answerEl.textContent = card.answer;
    if (explanationEl) explanationEl.textContent = card.explanation;
    if (currentCardEl) currentCardEl.textContent = currentIndex + 1;
    if (totalCardsEl) totalCardsEl.textContent = flashcards[currentDeck].length;
  }
  function updateActiveTopic() { topicTags.forEach(tag => tag.classList.toggle('active', tag.textContent.trim().toLowerCase() === currentDeck)); }
  function saveProgress() { localStorage.setItem('brainhub-flashcards', JSON.stringify({ currentDeck, currentIndex })); }
}

// ==================== LIVE SEARCH ====================
function initLiveSearch() { /* homepage search handled inline */ }
function searchMaterials() {
  const query = document.getElementById('searchInput')?.value?.trim();
  if (!query) return;
  window.location.href = `pages/universities.html?q=${encodeURIComponent(query)}`;
}

// ==================== POMODORO TIMER ====================
function initPomodoroTimer() {
  const widget = document.getElementById('pomodoroWidget');
  const toggleBtn = document.getElementById('timerToggle');
  const closeBtn = document.getElementById('timerClose');
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('timerStart');
  const pauseBtn = document.getElementById('timerPause');
  const resetBtn = document.getElementById('timerReset');
  const sessionCountEl = document.getElementById('sessionCount');
  const beep = document.getElementById('timerBeep');
  if (!widget) return;

  let minutes = 25, seconds = 0, interval = null;
  let sessions = parseInt(localStorage.getItem('brainhub-sessions') || '0');
  if (sessionCountEl) sessionCountEl.textContent = sessions;

  toggleBtn?.addEventListener('click', () => widget.classList.toggle('show'));
  closeBtn?.addEventListener('click', () => widget.classList.remove('show'));
  startBtn?.addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) { clearInterval(interval); interval = null; sessions++; localStorage.setItem('brainhub-sessions', sessions); if (sessionCountEl) sessionCountEl.textContent = sessions; try { beep?.play(); } catch(e){} minutes = 25; seconds = 0; updateDisplay(); return; }
        minutes--; seconds = 59;
      } else { seconds--; }
      updateDisplay();
    }, 1000);
  });
  pauseBtn?.addEventListener('click', () => { clearInterval(interval); interval = null; });
  resetBtn?.addEventListener('click', () => { clearInterval(interval); interval = null; minutes = 25; seconds = 0; updateDisplay(); });
  function updateDisplay() { if (display) display.textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`; }
}

// ==================== CONTACT FORM ====================
function validateContactForm() {
  const form = document.querySelector('.contact-form form');
  if (!form) return;
  form.addEventListener('submit', () => {
    const btn = form.querySelector('.submit-btn');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  });
}

// ==================== NEWSLETTER FORM ====================
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value?.trim();
    const btn = form.querySelector('.newsletter-btn');
    const msg = document.getElementById('newsletterMsg');
    if (!email) return;
    if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }
    // Store locally + post to Formspree
    const subs = JSON.parse(localStorage.getItem('bh-newsletter') || '[]');
    if (!subs.includes(email)) { subs.push(email); localStorage.setItem('bh-newsletter', JSON.stringify(subs)); }
    try {
      await fetch('https://formspree.io/f/xzdazvwz', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _subject: 'New BrainHub Newsletter Subscriber' })
      });
    } catch(e) {}
    if (msg) { msg.textContent = '🎉 You\'re subscribed! We\'ll notify you of new content.'; msg.style.display = 'block'; }
    form.reset();
    if (btn) { btn.textContent = 'Subscribed ✓'; }
  });
}

// ==================== PROGRESS TRACKER ====================
function initProgressTracker() {
  // Mark resource as complete
  document.querySelectorAll('.mark-done-btn').forEach(btn => {
    const id = btn.dataset.id;
    const done = getProgress(id);
    updateDoneBtn(btn, done);
    btn.addEventListener('click', () => {
      const newState = !getProgress(id);
      setProgress(id, newState);
      updateDoneBtn(btn, newState);
      showToast(newState ? '✓ Marked as complete!' : 'Unmarked');
      renderProgressBar();
    });
  });
  renderProgressBar();
}

function getProgress(id) {
  const progress = JSON.parse(localStorage.getItem('bh-progress') || '{}');
  return !!progress[id];
}

function setProgress(id, done) {
  const progress = JSON.parse(localStorage.getItem('bh-progress') || '{}');
  if (done) progress[id] = true; else delete progress[id];
  localStorage.setItem('bh-progress', JSON.stringify(progress));
}

function updateDoneBtn(btn, done) {
  btn.innerHTML = done ? '<i class="fas fa-check-circle"></i> Done' : '<i class="far fa-circle"></i> Mark done';
  btn.classList.toggle('done', done);
}

function renderProgressBar() {
  const bar = document.getElementById('courseProgressBar');
  const label = document.getElementById('courseProgressLabel');
  const total = document.querySelectorAll('.mark-done-btn').length;
  if (!bar || total === 0) return;
  const progress = JSON.parse(localStorage.getItem('bh-progress') || '{}');
  const ids = Array.from(document.querySelectorAll('.mark-done-btn')).map(b => b.dataset.id);
  const done = ids.filter(id => progress[id]).length;
  const pct = Math.round((done / total) * 100);
  bar.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${total} completed (${pct}%)`;
}

// ==================== BOOKMARKS ====================
function initBookmarks() {
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    const id = btn.dataset.id;
    const title = btn.dataset.title || 'Resource';
    const url = btn.dataset.url || window.location.href;
    updateBookmarkBtn(btn, isBookmarked(id));
    btn.addEventListener('click', () => {
      const bm = !isBookmarked(id);
      toggleBookmark(id, title, url, bm);
      updateBookmarkBtn(btn, bm);
      showToast(bm ? '🔖 Bookmarked!' : 'Bookmark removed');
    });
  });
  renderBookmarkPanel();
}

function isBookmarked(id) {
  return JSON.parse(localStorage.getItem('bh-bookmarks') || '[]').some(b => b.id === id);
}

function toggleBookmark(id, title, url, add) {
  let bms = JSON.parse(localStorage.getItem('bh-bookmarks') || '[]');
  if (add) { if (!bms.some(b => b.id === id)) bms.push({ id, title, url }); }
  else { bms = bms.filter(b => b.id !== id); }
  localStorage.setItem('bh-bookmarks', JSON.stringify(bms));
}

function updateBookmarkBtn(btn, saved) {
  btn.innerHTML = saved ? '<i class="fas fa-bookmark"></i> Saved' : '<i class="far fa-bookmark"></i> Save';
  btn.classList.toggle('bookmarked', saved);
}

function renderBookmarkPanel() {
  const panel = document.getElementById('bookmarksList');
  if (!panel) return;
  const bms = JSON.parse(localStorage.getItem('bh-bookmarks') || '[]');
  if (!bms.length) {
    panel.innerHTML = '<p class="bm-empty">No saved items yet. Bookmark documents and pages to find them here.</p>';
    return;
  }
  panel.innerHTML = bms.map(b => `
    <div class="bm-item">
      <i class="fas fa-bookmark"></i>
      <a href="${b.url}">${b.title}</a>
      <button class="bm-remove" onclick="removeBookmark('${b.id}')"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function removeBookmark(id) {
  toggleBookmark(id, '', '', false);
  renderBookmarkPanel();
  document.querySelectorAll(`.bookmark-btn[data-id="${id}"]`).forEach(btn => updateBookmarkBtn(btn, false));
  showToast('Bookmark removed');
}

// ==================== SOCIAL SHARE ====================
function initSocialShare() {
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;
      const url = encodeURIComponent(btn.dataset.url || window.location.href);
      const text = encodeURIComponent(btn.dataset.text || document.title);
      const links = {
        whatsapp: `https://wa.me/?text=${text}%20${url}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        copy:     null
      };
      if (platform === 'copy') {
        navigator.clipboard.writeText(decodeURIComponent(url)).then(() => showToast('🔗 Link copied!'));
      } else if (links[platform]) {
        window.open(links[platform], '_blank', 'width=600,height=400');
      }
    });
  });
}

// Share current page helper (callable from inline onclick)
function sharePage(platform) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(document.title + ' — Free study materials on BrainHub');
  const links = {
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  };
  if (platform === 'copy') { navigator.clipboard.writeText(decodeURIComponent(window.location.href)).then(() => showToast('🔗 Link copied!')); }
  else if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
}

// ==================== AI CHATBOT TUTOR ====================
function initAIChatbot() {
  const toggleBtn = document.getElementById('chatToggleBtn');
  const closeBtn = document.getElementById('chatCloseBtn');
  const chatWindow = document.getElementById('aiChatWindow');
  const sendBtn = document.getElementById('chatSendBtn');
  const inputEl = document.getElementById('chatInput');
  const messagesEl = document.getElementById('chatMessages');
  if (!toggleBtn || !chatWindow) return;

  let history = [];
  const context = document.querySelector('meta[name="course-context"]')?.content ||
    'BrainHub study platform for Zambian university students';

  toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open') && !history.length) {
      appendMessage('bot', "👋 Hi! I'm your BrainHub AI tutor. Ask me anything about your course material, and I'll do my best to help you understand it.");
    }
  });

  closeBtn?.addEventListener('click', () => chatWindow.classList.remove('open'));

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    appendMessage('user', text);
    history.push({ role: 'user', content: text });

    const typingId = appendMessage('bot', '<span class="typing-dots"><span></span><span></span><span></span></span>', true);

    try {
      const response = await fetch('http://brainhub-ai.gabrieljoshuabanda81.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: `You are a helpful, friendly AI tutor on BrainHub, a free study platform for Zambian university students. Context: ${context}. Keep answers clear, concise and encouraging. Use simple language suitable for university students. When explaining concepts, use examples relevant to Zambia where possible.`,
          messages: history
        })
      });
      const data = await response.json();
      const reply = data.content?.map(c => c.text || '').join('') || 'Sorry, I could not get a response. Please try again.';
      history.push({ role: 'assistant', content: reply });
      updateMessage(typingId, reply);
    } catch (err) {
      updateMessage(typingId, 'Network error. Please check your connection and try again.');
    }
  }

  sendBtn?.addEventListener('click', sendMessage);
  inputEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

  function appendMessage(role, content, raw = false) {
    const id = 'msg-' + Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = `chat-msg chat-${role}`;
    div.id = id;
    div.innerHTML = raw ? content : `<span>${escapeHtml(content).replace(/\n/g, '<br>')}</span>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return id;
  }

  function updateMessage(id, content) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<span>${escapeHtml(content).replace(/\n/g, '<br>')}</span>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

// ==================== DOCUMENT VIEWER (with PDF viewer + bookmarks + share) ====================
function initDocumentViewer(documents, type) {
  const docViewer = document.querySelector('.doc-viewer');
  const brickWall = document.getElementById('brickWall');
  const docList   = document.getElementById('docList');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const previewActive      = document.getElementById('previewActive');
  const loadMoreBtn        = document.getElementById('loadMoreBtn');
  const docCountSpan       = document.getElementById('docCount');

  if (!documents || documents.length === 0) {
    if (docViewer) docViewer.style.display = 'none';
    if (brickWall) brickWall.style.display = 'flex';
    return;
  }

  if (brickWall) brickWall.style.display = 'none';
  if (docViewer) docViewer.style.display = 'flex';
  if (!docList) return;

  let visibleCount = 5;
  if (docCountSpan) docCountSpan.textContent = documents.length + ' file' + (documents.length !== 1 ? 's' : '');

  function renderDocList() {
    const docsToShow = documents.slice(0, visibleCount);
    docList.innerHTML = docsToShow.map(doc => {
      const bm = isBookmarked('doc-' + doc.id);
      const done = getProgress('doc-' + doc.id);
      return `
        <div class="doc-card ${done ? 'doc-done' : ''}" data-id="${doc.id}">
          <div class="doc-icon ${doc.iconClass || 'pdf'}"><i class="fas ${doc.icon || 'fa-file-pdf'}"></i></div>
          <div class="doc-info">
            <div class="doc-title">${doc.title}</div>
            <div class="doc-meta">
              <span class="doc-type">${doc.type || 'PDF'}</span>
              <span class="doc-size"><i class="far fa-file"></i> ${doc.size || ''}</span>
              ${done ? '<span class="doc-done-badge"><i class="fas fa-check-circle"></i> Done</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.doc-card').forEach(card => {
      card.addEventListener('click', () => {
        const doc = documents.find(d => d.id == card.dataset.id);
        if (doc) selectDocument(doc);
        document.querySelectorAll('.doc-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    if (loadMoreBtn) loadMoreBtn.style.display = visibleCount >= documents.length ? 'none' : 'flex';
  }

  function selectDocument(doc) {
    if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    if (previewActive) {
      previewActive.style.display = 'block';
      const bm = isBookmarked('doc-' + doc.id);
      const done = getProgress('doc-' + doc.id);
      previewActive.innerHTML = `
        <div class="preview-doc-icon"><i class="fas ${doc.icon || 'fa-file-pdf'}"></i></div>
        <div class="preview-doc-title">${doc.title}</div>
        <div class="preview-doc-meta">
          <span><i class="far fa-file-alt"></i> ${doc.type || 'PDF'}</span>
          <span><i class="far fa-save"></i> ${doc.size || ''}</span>
        </div>
        <div class="preview-actions">
          <a href="${doc.url}" download class="download-btn"><i class="fas fa-download"></i> Download</a>
          <button class="view-btn" onclick="openPdfViewer('${doc.url}', '${doc.title.replace(/'/g,"\\'")}')"><i class="fas fa-eye"></i> Read</button>
        </div>
        <div class="preview-doc-extras">
          <button class="mark-done-btn ${done ? 'done' : ''}" data-id="doc-${doc.id}"
            onclick="toggleDocProgress('doc-${doc.id}', this)">
            ${done ? '<i class="fas fa-check-circle"></i> Done' : '<i class="far fa-circle"></i> Mark done'}
          </button>
          <button class="bookmark-btn ${bm ? 'bookmarked' : ''}" data-id="doc-${doc.id}" data-title="${doc.title}" data-url="${window.location.href}"
            onclick="toggleDocBookmark('doc-${doc.id}', '${doc.title.replace(/'/g,"\\'")}', this)">
            ${bm ? '<i class="fas fa-bookmark"></i> Saved' : '<i class="far fa-bookmark"></i> Save'}
          </button>
          <button class="share-doc-btn" onclick="sharePage('whatsapp')" title="Share on WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </button>
          <button class="share-doc-btn" onclick="sharePage('copy')" title="Copy link">
            <i class="fas fa-link"></i>
          </button>
        </div>
      `;
    }
  }

  loadMoreBtn?.addEventListener('click', () => { visibleCount += 5; renderDocList(); });
  renderDocList();
  if (documents.length > 0) {
    selectDocument(documents[0]);
    setTimeout(() => { const first = document.querySelector('.doc-card'); if (first) first.classList.add('active'); }, 100);
  }
}

// Inline helpers for document viewer buttons
function toggleDocProgress(id, btn) {
  const done = !getProgress(id);
  setProgress(id, done);
  btn.innerHTML = done ? '<i class="fas fa-check-circle"></i> Done' : '<i class="far fa-circle"></i> Mark done';
  btn.classList.toggle('done', done);
  // Update doc card badge
  const docId = id.replace('doc-', '');
  const card = document.querySelector(`.doc-card[data-id="${docId}"]`);
  if (card) {
    card.classList.toggle('doc-done', done);
    const badge = card.querySelector('.doc-done-badge');
    if (done && !badge) {
      const meta = card.querySelector('.doc-meta');
      if (meta) meta.insertAdjacentHTML('beforeend', '<span class="doc-done-badge"><i class="fas fa-check-circle"></i> Done</span>');
    } else if (!done && badge) badge.remove();
  }
  renderProgressBar();
  showToast(done ? '✓ Marked as complete!' : 'Unmarked');
}

function toggleDocBookmark(id, title, btn) {
  const bm = !isBookmarked(id);
  toggleBookmark(id, title, window.location.href, bm);
  btn.innerHTML = bm ? '<i class="fas fa-bookmark"></i> Saved' : '<i class="far fa-bookmark"></i> Save';
  btn.classList.toggle('bookmarked', bm);
  showToast(bm ? '🔖 Bookmarked!' : 'Bookmark removed');
}

// ==================== PDF VIEWER ====================
function openPdfViewer(url, title) {
  let overlay = document.getElementById('pdfViewerOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pdfViewerOverlay';
    overlay.className = 'pdf-overlay';
    overlay.innerHTML = `
      <div class="pdf-modal">
        <div class="pdf-modal-header">
          <span class="pdf-modal-title" id="pdfModalTitle"></span>
          <div class="pdf-modal-actions">
            <a id="pdfDownloadBtn" class="pdf-action-btn" download><i class="fas fa-download"></i> Download</a>
            <button class="pdf-action-btn" onclick="sharePage('whatsapp')"><i class="fab fa-whatsapp"></i> Share</button>
            <button class="pdf-action-btn" onclick="sharePage('copy')"><i class="fas fa-link"></i> Copy link</button>
            <button class="pdf-close-btn" id="pdfCloseBtn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <div class="pdf-modal-body">
          <iframe id="pdfFrame" src="" frameborder="0"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('pdfCloseBtn').addEventListener('click', closePdfViewer);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePdfViewer(); });
  }
  document.getElementById('pdfModalTitle').textContent = title || 'Document Preview';
  document.getElementById('pdfDownloadBtn').href = url;
  // Use Google Docs viewer as fallback for broad compatibility
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  document.getElementById('pdfFrame').src = viewerUrl;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePdfViewer() {
  const overlay = document.getElementById('pdfViewerOverlay');
  if (overlay) { overlay.classList.remove('open'); document.getElementById('pdfFrame').src = ''; }
  document.body.style.overflow = '';
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, duration = 2800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ==================== WHAT'S NEW MODAL ====================
function initWhatsNewModal() {
  const modal = document.getElementById('whatsNewModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const gotItBtn = document.getElementById('gotItBtn');
  const dontShowBtn = document.getElementById('dontShowAgainBtn');
  if (!modal) return;
  if (localStorage.getItem('brainhub-whatsnew-dismiss') === 'true') return;
  setTimeout(() => { modal.style.display = 'flex'; }, 600);
  function hideModal() { modal.style.display = 'none'; }
  modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
  closeBtn?.addEventListener('click', hideModal);
  gotItBtn?.addEventListener('click', hideModal);
  dontShowBtn?.addEventListener('click', () => { localStorage.setItem('brainhub-whatsnew-dismiss', 'true'); hideModal(); });
}

// ==================== FOOTER CLOCK ====================
function updateFooterClock() {
  const el = document.getElementById('realtime-clock');
  if (!el) return;
  const now = new Date();
  el.textContent = `${now.toLocaleDateString('en-US', {weekday:'short',year:'numeric',month:'short',day:'numeric'})} | ${now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
}
updateFooterClock();
setInterval(updateFooterClock, 1000);
/* ── features.js merged below ── */

/* ============================================================
   MOBILE BOTTOM NAVIGATION
   ============================================================ */
function initMobileBottomNav() {
  // Already rendered in HTML — just ensure active state is set
  highlightActiveBottomNav();
}

function highlightActiveBottomNav() {
  const links = document.querySelectorAll('.mobile-bottom-nav a[data-page]');
  const current = window.location.pathname;
  links.forEach(link => {
    const page = link.dataset.page;
    const isActive =
      (page === 'home'        && (current === '/' || current.endsWith('index.html'))) ||
      (page === 'universities' && current.includes('universities')) ||
      (page === 'flashcards'  && current.includes('flashcards')) ||
      (page === 'quizzes'     && current.includes('quizzes'));
    link.classList.toggle('active', isActive);
  });
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
function initKeyboardShortcuts() {
  // Inject shortcuts panel if not present
  if (!document.getElementById('shortcutsPanel')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="shortcuts-backdrop" id="shortcutsBackdrop"></div>
      <div class="shortcuts-hint" id="shortcutsPanel" role="dialog" aria-label="Keyboard shortcuts">
        <h3>
          Keyboard Shortcuts
          <button onclick="closeShortcuts()" aria-label="Close"><i class="fas fa-times"></i></button>
        </h3>
        <div class="shortcut-row">
          <span class="shortcut-desc">Open search</span>
          <span class="shortcut-key"><kbd>K</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Toggle dark / light mode</span>
          <span class="shortcut-key"><kbd>T</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Open AI Tutor chat</span>
          <span class="shortcut-key"><kbd>C</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Go to home</span>
          <span class="shortcut-key"><kbd>G</kbd> <kbd>H</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Go to universities</span>
          <span class="shortcut-key"><kbd>G</kbd> <kbd>U</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Go to flashcards</span>
          <span class="shortcut-key"><kbd>G</kbd> <kbd>F</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Study timer</span>
          <span class="shortcut-key"><kbd>P</kbd></span>
        </div>
        <div class="shortcut-row">
          <span class="shortcut-desc">Show shortcuts</span>
          <span class="shortcut-key"><kbd>?</kbd></span>
        </div>
      </div>
    `);
    document.getElementById('shortcutsBackdrop')
      .addEventListener('click', closeShortcuts);
  }

  let gPressed = false;
  let gTimer = null;

  document.addEventListener('keydown', (e) => {
    // Skip if typing in an input / textarea
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const key = e.key.toLowerCase();

    // G + letter navigation combos
    if (gPressed) {
      clearTimeout(gTimer);
      gPressed = false;
      if (key === 'h') { window.location.href = '/index.html'; return; }
      if (key === 'u') { window.location.href = '/pages/universities.html'; return; }
      if (key === 'f') { window.location.href = '/pages/flashcards.html'; return; }
      if (key === 'q') { window.location.href = '/pages/quizzes.html'; return; }
    }

    if (key === 'g') {
      gPressed = true;
      gTimer = setTimeout(() => { gPressed = false; }, 1000);
      return;
    }

    if (key === 'k' || (e.ctrlKey && key === 'k')) {
      e.preventDefault();
      const search = document.getElementById('searchInput');
      if (search) { search.focus(); search.select(); }
      else window.location.href = '/pages/universities.html';
      return;
    }

    if (key === 't') {
      document.getElementById('theme-toggle')?.click();
      return;
    }

    if (key === 'c') {
      document.getElementById('chatToggleBtn')?.click();
      return;
    }

    if (key === 'p') {
      document.getElementById('timerToggle')?.click();
      return;
    }

    if (key === '?') {
      toggleShortcuts();
      return;
    }

    if (key === 'escape') {
      closeShortcuts();
      closePdfViewer?.();
      document.getElementById('aiChatWindow')?.classList.remove('open');
      document.getElementById('pomodoroWidget')?.classList.remove('show');
    }
  });
}

function toggleShortcuts() {
  const panel = document.getElementById('shortcutsPanel');
  const backdrop = document.getElementById('shortcutsBackdrop');
  const isOpen = panel?.classList.contains('show');
  panel?.classList.toggle('show', !isOpen);
  backdrop?.classList.toggle('show', !isOpen);
}

function closeShortcuts() {
  document.getElementById('shortcutsPanel')?.classList.remove('show');
  document.getElementById('shortcutsBackdrop')?.classList.remove('show');
}

/* ============================================================
   SKELETON LOADER
   Shows skeletons on .skeleton-target elements until
   the page is fully interactive
   ============================================================ */
function initSkeletonLoader() {
  const targets = document.querySelectorAll('[data-skeleton]');
  if (!targets.length) return;

  targets.forEach(el => {
    const type = el.dataset.skeleton || 'card';
    el.innerHTML = buildSkeleton(type);
  });

  // Replace skeletons with real content after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      targets.forEach(el => {
        const realContent = el.dataset.realContent;
        if (realContent) {
          el.innerHTML = decodeURIComponent(realContent);
        }
        el.removeAttribute('data-skeleton');
      });
    }, 600); // small delay so skeleton is visible on fast connections too
  });
}

function buildSkeleton(type) {
  switch(type) {
    case 'doc-list':
      return Array(4).fill(0).map(() => `
        <div class="skeleton-doc-card">
          <span class="skeleton skeleton-icon" style="width:44px;height:44px;border-radius:var(--radius-sm);flex-shrink:0"></span>
          <div style="flex:1">
            <span class="skeleton skeleton-text wide"></span>
            <span class="skeleton skeleton-text short"></span>
          </div>
        </div>
      `).join('');
    case 'card-grid':
      return Array(3).fill(0).map(() => `
        <div class="skeleton-card-wrap">
          <span class="skeleton skeleton-icon"></span>
          <span class="skeleton skeleton-title"></span>
          <span class="skeleton skeleton-text wide"></span>
          <span class="skeleton skeleton-text mid"></span>
          <span class="skeleton skeleton-text short" style="margin-top:1rem"></span>
        </div>
      `).join('');
    case 'hero':
      return `
        <span class="skeleton skeleton-badge" style="margin-bottom:1rem"></span>
        <span class="skeleton skeleton-title" style="height:3rem;width:70%;margin-bottom:0.75rem"></span>
        <span class="skeleton skeleton-title" style="height:3rem;width:55%;margin-bottom:1.5rem"></span>
        <span class="skeleton skeleton-text wide" style="margin-bottom:0.5rem"></span>
        <span class="skeleton skeleton-btn" style="width:200px;height:48px;margin-top:1rem"></span>
      `;
    default: // 'card'
      return `
        <div class="skeleton-card-wrap">
          <span class="skeleton skeleton-icon"></span>
          <span class="skeleton skeleton-title"></span>
          <span class="skeleton skeleton-text wide"></span>
          <span class="skeleton skeleton-text mid"></span>
        </div>
      `;
  }
}

// Helper: show skeletons while async content loads
// Usage: showSkeletonWhile(containerEl, 'doc-list', asyncFn)
async function showSkeletonWhile(container, skeletonType, asyncFn) {
  const original = container.innerHTML;
  container.innerHTML = buildSkeleton(skeletonType);
  try {
    await asyncFn();
  } finally {
    // asyncFn is responsible for setting container.innerHTML
  }
}

/* ============================================================
   WEEKLY STUDY CHALLENGE
   ============================================================ */
const CHALLENGES = [
  {
    week: 1,
    title: "Cell Biology Basics",
    desc: "Test your knowledge of cell structure and function from BI 110.",
    question: "Which organelle is responsible for producing ATP through cellular respiration?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correct: 1,
    explanation: "The mitochondria is the powerhouse of the cell. It produces ATP via aerobic respiration through the processes of glycolysis, the Krebs cycle, and the electron transport chain.",
    course: "BI 110"
  },
  {
    week: 2,
    title: "Newton's Laws of Motion",
    desc: "A quick challenge from PH 110 — mechanics fundamentals.",
    question: "A 10 kg object accelerates at 2 m/s². What net force is acting on it?",
    options: ["5 N", "12 N", "20 N", "0.2 N"],
    correct: 2,
    explanation: "Using Newton's second law: F = ma. F = 10 kg × 2 m/s² = 20 N. Remember: force is always mass times acceleration.",
    course: "PH 110"
  },
  {
    week: 3,
    title: "Chemical Bonding",
    desc: "Test your understanding of atomic bonding from CH 110.",
    question: "Which type of bond involves the complete transfer of electrons from one atom to another?",
    options: ["Covalent bond", "Metallic bond", "Ionic bond", "Hydrogen bond"],
    correct: 2,
    explanation: "Ionic bonds form when one atom completely transfers one or more electrons to another atom, creating oppositely charged ions that attract each other. Example: NaCl (table salt).",
    course: "CH 110"
  },
  {
    week: 4,
    title: "Calculus Fundamentals",
    desc: "A quick differentiation challenge from MA 110.",
    question: "What is the derivative of f(x) = x³ + 2x² - 5x + 7?",
    options: ["3x² + 4x - 5", "x² + 2x - 5", "3x² + 4x + 7", "3x³ + 4x - 5"],
    correct: 0,
    explanation: "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹. So: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(7) = 0. Combined: f'(x) = 3x² + 4x - 5.",
    course: "MA 110"
  },
  {
    week: 5,
    title: "Zambian History & Context",
    desc: "A general knowledge challenge for LA 111.",
    question: "In what year did Zambia gain its independence from British colonial rule?",
    options: ["1960", "1962", "1964", "1966"],
    correct: 2,
    explanation: "Zambia gained independence on 24 October 1964, under the leadership of Kenneth Kaunda and the United National Independence Party (UNIP). October 24 is now celebrated as Zambia's Independence Day.",
    course: "LA 111"
  },
];

function getCurrentChallenge() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return CHALLENGES[weekNum % CHALLENGES.length];
}

function initStudyChallenge() {
  const container = document.getElementById('studyChallengeWidget');
  if (!container) return;

  const challenge = getCurrentChallenge();
  const savedKey = `bh-challenge-${challenge.week}`;
  const saved = JSON.parse(localStorage.getItem(savedKey) || 'null');
  const streak = parseInt(localStorage.getItem('bh-challenge-streak') || '0');

  // Countdown to next Monday
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0,0,0,0);

  container.innerHTML = `
    <div class="challenge-widget reveal">
      <div class="challenge-header">
        <span class="challenge-label"><i class="fas fa-fire"></i> Weekly Challenge</span>
        <span class="challenge-countdown" id="challengeCountdown">
          <i class="fas fa-clock"></i> Next in <strong id="challengeTimer">--:--:--</strong>
        </span>
      </div>
      <div class="challenge-title">${challenge.title}</div>
      <div class="challenge-desc">${challenge.desc} <span style="font-size:0.78rem;color:var(--primary);font-weight:600">${challenge.course}</span></div>

      <div class="challenge-question">
        <p>${challenge.question}</p>
        <div class="challenge-options" id="challengeOptions">
          ${challenge.options.map((opt, i) => `
            <button class="challenge-option" data-index="${i}" ${saved !== null ? 'disabled' : ''}>
              <span class="opt-letter">${String.fromCharCode(65+i)}</span>
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="challenge-result ${saved !== null ? 'show' : ''}" id="challengeResult">
        ${saved !== null ? `<strong>${saved.correct ? '✓ Correct!' : '✗ Not quite.'}</strong> ${challenge.explanation}` : ''}
      </div>

      <div class="challenge-footer">
        <span class="challenge-streak">
          <i class="fas fa-fire" style="color:#f59e0b"></i>
          Streak: <strong id="streakCount">${streak}</strong> week${streak !== 1 ? 's' : ''}
        </span>
        <a href="${getCourseLink(challenge.course)}" class="link-btn" style="font-size:0.85rem">
          Study ${challenge.course} <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;

  // Restore previous answer highlighting
  if (saved !== null) {
    highlightChallengeAnswer(challenge.correct, saved.chosen);
  }

  // Bind option clicks
  document.querySelectorAll('.challenge-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const chosen = parseInt(btn.dataset.index);
      const isCorrect = chosen === challenge.correct;

      // Save answer
      const newStreak = isCorrect ? streak + 1 : 0;
      localStorage.setItem(savedKey, JSON.stringify({ correct: isCorrect, chosen }));
      localStorage.setItem('bh-challenge-streak', newStreak);
      document.getElementById('streakCount').textContent = newStreak;

      // Disable all options
      document.querySelectorAll('.challenge-option').forEach(b => b.disabled = true);

      // Highlight
      highlightChallengeAnswer(challenge.correct, chosen);

      // Show explanation
      const result = document.getElementById('challengeResult');
      result.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong> ${challenge.explanation}`;
      result.classList.add('show');

      if (isCorrect) showToast('🔥 Correct! Streak: ' + newStreak);
      else showToast('Keep studying — you\'ll get it next time!');
    });
  });

  // Countdown timer
  function updateCountdown() {
    const diff = nextMonday - new Date();
    if (diff <= 0) { document.getElementById('challengeTimer').textContent = 'Refreshing…'; return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const el = document.getElementById('challengeTimer');
    if (el) el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function highlightChallengeAnswer(correct, chosen) {
  document.querySelectorAll('.challenge-option').forEach((btn, i) => {
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen && chosen !== correct) btn.classList.add('wrong');
  });
}

function getCourseLink(course) {
  const map = {
    'BI 110': '/pages/universities/cbu/programs/natural-sciences/bio110/index.html',
    'PH 110': '/pages/universities/cbu/programs/natural-sciences/ph110/index.html',
    'CH 110': '/pages/universities/cbu/programs/natural-sciences/ch110/index.html',
    'MA 110': '/pages/universities/cbu/programs/natural-sciences/ma110/index.html',
    'LA 111': '/pages/universities/cbu/programs/natural-sciences/la111/index.html',
  };
  return map[course] || '/pages/universities.html';
}

/* ============================================================
   SUGGEST A RESOURCE
   ============================================================ */
function initSuggestResource() {
  document.querySelectorAll('.suggest-resource-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const course = btn.dataset.course || '';
      const university = btn.dataset.university || 'CBU';
      openSuggestModal(course, university);
    });
  });
}

function openSuggestModal(course, university) {
  // Remove existing modal
  document.getElementById('suggestModal')?.remove();

  const modal = document.createElement('div');
  modal.className = 'suggest-modal-overlay';
  modal.id = 'suggestModal';
  modal.innerHTML = `
    <div class="suggest-modal">
      <button class="suggest-close" onclick="closeSuggestModal()"><i class="fas fa-times"></i></button>
      <h3>📎 Suggest a Resource</h3>
      <p>Found a useful document, link, or textbook? Share it and help fellow students.</p>

      <div style="display:flex;flex-direction:column;gap:0.85rem;">
        <div>
          <label style="font-size:0.8rem;font-weight:700;color:var(--text-700);display:block;margin-bottom:0.3rem">
            Resource title *
          </label>
          <input id="suggestTitle" type="text" placeholder="e.g. BI 110 Cell Structure Notes"
            style="width:100%;padding:0.7rem 0.9rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.875rem;font-family:var(--font-body);background:var(--bg-subtle);color:var(--text-900);outline:none;box-sizing:border-box"
            value="${course ? course + ' ' : ''}" />
        </div>
        <div>
          <label style="font-size:0.8rem;font-weight:700;color:var(--text-700);display:block;margin-bottom:0.3rem">
            Link or description *
          </label>
          <textarea id="suggestLink" placeholder="Paste a URL, Google Drive link, or describe the resource…"
            rows="3"
            style="width:100%;padding:0.7rem 0.9rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.875rem;font-family:var(--font-body);background:var(--bg-subtle);color:var(--text-900);outline:none;resize:vertical;box-sizing:border-box"></textarea>
        </div>
        <div>
          <label style="font-size:0.8rem;font-weight:700;color:var(--text-700);display:block;margin-bottom:0.3rem">
            Your name (optional)
          </label>
          <input id="suggestName" type="text" placeholder="Anonymous"
            style="width:100%;padding:0.7rem 0.9rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.875rem;font-family:var(--font-body);background:var(--bg-subtle);color:var(--text-900);outline:none;box-sizing:border-box" />
        </div>
        <button onclick="submitSuggestion('${university}', '${course}')"
          style="background:var(--primary);color:white;border:none;padding:0.8rem;border-radius:var(--radius-sm);font-weight:700;font-size:0.9rem;cursor:pointer;font-family:var(--font-body);transition:var(--transition);margin-top:0.25rem">
          <i class="fas fa-paper-plane"></i> Submit Suggestion
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeSuggestModal(); });
  setTimeout(() => document.getElementById('suggestTitle')?.focus(), 100);
}

async function submitSuggestion(university, course) {
  const title = document.getElementById('suggestTitle')?.value?.trim();
  const link  = document.getElementById('suggestLink')?.value?.trim();
  const name  = document.getElementById('suggestName')?.value?.trim() || 'Anonymous';

  if (!title || !link) { showToast('Please fill in the title and link/description.'); return; }

  const btn = document.querySelector('#suggestModal button[onclick*="submitSuggestion"]');
  if (btn) { btn.textContent = 'Submitting…'; btn.disabled = true; }

  try {
    await fetch('https://formspree.io/f/xzdazvwz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: `Resource suggestion: ${title}`,
        university, course, title, link, name
      })
    });
  } catch(e) {}

  closeSuggestModal();
  showToast('✓ Thanks! We\'ll review your suggestion soon.');
}

function closeSuggestModal() {
  const modal = document.getElementById('suggestModal');
  if (modal) modal.remove();
}

/* ============================================================
   ALSO VIEWED (Students also viewed)
   Call renderAlsoViewed(coursesArray) on course pages
   ============================================================ */
function initAlsoViewed() {
  const container = document.getElementById('alsoViewedContainer');
  if (!container) return;

  // Read courses from data attribute
  let courses = [];
  try { courses = JSON.parse(container.dataset.courses || '[]'); } catch(e) {}
  if (!courses.length) return;

  container.innerHTML = `
    <div class="also-viewed">
      <h3><i class="fas fa-graduation-cap"></i> Students also viewed</h3>
      <div class="also-viewed-grid">
        ${courses.map(c => `
          <a href="${c.url}" class="also-viewed-card" style="text-decoration:none">
            <div class="also-viewed-icon" style="background:${c.color || 'var(--primary-light)'};color:${c.textColor || 'var(--primary)'}">
              ${c.code}
            </div>
            <div class="also-viewed-info">
              <h4>${c.name}</h4>
              <p>${c.desc || 'View resources'}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

/* ============================================================
   COURSE COMPLETION CERTIFICATE
   ============================================================ */
function initCompletionCertificate() {
  const trigger = document.getElementById('certTrigger');
  if (!trigger) return;

  // Check if course is 100% complete
  const buttons = document.querySelectorAll('.mark-done-btn');
  if (!buttons.length) return;

  function checkCompletion() {
    const progress = JSON.parse(localStorage.getItem('bh-progress') || '{}');
    const ids = Array.from(buttons).map(b => b.dataset.id);
    const allDone = ids.every(id => progress[id]);
    trigger.classList.toggle('show', allDone);
  }

  checkCompletion();
  // Re-check whenever a mark-done btn is clicked
  document.addEventListener('click', e => {
    if (e.target.closest('.mark-done-btn')) setTimeout(checkCompletion, 100);
  });

  document.getElementById('certGenerateBtn')?.addEventListener('click', () => {
    const courseName = trigger.dataset.course || 'Course';
    const studentName = prompt('Enter your name for the certificate:', 'Student') || 'Student';
    generateCertificate(studentName, courseName);
  });
}

function generateCertificate(studentName, courseName) {
  // Remove existing overlay
  document.getElementById('certOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'cert-overlay';
  overlay.id = 'certOverlay';

  const canvasWrap = document.createElement('div');
  canvasWrap.className = 'cert-canvas-wrap';
  const canvas = document.createElement('canvas');
  canvas.id = 'certCanvas';
  canvas.width = 900;
  canvas.height = 640;
  canvasWrap.appendChild(canvas);

  const actions = document.createElement('div');
  actions.className = 'cert-actions';
  actions.innerHTML = `
    <button class="cert-download-btn" id="certDownloadBtn">
      <i class="fas fa-download"></i> Download Certificate
    </button>
    <button class="cert-close-btn" id="certCloseBtn">
      <i class="fas fa-times"></i> Close
    </button>
  `;

  overlay.appendChild(canvasWrap);
  overlay.appendChild(actions);
  document.body.appendChild(overlay);

  document.getElementById('certCloseBtn').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // Draw certificate
  drawCertificate(canvas, studentName, courseName);

  document.getElementById('certDownloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `BrainHub_Certificate_${studentName.replace(/\s+/g,'_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('🎓 Certificate downloaded!');
  });
}

function drawCertificate(canvas, studentName, courseName) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  ctx.fillStyle = '#fffdf5';
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Inner border
  ctx.strokeStyle = '#e4c96e';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Corner ornaments
  drawCornerOrnament(ctx, 44, 44);
  drawCornerOrnament(ctx, W - 44, 44, true);
  drawCornerOrnament(ctx, 44, H - 44, false, true);
  drawCornerOrnament(ctx, W - 44, H - 44, true, true);

  // Header gradient bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,   '#1e3a8a');
  grad.addColorStop(0.5, '#2563eb');
  grad.addColorStop(1,   '#0891b2');
  ctx.fillStyle = grad;
  ctx.fillRect(50, 50, W - 100, 80);

  // BrainHub logo text in bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px serif';
  ctx.textAlign = 'center';
  ctx.fillText('BrainHub', W / 2, 103);

  // Title
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF STUDY COMPLETION', W / 2, 168);

  // Decorative line
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 182); ctx.lineTo(W - 120, 182);
  ctx.stroke();

  // This certifies text
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 17px serif';
  ctx.fillText('This certifies that', W / 2, 222);

  // Student name
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 46px serif';
  ctx.fillText(studentName, W / 2, 290);

  // Underline for name
  const nameWidth = ctx.measureText(studentName).width;
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W/2 - nameWidth/2, 302);
  ctx.lineTo(W/2 + nameWidth/2, 302);
  ctx.stroke();

  // Has successfully text
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 17px serif';
  ctx.fillText('has successfully completed all study materials for', W / 2, 342);

  // Course name
  ctx.fillStyle = '#2563eb';
  ctx.font = 'bold 28px serif';
  ctx.fillText(courseName, W / 2, 390);

  // On BrainHub text
  ctx.fillStyle = '#64748b';
  ctx.font = '15px serif';
  ctx.fillText('on BrainHub — the free study platform for Zambian students', W / 2, 424);

  // Decorative line
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 442); ctx.lineTo(W - 120, 442);
  ctx.stroke();

  // Date
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  ctx.fillStyle = '#64748b';
  ctx.font = '14px serif';
  ctx.fillText(`Awarded on ${dateStr}`, W / 2, 475);

  // Seal circle
  ctx.beginPath();
  ctx.arc(W / 2, 552, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px serif';
  ctx.fillText('BRAINHUB', W / 2, 545);
  ctx.font = '10px serif';
  ctx.fillText('VERIFIED', W / 2, 562);

  // Stars around seal
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x = W/2 + Math.cos(angle) * 60;
    const y = 552 + Math.sin(angle) * 60;
    ctx.fillStyle = '#c8a84b';
    ctx.font = '10px serif';
    ctx.fillText('★', x - 5, y + 4);
  }

  // Website
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px serif';
  ctx.fillText('brainhub.zm', W / 2, 612);
}

function drawCornerOrnament(ctx, x, y, flipX = false, flipY = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.strokeStyle = '#c8a84b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 20); ctx.lineTo(0, 0); ctx.lineTo(20, 0);
  ctx.stroke();
  ctx.fillStyle = '#c8a84b';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ============================================================
   KEYBOARD SHORTCUT HINT IN FOOTER
   ============================================================ */
function showKeyboardHint() {
  toggleShortcuts();
}
