const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Subscriber = require('../models/Subscriber');

// Initialize MongoDB connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        console.log('⚠️ MongoDB URI not set, skipping database connection');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
    }
};

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
        const { email, phone, role } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address'
            });
        }

        // Save to database
        if (process.env.MONGODB_URI) {
            try {
                await connectDB();
                if (isConnected) {
                    // Check if already subscribed
                    const existing = await Subscriber.findOne({ email });
                    if (existing) {
                        // Update role/phone if changed
                        existing.role = role || existing.role;
                        existing.phone = phone || existing.phone;
                        await existing.save();
                    } else {
                        const subscriber = new Subscriber({
                            email,
                            phone,
                            role: role || 'customer',
                            ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
                            userAgent: req.headers['user-agent'] || 'unknown'
                        });
                        await subscriber.save();
                    }
                    console.log(`✅ New subscriber saved: ${email}`);
                }
            } catch (dbError) {
                console.error('❌ Database save error:', dbError.message);
            }
        }

        // Email Handling
        if (false && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {

            // 1. Notification to Admin
            const adminMailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                subject: `🚀 New Launch Waitlist: ${role.toUpperCase()}`,
                html: `
                    <div style="font-family: Arial, sans-serif;">
                        <h2 style="color: #6366f1;">New Waitlist Subscriber</h2>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Role:</strong> ${role}</p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(adminMailOptions);
            } catch (e) { console.error("Admin Email Error", e); }

            // 2. Beautiful Confirmation to User
            const userSubject = role === 'join' ? 'Welcome to the HS21 Family! 🌟' : 'You are on the List! 🚀';
            const userMessage = role === 'join'
                ? "We are thrilled that you want to join us. We'll be in touch soon to discuss opportunities."
                : "Thanks for your interest! You've secured your spot for early access.";

            const userMailOptions = {
                from: `"HS21 Digital" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: userSubject,
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                        .header { background: #050507; padding: 40px 0; text-align: center; }
                        .logo { font-size: 28px; font-weight: 700; color: #ffffff; margin: 0; }
                        .accent { color: #6366f1; }
                        .content { padding: 40px; text-align: center; }
                        .title { color: #1a1a1a; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
                        .text { color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
                        .btn { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; display: inline-block; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div style="padding: 40px 0;">
                        <div class="container">
                            <div class="header">
                                <h1 class="logo">HS21<span class="accent">.</span></h1>
                            </div>
                            <div class="content">
                                <h2 class="title">You're In!</h2>
                                <p class="text">
                                    Hi there,<br><br>
                                    Thank you for requesting to join <strong>HS21 Digital</strong>.
                                    <br><br>
                                    ${userMessage}
                                    <br><br>
                                    We received your details and will contact you shortly at <strong>${phone || 'your email'}</strong>.
                                    Get ready to experience the future of digital innovation.
                                </p>
                            </div>
                            <div class="footer">
                                &copy; ${new Date().getFullYear()} HS21 Digital. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `
            };

            await transporter.sendMail(userMailOptions);
            console.log('✅ User confirmation email sent');
        }

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed!'
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process subscription'
        });
    }
};
