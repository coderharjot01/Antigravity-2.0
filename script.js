// Star Background & Cursor Swarm
function initStars() {
    // Mobile optimization: Less stars
    const isMobile = window.innerWidth < 768;
    const container = document.getElementById('stars-container');
    const starCount = isMobile ? 30 : 100; // Reduce from 100 to 30 on mobile

    // 1. Static Background Stars
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random drift destination (movement)
        const moveX = (Math.random() - 0.5) * 100; // -50px to +50px
        const moveY = (Math.random() - 0.5) * 100;

        // Random animation properties
        const duration = 10 + Math.random() * 20; // 10-30s slow drift
        const delay = Math.random() * 5;
        const opacity = 0.3 + Math.random() * 0.7;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--delay', `${delay}s`);
        star.style.setProperty('--moveX', `${moveX}px`);
        star.style.setProperty('--moveY', `${moveY}px`);
        star.style.setProperty('--opacity', opacity);

        if (Math.random() < 0.2) {
            star.style.width = '3px';
            star.style.height = '3px';
            star.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.9), 0 0 15px var(--primary)'; // Brighter glow for big stars
        }

        container.appendChild(star);
    }

    // 2. Interactive Cursor Swarm (Disable on mobile)
    if (!isMobile) {
        const swarmCount = 20;
        const swarmStars = [];

        for (let i = 0; i < swarmCount; i++) {
            const star = document.createElement('div');
            star.className = 'swarm-star';
            document.body.appendChild(star);

            swarmStars.push({
                element: star,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                offsetX: (Math.random() - 0.5) * 60, // Spread range
                offsetY: (Math.random() - 0.5) * 60,
                speed: 0.05 + Math.random() * 0.08 // Variable speed for natural feel
            });
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateSwarm() {
            swarmStars.forEach(star => {
                // Target position is mouse + offset
                const targetX = mouseX + star.offsetX;
                const targetY = mouseY + star.offsetY;

                // Smooth easing (Lerp)
                star.x += (targetX - star.x) * star.speed;
                star.y += (targetY - star.y) * star.speed;

                star.element.style.transform = `translate(${star.x}px, ${star.y}px)`;
            });
            requestAnimationFrame(animateSwarm);
        }

        animateSwarm();
    }
}

// Typing Text Effect
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    const phrases = ["Digital Empires", "Scalable Systems", "Stunning Designs", "Future Tech"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster when deleting
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing speed
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Finished typing phrase
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting phrase
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before typing new
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// Back to Top with Progress
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    const circle = backToTopBtn.querySelector('circle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Set initial state
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    window.addEventListener('scroll', () => {
        // Calculate scroll percentage
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / height;

        // Update circular progress
        const offset = circumference - (scrollPercent * circumference);
        circle.style.strokeDashoffset = offset;

        // Show/Hide button
        if (scrollTop > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 3D Tilt Effect
function initTiltEffect() {
    if (window.innerWidth < 768) return; // Disable on mobile

    const cards = document.querySelectorAll('.project-card, .service-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max +/- 10deg)
            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const rotateX = (0.5 - yPct) * 20; // -10 to +10 deg
            const rotateY = (xPct - 0.5) * 20; // -10 to +10 deg

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initTypingEffect();
    initBackToTop();
    initTiltEffect();
});

// Custom Cursor
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Add a slight delay/easing to the outline for a fluid feel
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Add hover effect to interactive elements
const interactiveElements = document.querySelectorAll('a, button, input, textarea');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        cursorOutline.style.borderColor = 'transparent';
    });

    el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.backgroundColor = 'transparent';
        cursorOutline.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    });
});

// Scroll Reveal Animation
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in class to sections and cards
document.querySelectorAll('section, .service-card, .glass-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileBtn.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    if (navLinks.style.display === 'flex') {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(5, 5, 7, 0.95)';
        navLinks.style.padding = '2rem';
        navLinks.style.borderBottom = '1px solid var(--glass-border)';
    }
});

// Add CSS for fade-in animation dynamically
const style = document.createElement('style');
style.innerHTML = `
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Chatbot Functionality
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const notificationBadge = document.querySelector('.notification-badge');

// Toggle chat window
chatToggle.addEventListener('click', () => {
    // Toggle the active class
    chatWindow.classList.toggle('active');

    // Hide notification badge when opening
    if (chatWindow.classList.contains('active') && notificationBadge) {
        notificationBadge.style.display = 'none';
    }
});

closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
});

// Send message function
function sendMessage(messageText) {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = createMessage(messageText, 'user');
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Remove quick replies if present
    const quickReplies = document.querySelector('.quick-replies');
    if (quickReplies) {
        quickReplies.remove();
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate bot response
    setTimeout(() => {
        const botResponse = getBotResponse(messageText);
        const botMessage = createMessage(botResponse, 'bot');
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Re-initialize Lucide icons for new messages
        lucide.createIcons();
    }, 1000);
}

// Create message element
function createMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'bot'
        ? '<i data-lucide="bot"></i>'
        : '<i data-lucide="user"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <p>${text}</p>
        <span class="message-time">${getCurrentTime()}</span>
    `;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

// Get bot response
function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();

    if (userMessage.includes('website') || userMessage.includes('web')) {
        return "Great! We specialize in building stunning, responsive websites. Would you like to discuss your project requirements? Feel free to share details or contact us at hello@hs21digital.com";
    } else if (userMessage.includes('marketing') || userMessage.includes('seo')) {
        return "Our digital marketing services include SEO, social media management, and PPC campaigns. We can help increase your online visibility and drive real growth. What specific marketing goals do you have?";
    } else if (userMessage.includes('price') || userMessage.includes('cost') || userMessage.includes('pricing')) {
        return "Our pricing is tailored for the Indian market, starting from ₹15,000 for websites and ₹8,000 for branding. Let's discuss your specific needs! Email us at hello@hs21digital.com for a custom quote.";
    } else if (userMessage.includes('hello') || userMessage.includes('hi')) {
        return "Hello! 👋 Thanks for reaching out. How can HS21 Digital help bring your vision to life today?";
    } else if (userMessage.includes('thank')) {
        return "You're welcome! If you have any other questions, feel free to ask. We're here to help! 😊";
    } else {
        return "Thanks for your message! I'd love to help you further. For detailed information, please email us at hello@hs21digital.com or give us a call at +91 98765 43210. Our team will get back to you shortly!";
    }
}

// Get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Send button click
sendBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
});

// Enter key to send
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(chatInput.value);
    }
});

// Quick reply buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-reply')) {
        const message = e.target.getAttribute('data-message');
        sendMessage(message);
    }
});

// Project Modal Functionality
const projectModal = document.getElementById('project-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

// Project data
const projectData = {
    wecurewellness: {
        title: 'WeCureWellness',
        category: 'Health & Wellness',
        image: './images/wecurewellness.png',
        url: 'https://wecurewellness.com/',
        client: 'Healthcare Provider',
        duration: '3 months',
        year: '2024',
        description: 'A comprehensive wellness platform connecting patients with holistic healthcare solutions. Features secure patient portals, appointment scheduling, and telemedicine integration.',
        challenge: 'Creating a secure, HIPAA-compliant platform that is also user-friendly for elderly patients.',
        solution: 'Built a custom portal with simplified UI/UX, integrated video conferencing, and encrypted data storage.',
        features: ['Patient Portal', 'Telemedicine', 'Appointment Booking', 'Secure Messaging', 'Health Records', 'Payment Processing'],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'WebRTC', 'AWS'],
        results: '+45% Patient Engagement, Reduced Wait Times by 60%, 98% Patient Satisfaction Score'
    },
    wppmedia: {
        title: 'WPP Media',
        category: 'Digital Agency',
        image: './images/wppmedia.png',
        url: 'https://www.wppmedia.com/',
        client: 'Media Agency',
        duration: '2 months',
        year: '2024',
        description: 'Corporate portfolio website for a leading media and digital advertising agency. Showcases high-impact campaigns with smooth animations and immersive visuals.',
        challenge: 'The agency needed a website that reflected their creativity and modern approach to advertising.',
        solution: 'Developed a WebGL-powered portfolio site with fluid transitions and interactive case studies.',
        features: ['WebGL Animations', 'Interactive Case Studies', 'Client Portal', 'Career Section', 'News & Insights', 'Dynamic Filtering'],
        technologies: ['Three.js', 'GSAP', 'Next.js', 'Contentful CMS'],
        results: 'Award-Winning Design, +200% Lead Generation, Improved Brand Perception'
    },
    primebeds: {
        title: 'PrimeBeds',
        category: 'E-commerce',
        image: './images/primebeds.png',
        url: 'https://primebeds.in/',
        client: 'Furniture Retailer',
        duration: '4 months',
        year: '2024',
        description: 'Modern e-commerce store for premium bedding with seamless checkout experience. Features custom mattress configurator and augmented reality preview.',
        challenge: 'Simplifying the complex process of buying a mattress online and reducing cart abandonment.',
        solution: 'Implemented a custom Shopify Plus store with a guided selling quiz and AR visualization tools.',
        features: ['Product Configurator', 'AR Preview', 'Custom Quiz', 'One-Page Checkout', 'Abandoned Cart Recovery', 'Loyalty Program'],
        technologies: ['Shopify Plus', 'Liquid', 'Vue.js', 'AR.js'],
        results: '+35% Conversion Rate, +50% Average Order Value, 2x Direct Traffic'
    },
    ecommerce: {
        title: 'Luxury E-commerce Platform',
        category: 'Web Development',
        image: './images/ecommerce_project.png',
        client: 'Luxury Fashion Brand',
        duration: '3 months',
        year: '2024',
        description: 'High-end e-commerce platform.',
        features: [],
        technologies: []
    }
};

// Open modal when project card is clicked
// Open modal when project card is clicked (Event Delegation)
document.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (card) {
        const projectId = card.getAttribute('data-project');
        if (projectId && projectData[projectId]) {
            openProjectModal(projectId);
        }
    }
});

// Close modal handlers
modalClose.addEventListener('click', closeProjectModal);
modalOverlay.addEventListener('click', closeProjectModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

function openProjectModal(projectId) {
    const project = projectData[projectId];
    if (!project) return;

    // Generate modal content
    modalBody.innerHTML = `
        <div class="modal-header">
            <span class="project-category">${project.category}</span>
            <h2>${project.title}</h2>
            <div class="project-meta">
                <span><i data-lucide="user"></i> ${project.client}</span>
                <span><i data-lucide="calendar"></i> ${project.year}</span>
                <span><i data-lucide="clock"></i> ${project.duration}</span>
            </div>
        </div>

        <div class="modal-image">
            ${project.image
            ? `<img src="${project.image}" alt="${project.title}">`
            : `<div class="modal-placeholder"><i data-lucide="${project.icon}"></i></div>`
        }
        </div>

        <div class="modal-description">
            <h3>Project Overview</h3>
            <p>${project.description}</p>
            ${project.challenge ? `<p><strong>Challenge:</strong> ${project.challenge}</p>` : ''}
            ${project.solution ? `<p><strong>Solution:</strong> ${project.solution}</p>` : ''}
        </div>

        <div class="modal-features">
            <h3>Key Features</h3>
            <div class="features-grid">
                ${project.features.map(feature => `
                    <div class="feature-item">
                        <i data-lucide="check-circle"></i>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="modal-technologies">
            <h3>Technologies Used</h3>
            <div class="tech-grid">
                ${project.technologies.map(tech => `
                    <span class="tech-item">${tech}</span>
                `).join('')}
            </div>
        </div>

        ${project.results ? `
            <div class="modal-description">
                <h3>Results</h3>
                <p><strong>${project.results}</strong></p>
            </div>
        ` : ''}

        <div class="modal-cta">
            ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn-primary">Visit Website <i data-lucide="external-link"></i></a>` : ''}
            <a href="#contact" class="btn-secondary" onclick="closeProjectModal()">Start Your Project</a>
        </div>
    `;

    // Show modal
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Re-initialize Lucide icons
    lucide.createIcons();
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Feature Screenshot Lightbox
const featureLightbox = document.getElementById('feature-lightbox');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');

// Feature screenshots mapping
const featureScreenshots = {
    // E-commerce Features
    'Custom Product Configurator': './images/features/product_configurator.png',
    'Real-time Inventory Sync': './images/features/inventory_sync.png',
    'Advanced Filtering System': './images/features/filtering_system.png',
    'Wishlist & Favorites': './images/features/wishlist.png',
    'Mobile-First Design': './images/features/mobile_design.png',
    'Payment Gateway Integration': './images/features/payment_gateway.png',

    // Restaurant Features
    'Online Reservation System': './images/features/reservation_system.png',
    'Interactive Digital Menu': './images/features/digital_menu.png',
    'Chef\'s Table Booking': './images/features/chef_table.png',
    'Event Management': './images/features/event_management.png',
    'Photo Gallery': './images/features/photo_gallery.png',
    'Newsletter Integration': './images/features/newsletter.png',

    // SaaS Features
    'Real-time Data Processing': './images/features/data_processing.png',
    'Custom Dashboard Builder': './images/features/dashboard_builder.png',
    'Advanced Filtering': './images/features/advanced_filtering.png',
    'Export & Reporting': './images/features/export_reporting.png',
    'Team Collaboration': './images/features/team_collaboration.png',
    'API Integration': './images/features/api_integration.png',

    // Fitness Marketing Features
    'Social Media Strategy': './images/features/social_media.png',
    'Influencer Partnerships': './images/features/influencer.png',
    'Content Creation': './images/features/content_creation.png',
    'PPC Campaigns': './images/features/ppc_campaigns.png',
    'Email Marketing': './images/features/email_marketing.png',
    'App Store Optimization': './images/features/aso.png',

    // Startup Branding Features
    'Logo & Visual Identity': './images/features/logo_identity.png',
    'Brand Guidelines': './images/features/brand_guidelines.png',
    'Pitch Deck Design': './images/features/pitch_deck.png',
    'Business Cards & Stationery': './images/features/business_cards.png',
    'Website Design System': './images/features/design_system.png',
    'Social Media Templates': './images/features/social_templates.png',

    // SEO Features
    'Technical SEO Audit': './images/features/seo_audit.png',
    'Keyword Research & Strategy': './images/features/keyword_research.png',
    'On-page Optimization': './images/features/onpage_seo.png',
    'Content Marketing': './images/features/content_marketing.png',
    'Link Building': './images/features/link_building.png',
    'Analytics & Reporting': './images/features/analytics_reporting.png'
};

// Handle feature clicks - using event delegation
document.addEventListener('click', (e) => {
    const featureItem = e.target.closest('.feature-item');
    if (featureItem && featureItem.querySelector('span')) {
        const featureName = featureItem.querySelector('span').textContent;
        const screenshot = featureScreenshots[featureName];

        if (screenshot) {
            openFeatureLightbox(screenshot, featureName);
        }
    }
});

// Close lightbox handlers
lightboxClose.addEventListener('click', closeFeatureLightbox);
featureLightbox.addEventListener('click', (e) => {
    if (e.target === featureLightbox) {
        closeFeatureLightbox();
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && featureLightbox.classList.contains('active')) {
        closeFeatureLightbox();
    }
});

function openFeatureLightbox(imageSrc, caption) {
    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = caption;
    featureLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Re-initialize Lucide icons
    lucide.createIcons();
}

function closeFeatureLightbox() {
    featureLightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Contact Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // Send to backend API
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Success - show confirmation
            showNotification('✅ Thank you! We\'ll be in touch soon.', 'success');
            contactForm.reset();
        } else {
            // Error from server
            showNotification('❌ ' + (data.error || 'Something went wrong'), 'error');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('❌ Failed to send message. Please try again.', 'error');
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.innerHTML = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// PWA Install Prompt
let deferredPrompt;
const installPrompt = document.getElementById('pwa-install-prompt');
const installButton = document.getElementById('install-button');
const dismissButton = document.getElementById('dismiss-prompt');

// Capture the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install prompt after 3 seconds
    setTimeout(() => {
        if (!localStorage.getItem('pwa-dismissed')) {
            installPrompt.classList.add('show');
        }
    }, 3000);
});

// Install button click
installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    // Hide the prompt
    installPrompt.classList.remove('show');
    
    // Clear the deferredPrompt
    deferredPrompt = null;
});

// Dismiss button click
dismissButton.addEventListener('click', () => {
    installPrompt.classList.remove('show');
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-dismissed', Date.now() + (7 * 24 * 60 * 60 * 1000));
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installPrompt.classList.remove('show');
    deferredPrompt = null;
});

// Hide prompt if already installed (running as standalone)
if (window.matchMedia('(display-mode: standalone)').matches) {
    installPrompt.style.display = 'none';
}

// Navigation Install Button
const navInstallButton = document.getElementById('nav-install-button');

// Show nav button when app is installable
window.addEventListener('beforeinstallprompt', (e) => {
    // Also show the nav button
    if (navInstallButton && !window.matchMedia('(display-mode: standalone)').matches) {
        navInstallButton.style.display = 'inline-flex';
    }
});

// Nav button click - same as banner install
if (navInstallButton) {
    navInstallButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            alert('To install this app:\n\n• On Android/Chrome: Use the menu and select "Install app"\n• On iPhone: Tap the Share button and select "Add to Home Screen"\n• On Desktop: Look for the install icon in the address bar');
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        if (outcome === 'accepted') {
            navInstallButton.style.display = 'none';
        }
        
        deferredPrompt = null;
    });
}

// Hide nav button if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
    if (navInstallButton) {
        navInstallButton.style.display = 'none';
    }
}
