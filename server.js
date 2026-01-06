const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Contact = require('./models/Contact');
const Subscriber = require('./models/Subscriber');
const ChatLog = require('./models/ChatLog');
const { getBotResponse } = require('./utils/botBrain');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('⚠️  Running without database. Contact forms will not be saved.');
    }
};

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files from root directory

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Routes

// Health check
app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const unreadCount = mongoose.connection.readyState === 1
        ? await Contact.countDocuments({ read: false })
        : 0;

    res.json({
        status: 'OK',
        message: 'HS21 Digital Backend is running',
        database: dbStatus,
        unreadContacts: unreadCount,
        timestamp: new Date().toISOString()
    });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
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

        // Create contact submission in database
        const contactSubmission = new Contact({
            name,
            email,
            message,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        });

        // Save to database
        // Save to database only if connected
        if (mongoose.connection.readyState === 1) {
            try {
                await contactSubmission.save();
                console.log('✅ Contact saved to database');
            } catch (dbError) {
                console.error('❌ Failed to save to database:', dbError.message);
                // Continue to send email despite DB error
            }
        } else {
            console.log('⚠️ Database not connected. Skipping save.');
        }

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || 'hello@hs21digital.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">New Contact Form Submission</h2>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>From:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Message:</strong></p>
                        <p style="background: white; padding: 15px; border-left: 4px solid #6366f1;">${message}</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Submitted ID: ${contactSubmission._id}<br>
                        Submitted at: ${contactSubmission.createdAt}<br>
                        IP Address: ${contactSubmission.ipAddress}
                    </p>
                </div>
            `
        };

        // Send confirmation email to user
        const confirmationMail = {
            from: `"HS21 Digital" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'We\'ve received your message! 🚀',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thank You</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <!-- Main Card -->
                                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                                    
                                    <!-- Header Image -->
                                    <tr>
                                        <td style="padding: 0; background-color: #1a1a1a;">
                                            <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Partnership Handshake" style="width: 100%; height: 240px; object-fit: cover; display: block;">
                                        </td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <h1 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">Let's Build Something Great!</h1>
                                                <p style="color: #6366f1; margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 1px;">HS21 DIGITAL SOLUTIONS</p>
                                            </div>

                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                                Hi <strong>${name}</strong>,
                                            </p>

                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                                Thank you for reaching out to us! We've received your message and are excited to explore how we can help elevate your digital presence. One of our experts will review your inquiry and get back to you within 24 hours.
                                            </p>

                                            <!-- Message Recap -->
                                            <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                                                <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0;">Your Message:</p>
                                                <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">"${message}"</p>
                                            </div>

                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <a href="https://hs21.in" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">Visit Our Website</a>
                                            </div>

                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                                                Best regards,<br>
                                                <strong>The HS21 Team</strong>
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #111827; padding: 30px; text-align: center;">
                                            <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">HS21<span style="color: #6366f1;">.</span></p>
                                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px 0;">Elevating businesses through digital innovation.</p>
                                            
                                            <div style="margin-bottom: 20px;">
                                                <a href="mailto:hello@hs21digital.com" style="color: #d1d5db; text-decoration: none; font-size: 14px; margin: 0 10px;">hello@hs21digital.com</a>
                                                <span style="color: #4b5563;">|</span>
                                                <a href="#" style="color: #d1d5db; text-decoration: none; font-size: 14px; margin: 0 10px;">+91 6397841399</a>
                                            </div>
                                            
                                            <p style="color: #4b5563; font-size: 12px; margin: 0;">
                                                &copy; ${new Date().getFullYear()} HS21 Digital Solutions. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Social Proof / Trust -->
                                <table role="presentation" style="width: 600px; margin-top: 20px;">
                                    <tr>
                                        <td align="center">
                                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                                Sent with ❤️ from your digital partners
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `
        };

        // Send emails (skip if EMAIL_USER is not configured)
        if (process.env.EMAIL_USER) {
            console.log('📧 Attempting to send emails...');
            try {
                await transporter.sendMail(mailOptions);
                console.log('✅ Notification email sent');
                await transporter.sendMail(confirmationMail);
                console.log('✅ Confirmation email sent');
            } catch (emailError) {
                console.error('❌ Email sending error details:', emailError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to send email. Server configuration issue.'
                });
            }
        } else {
            console.log('⚠️ EMAIL_USER not configured. Skipping email.');
            return res.status(500).json({
                success: false,
                error: 'Email service not configured on server.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Thank you! We\'ll be in touch soon.',
            submissionId: contactSubmission._id
        });

    } catch (error) {
        console.error('❌ FULL ERROR DETAILS:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to process your request. Please try again later.'
        });
    }
});

// Enrollment form submission
app.post('/api/enroll', async (req, res) => {
    try {
        const { name, email, phone, course } = req.body;

        // Validation
        if (!name || !email || !course) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Send email notification to Admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || 'hello@hs21digital.com',
            subject: `🎓 New Course Enrollment: ${course}`,
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2 style="color: #6366f1;">New Course Enrollment</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Course:</strong> ${course}</p>
                    <p><strong>Status:</strong> <span style="color: orange;">Pending Payment/Confirmation</span></p>
                </div>
            `
        };

        // Confirmation to Student
        const studentMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Application Received: ${course} 🎓`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #6366f1;">Application Received!</h1>
                    <p>Hi ${name},</p>
                    <p>Thanks for applying for the <strong>${course}</strong> with HS21 Digital.</p>
                    <p>We are reviewing your application and will get back to you shortly with the next steps regarding the schedule and payment.</p>
                    <br>
                    <p>Best,<br>HS21 Education Team</p>
                </div>
            `
        };

        if (process.env.EMAIL_USER) {
            await transporter.sendMail(adminMailOptions);
            await transporter.sendMail(studentMailOptions);
        }

        // You might want to save this to a new Enrollment model, but for now we'll just return success
        res.status(200).json({
            success: true,
            message: 'Application submitted successfully!'
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process enrollment'
        });
    }
});

// Waitlist Subscriber Endpoint
app.post('/api/subscribe', async (req, res) => {
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
        if (mongoose.connection.readyState === 1) {
            try {
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
                        ipAddress: req.ip || req.connection.remoteAddress,
                        userAgent: req.get('user-agent')
                    });
                    await subscriber.save();
                }
                console.log(`✅ New subscriber: ${email} (${role})`);
            } catch (dbError) {
                console.error('❌ Failed to save subscriber:', dbError.message);
            }
        }

        // Send Email(s)
        if (process.env.EMAIL_USER) {
            // 1. Notification to Admin
            const adminMailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.NOTIFICATION_EMAIL || 'hello@hs21digital.com',
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
            transporter.sendMail(adminMailOptions).catch(err => console.error('Failed to send admin email', err));

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
            transporter.sendMail(userMailOptions).catch(err => console.error('Failed to send user confirmation email', err));
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
});

// Get all contact submissions (admin endpoint - should be protected in production)
app.get('/api/admin/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            total: contacts.length,
            submissions: contacts
        });
    } catch (error) {
        console.error('Error fetching contact submissions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submissions'
        });
    }
});

// Get all chat logs (admin endpoint - for improving bot training)
app.get('/api/admin/chats', async (req, res) => {
    try {
        // Ensure DB is connected
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const chats = await ChatLog.find().sort({ createdAt: -1 }).limit(100);
        res.json({
            success: true,
            total: chats.length,
            logs: chats
        });
    } catch (error) {
        console.error('Error fetching chat logs:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch chat logs'
        });
    }
});

// Chatbot endpoint (for future AI integration)
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        // Use the smart bot brain
        const response = getBotResponse(message);

        // Determine type based on response for analytics (simplified)
        let type = 'general';
        if (response.includes('₹') || response.includes('price')) type = 'pricing';
        if (response.includes('services')) type = 'service';
        if (response.includes('Hello') || response.includes('Hi')) type = 'greeting';

        // Log chat conversation if database is connected
        if (mongoose.connection.readyState === 1 && sessionId) {
            const chatLog = new ChatLog({
                sessionId,
                userMessage: message,
                botResponse: response,
                type,
                ipAddress: req.ip || req.connection.remoteAddress
            });
            await chatLog.save();
        }

        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: true, // Still return success for user experience
            response: "I'm having trouble right now. Please email us at hello@hs21digital.com",
            timestamp: new Date().toISOString()
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server if running directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════╗
║   HS21 Digital Backend Server          ║
║   Running on http://localhost:${PORT}    ║
╚════════════════════════════════════════╝

📧 Email: ${process.env.EMAIL_USER ? 'Configured ✅' : 'Not configured ⚠️'}
💾 Database: ${mongoose.connection.readyState === 1 ? 'MongoDB Atlas ✅' : 'Connecting...'}
🚀 Environment: ${process.env.NODE_ENV || 'development'}
        `);
    });
}

module.exports = app;
