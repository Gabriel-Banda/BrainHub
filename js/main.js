document.addEventListener('DOMContentLoaded', () => {
    // ===== ENHANCED NAVBAR =====
    const navbar = document.querySelector('.navbar');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // ===== ENHANCED SEARCH FUNCTIONALITY =====
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-box button');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchMaterials);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMaterials();
            }
        });
    }
    
    // ===== ANIMATIONS =====
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // ===== FORM VALIDATION =====
    initializeFormValidation();
    
    // ===== REAL-TIME STATS COUNTER =====
    animateStatsCounter();
});

// Enhanced Search Function
function searchMaterials() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    // Simulate search results
    const categories = ['University Notes', 'Secondary Education', 'Past Papers', 'Quizzes'];
    const results = categories.filter(cat => cat.toLowerCase().includes(query));
    
    if (results.length > 0) {
        showNotification(`Found ${results.length} matching categories`, 'success');
        // In real implementation, this would navigate to search results page
        console.log('Search results:', results);
    } else {
        showNotification('No results found. Try different keywords.', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for notification
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                gap: 0.8rem;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                min-width: 300px;
            }
            .notification-success { background: #27AE60; }
            .notification-error { background: #E74C3C; }
            .notification-warning { background: #F39C12; }
            .notification-info { background: #3498DB; }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: auto;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto-remove notification
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Animate Stats Counter
function animateStatsCounter() {
    const stats = document.querySelectorAll('.stat-item span');
    if (!stats.length) return;
    
    const targetValues = [50000, 1000, 1]; // Actual target numbers
    const duration = 2000;
    const frameRate = 60;
    const increment = targetValues.map(val => val / (duration / (1000 / frameRate)));
    
    let currentValues = [0, 0, 0];
    const updateCounters = () => {
        stats.forEach((stat, index) => {
            if (currentValues[index] < targetValues[index]) {
                currentValues[index] = Math.min(currentValues[index] + increment[index], targetValues[index]);
                stat.textContent = Math.floor(currentValues[index]).toLocaleString() + 
                    (index === 2 ? '' : '+');
            }
        });
        
        if (currentValues.some((val, idx) => val < targetValues[idx])) {
            requestAnimationFrame(updateCounters);
        }
    };
    
    // Start animation when in viewport
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            updateCounters();
            observer.disconnect();
        }
    });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) observer.observe(heroStats);
}

// Initialize Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const isValid = validateForm(this);
            if (isValid) {
                // Simulate form submission
                showNotification('Your message has been sent successfully!', 'success');
                this.reset();
                
                // In real app, you would send data to server
                // fetch('/api/contact', { method: 'POST', body: new FormData(this) })
            }
        });
    });
}

// Form Validation Helper
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        input.classList.remove('error');
        
        if (!input.value.trim()) {
            input.classList.add('error');
            showNotification(`Please fill in the ${input.name || 'required'} field`, 'error');
            isValid = false;
        }
        
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                showNotification('Please enter a valid email address', 'error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Add to style.css
const style = document.createElement('style');
style.textContent = `
    input.error, textarea.error, select.error {
        border-color: #E74C3C !important;
        background: #FDEDED;
    }
    
    .hero-stats {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }
    
    .hero-stats.animated {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);