/**
 * HS21 Smart Bot Logic
 * "Trained" with specific intents and patterns for the digital agency domain.
 */

// The "Brain" - Knowledge Base
const intents = [
    {
        id: 'greeting',
        patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'hola', 'yo', 'start'],
        responses: [
            "Hello! 👋 Welcome to HS21 Digital. How can I verify your digital success today?",
            "Hi there! Ready to transform your digital presence? I'm here to guide you.",
            "Greetings! I'm the HS21 AI assistant. Ask me about our services, courses, or pricing!"
        ]
    },
    {
        id: 'services',
        patterns: ['what do you do', 'services', 'offer', 'products', 'what can you help with'],
        responses: [
            "We specialize in three core areas:\n1. 🌐 **Web Development**: Custom, high-performance websites.\n2. 📈 **Digital Marketing**: SEO, PPC, and growth strategies.\n3. 🎨 **Brand Identity**: Logo design and complete visual branding.\n\nWhich one interests you?"
        ]
    },
    {
        id: 'pricing_web',
        patterns: ['website cost', 'price of website', 'how much for website', 'web dev price', 'cost to build site', 'web rates'],
        responses: [
            "Our Website Development packages are tailored to your needs:\n• **Starter**: ₹18,000+ (Great for small businesses)\n• **Professional**: ₹42,000+ (Most Popular)\n• **Enterprise**: Custom pricing\n\nWould you like to start a project?"
        ]
    },
    {
        id: 'pricing_marketing',
        patterns: ['marketing cost', 'seo price', 'marketing package', 'cost of seo', 'ppc price'],
        responses: [
            "Our Digital Marketing plans drive real growth:\n• **Starter Growth**: ₹18,000/mo\n• **Growth Accelerator**: ₹42,000/mo\n\nWe focus on ROI and measurable results. Shall we audit your current presence?"
        ]
    },
    {
        id: 'pricing_branding',
        patterns: ['logo cost', 'logo price', 'branding cost', 'brand identity price', 'cost of logo'],
        responses: [
            "Build a brand that stands out:\n• **Logo Package**: ₹10,000\n• **Complete Identity**: ₹30,000\n• **Brand Refresh**: ₹48,000+\n\nReady to make a statement?"
        ]
    },
    {
        id: 'courses',
        patterns: ['course', 'learn', 'teach', 'training', 'bootcamp', 'student', 'enroll'],
        responses: [
            "We offer premium courses to help you master digital skills:\n• 💻 **Web Development Bootcamp**\n• 📈 **Digital Marketing Mastery**\n• 🎨 **Brand Identity Design**\n\nCheck out the 'Courses' page to enroll!"
        ]
    },
    {
        id: 'contact',
        patterns: ['contact', 'email', 'phone', 'call', 'reach', 'talk to human', 'support'],
        responses: [
            "You can reach our team directly at:\n📧 hello@hs21digital.com\n📱 +91 6397841399\n\nOr simply fill out the contact form below!"
        ]
    },
    {
        id: 'portfolio',
        patterns: ['work', 'portfolio', 'projects', 'case studies', 'examples', 'done before'],
        responses: [
            "We've worked with wonderful clients like WeCureWellness, WPP Media, and PrimeBeds. You can view our detailed case studies in the 'Our Work' section of the home page."
        ]
    },
    {
        id: 'thanks',
        patterns: ['thank', 'thanks', 'thx', 'cool', 'great', 'awesome'],
        responses: [
            "You're welcome! Let me know if you need anything else. 🚀",
            "Happy to help! 😊",
            "Glad I could assist. Have a creative day!"
        ]
    }
];

// improved "Fuzzy" matching logic
function findBestMatch(userMessage) {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // 1. Check for exact keywords first (scoring system)
    let bestMatch = null;
    let highestScore = 0;

    intents.forEach(intent => {
        let score = 0;
        intent.patterns.forEach(pattern => {
            if (normalizedMessage.includes(pattern)) {
                // simple inclusion adds specific weight based on length of pattern (longer specific phrases worth more)
                score += pattern.length;
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
        }
    });

    return bestMatch;
}

// Main function to get response
function getBotResponse(userMessage) {
    // Basic fallback if empty
    if (!userMessage) return "I didn't catch that. Could you say it again?";

    const match = findBestMatch(userMessage);

    if (match) {
        // Return a random response from the matching intent
        const randomIndex = Math.floor(Math.random() * match.responses.length);
        return match.responses[randomIndex];
    }

    // Default Fallback
    return "I'm not entirely sure about that specific query. However, I can help you with services, pricing, courses, or connecting you with our team. What would you like to explore?";
}

module.exports = { getBotResponse };
