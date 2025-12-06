// Star Background
function createStars() {
    const container = document.getElementById('stars-container');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random animation properties
        const duration = 2 + Math.random() * 4; // 2-6s
        const delay = Math.random() * 4;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.setProperty('--delay', `${delay}s`);

        // Varying sizes
        if (Math.random() < 0.1) { // 10% chance for bigger star
            star.style.width = '3px';
            star.style.height = '3px';
        }

        container.appendChild(star);
    }
}

document.addEventListener('DOMContentLoaded', createStars);

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
    ecommerce: {
        title: 'Luxury E-commerce Platform',
        category: 'Web Development',
        image: './images/ecommerce_project.png',
        client: 'Luxury Fashion Brand',
        duration: '3 months',
        year: '2024',
        description: 'We designed and developed a high-end e-commerce platform for a luxury fashion brand, featuring custom product configurators, seamless checkout experience, and integration with existing inventory systems. The platform achieved a 40% increase in conversion rates within the first quarter.',
        challenge: 'The client needed a sophisticated online presence that matched their luxury brand identity while providing a frictionless shopping experience across all devices.',
        solution: 'We implemented a custom React-based frontend with Shopify as the backend, creating a headless commerce solution that delivered exceptional performance and flexibility.',
        features: ['Custom Product Configurator', 'Real-time Inventory Sync', 'Advanced Filtering System', 'Wishlist & Favorites', 'Mobile-First Design', 'Payment Gateway Integration'],
        technologies: ['React', 'Shopify Plus', 'Node.js', 'GraphQL', 'Tailwind CSS', 'Stripe'],
        results: '+40% Conversion Rate, +65% Mobile Sales, 2.5s Average Load Time'
    },
    restaurant: {
        title: 'Fine Dining Restaurant',
        category: 'Brand Identity',
        image: './images/restaurant_project.png',
        client: 'Upscale Restaurant',
        duration: '2 months',
        year: '2024',
        description: 'Complete brand refresh and website redesign for an upscale dining establishment. We created a sophisticated visual identity and an elegant website featuring online reservations, interactive menus, and a gallery showcasing the culinary experience.',
        challenge: 'The restaurant needed to elevate their digital presence to match their premium dining experience and attract high-end clientele.',
        solution: 'We developed a comprehensive brand identity package and a luxurious website with integrated reservation system and content management capabilities.',
        features: ['Online Reservation System', 'Interactive Digital Menu', 'Chef\'s Table Booking', 'Event Management', 'Photo Gallery', 'Newsletter Integration'],
        technologies: ['WordPress', 'OpenTable API', 'Custom Theme', 'JavaScript', 'PHP', 'MySQL'],
        results: '+120% Online Reservations, +80% Brand Recognition, Featured in Local Press'
    },
    saas: {
        title: 'SaaS Analytics Dashboard',
        category: 'Web Application',
        image: './images/saas_project.png',
        client: 'Tech Startup',
        duration: '6 months',
        year: '2023',
        description: 'Enterprise-grade analytics platform with real-time data visualization, customizable dashboards, and advanced reporting capabilities. Built for a B2B SaaS company serving Fortune 500 clients.',
        challenge: 'Creating a scalable platform that could handle millions of data points while maintaining real-time performance and providing intuitive data visualization.',
        solution: 'We architected a modern web application using Vue.js for the frontend and Node.js microservices for the backend, with real-time data processing capabilities.',
        features: ['Real-time Data Processing', 'Custom Dashboard Builder', 'Advanced Filtering', 'Export & Reporting', 'Team Collaboration', 'API Integration'],
        technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Redis', 'D3.js', 'WebSockets'],
        results: '10M+ Data Points Processed Daily, 99.9% Uptime, 50+ Enterprise Clients'
    },
    fitness: {
        title: 'Fitness App Launch Campaign',
        category: 'Digital Marketing',
        image: './images/fitness_project.png',
        client: 'Fitness App Startup',
        duration: '4 months',
        year: '2024',
        description: '360° digital marketing strategy for a fitness app launch, including social media campaigns, influencer partnerships, content marketing, and paid advertising across multiple platforms.',
        challenge: 'Launch a new fitness app in a highly competitive market and achieve 50,000 downloads in the first month.',
        solution: 'We developed a comprehensive marketing strategy combining organic and paid channels, leveraging fitness influencers and creating viral-worthy content.',
        features: ['Social Media Strategy', 'Influencer Partnerships', 'Content Creation', 'PPC Campaigns', 'Email Marketing', 'App Store Optimization'],
        technologies: ['Facebook Ads', 'Google Ads', 'Instagram', 'TikTok', 'Mailchimp', 'Analytics Tools'],
        results: '75K+ Downloads First Month, 4.8 Star Rating, Featured on App Store'
    },
    startup: {
        title: 'Tech Startup Branding',
        category: 'Brand Identity',
        image: './images/startup_project.png',
        client: 'AI Technology Startup',
        duration: '2 months',
        year: '2024',
        description: 'Created a comprehensive brand identity for an AI technology startup, including logo design, brand guidelines, pitch deck templates, and marketing collateral to support their Series A fundraising.',
        challenge: 'Establish a strong, professional brand identity that would resonate with both enterprise clients and venture capital investors.',
        solution: 'We developed a modern, tech-forward brand identity that balanced innovation with trustworthiness, complete with detailed guidelines for consistent application.',
        features: ['Logo & Visual Identity', 'Brand Guidelines', 'Pitch Deck Design', 'Business Cards & Stationery', 'Website Design System', 'Social Media Templates'],
        technologies: ['Adobe Creative Suite', 'Figma', 'Brand Strategy', 'Design Systems'],
        results: 'Successfully Raised $5M Series A, Strong Brand Recognition, Professional Market Presence'
    },
    seo: {
        title: 'E-commerce SEO Optimization',
        category: 'SEO & Marketing',
        image: './images/seo_project.png',
        client: 'Online Retail Store',
        duration: '6 months',
        year: '2023-2024',
        description: 'Comprehensive SEO strategy and implementation for an e-commerce store, resulting in massive organic traffic growth and revenue increase through strategic optimization and content marketing.',
        challenge: 'The client was struggling with low organic visibility and high customer acquisition costs through paid advertising.',
        solution: 'We implemented a data-driven SEO strategy including technical optimization, content creation, link building, and conversion rate optimization.',
        features: ['Technical SEO Audit', 'Keyword Research & Strategy', 'On-page Optimization', 'Content Marketing', 'Link Building', 'Analytics & Reporting'],
        technologies: ['Google Analytics', 'Search Console', 'SEMrush', 'Ahrefs', 'Schema Markup', 'Page Speed Tools'],
        results: '+250% Organic Traffic, +180% Conversions, Page 1 Rankings for 150+ Keywords'
    }
};

// Open modal when project card is clicked
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project');
        openProjectModal(projectId);
    });
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
            <a href="#contact" class="btn-primary" onclick="closeProjectModal()">Start Your Project</a>
            <a href="#work" class="btn-secondary" onclick="closeProjectModal()">View More Work</a>
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
