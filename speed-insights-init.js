// Vercel Speed Insights Initialization
// Loads Speed Insights to monitor web performance
// This runs on the client side only

(function() {
    // Check if we're in a browser environment (client-side only)
    if (typeof window === 'undefined') {
        return;
    }

    // Load Vercel Speed Insights script
    // The script will initialize speed monitoring automatically
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    
    // Append to the document head
    if (document.head) {
        document.head.appendChild(script);
    } else {
        // Fallback: append to document if head isn't available yet
        document.addEventListener('DOMContentLoaded', function() {
            if (document.head && !document.querySelector('script[src="/_vercel/insights/script.js"]')) {
                document.head.appendChild(script.cloneNode(true));
            }
        });
    }

    // Log initialization (optional - can be removed for production)
    console.log('✅ Vercel Speed Insights initialized');
})();
