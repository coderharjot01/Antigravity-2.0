const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Contact = require('./models/Contact');
const ChatLog = require('./models/ChatLog');

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
                                                <a href="http://localhost:3000" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);">Visit Our Website</a>
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
                                                <a href="#" style="color: #d1d5db; text-decoration: none; font-size: 14px; margin: 0 10px;">+91 98765 43210</a>
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
                // We don't throw here so the submission is still saved
            }
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

// Chatbot endpoint (for future AI integration)
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        // Simple response logic (can be enhanced with AI)
        let response = "Thanks for your message! For immediate assistance, please email us at hello@hs21digital.com";
        let type = 'general';

        if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
            response = "Our pricing varies based on project scope. Let's discuss your specific needs! Email us at hello@hs21digital.com or call +1 (555) 123-4567.";
            type = 'pricing';
        } else if (message.toLowerCase().includes('website') || message.toLowerCase().includes('web')) {
            response = "We specialize in building stunning websites! Contact us at hello@hs21digital.com to discuss your project.";
            type = 'service';
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            response = "Hello! How can HS21 Digital help bring your vision to life today?";
            type = 'greeting';
        }

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

// Start server
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

module.exports = app;
