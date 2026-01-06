const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Initialize MongoDB connection (reuse logic but keep it self-contained for serverless)
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
        const { name, email, phone, course } = req.body;

        // Validation
        if (!name || !email || !course) {
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

        console.log(`📝 Processing enrollment for ${email} - ${course}`);

        // Connect to DB (Optional for now, but good practice)
        await connectDB();

        // Check for Email Configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: Email credentials not found.'
            });
        }

        // Send email notification to Admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `🎓 New Course Enrollment: ${course}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCourse: ${course}`, // Fallback text
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
            from: `"HS21 Digital" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Application Received: ${course} 🎓`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background-color: #f9fafb; padding: 20px; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #6366f1; margin: 0;">Application Received!</h1>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="font-size: 16px; line-height: 1.5;">Thanks for applying for the <strong>${course}</strong> with HS21 Digital.</p>
                        <p style="font-size: 16px; line-height: 1.5;">We are reviewing your application and will get back to you shortly with the next steps regarding the schedule and payment.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong style="color: #6366f1;">HS21 Education Team</strong></p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(adminMailOptions);
            console.log('✅ Admin notification sent');
            await transporter.sendMail(studentMailOptions);
            console.log('✅ Student confirmation sent');
        } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
            return res.status(500).json({
                success: false,
                error: `Email Error: ${emailError.message}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully!'
        });

    } catch (error) {
        console.error('❌ Enrollment error:', error);
        res.status(500).json({
            success: false,
            error: `Server Error: ${error.message}`
        });
    }
};
