document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      
      if (navLinks.classList.contains('active')) {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--nav-bg)';
        navLinks.style.padding = '1rem';
        navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        navLinks.style.zIndex = '1000';
      } else {
        navLinks.style.display = 'none';
      }
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (event) => {
    if (navLinks && navLinks.classList.contains('active') && 
        !navLinks.contains(event.target) && 
        event.target !== mobileBtn) {
      navLinks.classList.remove('active');
      navLinks.style.display = 'none';
    }
  });

  // Sticky Navbar Shadow on Scroll
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 0 
        ? '0 2px 10px rgba(0,0,0,0.1)' 
        : '0 2px 10px rgba(0,0,0,0.05)';
    }
  });

  // Initialize contact form validation if form exists on page
  validateContactForm();
  
  // Initialize Dark Mode
  initDarkMode();
  
  // Initialize Flashcards
  initFlashcards();
  
  // Initialize Live Search
  initLiveSearch();
  
  // Initialize Pomodoro Timer
  initPomodoroTimer();
});

// ==================== DARK MODE TOGGLE ====================
function initDarkMode() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (!themeToggle) return;
  
  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem('brainhub-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update icon based on current theme
  updateThemeIcon(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save preference
    localStorage.setItem('brainhub-theme', newTheme);
    
    // Update icon
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

// ==================== FLASHCARDS ====================
function initFlashcards() {
  const flashcard = document.getElementById('flashcard');
  const questionEl = document.getElementById('flashcard-question');
  const answerEl = document.getElementById('flashcard-answer');
  const explanationEl = document.getElementById('flashcard-explanation');
  const currentCardEl = document.getElementById('currentCard');
  const nextBtn = document.getElementById('nextCard');
  const prevBtn = document.getElementById('prevCard');
  const topicTags = document.querySelectorAll('.topic-tag');
  
  if (!flashcard) return;
  
  // Flashcards database
  const flashcards = {
    geography: [
      {
        question: "What is the capital of Zambia?",
        answer: "Lusaka",
        explanation: "Lusaka is the capital and largest city of Zambia, located in the southern part of the central plateau."
      },
      {
        question: "Which river forms part of Zambia's border with Zimbabwe?",
        answer: "Zambezi River",
        explanation: "The Zambezi River forms the border between Zambia and Zimbabwe, famous for Victoria Falls."
      },
      {
        question: "What is the highest point in Zambia?",
        answer: "Mafinga Central",
        explanation: "Mafinga Central is the highest peak in Zambia at 2,339 meters (7,674 ft) above sea level."
      },
      {
        question: "Which country borders Zambia to the north?",
        answer: "Democratic Republic of Congo",
        explanation: "Zambia shares its longest border (1,930 km) with the Democratic Republic of Congo to the north."
      },
      {
        question: "What is Zambia's largest national park?",
        answer: "Kafue National Park",
        explanation: "Kafue National Park is Zambia's largest national park, covering about 22,400 km²."
      }
    ],
    science: [
      {
        question: "What is the chemical symbol for gold?",
        answer: "Au",
        explanation: "Au comes from the Latin word 'aurum', meaning gold."
      },
      {
        question: "What planet is known as the Red Planet?",
        answer: "Mars",
        explanation: "Mars appears red due to iron oxide (rust) on its surface."
      },
      {
        question: "What is the hardest natural substance on Earth?",
        answer: "Diamond",
        explanation: "Diamond scores 10 on the Mohs scale of mineral hardness."
      }
    ],
    mathematics: [
      {
        question: "What is the value of π (pi) to two decimal places?",
        answer: "3.14",
        explanation: "π is a mathematical constant representing the ratio of a circle's circumference to its diameter."
      },
      {
        question: "What is 15 squared?",
        answer: "225",
        explanation: "15 × 15 = 225"
      }
    ]
  };
  
  let currentDeck = 'geography';
  let currentIndex = 0;
  
  // Load saved progress
  const savedProgress = JSON.parse(localStorage.getItem('brainhub-flashcards')) || {
    currentDeck: 'geography',
    currentIndex: 0
  };
  
  currentDeck = savedProgress.currentDeck;
  currentIndex = savedProgress.currentIndex;
  
  // Update active topic tag
  updateActiveTopic();
  
  // Load current card
  updateFlashcard();
  
  // Flip card on click
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });
  
  // Next card button
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      flashcard.classList.remove('flipped');
      currentIndex = (currentIndex + 1) % flashcards[currentDeck].length;
      saveProgress();
      updateFlashcard();
    });
  }
  
  // Previous card button
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      flashcard.classList.remove('flipped');
      currentIndex = (currentIndex - 1 + flashcards[currentDeck].length) % flashcards[currentDeck].length;
      saveProgress();
      updateFlashcard();
    });
  }
  
  // Topic tag selection
  topicTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const topic = tag.textContent.toLowerCase();
      if (flashcards[topic]) {
        currentDeck = topic;
        currentIndex = 0;
        updateActiveTopic();
        saveProgress();
        updateFlashcard();
        flashcard.classList.remove('flipped');
      }
    });
  });
  
  function updateFlashcard() {
    const card = flashcards[currentDeck][currentIndex];
    questionEl.textContent = card.question;
    answerEl.textContent = card.answer;
    explanationEl.textContent = card.explanation;
    currentCardEl.textContent = currentIndex + 1;
    document.getElementById('totalCards').textContent = flashcards[currentDeck].length;
  }
  
  function updateActiveTopic() {
    topicTags.forEach(tag => {
      tag.classList.remove('active');
      if (tag.textContent.toLowerCase() === currentDeck) {
        tag.classList.add('active');
      }
    });
  }
  
  function saveProgress() {
    localStorage.setItem('brainhub-flashcards', JSON.stringify({
      currentDeck,
      currentIndex
    }));
  }
}

// ==================== LIVE SEARCH ====================
function initLiveSearch() {
  const searchInput = document.getElementById('searchInput');
  const cards = document.querySelectorAll('.card');
  
  if (!searchInput) return;
  
  // Add event listener for real-time search
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    
    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const link = card.querySelector('a').textContent.toLowerCase();
      
      if (query === '') {
        // Show all cards
        card.classList.remove('hidden');
        card.classList.remove('highlight');
      } else if (title.includes(query) || desc.includes(query) || link.includes(query)) {
        // Show matching cards with highlight
        card.classList.remove('hidden');
        card.classList.add('highlight');
      } else {
        // Hide non-matching cards
        card.classList.add('hidden');
        card.classList.remove('highlight');
      }
    });
    
    // If no cards match, show a message
    const visibleCards = Array.from(cards).filter(card => !card.classList.contains('hidden'));
    if (visibleCards.length === 0 && query !== '') {
      showSearchMessage('No matching categories found. Try "university", "secondary", or "quizzes"');
    } else {
      hideSearchMessage();
    }
  });
  
  // Enter key search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchMaterials();
    }
  });
}

function showSearchMessage(message) {
  let messageEl = document.getElementById('searchMessage');
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'searchMessage';
    messageEl.style.cssText = `
      text-align: center;
      padding: 1rem;
      background: var(--bg-light);
      border-radius: 8px;
      margin: 1rem 0;
      color: var(--text-light);
    `;
    const container = document.querySelector('.features .container');
    if (container) {
      container.appendChild(messageEl);
    }
  }
  messageEl.textContent = message;
}

function hideSearchMessage() {
  const messageEl = document.getElementById('searchMessage');
  if (messageEl) {
    messageEl.remove();
  }
}

// Original search function (for backward compatibility)
function searchMaterials() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.card');
  
  if (!query) {
    alert('Please enter a search term!');
    return;
  }

  cards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc = card.querySelector('p').textContent.toLowerCase();
    
    if (title.includes(query) || desc.includes(query)) {
      card.classList.remove('hidden');
      card.classList.add('highlight');
    } else {
      card.classList.add('hidden');
      card.classList.remove('highlight');
    }
  });

  // Show message if no results
  const visibleCards = Array.from(cards).filter(card => !card.classList.contains('hidden'));
  if (visibleCards.length === 0) {
    showSearchMessage('No categories found matching: ' + query);
  }
}

// ==================== POMODORO TIMER ====================
function initPomodoroTimer() {
  const timerDisplay = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('timerStart');
  const pauseBtn = document.getElementById('timerPause');
  const resetBtn = document.getElementById('timerReset');
  const timerClose = document.getElementById('timerClose');
  const timerToggle = document.getElementById('timerToggle');
  const pomodoroWidget = document.getElementById('pomodoroWidget');
  const sessionCountEl = document.getElementById('sessionCount');
  const timerBeep = document.getElementById('timerBeep');
  
  if (!timerDisplay) return;
  
  let timer;
  let timeLeft = 25 * 60; // 25 minutes in seconds
  let isRunning = false;
  let sessions = parseInt(localStorage.getItem('brainhub-sessions')) || 0;
  
  // Load saved timer state
  const savedTime = localStorage.getItem('brainhub-timer');
  if (savedTime) {
    timeLeft = parseInt(savedTime);
  }
  
  // Load widget state
  const widgetHidden = localStorage.getItem('brainhub-timer-hidden') === 'true';
  if (pomodoroWidget) {
    if (widgetHidden) {
      pomodoroWidget.classList.add('hidden');
    }
  }
  
  // Update session count
  sessionCountEl.textContent = sessions;
  
  // Update display
  updateDisplay();
  
  // Timer toggle button
  if (timerToggle) {
    timerToggle.addEventListener('click', () => {
      if (pomodoroWidget.classList.contains('hidden')) {
        pomodoroWidget.classList.remove('hidden');
        localStorage.setItem('brainhub-timer-hidden', 'false');
        timerToggle.innerHTML = '<i class="fas fa-clock"></i> Hide Timer';
      } else {
        pomodoroWidget.classList.add('hidden');
        localStorage.setItem('brainhub-timer-hidden', 'true');
        timerToggle.innerHTML = '<i class="fas fa-clock"></i> Show Timer';
      }
    });
    
    // Update toggle button text
    if (widgetHidden) {
      timerToggle.innerHTML = '<i class="fas fa-clock"></i> Show Timer';
    } else {
      timerToggle.innerHTML = '<i class="fas fa-clock"></i> Hide Timer';
    }
  }
  
  // Close button
  if (timerClose) {
    timerClose.addEventListener('click', () => {
      pomodoroWidget.classList.add('hidden');
      localStorage.setItem('brainhub-timer-hidden', 'true');
      if (timerToggle) {
        timerToggle.innerHTML = '<i class="fas fa-clock"></i> Show Timer';
      }
    });
  }
  
  // Start button
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!isRunning) {
        startTimer();
      }
    });
  }
  
  // Pause button
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (isRunning) {
        pauseTimer();
      }
    });
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetTimer();
    });
  }
  
  function startTimer() {
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      localStorage.setItem('brainhub-timer', timeLeft);
      
      if (timeLeft <= 0) {
        timerComplete();
      }
    }, 1000);
  }
  
  function pauseTimer() {
    isRunning = false;
    clearInterval(timer);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }
  
  function resetTimer() {
    pauseTimer();
    timeLeft = 25 * 60;
    updateDisplay();
    localStorage.setItem('brainhub-timer', timeLeft);
  }
  
  function timerComplete() {
    clearInterval(timer);
    isRunning = false;
    
    // Play beep sound
    if (timerBeep) {
      timerBeep.currentTime = 0;
      timerBeep.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Show notification
    if (Notification.permission === "granted") {
      new Notification("BrainHub Timer", {
        body: "Study session completed! Take a 5-minute break.",
        icon: "favicon.ico"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("BrainHub Timer", {
            body: "Study session completed! Take a 5-minute break.",
            icon: "favicon.ico"
          });
        }
      });
    }
    
    // Increment session count
    sessions++;
    sessionCountEl.textContent = sessions;
    localStorage.setItem('brainhub-sessions', sessions);
    
    // Reset for next session
    setTimeout(() => {
      resetTimer();
      alert("Time's up! Great work. Take a 5-minute break.");
    }, 100);
  }
  
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Color coding
    if (timeLeft < 300) { // Last 5 minutes
      timerDisplay.style.color = '#ef4444'; // Red
    } else {
      timerDisplay.style.color = 'var(--primary-color)';
    }
  }
  
  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// ==================== CONTACT FORM ====================
function validateContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const subject = document.getElementById('subject').value;
    
    // Simple validation
    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
      <div style="background-color: #d4edda; color: #155724; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
        <strong>Thank you for your message!</strong><br>
        We will respond within 24 hours.
      </div>
    `;
    
    // Insert success message before form
    form.parentNode.insertBefore(successMessage, form);
    
    // Reset form
    form.reset();
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
    
    console.log('Form submitted:', { name, email, subject, message });
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==================== HELPER FUNCTIONS ====================
// Add search on Enter key press
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchMaterials();
      }
    });
  }
});

// Function to toggle bookmark (for future use)
function toggleBookmark(id, title, url) {
  let bookmarks = JSON.parse(localStorage.getItem('brainhubBookmarks')) || [];
  
  // Check if item exists
  const existingIndex = bookmarks.findIndex(item => item.id === id);
  
  if (existingIndex > -1) {
    // Remove it
    bookmarks.splice(existingIndex, 1);
    alert(`${title} removed from saved items.`);
  } else {
    // Add it
    bookmarks.push({ id, title, url });
    alert(`${title} saved to your library!`);
  }
  
  // Save back to local storage
  localStorage.setItem('brainhubBookmarks', JSON.stringify(bookmarks));
}