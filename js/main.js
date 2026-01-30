document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
            
            if (!isVisible) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#fff';
                navLinks.style.padding = '1rem';
                navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                navLinks.style.zIndex = '1000';
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (navLinks && navLinks.style.display === 'flex' && 
            !navLinks.contains(event.target) && 
            event.target !== mobileBtn) {
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
});

// Search Functionality
function searchMaterials() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.card');
    
    if (!query) {
        alert('Please enter a search term!');
        return;
    }

    let found = false;
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        
        // Simple filter effect
        if (title.includes(query) || desc.includes(query)) {
            card.style.display = 'block';
            card.style.border = '2px solid var(--primary-color)';
            card.style.backgroundColor = '#f0f7ff'; // Light blue highlight
            found = true;
        } else {
            card.style.display = 'none';
            card.style.border = '1px solid transparent';
            card.style.backgroundColor = ''; // Reset background
        }
    });

    if (!found) {
        alert('No categories found matching: ' + query);
        // Reset view
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.border = '1px solid transparent';
            card.style.backgroundColor = '';
        });
        searchInput.focus();
    }
}
// Search Button Event Listener
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-box button');

function performSearch() {
    const query = searchInput.value.toLowerCase();
    if (query.includes('grade') || query.includes('ecz') || query.includes('secondary')) {
        window.location.href = 'pages/secondary.html';
    } else if (query.includes('university') || query.includes('unza') || query.includes('cbu')) {
        window.location.href = 'pages/universities.html';
    } else if (query.includes('quiz') || query.includes('test')) {
        window.location.href = 'pages/quizzes.html';
    } else {
        alert("Try searching for 'Secondary', 'University', or 'Quizzes'");
    }
}

if(searchBtn) searchBtn.addEventListener('click', performSearch);

// Contact Form Validation
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

// Function to toggle bookmark
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

// Function to load bookmarks (put this on a new 'saved.html' page)
function loadBookmarks() {
    const list = document.getElementById('saved-list');
    const bookmarks = JSON.parse(localStorage.getItem('brainhubBookmarks')) || [];
    
    if (bookmarks.length === 0) {
        list.innerHTML = '<p>No saved items yet.</p>';
        return;
    }
    
    list.innerHTML = bookmarks.map(item => `
        <div class="card">
            <h3>${item.title}</h3>
            <a href="${item.url}" class="link-btn">View Resource</a>
            <button onclick="toggleBookmark('${item.id}')" style="color: red;">Remove</button>
        </div>
    `).join('');
}