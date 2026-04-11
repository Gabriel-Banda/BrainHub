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
  initOnboarding();
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

// ==================== i18n HELPER ====================
// Thin wrapper — returns translated string or falls back to English key
function i18n(key, fallback) {
  return window.BrainHubI18n?.t(key, fallback) || fallback || key;
}

// ==================== DARK MODE (auto + manual) ====================
// If user has never manually chosen a theme, we follow the system.
// If they click the toggle, we remember their choice and stop following system.
function initDarkMode() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function getTheme() {
    const saved = localStorage.getItem('brainhub-theme');
    if (saved) return saved;                          // user chose manually
    return mq.matches ? 'dark' : 'light';             // follow system
  }

  applyTheme(getTheme());

  // Listen for system theme changes — only applies if user hasn't chosen manually
  mq.addEventListener('change', (e) => {
    if (!localStorage.getItem('brainhub-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Manual toggle — saves preference
  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('brainhub-theme', next);
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
    { 
      question: "Define the 'Pedicle' in the context of Zambian geography.", 
      answer: "The Congo Pedicle", 
      explanation: "A salient of the DRC territory that cuts into Zambia, effectively dividing the Copperbelt and Luapula provinces." 
    },
    { 
      question: "What are the three main drainage basins in Zambia?", 
      answer: "Zambezi, Congo, and Lake Rukwa", 
      explanation: "The Zambezi basin is the largest, covering about 75% of the country, followed by the Congo basin in the north." 
    },
    { 
      question: "Which tectonic feature is responsible for the formation of Lake Tanganyika?", 
      answer: "The East African Rift System", 
      explanation: "Lake Tanganyika is a rift lake formed by the tectonic separation of the African Plate into the Somalian and Nubian plates." 
    },
    { 
      question: "Identify the four major agro-ecological zones in Zambia.", 
      answer: "Region I, IIa, IIb, and III", 
      explanation: "These regions are classified based on annual rainfall, with Region III being the highest rainfall area (over 1000mm)." 
    },
    { 
      question: "Explain the 'Rain Shadow Effect' in the context of the Muchinga Mountains.", 
      answer: "Orographic Precipitation", 
      explanation: "As moist air rises over the Muchinga Escarpment, it cools and releases rain on the windward side, leaving the leeward side (Luangwa Valley) significantly drier." 
    },
    { 
      question: "What is the economic significance of the 'Line of Rail' in Zambia?", 
      answer: "Industrial and Urban Backbone", 
      explanation: "It is the primary corridor for trade and transport, connecting the Copperbelt to Lusaka and Livingstone, housing the majority of Zambia's urban population and industry." 
    },
    { 
      question: "What characterizes 'Veld' vegetation found in parts of Southern Africa?", 
      answer: "Open Grasslands", 
      explanation: "Veld refers to wide, open rural spaces of Southern Africa, typically covered in grass or low shrubbery, used extensively for cattle grazing." 
    }
  ],
  science: [
    { 
      question: "What is the 'Central Dogma' of molecular biology?", 
      answer: "DNA → RNA → Protein", 
      explanation: "It describes the two-step process, transcription and translation, by which the information in genes flows into proteins." 
    },
    { 
      question: "Define the 'Heisenberg Uncertainty Principle'.", 
      answer: "Δx Δp ≥ h/4π", 
      explanation: "It states that it is impossible to simultaneously know the exact position (x) and momentum (p) of a particle." 
    },
    { 
      question: "What is the difference between a galvanic and an electrolytic cell?", 
      answer: "Spontaneity of reaction", 
      explanation: "Galvanic cells convert chemical energy into electrical energy (spontaneous), while electrolytic cells use electricity to drive a non-spontaneous reaction." 
    },
    { 
      question: "Define 'Homeostasis' in biological systems.", 
      answer: "Dynamic Equilibrium", 
      explanation: "The process by which biological systems maintain stability while adjusting to changing external conditions." 
    },
    { 
      question: "What is the 'Photoelectric Effect' and who explained it?", 
      answer: "Emission of electrons by light; Albert Einstein.", 
      explanation: "It occurs when light shining on a metal surface causes the emission of electrons, proving that light behaves as discrete packets of energy called photons." 
    },
    { 
      question: "Define 'Buffer Solution' in Chemistry.", 
      answer: "pH Resistance", 
      explanation: "A solution consisting of a weak acid and its conjugate base (or vice versa) that resists changes in pH when small amounts of acid or base are added." 
    },
    { 
      question: "What is 'Allopatric Speciation'?", 
      answer: "Geographic Isolation", 
      explanation: "The formation of new species from a single ancestral species due to geographic barriers that prevent gene flow between populations." 
    },
    { 
      question: "State the First Law of Thermodynamics.", 
      answer: "Conservation of Energy", 
      explanation: "Energy cannot be created or destroyed — it only changes form. For example, the heat energy added to a gas minus the work the gas does on its surroundings equals the change in its internal energy." 
    }
  ],
  mathematics: [
    { 
      question: "State the 'Fundamental Theorem of Calculus'.", 
      answer: "Integration and Differentiation are inverse processes.", 
      explanation: "Specifically, it states that the definite integral of a function can be found using its antiderivative." 
    },
    { 
      question: "What defines a 'Linear Transformation' in Linear Algebra?", 
      answer: "Additivity and Homogeneity", 
      explanation: "A transformation is linear if two rules hold: (1) transforming two vectors added together gives the same result as transforming each one separately and then adding, and (2) scaling a vector before or after the transformation makes no difference." 
    },
    { 
      question: "What is the 'Normal Distribution' in Statistics?", 
      answer: "A Bell Curve", 
      explanation: "A probability distribution symmetric about the mean, showing that data near the mean are more frequent in occurrence." 
    },
    { 
      question: "What is the 'Squeeze Theorem' (Sandwich Theorem)?", 
      answer: "Limit Evaluation Technique", 
      explanation: "Think of it like a sandwich: if a function is always trapped between two other functions, and those two outer functions both approach the same value at a point, then the trapped function is forced to approach that same value too." 
    },
    { 
      question: "Define an 'Improper Integral'.", 
      answer: "Infinite limits or discontinuities.", 
      explanation: "An integral where either the interval of integration is infinite or the integrand has an infinite discontinuity within the interval." 
    },
    { 
      question: "What is the 'Taylor Series' expansion?", 
      answer: "Power Series Representation", 
      explanation: "A representation of a function as an infinite sum of terms calculated from the values of its derivatives at a single point." 
    }
  ],
  history: [
    { 
      question: "What was the significance of the 1948 Federation of Rhodesia and Nyasaland proposal?", 
      answer: "A consolidation of white settler power.", 
      explanation: "It aimed to unite Northern Rhodesia, Southern Rhodesia, and Nyasaland, sparking intense African nationalist resistance." 
    },
    { 
      question: "Define 'Humanism' as applied to the First Republic of Zambia.", 
      answer: "Zambian Humanism", 
      explanation: "Kenneth Kaunda's socio-political philosophy that combined socialist ideals with traditional African values, emphasizing the importance of man." 
    },
    { 
      question: "What occurred during the 'Choma Declaration' of 1972?", 
      answer: "Transition to a One-Party State", 
      explanation: "The signing of an agreement between UNIP and the ANC (Harry Nkumbula) effectively ending multi-party politics until 1990." 
    },
    { 
      question: "What was the 'Mulungushi Reforms' of 1968?", 
      answer: "Economic Nationalization", 
      explanation: "A set of policies where the Zambian government took a 51% controlling interest in major foreign-owned companies, shifting toward a state-led economy." 
    },
    { 
      question: "What was the role of the 'United National Independence Party' (UNIP)?", 
      answer: "Liberation and Post-Independence Governance", 
      explanation: "Founded by Kenneth Kaunda, it was the primary vehicle for the independence struggle and the sole legal party during Zambia's Second Republic." 
    },
    { 
      question: "Identify the 'Barotse Agreement 1964'.", 
      answer: "Regional Autonomy Treaty", 
      explanation: "An agreement between the Litunga of Barotseland and Kenneth Kaunda regarding the status and semi-autonomy of Barotseland within the sovereign state of Zambia." 
    }
  ],
  general: [
    { 
      question: "Define 'Macroeconomics' at a university level.", 
      answer: "Study of aggregate economy", 
      explanation: "Focuses on large-scale economic factors such as interest rates, national productivity, and global trade." 
    },
    { 
      question: "What is the purpose of 'Peer Review' in academic publishing?", 
      answer: "Quality Control and Validation", 
      explanation: "The evaluation of work by experts in the same field to ensure scientific rigor and credibility before publication." 
    },
    { 
      question: "Define 'Opportunity Cost' in Economics.", 
      answer: "The cost of the next best alternative.", 
      explanation: "In decision-making, it represents the value or benefit given up by choosing one option over another." 
    },
    { 
      question: "What is the 'Social Contract' theory in Political Science?", 
      answer: "Agreement between the ruled and their rulers.", 
      explanation: "The idea that individuals consent, either explicitly or implicitly, to surrender some freedoms to an authority in exchange for protection of their remaining rights." 
    },
    { 
      question: "Explain the difference between 'Reliability' and 'Validity' in research.", 
      answer: "Consistency vs. Accuracy", 
      explanation: "Reliability refers to how consistent a measure is; Validity refers to how accurately a tool measures what it is intended to measure." 
    }
  ]
};

let currentDeck = 'geography';
  let currentIndex = 0;

  // Initial UI Update
  updateFlashcard();

  // Flip Logic
  // Flip on click
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  // Navigation — always unflip first, wait for unflip to finish, then swap content
  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasFlipped = flashcard.classList.contains('flipped');
    flashcard.classList.remove('flipped');
    const delay = wasFlipped ? 350 : 0;
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % flashcards[currentDeck].length;
      swapCard('next');
    }, delay);
  });

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasFlipped = flashcard.classList.contains('flipped');
    flashcard.classList.remove('flipped');
    const delay = wasFlipped ? 350 : 0;
    setTimeout(() => {
      currentIndex = (currentIndex - 1 + flashcards[currentDeck].length) % flashcards[currentDeck].length;
      swapCard('prev');
    }, delay);
  });

  // Topic Selection
  topicTags.forEach(tag => {
    tag.addEventListener('click', () => {
      topicTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      currentDeck = tag.textContent.trim().toLowerCase();
      currentIndex = 0;
      flashcard.classList.remove('flipped');
      setTimeout(() => swapCard('next'), 50);
    });
  });

  // Swap content with a fade on just the text, never touching inner's transform
  function swapCard(direction) {
    const front = flashcard.querySelector('.flashcard-front');
    const back  = flashcard.querySelector('.flashcard-back');

    // Fade out both faces
    [front, back].forEach(el => {
      el.style.transition = 'opacity 0.15s ease';
      el.style.opacity = '0';
    });

    setTimeout(() => {
      updateFlashcard();
      // Fade back in
      [front, back].forEach(el => {
        el.style.transition = 'opacity 0.2s ease';
        el.style.opacity = '1';
      });
      // Clean up inline styles so CSS takes over again
      setTimeout(() => {
        [front, back].forEach(el => {
          el.style.transition = '';
          el.style.opacity = '';
        });
      }, 220);
    }, 160);
  }

  function updateFlashcard() {
    const card = flashcards[currentDeck][currentIndex];
    if (!card) return;

    questionEl.textContent = card.question;
    answerEl.textContent = card.answer;
    if (explanationEl) explanationEl.textContent = card.explanation;
    if (currentCardEl) currentCardEl.textContent = currentIndex + 1;
    if (totalCardsEl) totalCardsEl.textContent = flashcards[currentDeck].length;

    if (window.renderMathInElement) {
      renderMathInElement(flashcard, {
        delimiters: [{ left: '$', right: '$', display: false }]
      });
    }
  }
}

// ==================== LIVE SEARCH ====================
function initLiveSearch() { /* homepage search handled inline */ }
function searchMaterials() {
  window.BrainHubXP?.trackSearch();
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
      if (newState) window.BrainHubXP?.trackDocComplete();
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
  window.dispatchEvent(new Event('brainhub:progresschange'));
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
  window.dispatchEvent(new Event('brainhub:bookmarkchange'));
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
  window.BrainHubXP?.trackShare();
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
      const response = await fetch('https://brainhub-ai.gabrieljoshuabanda81.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: `You are a helpful, friendly AI tutor on BrainHub, a free study platform for Zambian university students. Context: ${context}. Format your responses in clean HTML only — never use markdown symbols like **, ##, --, or ---. Use <strong> for bold, <em> for italic, <h4> for headings, <ul>/<li> for bullet lists, <ol>/<li> for numbered lists, <table><thead><tbody><tr><th><td> for tables, <br> for line breaks, and <p> for paragraphs. Keep answers clear and encouraging. Use simple language suitable for university students. Use examples relevant to Zambia where possible.`,
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
    div.innerHTML = raw ? content : `<div class="chat-html">${renderChatContent(content)}</div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return id;
  }

  function updateMessage(id, content) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div class="chat-html">${renderChatContent(content)}</div>`;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Renders bot response — accepts HTML from AI, also converts any
  // stray markdown as a fallback in case the AI slips back into it
  function renderChatContent(content) {
    // If content looks like HTML already (AI followed instructions), use it directly
    if (/<[a-z][\s\S]*>/i.test(content)) {
      // Sanitise — only allow safe tags
      const allowed = /^(p|br|strong|em|b|i|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|hr|blockquote|code|pre|span|div)$/i;
      const tmp = document.createElement('div');
      tmp.innerHTML = content;
      // Remove any script/style tags
      tmp.querySelectorAll('script,style,iframe,img,a[href^="javascript"]').forEach(el => el.remove());
      return tmp.innerHTML;
    }

    // Fallback: convert markdown to HTML
    let html = content
      // Escape HTML entities first
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      // Headers
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
      .replace(/^# (.+)$/gm,   '<h3>$1</h3>')
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,      '<strong>$1</strong>')
      .replace(/__(.+?)__/g,           '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,           '<em>$1</em>')
      .replace(/_(.+?)_/g,             '<em>$1</em>')
      // Inline code
      .replace(/`(.+?)`/g, '<code style="background:var(--bg-muted);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.85em">$1</code>')
      // Horizontal rule
      .replace(/^(-{3,}|\*{3,})$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:0.75rem 0">')
      // Unordered lists
      .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>')
      // Ordered lists
      .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
      // Simple table (pipe-separated)
      .replace(/^\|(.+)\|$/gm, (match, row) => {
        const cells = row.split('|').map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) return ''; // skip separator row
        const tag = match.includes('---') ? 'th' : 'td';
        return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      })
      .replace(/(<tr>[\s\S]+?<\/tr>)/g, '<table style="width:100%;border-collapse:collapse;font-size:0.85em;margin:0.5rem 0">$1</table>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
  }
}

// ==================== DOCUMENT VIEWER (with PDF viewer + bookmarks + share) ====================
function initDocumentViewer(documents, type) {
  // Await token then boot — this means NO page ever needs to handle
  // the token itself. Just call initDocumentViewer() normally and it works.
  if (window.BrainHubDocs) {
    window.BrainHubDocs.getToken().then(() => _bootViewer(documents, type));
    return;
  }
  _bootViewer(documents, type);
}

function _bootViewer(documents, type) {
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
        if (doc) { selectDocument(doc); window.BrainHubXP?.trackDocOpen(); }
        document.querySelectorAll('.doc-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });

    if (loadMoreBtn) loadMoreBtn.style.display = visibleCount >= documents.length ? 'none' : 'flex';
  }

  async function selectDocument(doc) {
    if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    if (previewActive) {
      previewActive.style.display = 'block';
      const bm   = isBookmarked('doc-' + doc.id);
      const done = getProgress('doc-' + doc.id);

      // Build secure proxied URLs — raw R2 URL never reaches the browser
      const readUrl = window.BrainHubDocs
        ? await window.BrainHubDocs.secureReadUrl(doc.url)
        : doc.url;
      const dlUrl = window.BrainHubDocs
        ? await window.BrainHubDocs.secureDownloadUrl(doc.url)
        : doc.url;

      previewActive.innerHTML = `
        <div class="preview-doc-icon"><i class="fas ${doc.icon || 'fa-file-pdf'}"></i></div>
        <div class="preview-doc-title">${doc.title}</div>
        <div class="preview-doc-meta">
          <span><i class="far fa-file-alt"></i> ${doc.type || 'PDF'}</span>
          <span><i class="far fa-save"></i> ${doc.size || ''}</span>
        </div>
        <div class="preview-actions">
          <a href="${dlUrl}" download class="download-btn"><i class="fas fa-download"></i> Download</a>
          <button class="view-btn" onclick="openPdfViewer('${readUrl}', '${doc.title.replace(/'/g,"\\'")}')"><i class="fas fa-eye"></i> Read</button>
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
          <button class="share-doc-btn save-offline-btn" 
            data-offline-url="${readUrl}"
            title="Save for offline reading"
            onclick="window.BrainHubOffline?.saveForOffline('${readUrl}', '${doc.title.replace(/'/g, "\\'")}')">
            <i class="fas fa-download"></i>
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
async function openPdfViewer(url, title) {
  // url coming in is already the secure /doc Worker URL
  // Build the download URL by swapping /doc → /download
  const dlUrl = window.BrainHubDocs && url.includes('/doc?')
    ? url.replace('/doc?', '/download?')
    : url;

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
        <div class="pdf-modal-body" id="pdfModalBody">
          <!-- Filled dynamically below -->
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('pdfCloseBtn').addEventListener('click', closePdfViewer);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePdfViewer(); });
  }

  document.getElementById('pdfModalTitle').textContent = title || 'Document Preview';
  document.getElementById('pdfDownloadBtn').href = dlUrl;

  const body = document.getElementById('pdfModalBody');

  // Detect iOS/Safari — they block iframe PDF rendering for cross-origin blobs
  const isSafariIOS = /iP(ad|hone|od)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Firefox'));

  const ext = (url.split('?')[0]).split('.').pop().toLowerCase();
  const isOfficeDoc = ['docx','doc','pptx','xlsx','xls','ppt'].includes(ext);

  if (isOfficeDoc) {
    // Office docs — use Google Docs viewer (these can't render natively)
    body.innerHTML = `<iframe id="pdfFrame"
      src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"
      frameborder="0" style="width:100%;height:100%;border:none"></iframe>`;

  } else if (isSafariIOS) {
    // Safari iOS — can't render PDF in iframe cross-origin, show open button
    body.innerHTML = `
      <div class="pdf-safari-fallback">
        <div style="font-size:3rem;margin-bottom:1rem">📄</div>
        <h3 style="margin-bottom:0.5rem;color:var(--text-900)">${title || 'Document'}</h3>
        <p style="color:var(--text-500);margin-bottom:1.5rem;font-size:0.9rem">
          Tap below to open the document in your browser.
        </p>
        <a href="${url}" target="_blank" rel="noopener"
          style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--primary);color:white;
          padding:0.75rem 1.5rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem">
          <i class="fas fa-eye"></i> Open Document
        </a>
        <br><br>
        <a href="${dlUrl}" download
          style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--bg-muted);color:var(--text-700);
          padding:0.65rem 1.25rem;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.875rem;
          border:1px solid var(--border)">
          <i class="fas fa-download"></i> Download Instead
        </a>
      </div>`;

  } else {
    // Chrome, Firefox, Edge, Desktop Safari — stream directly into iframe
    // Worker returns Content-Type: application/pdf + Content-Disposition: inline
    // Browser PDF renderer handles it natively — fast, no third party involved
    body.innerHTML = `<iframe id="pdfFrame"
      src="${url}"
      frameborder="0"
      style="width:100%;height:100%;border:none"
      title="${(title || 'Document').replace(/"/g, '')}"
    ></iframe>`;

    // Fallback: if iframe fails to load after 8s, show download prompt
    const frame = document.getElementById('pdfFrame');
    const fallbackTimer = setTimeout(() => {
      if (frame && !frame.contentDocument) {
        frame.outerHTML = `
          <div class="pdf-safari-fallback">
            <div style="font-size:2.5rem;margin-bottom:1rem">⚠️</div>
            <h3 style="color:var(--text-900);margin-bottom:0.5rem">Preview unavailable</h3>
            <p style="color:var(--text-500);margin-bottom:1.5rem;font-size:0.875rem">
              Your browser could not display this document inline.
            </p>
            <a href="${dlUrl}" download
              style="display:inline-flex;align-items:center;gap:0.5rem;background:var(--primary);color:white;
              padding:0.75rem 1.5rem;border-radius:10px;text-decoration:none;font-weight:700">
              <i class="fas fa-download"></i> Download Document
            </a>
          </div>`;
      }
    }, 8000);
    if (frame) frame.addEventListener('load', () => clearTimeout(fallbackTimer));
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePdfViewer() {
  const overlay = document.getElementById('pdfViewerOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    const body = document.getElementById('pdfModalBody');
    if (body) body.innerHTML = ''; // clear iframe to stop loading/playing
  }
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

// ==================== ONBOARDING ====================
function initOnboarding() {
  // Only show on index page
  if (!document.getElementById('onboardingModal')) return;
  // Don't show if already completed
  if (localStorage.getItem('bh-onboarded')) return;
  // Show after a short delay
  setTimeout(() => showOnboarding(), 900);
}

function showOnboarding() {
  const modal = document.getElementById('onboardingModal');
  if (!modal) return;
  modal.classList.add('ob-open');
  document.body.style.overflow = 'hidden';
}

function closeOnboarding(completed) {
  const modal = document.getElementById('onboardingModal');
  if (!modal) return;
  modal.classList.remove('ob-open');
  modal.classList.add('ob-closing');
  document.body.style.overflow = '';
  setTimeout(() => { modal.classList.remove('ob-closing'); }, 400);
  if (completed) localStorage.setItem('bh-onboarded', '1');
}

function obSelectUni(el, value) {
  document.querySelectorAll('.ob-uni-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('obNextStep1').disabled = false;
  window._obUni = value;
}

function obSelectYear(el, value) {
  document.querySelectorAll('.ob-year-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('obNextStep2').disabled = false;
  window._obYear = value;
}

function obGoStep(step) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ob-step-' + step).classList.add('active');
  // Update progress dots
  document.querySelectorAll('.ob-dot').forEach((d, i) => {
    d.classList.toggle('active', i < step);
    d.classList.toggle('done', i < step - 1);
  });
}

function obFinish() {
  const uni  = window._obUni  || 'all';
  const year = window._obYear || '1';

  // Save prefs
  const prefs = JSON.parse(localStorage.getItem('bh-profile-prefs') || '{}');
  prefs.uni  = uni;
  prefs.year = year;
  localStorage.setItem('bh-profile-prefs', JSON.stringify(prefs));

  // Show step 3 (results)
  obGoStep(3);
  obBuildResults(uni, year);
  closeOnboarding(true);

  // Re-show step 3 content (it's inside the modal on step 3)
  const modal = document.getElementById('onboardingModal');
  if (modal) {
    modal.classList.add('ob-open');
    document.body.style.overflow = 'hidden';
  }
}

function obBuildResults(uni, year) {
  const ROUTES = {
    CBU:  {
      name: 'Copperbelt University',
      programs: [
        { name: 'Natural Sciences',      url: '/pages/universities/cbu/programs/natural-sciences.html', icon: '🔬' },
        { name: 'Engineering Drawing',   url: '/pages/universities/cbu/programs/engineering-drawing.html', icon: '📐' },
      ]
    },
    UNZA: {
      name: 'University of Zambia',
      programs: [
        { name: 'Natural Sciences',      url: '/pages/universities/unza/programs/natural-sciences.html', icon: '🔬' },
      ]
    },
    ZUT:  {
      name: 'Zambia University of Technology',
      programs: [
        { name: 'Communication Skills',  url: '/pages/universities/zut/programs/communication-skills.html', icon: '💬' },
        { name: 'Software Engineering',  url: '/pages/universities/zut/programs/software-engineering.html', icon: '💻' },
      ]
    },
  };

  const yearLabels = { '1':'1st Year', '2':'2nd Year', '3':'3rd Year', '4':'4th Year+' };
  const el = document.getElementById('obResults');
  if (!el) return;

  const r = ROUTES[uni];
  const uniName = r ? r.name : 'Your University';
  const programs = r ? r.programs : [];

  el.innerHTML = `
    <div class="ob-result-greeting">
      <div class="ob-result-avatar">${uni === 'CBU' ? '🔬' : uni === 'UNZA' ? '🎓' : uni === 'ZUT' ? '💻' : '📚'}</div>
      <div>
        <div class="ob-result-name">Welcome to BrainHub! 🎉</div>
        <div class="ob-result-sub">${uniName} · ${yearLabels[year] || year}</div>
      </div>
    </div>
    <p class="ob-result-msg">Here's what we've prepared for you:</p>
    <div class="ob-result-links">
      ${programs.map(p => `
        <a href="${p.url}" class="ob-result-link" onclick="closeOnboarding(true)">
          <span class="ob-rl-icon">${p.icon}</span>
          <span class="ob-rl-text">
            <span class="ob-rl-title">${p.name}</span>
            <span class="ob-rl-sub">Notes, past papers & resources</span>
          </span>
          <i class="fas fa-arrow-right ob-rl-arrow"></i>
        </a>`).join('')}
      <a href="/pages/quizzes.html" class="ob-result-link" onclick="closeOnboarding(true)">
        <span class="ob-rl-icon">🧠</span>
        <span class="ob-rl-text">
          <span class="ob-rl-title">Topic Quizzes</span>
          <span class="ob-rl-sub">100 questions · Biology, Chemistry, Maths & more</span>
        </span>
        <i class="fas fa-arrow-right ob-rl-arrow"></i>
      </a>
      <a href="/pages/flashcards.html" class="ob-result-link" onclick="closeOnboarding(true)">
        <span class="ob-rl-icon">🃏</span>
        <span class="ob-rl-text">
          <span class="ob-rl-title">Flashcard Decks</span>
          <span class="ob-rl-sub">Flip cards · Test your memory</span>
        </span>
        <i class="fas fa-arrow-right ob-rl-arrow"></i>
      </a>
    </div>
    <button class="ob-btn-primary" onclick="closeOnboarding(true)" style="margin-top:1.25rem;width:100%">
      Let's go <i class="fas fa-arrow-right"></i>
    </button>`;
}

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
    title: "Cell Structure",
    desc: "BI 110: Biology fundamentals.",
    question: "Which of the following is found in plant cells but NOT in animal cells?",
    options: ["Mitochondria", "Cell Wall", "Ribosomes", "Cytoplasm"],
    correct: 1,
    explanation: "Plant cells have a rigid cell wall made of cellulose that gives them structure and shape. Animal cells do not have one — they rely on the cell membrane alone.",
    course: "BI 110"
  },
  {
    week: 2,
    title: "Kinematics",
    desc: "PH 110: Motion in a straight line.",
    question: "An object starts from rest and accelerates at 3 m/s² for 4 seconds. What is its final velocity?",
    options: ["7 m/s", "12 m/s", "1.33 m/s", "9 m/s"],
    correct: 1,
    explanation: "Using v = u + at: starting at 0 m/s, accelerating at 3 m/s² for 4 s gives v = 0 + (3 × 4) = 12 m/s.",
    course: "PH 110"
  },
  {
    week: 3,
    title: "Atomic Structure",
    desc: "CH 110: Subatomic particles.",
    question: "Which subatomic particle has a negative charge?",
    options: ["Proton", "Neutron", "Electron", "Nucleus"],
    correct: 2,
    explanation: "Electrons carry a negative charge and orbit the nucleus. Protons are positive, and neutrons carry no charge at all.",
    course: "CH 110"
  },
  {
    week: 4,
    title: "Limits",
    desc: "MA 110: Introduction to limits.",
    question: "What is the limit of (x² − 1) ÷ (x − 1) as x approaches 1?",
    options: ["0", "1", "2", "Undefined"],
    correct: 2,
    explanation: "Factor the top: (x − 1)(x + 1). The (x − 1) cancels, leaving x + 1. Plug in x = 1: 1 + 1 = 2.",
    course: "MA 110"
  },
  {
    week: 5,
    title: "Zambian Pre-Independence",
    desc: "LA 111: History of Northern Rhodesia.",
    question: "What was Zambia called before it gained independence in 1964?",
    options: ["Nyasaland", "Southern Rhodesia", "Northern Rhodesia", "Basutoland"],
    correct: 2,
    explanation: "Zambia was a British protectorate known as Northern Rhodesia until it became independent on 24 October 1964.",
    course: "LA 111"
  },
  {
    week: 6,
    title: "Enzyme Function",
    desc: "BI 110: Biological catalysts.",
    question: "What happens to an enzyme when exposed to extremely high temperatures?",
    options: ["It speeds up", "It reproduces", "It denatures", "It turns into a substrate"],
    correct: 2,
    explanation: "High heat breaks the bonds holding the enzyme's 3D shape together. Once the shape is lost (denaturation), the enzyme can no longer bind its substrate and stops working.",
    course: "BI 110"
  },
  {
    week: 7,
    title: "Newton's Third Law",
    desc: "PH 110: Action and Reaction.",
    question: "If a bird pushes down on the air with its wings, what is the reaction force?",
    options: ["The air pushes up on the wings", "Gravity pulls the bird down", "The bird moves forward", "The air moves sideways"],
    correct: 0,
    explanation: "Newton's Third Law: every action has an equal and opposite reaction. Wings push air down → the air pushes the wings up with the same force.",
    course: "PH 110"
  },
  {
    week: 8,
    title: "The Periodic Table",
    desc: "CH 110: Groups and Periods.",
    question: "Which group of elements is known for being chemically inert (unreactive)?",
    options: ["Alkali Metals", "Halogens", "Noble Gases", "Transition Metals"],
    correct: 2,
    explanation: "Noble Gases (Group 18) have a completely full outer electron shell, so they have no need to bond with other atoms — making them almost completely unreactive.",
    course: "CH 110"
  },
  {
    week: 9,
    title: "Differentiation — Chain Rule",
    desc: "MA 110: Complex derivatives.",
    question: "Find the derivative of  f(x) = (2x + 1)³",
    options: ["3(2x + 1)²", "6(2x + 1)²", "2(2x + 1)²", "6x²"],
    correct: 1,
    explanation: "Chain Rule: differentiate the outer function first → 3(2x+1)², then multiply by the derivative of the inside, which is 2. Result: 3(2x+1)² × 2 = 6(2x+1)².",
    course: "MA 110"
  },
  {
    week: 10,
    title: "The Federation Era",
    desc: "LA 111: The CAF era.",
    question: "Zambia was part of a Federation from 1953 to 1963 alongside which two countries?",
    options: ["Malawi and Zimbabwe", "Botswana and Namibia", "Congo and Angola", "Tanzania and Kenya"],
    correct: 0,
    explanation: "The Central African Federation joined Northern Rhodesia (Zambia), Southern Rhodesia (Zimbabwe), and Nyasaland (Malawi) — strongly opposed by African nationalists.",
    course: "LA 111"
  },
  {
    week: 11,
    title: "DNA Replication",
    desc: "BI 110: Molecular basis of inheritance.",
    question: "Which enzyme is responsible for 'unzipping' the DNA double helix during replication?",
    options: ["DNA Polymerase", "Helicase", "Ligase", "Primase"],
    correct: 1,
    explanation: "Helicase breaks the hydrogen bonds between the two DNA strands, separating them like a zip so each strand can be used as a template for copying.",
    course: "BI 110"
  },
  {
    week: 12,
    title: "Circular Motion",
    desc: "PH 110: Centripetal forces.",
    question: "In uniform circular motion, the acceleration always points in which direction?",
    options: ["Tangent to the circle", "Away from the center", "Toward the center", "Opposite the velocity"],
    correct: 2,
    explanation: "Centripetal acceleration always points inward toward the center. It is what keeps changing the object's direction without changing its speed.",
    course: "PH 110"
  },
  {
    week: 13,
    title: "Gas Laws — Boyle's Law",
    desc: "CH 110: Behaviour of ideal gases.",
    question: "According to Boyle's Law, if the volume of a gas decreases at constant temperature, the pressure will:",
    options: ["Decrease", "Increase", "Stay the same", "Drop to zero"],
    correct: 1,
    explanation: "Boyle's Law: P₁V₁ = P₂V₂. Pressure and volume are inversely proportional — squeeze the gas into a smaller space and the pressure rises.",
    course: "CH 110"
  },
  {
    week: 14,
    title: "Differentiation — Product Rule",
    desc: "MA 110: Differentiating multiplied functions.",
    question: "What is the derivative of  f(x) = x · sin(x)?",
    options: ["cos(x)", "sin(x) + x·cos(x)", "x·cos(x)", "sin(x) − x·cos(x)"],
    correct: 1,
    explanation: "Product Rule: (u·v)' = u'v + uv'. Here u = x (derivative = 1) and v = sin(x) (derivative = cos(x)). So: 1·sin(x) + x·cos(x) = sin(x) + x·cos(x).",
    course: "MA 110"
  },
  {
    week: 15,
    title: "Zambian National Symbols",
    desc: "LA 111: Identity of the Republic.",
    question: "What does the orange colour on the Zambian national flag represent?",
    options: ["The lush flora", "The struggle for freedom", "The nation's mineral wealth", "The Zambezi river"],
    correct: 2,
    explanation: "Each colour has a meaning: green = agriculture/flora, red = the freedom struggle, black = the people, and orange = Zambia's mineral wealth, especially copper.",
    course: "LA 111"
  },
  {
    week: 16,
    title: "Photosynthesis",
    desc: "BI 110: Energy conversion in plants.",
    question: "In which part of the chloroplast do the light-independent (Calvin Cycle) reactions occur?",
    options: ["Thylakoid membrane", "Stroma", "Granum", "Outer membrane"],
    correct: 1,
    explanation: "Light-dependent reactions happen in the thylakoid membranes. The Calvin Cycle (light-independent) takes place in the stroma — the fluid-filled space surrounding the thylakoids.",
    course: "BI 110"
  },
  {
    week: 17,
    title: "Ohm's Law",
    desc: "PH 110: Basics of electricity.",
    question: "A circuit has a resistance of 5Ω and a current of 2A. What is the voltage?",
    options: ["2.5 V", "7 V", "10 V", "0.4 V"],
    correct: 2,
    explanation: "Ohm's Law: Voltage = Current × Resistance = 2A × 5Ω = 10V. Think of it like water: voltage is pressure, current is flow, resistance is how narrow the pipe is.",
    course: "PH 110"
  },
  {
    week: 18,
    title: "Acids and Bases — pH Scale",
    desc: "CH 110: Understanding the pH scale.",
    question: "A solution with a hydrogen ion concentration of 1 × 10⁻³ mol/L has a pH of:",
    options: ["3", "−10", "11", "7"],
    correct: 0,
    explanation: "pH = −log[H⁺]. log(10⁻³) = −3, so pH = −(−3) = 3. A pH below 7 is acidic; above 7 is basic; 7 is neutral.",
    course: "CH 110"
  },
  {
    week: 19,
    title: "Concavity",
    desc: "MA 110: The second derivative.",
    question: "If the second derivative f''(x) > 0 on an interval, the graph of f(x) is:",
    options: ["Increasing", "Decreasing", "Concave Up", "Concave Down"],
    correct: 2,
    explanation: "A positive second derivative means the slope is increasing — the curve bends upward like a bowl (concave up). Negative means it bends downward like a dome.",
    course: "MA 110"
  },
  {
    week: 20,
    title: "The Copperbelt",
    desc: "LA 111: Economic foundations of Zambia.",
    question: "Which town is historically known as the hub of the Zambian Copperbelt?",
    options: ["Lusaka", "Livingstone", "Kitwe", "Chipata"],
    correct: 2,
    explanation: "Kitwe sits at the heart of the Copperbelt Province and has served as the industrial and commercial centre of Zambia's copper mining industry since the colonial era.",
    course: "LA 111"
  },
  {
    week: 21,
    title: "Cellular Respiration",
    desc: "BI 110: ATP production stages.",
    question: "Which stage of cellular respiration produces the most ATP?",
    options: ["Glycolysis", "Krebs Cycle", "Electron Transport Chain", "Fermentation"],
    correct: 2,
    explanation: "The Electron Transport Chain produces approximately 32–34 ATP per glucose. Glycolysis makes only 2 ATP, and the Krebs Cycle makes 2 more — the ETC is where most energy is released.",
    course: "BI 110"
  },
  {
    week: 22,
    title: "Conservation of Momentum",
    desc: "PH 110: Collisions and impulses.",
    question: "In an inelastic collision, which quantity is conserved?",
    options: ["Kinetic Energy", "Momentum", "Both", "Neither"],
    correct: 1,
    explanation: "Momentum is always conserved in isolated collisions. In inelastic collisions, kinetic energy is NOT conserved — some is lost as heat, sound, or object deformation.",
    course: "PH 110"
  },
  {
    week: 23,
    title: "Intermolecular Forces",
    desc: "CH 110: Forces between molecules.",
    question: "Which type of intermolecular force is generally the strongest?",
    options: ["London Dispersion", "Dipole-Dipole", "Hydrogen Bonding", "Ion-Dipole"],
    correct: 3,
    explanation: "Ion-dipole forces (between a charged ion and a polar molecule) are the strongest. This is why ionic salts like NaCl dissolve so readily in water.",
    course: "CH 110"
  },
  {
    week: 24,
    title: "Fundamental Theorem of Calculus",
    desc: "MA 110: Connecting derivatives and integrals.",
    question: "What is the result of the integral of 2x from x = 1 to x = 3?",
    options: ["4", "8", "6", "12"],
    correct: 1,
    explanation: "Integrate 2x to get x². Evaluate from 1 to 3: (3²) − (1²) = 9 − 1 = 8. The integral gives the area under the curve 2x between those two points.",
    course: "MA 110"
  },
  {
    week: 25,
    title: "Mendelian Genetics",
    desc: "BI 110: Patterns of inheritance.",
    question: "In a cross between two heterozygous tall plants (Tt × Tt), what fraction of offspring will be short (tt)?",
    options: ["1/4", "1/2", "3/4", "0"],
    correct: 0,
    explanation: "A Punnett square for Tt × Tt gives: TT, Tt, Tt, tt. Only 1 of 4 offspring gets the recessive tt genotype and will be short — a 25% chance.",
    course: "BI 110"
  },
  {
    week: 26,
    title: "Work and Energy",
    desc: "PH 110: The work-energy theorem.",
    question: "A force of 10N moves an object 5m in the direction of the force. How much work is done?",
    options: ["2 J", "15 J", "50 J", "0.5 J"],
    correct: 2,
    explanation: "Work = Force × Distance = 10N × 5m = 50 Joules. Work is only done when the force has a component in the direction of movement.",
    course: "PH 110"
  },
  {
    week: 27,
    title: "Chemical Bonding",
    desc: "CH 110: Types of chemical bonds.",
    question: "What type of bond forms when two non-metal atoms share electrons?",
    options: ["Ionic", "Metallic", "Covalent", "Hydrogen"],
    correct: 2,
    explanation: "Covalent bonds form when two non-metals share pairs of electrons. For example, water (H₂O) has covalent bonds. Ionic bonds transfer electrons; covalent bonds share them.",
    course: "CH 110"
  },
  {
    week: 28,
    title: "Integration by Substitution",
    desc: "MA 110: Antidifferentiation technique.",
    question: "Which technique is best for integrating a composite function like 2x·(x²+1)⁵?",
    options: ["Integration by Parts", "U-Substitution", "Partial Fractions", "L'Hopital's Rule"],
    correct: 1,
    explanation: "U-Substitution reverses the chain rule. Let u = x²+1, then du = 2x dx. The 2x and dx are absorbed, leaving a simple integral of u⁵ du = u⁶/6.",
    course: "MA 110"
  },
  {
    week: 29,
    title: "The MMD Era",
    desc: "LA 111: Zambian political history.",
    question: "Which president led Zambia's transition to multiparty democracy in 1991?",
    options: ["Kenneth Kaunda", "Frederick Chiluba", "Levy Mwanawasa", "Rupiah Banda"],
    correct: 1,
    explanation: "Frederick Chiluba of the MMD defeated Kenneth Kaunda in Zambia's first multiparty elections in 1991, ending 27 years of one-party UNIP rule.",
    course: "LA 111"
  },
  {
    week: 30,
    title: "Mitosis vs Meiosis",
    desc: "BI 110: Cell division.",
    question: "Which type of cell division produces genetically identical daughter cells?",
    options: ["Meiosis", "Mitosis", "Both", "Neither"],
    correct: 1,
    explanation: "Mitosis produces 2 genetically identical daughter cells (used for growth and repair). Meiosis produces 4 genetically unique sex cells with half the chromosome number.",
    course: "BI 110"
  },
  {
    week: 31,
    title: "Waves",
    desc: "PH 110: Wave properties.",
    question: "A wave has a frequency of 5 Hz and a wavelength of 2 m. What is its speed?",
    options: ["2.5 m/s", "7 m/s", "10 m/s", "0.4 m/s"],
    correct: 2,
    explanation: "Wave speed = frequency × wavelength = 5 Hz × 2 m = 10 m/s. This formula applies to all waves: sound, light, and water.",
    course: "PH 110"
  },
  {
    week: 32,
    title: "Redox Reactions",
    desc: "CH 110: Oxidation and Reduction.",
    question: "In a redox reaction, the substance that GAINS electrons is said to be:",
    options: ["Oxidised", "Reduced", "Neutralised", "Precipitated"],
    correct: 1,
    explanation: "Remember OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons). The substance gaining electrons is reduced; the one losing electrons is oxidised.",
    course: "CH 110"
  },
  {
    week: 33,
    title: "Differential Equations",
    desc: "MA 110: Introduction to ODEs.",
    question: "What is the general solution of dy/dx = y?",
    options: ["y = x + C", "y = Ce^x", "y = ln(x) + C", "y = x² + C"],
    correct: 1,
    explanation: "Separate variables: dy/y = dx. Integrate both sides: ln|y| = x + C. Raise e to both sides: y = Ce^x. This describes exponential growth.",
    course: "MA 110"
  },
  {
    week: 34,
    title: "Zambia's Economy",
    desc: "LA 111: Economic development.",
    question: "What is Zambia's primary mineral export?",
    options: ["Gold", "Diamonds", "Copper", "Coal"],
    correct: 2,
    explanation: "Copper accounts for the majority of Zambia's export earnings. The Copperbelt Province has been the centre of copper mining operations since the 1930s.",
    course: "LA 111"
  },
  {
    week: 35,
    title: "The Nervous System",
    desc: "BI 110: Neural signalling.",
    question: "What is the name of the gap between two neurons where signals are transmitted chemically?",
    options: ["Axon terminal", "Synapse", "Dendrite", "Myelin sheath"],
    correct: 1,
    explanation: "The synapse is the tiny gap between neurons. Since electrical signals cannot jump across, the sending neuron releases chemical messengers (neurotransmitters) that cross the gap and trigger the next neuron.",
    course: "BI 110"
  },
  {
    week: 36,
    title: "Pressure",
    desc: "PH 110: Fluid mechanics.",
    question: "Pressure is defined as force per unit:",
    options: ["Volume", "Mass", "Area", "Length"],
    correct: 2,
    explanation: "Pressure = Force ÷ Area (measured in Pascals). That is why a sharp knife cuts better — the same force over a smaller area creates much greater pressure.",
    course: "PH 110"
  },
  {
    week: 37,
    title: "Moles and Avogadro's Number",
    desc: "CH 110: Stoichiometry basics.",
    question: "How many atoms are in 1 mole of any element?",
    options: ["1,000", "6.02 × 10²³", "1.67 × 10⁻²⁴", "1 × 10¹⁰"],
    correct: 1,
    explanation: "One mole always contains 6.02 × 10²³ particles — Avogadro's number. It is chemistry's standard 'counting unit' for atoms and molecules.",
    course: "CH 110"
  },
  {
    week: 38,
    title: "Vector Addition",
    desc: "MA 110: Vectors and scalars.",
    question: "Two forces of 3N and 4N act at right angles to each other. What is the resultant force?",
    options: ["7 N", "1 N", "5 N", "12 N"],
    correct: 2,
    explanation: "For perpendicular vectors, use Pythagoras: √(3² + 4²) = √(9 + 16) = √25 = 5N. This is the classic 3-4-5 right triangle.",
    course: "MA 110"
  },
  {
    week: 39,
    title: "Zambia's Geography",
    desc: "LA 111: Physical geography.",
    question: "Which river forms the natural boundary between Zambia and Zimbabwe?",
    options: ["Congo River", "Kafue River", "Luangwa River", "Zambezi River"],
    correct: 3,
    explanation: "The Zambezi River forms the border between Zambia and Zimbabwe and flows through Victoria Falls (Mosi-oa-Tunya) — one of the Seven Natural Wonders of the World.",
    course: "LA 111"
  },
  {
    week: 40,
    title: "Hormones",
    desc: "BI 110: The endocrine system.",
    question: "Which hormone lowers blood glucose levels after a meal?",
    options: ["Glucagon", "Adrenaline", "Insulin", "Thyroxine"],
    correct: 2,
    explanation: "Insulin is released by the pancreas when blood glucose rises. It signals cells to absorb glucose, bringing levels back to normal. Glucagon does the opposite — it raises blood sugar.",
    course: "BI 110"
  },
  {
    week: 41,
    title: "Series Circuits",
    desc: "PH 110: Circuit analysis.",
    question: "In a series circuit with a 12V battery and two identical resistors, what is the voltage across each resistor?",
    options: ["12 V", "3 V", "6 V", "24 V"],
    correct: 2,
    explanation: "In a series circuit, voltage is shared equally across identical resistors. Total voltage = 12V ÷ 2 = 6V each.",
    course: "PH 110"
  },
  {
    week: 42,
    title: "Chemical Equilibrium",
    desc: "CH 110: Le Chatelier's Principle.",
    question: "If pressure increases in a gas-phase equilibrium, the reaction will shift toward:",
    options: ["The side with more gas moles", "The side with fewer gas moles", "Neither side", "The exothermic side"],
    correct: 1,
    explanation: "Le Chatelier's Principle: the system resists change. Higher pressure favours the side with fewer gas molecules, which reduces volume and relieves the pressure.",
    course: "CH 110"
  },
  {
    week: 43,
    title: "Logarithms",
    desc: "MA 110: Exponential and log functions.",
    question: "What is log base 2 of 8?",
    options: ["2", "3", "4", "16"],
    correct: 1,
    explanation: "log₂(8) asks: '2 raised to what power gives 8?' Since 2³ = 8, the answer is 3. Logarithms are simply the inverse operation of exponentiation.",
    course: "MA 110"
  },
  {
    week: 44,
    title: "Zambia's Constitution",
    desc: "LA 111: Governance and civic studies.",
    question: "Under Zambia's constitution, how many terms can a president serve?",
    options: ["One term", "Two terms", "Three terms", "Unlimited terms"],
    correct: 1,
    explanation: "The constitution limits the president to a maximum of two five-year terms. This limit was a key reform introduced during the 1991 transition to multiparty democracy.",
    course: "LA 111"
  },
  {
    week: 45,
    title: "The Immune System",
    desc: "BI 110: Defence mechanisms.",
    question: "Which blood cells are the main soldiers of the adaptive immune response?",
    options: ["Red blood cells", "Platelets", "Lymphocytes (White blood cells)", "Plasma cells"],
    correct: 2,
    explanation: "Lymphocytes (B-cells and T-cells) drive the adaptive immune response. B-cells produce antibodies that tag pathogens; T-cells directly kill infected cells.",
    course: "BI 110"
  },
  {
    week: 46,
    title: "The Heart",
    desc: "BI 110: The circulatory system.",
    question: "Which chamber of the human heart pumps oxygenated blood to the rest of the body?",
    options: ["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"],
    correct: 3,
    explanation: "The left ventricle has the thickest walls because it pumps oxygenated blood through the aorta to the entire body — a far greater demand than the right side pumping to the lungs.",
    course: "BI 110"
  },
  {
    week: 47,
    title: "Torque and Equilibrium",
    desc: "PH 110: Rotational mechanics.",
    question: "To maximise torque on a bolt using a wrench, where should you apply the force?",
    options: ["At the pivot", "At the very end of the handle", "In the middle of the handle", "Parallel to the handle"],
    correct: 1,
    explanation: "Torque = Force × perpendicular distance from the pivot. The further from the pivot (longer lever arm), the greater the torque — that is why longer spanners feel easier to turn.",
    course: "PH 110"
  },
  {
    week: 48,
    title: "Atomic Orbitals",
    desc: "CH 110: Electron configuration.",
    question: "What is the maximum number of electrons that can occupy a 'p' subshell?",
    options: ["2", "6", "10", "14"],
    correct: 1,
    explanation: "A p subshell has 3 orbitals (pₓ, pᵧ, p₄), and each holds a maximum of 2 electrons. So 3 × 2 = 6 electrons total.",
    course: "CH 110"
  },
  {
    week: 49,
    title: "Mean Value Theorem",
    desc: "MA 110: Differentiability and slopes.",
    question: "The Mean Value Theorem guarantees a point c where f'(c) equals:",
    options: ["0", "The average rate of change over the interval", "The y-intercept", "The local maximum"],
    correct: 1,
    explanation: "The MVT says that somewhere between points a and b, the instantaneous slope (tangent line) must equal the average slope (secant line). Like a road trip: if your average speed was 100 km/h, your speedometer must have read exactly 100 at some moment.",
    course: "MA 110"
  },
  {
    week: 50,
    title: "Regional Integration",
    desc: "LA 111: Zambia in Africa.",
    question: "Zambia is a member of COMESA. What does COMESA stand for?",
    options: ["Community of Middle East and South Africa", "Common Market for Eastern and Southern Africa", "Commercial Market of East-South Africa", "Council of Mining Engineers in South Africa"],
    correct: 1,
    explanation: "COMESA (Common Market for Eastern and Southern Africa) is a regional economic bloc of 21 African countries, with its headquarters in Lusaka, Zambia.",
    course: "LA 111"
  },
  {
    week: 51,
    title: "Ecology: Trophic Levels",
    desc: "BI 110: Energy flow in ecosystems.",
    question: "Approximately how much energy transfers from one trophic level to the next in an energy pyramid?",
    options: ["1%", "10%", "50%", "90%"],
    correct: 1,
    explanation: "The 10% Rule: only about 10% of energy passes from one level to the next. The rest is lost as heat or used for the organism's own processes. This is why food chains rarely exceed 4-5 levels.",
    course: "BI 110"
  },
  {
    week: 52,
    title: "Universal Gravitation",
    desc: "PH 110: Forces between bodies.",
    question: "If the distance between two objects is tripled, what happens to the gravitational force?",
    options: ["It triples", "It becomes 1/3", "It becomes 1/9", "It stays the same"],
    correct: 2,
    explanation: "Gravity follows an inverse-square law. Triple the distance → force drops to 1/(3²) = 1/9 of the original. Double the distance → force drops to 1/4. It weakens very rapidly.",
    course: "PH 110"
  },
  {
    week: 53,
    title: "Organic Chemistry: Alkanes",
    desc: "CH 110: Hydrocarbon structures.",
    question: "What is the general formula for an open-chain alkane with n carbon atoms?",
    options: ["CnH2n", "CnH(2n+2)", "CnH(2n-2)", "CnHn"],
    correct: 1,
    explanation: "Alkanes are fully saturated (single bonds only). General formula: CnH(2n+2). Examples: methane = CH₄ (n=1), ethane = C₂H₆ (n=2), propane = C₃H₈ (n=3).",
    course: "CH 110"
  },
  {
    week: 54,
    title: "Area Between Curves",
    desc: "MA 110: Definite integrals application.",
    question: "To find the area between f(x) on top and g(x) on bottom from a to b, you calculate:",
    options: ["Integral of [f(x) + g(x)] dx", "Integral of [f(x) × g(x)] dx", "Integral of [f(x) − g(x)] dx", "Integral of [g(x) − f(x)] dx"],
    correct: 2,
    explanation: "Area between curves = integral of [top − bottom] dx. Subtracting g(x) from f(x) gives the height of the gap at each point x, and integrating sums all those heights.",
    course: "MA 110"
  },
  {
    week: 55,
    title: "Zambian Wildlife",
    desc: "LA 111: Tourism and Conservation.",
    question: "Which Zambian National Park is world-renowned for its walking safaris?",
    options: ["Kafue National Park", "Lower Zambezi National Park", "South Luangwa National Park", "Mosi-oa-Tunya National Park"],
    correct: 2,
    explanation: "South Luangwa National Park is widely credited as the birthplace of the walking safari. Norman Carr pioneered the concept there in the 1950s.",
    course: "LA 111"
  },
  {
    week: 56,
    title: "Enzyme Inhibition",
    desc: "BI 110: Factors affecting reaction rate.",
    question: "In competitive inhibition, where does the inhibitor bind on the enzyme?",
    options: ["Allosteric site", "Active site", "Substrate", "Product"],
    correct: 1,
    explanation: "A competitive inhibitor has a shape similar to the real substrate and 'competes' for the active site. If it binds first, the real substrate cannot enter and the reaction is blocked.",
    course: "BI 110"
  },
  {
    week: 57,
    title: "Simple Harmonic Motion",
    desc: "PH 110: Oscillatory systems.",
    question: "The period of a simple pendulum depends primarily on which factor?",
    options: ["The mass of the bob", "The amplitude of swing", "The length of the string", "The density of the bob"],
    correct: 2,
    explanation: "Period T = 2π × √(L ÷ g). Only the string length (L) and gravity (g) determine the period. The mass and amplitude do not matter for small swings.",
    course: "PH 110"
  },
  {
    week: 58,
    title: "Molar Mass Calculations",
    desc: "CH 110: Stoichiometry fundamentals.",
    question: "What is the molar mass of Sodium Hydroxide (NaOH)? (Na=23, O=16, H=1)",
    options: ["24 g/mol", "39 g/mol", "40 g/mol", "50 g/mol"],
    correct: 2,
    explanation: "Add the atomic masses: Na (23) + O (16) + H (1) = 40 g/mol. This means one mole of NaOH has a mass of 40 grams.",
    course: "CH 110"
  },
  {
    week: 59,
    title: "L'Hopital's Rule",
    desc: "MA 110: Solving indeterminate limits.",
    question: "L'Hopital's Rule is applied when a limit gives which indeterminate form?",
    options: ["1/0", "0/0 or ∞/∞", "∞ − 0", "1 to the power of ∞"],
    correct: 1,
    explanation: "When direct substitution gives 0/0 or ∞/∞ (meaningless), L'Hopital's Rule lets you differentiate the numerator and denominator separately, then re-evaluate the limit.",
    course: "MA 110"
  },
  {
    week: 60,
    title: "The National Assembly",
    desc: "LA 111: Zambian Government structure.",
    question: "How many elected constituencies make up Zambia's National Assembly?",
    options: ["150", "156", "160", "200"],
    correct: 1,
    explanation: "Zambia has 156 constituencies, each represented by one Member of Parliament. The National Assembly also includes 8 members nominated by the President.",
    course: "LA 111"
  },
  {
    week: 61,
    title: "Zambian Symbols: The Eagle",
    desc: "LA 111: National identity.",
    question: "What does the African Fish Eagle on the Zambian flag represent?",
    options: ["The people's freedom", "The ability to rise above the nation's problems", "The abundance of wildlife", "The strength of the military"],
    correct: 1,
    explanation: "The African Fish Eagle on the flag and Coat of Arms symbolises the Zambian people's ability to rise above challenges and adversity as a nation.",
    course: "LA 111"
  }
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
    <div class="challenge-widget">
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

  // Ensure widget is visible (was injected after ScrollReveal ran)
  const widget = container.querySelector('.challenge-widget');
  if (widget) { widget.style.opacity = '1'; widget.style.transform = 'none'; }

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

      if (isCorrect) { showToast('🔥 Correct! Streak: ' + newStreak); window.BrainHubXP?.trackChallengeCorrect(); }
      else { showToast('Keep studying — you\'ll get it next time!'); window.BrainHubXP?.trackChallengeWrong(); }
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

/* ── PDF Safari Fallback styles (injected by main.js) ── */
(function(){
  if (document.getElementById('bh-pdf-styles')) return;
  const s = document.createElement('style');
  s.id = 'bh-pdf-styles';
  s.textContent = `
    .pdf-safari-fallback {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; padding: 2rem;
      text-align: center; background: var(--card, #fff);
    }
  `;
  document.head.appendChild(s);
})();
// ==================== GLOBAL DOCUMENT SEARCH ====================
// Searches across ALL documents from all universities/courses
// Document index is built from a static JSON file: /search-index.json

(function initGlobalSearch() {
  const searchPage = document.getElementById('globalSearchPage');
  if (!searchPage) return; // only runs on search.html

  const input     = document.getElementById('globalSearchInput');
  const results   = document.getElementById('globalSearchResults');
  const countEl   = document.getElementById('globalSearchCount');
  const filterBtns = document.querySelectorAll('.search-filter-btn');

  let allDocs  = [];
  let activeFilter = 'all';

  // Load the search index
  fetch('/search-index.json')
    .then(r => r.json())
    .then(data => {
      allDocs = data;
      // If URL has a query param, run it immediately
      const q = new URLSearchParams(window.location.search).get('q') || '';
      if (q) { input.value = q; runSearch(q); }
    })
    .catch(() => {
      results.innerHTML = `<div class="search-empty">
        <i class="fas fa-exclamation-circle"></i>
        <p>Could not load search index. Please try again.</p>
      </div>`;
    });

  input?.addEventListener('input', () => runSearch(input.value));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter || 'all';
      runSearch(input?.value || '');
    });
  });

  function runSearch(query) {
    query = query.trim().toLowerCase();

    if (!query) {
      results.innerHTML = `<div class="search-empty">
        <i class="fas fa-search"></i>
        <p>Type above to search across all BrainHub documents.</p>
      </div>`;
      if (countEl) countEl.textContent = '';
      return;
    }

    let filtered = allDocs.filter(doc => {
      const matchesQuery =
        doc.title.toLowerCase().includes(query) ||
        doc.course.toLowerCase().includes(query) ||
        doc.university.toLowerCase().includes(query) ||
        (doc.tags || []).some(t => t.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === 'all' ||
        doc.type?.toLowerCase() === activeFilter ||
        doc.university?.toLowerCase().includes(activeFilter);

      return matchesQuery && matchesFilter;
    });

    if (countEl) countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      results.innerHTML = `<div class="search-empty">
        <i class="fas fa-search-minus"></i>
        <h3>No results for "${query}"</h3>
        <p>Try a different keyword, course code, or university.</p>
      </div>`;
      return;
    }

    results.innerHTML = filtered.map(doc => `
      <a href="${doc.pageUrl}" class="search-result-card reveal">
        <div class="sr-icon ${doc.iconClass || 'bg-bio'}">
          <i class="fas ${doc.icon || 'fa-file-pdf'}"></i>
        </div>
        <div class="sr-body">
          <div class="sr-meta">
            <span class="sr-uni">${doc.university}</span>
            <span class="sr-dot">·</span>
            <span class="sr-course">${doc.course}</span>
            <span class="sr-dot">·</span>
            <span class="sr-type ${doc.type?.toLowerCase()}">${doc.type || 'Notes'}</span>
          </div>
          <h3 class="sr-title">${highlight(doc.title, query)}</h3>
          ${doc.description ? `<p class="sr-desc">${highlight(doc.description, query)}</p>` : ''}
        </div>
        <div class="sr-arrow"><i class="fas fa-arrow-right"></i></div>
      </a>
    `).join('');

    // Trigger reveal animations
    setTimeout(() => {
      document.querySelectorAll('.search-result-card.reveal').forEach(el => el.classList.add('visible'));
    }, 50);

    window.BrainHubXP?.trackSearch?.();
  }

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

})();

// ==================== OFFLINE DOCUMENT CACHING (CLIENT) ====================
window.BrainHubOffline = (function() {
  const SW = navigator.serviceWorker;

  // Save a document for offline reading
  async function saveForOffline(docUrl, docTitle) {
    if (!SW?.controller) {
      showToast('Offline saving not available. Try refreshing.', 3000);
      return false;
    }
    showToast(`Saving "${docTitle}" for offline reading…`, 2500);
    SW.controller.postMessage({ type: 'CACHE_DOCUMENT', url: docUrl, title: docTitle });
    return true;
  }

  // Remove a cached document
  async function removeOffline(docUrl) {
    SW?.controller?.postMessage({ type: 'REMOVE_CACHED_DOCUMENT', url: docUrl });
  }

  // Get list of cached doc URLs
  function getCachedDocs() {
    return new Promise(resolve => {
      if (!SW?.controller) return resolve([]);
      SW.controller.postMessage({ type: 'GET_CACHED_DOCS' });
      const handler = (e) => {
        if (e.data?.type === 'CACHED_DOCS_LIST') {
          SW.removeEventListener('message', handler);
          resolve(e.data.docs || []);
        }
      };
      SW.addEventListener('message', handler);
      setTimeout(() => resolve([]), 2000); // timeout fallback
    });
  }

  // Listen for cache confirmations
  SW?.addEventListener('message', (e) => {
    if (e.data?.type === 'DOC_CACHED') {
      if (e.data.success) {
        showToast(`✅ "${e.data.title}" saved for offline reading`, 3000);
        // Update save button UI if present
        document.querySelectorAll(`[data-offline-url="${e.data.url}"]`).forEach(btn => {
          btn.classList.add('saved-offline');
          btn.title = 'Saved for offline';
          btn.innerHTML = '<i class="fas fa-wifi-slash"></i>';
        });
      } else {
        showToast('Could not save document. Please try again.', 3000);
      }
    }
  });

  return { saveForOffline, removeOffline, getCachedDocs };
})();


// ==================== PUSH NOTIFICATIONS (CLIENT) ====================
window.BrainHubNotifications = (function() {
  const VAPID_PUBLIC_KEY = 'BNfPyqxX4bPh_ZW49oFHv4KmF2z8Ad6xalQ_P7Wsm8G_lXiStqCTqJSV8DHdoBpNlJnmqku8me-ZPCrFKEFgDgM'; // Add your VAPID public key here when ready

  async function requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';

    const result = await Notification.requestPermission();
    return result;
  }

  async function subscribe() {
    const perm = await requestPermission();
    if (perm !== 'granted') {
      showToast('Notifications blocked. Enable them in your browser settings.', 4000);
      return null;
    }

    if (!navigator.serviceWorker) return null;
    const reg = await navigator.serviceWorker.ready;

    // Check if already subscribed
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;

    if (!VAPID_PUBLIC_KEY) {
      // No VAPID key yet — store preference locally and notify when set up
      localStorage.setItem('brainhub-notif-requested', 'true');
      showToast('🔔 You\'ll get notified when new documents are uploaded!', 3500);
      return 'pending';
    }

    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      localStorage.setItem('brainhub-notif-sub', JSON.stringify(sub));
      showToast('🔔 Notifications enabled! We\'ll let you know when new docs drop.', 3500);
      return sub;
    } catch (e) {
      console.warn('[BrainHub] Push subscription failed:', e);
      return null;
    }
  }

  async function unsubscribe() {
    if (!navigator.serviceWorker) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    localStorage.removeItem('brainhub-notif-sub');
    localStorage.removeItem('brainhub-notif-requested');
    showToast('Notifications turned off.', 2500);
  }

  function isSubscribed() {
    return !!(localStorage.getItem('brainhub-notif-sub') || localStorage.getItem('brainhub-notif-requested'));
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw     = window.atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }

  // Show notification prompt after 3 visits if not already subscribed/denied
  function maybePrompt() {
    if (Notification.permission === 'denied') return;
    if (isSubscribed()) return;
    const visits = parseInt(localStorage.getItem('brainhub-visits') || '0');
    localStorage.setItem('brainhub-visits', visits + 1);
    if (visits === 3) {
      setTimeout(() => showNotifPrompt(), 4000);
    }
  }

  function showNotifPrompt() {
    // Only show if not already showing
    if (document.getElementById('notifPrompt')) return;
    const prompt = document.createElement('div');
    prompt.id = 'notifPrompt';
    prompt.style.cssText = `
      position:fixed; bottom:5rem; left:50%; transform:translateX(-50%);
      background:var(--card); border:1px solid var(--border);
      border-radius:16px; padding:1.1rem 1.25rem;
      box-shadow:0 8px 32px rgba(0,0,0,0.15);
      z-index:9999; max-width:340px; width:90%;
      display:flex; align-items:center; gap:0.9rem;
      animation: slideUp 0.3s ease;
    `;
    prompt.innerHTML = `
      <div style="font-size:1.8rem;flex-shrink:0">🔔</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:0.9rem;color:var(--text-900);margin-bottom:0.2rem">Get notified about new docs</div>
        <div style="font-size:0.78rem;color:var(--text-500)">We'll ping you when new notes or exams are uploaded for your courses.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.4rem;flex-shrink:0">
        <button onclick="window.BrainHubNotifications.subscribe();document.getElementById('notifPrompt')?.remove()"
          style="background:var(--primary);color:white;border:none;border-radius:8px;padding:0.4rem 0.8rem;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit">
          Enable
        </button>
        <button onclick="document.getElementById('notifPrompt')?.remove()"
          style="background:var(--bg-muted);color:var(--text-700);border:none;border-radius:8px;padding:0.4rem 0.8rem;font-size:0.78rem;cursor:pointer;font-family:inherit">
          Not now
        </button>
      </div>
    `;
    document.body.appendChild(prompt);
    setTimeout(() => prompt.remove(), 12000); // auto-dismiss after 12s
  }

  // Run prompt logic on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybePrompt);
  } else {
    maybePrompt();
  }

  return { requestPermission, subscribe, unsubscribe, isSubscribed };
})();