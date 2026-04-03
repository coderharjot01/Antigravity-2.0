const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Initialize MongoDB connection (only if MONGODB_URI is set)
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        console.log('⚠️ MongoDB URI not set, skipping database connection');
        // We will continue without DB, as email is the priority
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        // Don't throw, just log. We want to try sending email even if DB fails.
    }
};

// Contact model schema
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Create contact submission object
        const contactData = {
            name,
            email,
            message,
            ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            createdAt: new Date()
        };

        let submissionId = Date.now();

        // Try to save to database if MongoDB is configured
        if (process.env.MONGODB_URI) {
            try {
                await connectDB();
                if (isConnected) {
                    const contactSubmission = new Contact(contactData);
                    await contactSubmission.save();
                    submissionId = contactSubmission._id;
                    console.log('✅ Contact saved to database');
                }
            } catch (dbError) {
                console.error('❌ Database save error:', dbError.message);
                // Continue to send email despite DB error
            }
        }

        // Check for Email Configuration - TEMPORARILY DISABLED
        if (false && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
            console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: Email credentials not found. Please set EMAIL_USER and EMAIL_PASSWORD in Vercel settings.'
            });
        }

        console.log('📧 Attempting to send emails...');

        try {
            console.log('Email sending temporarily disabled.');
        } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
            // Return detailed error message
            return res.status(500).json({
                success: false,
                error: `Email Error: ${emailError.message}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Thank you! We\'ll be in touch soon.',
            submissionId: submissionId
        });

    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        res.status(500).json({
            success: false,
            error: `Server Error: ${error.message}`
        });
    }
};
