const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Initialize MongoDB connection (only if MONGODB_URI is set)
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

        // Send emails if EMAIL_USER is configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            console.log('📧 Attempting to send emails...');

            try {
                // Send notification email to you
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
                                Submitted ID: ${submissionId}<br>
                                Submitted at: ${contactData.createdAt}<br>
                                IP Address: ${contactData.ipAddress}
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('✅ Notification email sent');

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
                                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
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
                                                    <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                                                        <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 10px 0;">Your Message:</p>
                                                        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0; font-style: italic;">"${message}"</p>
                                                    </div>
                                                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                                                        Best regards,<br>
                                                        <strong>The HS21 Team</strong>
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="background-color: #111827; padding: 30px; text-align: center;">
                                                    <p style="color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">HS21<span style="color: #6366f1;">.</span></p>
                                                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px 0;">Elevating businesses through digital innovation.</p>
                                                    <p style="color: #4b5563; font-size: 12px; margin: 0;">
                                                        &copy; ${new Date().getFullYear()} HS21 Digital Solutions. All rights reserved.
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

                await transporter.sendMail(confirmationMail);
                console.log('✅ Confirmation email sent');

            } catch (emailError) {
                console.error('❌ Email sending error:', emailError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to send email. Please try again later.'
                });
            }
        } else {
            console.log('⚠️ EMAIL_USER not configured. Skipping email.');
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
            error: 'Failed to process your request. Please try again later.'
        });
    }
};
