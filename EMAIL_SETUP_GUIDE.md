# 📧 Email Auto-Response Setup Guide

## What's Already Working

Your backend is configured to automatically send:
- ✅ **Notification Email to You** - When someone contacts you
- ✅ **Thank You Email to User** - Automatic response confirming receipt

Both emails are sent automatically when the contact form is submitted!

---

## 🚀 Quick Setup (Gmail)

### Option 1: Using Gmail (Recommended)

#### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Click "Get Started" and follow the steps
4. Complete the setup

#### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" from the dropdown
3. Select "Mac" (or your device)
4. Click "Generate"
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

#### Step 3: Update Your .env File

Open your `.env` file and update these lines:

```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NOTIFICATION_EMAIL=hello@hs21digital.com
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail
- Replace `abcd efgh ijkl mnop` with the app password you generated
- Keep `NOTIFICATION_EMAIL` as the email where you want to receive notifications

#### Step 4: Restart Your Server

```bash
# Stop the current server (Ctrl + C in terminal)
# Then start again:
npm start
```

---

## 📧 What Emails Are Sent?

### Email 1: To You (Notification)
**Subject:** New Contact Form Submission from [Name]

**Contains:**
- Customer's name and email
- Their message
- Submission ID
- Timestamp
- IP address (for security)

### Email 2: To Customer (Auto-Response)
**Subject:** Thank you for contacting HS21 Digital

**Contains:**
- Personalized greeting with their name
- Confirmation that you received their message
- Copy of their message
- Professional signature with contact info

---

## 🎨 Email Template Preview

### Customer Receives:
```
Thank you for reaching out!

Hi [Customer Name],

We've received your message and will get back to you shortly.

Your message:
[Their message here]

Best regards,
The HS21 Digital Team

HS21 Digital Solutions | Elevating businesses through digital innovation
Email: hello@hs21digital.com | Phone: +1 (555) 123-4567
```

---

## 🧪 Test Your Setup

### Step 1: Submit Test Form
1. Go to http://localhost:3000
2. Scroll to contact section
3. Fill out the form with your own email
4. Submit

### Step 2: Check If It Worked

You should receive **TWO** emails:
1. **Notification email** to `NOTIFICATION_EMAIL` (you)
2. **Thank you email** to the email you entered in the form

If you don't receive emails, check:
- ✅ Email credentials in `.env` are correct
- ✅ App password doesn't have spaces
- ✅ Server restarted after changing `.env`
- ✅ Check spam folder

---

## 🔧 Troubleshooting

### Error: "Invalid login"
- Make sure you're using an **App Password**, not your regular Gmail password
- Check that 2FA is enabled on your Google account
- Remove any spaces from the app password

### Error: "EAUTH"
- App password is incorrect
- Try regenerating a new app password

### Emails Not Arriving
- Check spam/junk folder
- Verify `EMAIL_USER` is correct
- Make sure server restarted after updating `.env`

### Want to Use Different Email Service?

#### For Outlook/Hotmail:
```javascript
// In server.js, update transporter:
service: 'hotmail'
```

#### For Custom SMTP:
```javascript
// In server.js, replace transporter with:
const transporter = nodemailer.createTransport({
    host: 'smtp.your-domain.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

---

## 🎯 Current Email Configuration

Your backend supports:
- ✅ HTML formatted emails with styling
- ✅ Professional templates
- ✅ Automatic personalization (uses customer's name)
- ✅ Includes all submission details
- ✅ Links to reply directly
- ✅ Branded footer with contact info

---

## 📝 Email Features

### In Notification Email (to you):
- 📧 Clickable email link
- 🆔 Unique submission ID
- ⏰ Timestamp
- 🌐 IP address for security
- 📱 User agent info

### In Auto-Response (to customer):
- 👋 Personalized greeting
- 📄 Copy of their message
- 📞 Your contact information
- 🎨 Professional HTML styling
- 💼 Company branding

---

## 🔐 Security Notes

- ✅ App passwords are more secure than regular passwords
- ✅ Never share your app password
- ✅ `.env` file is in `.gitignore` (not committed to git)
- ✅ Emails sent over secure connection
- ✅ All submissions logged in MongoDB

---

## 💡 Pro Tips

1. **Test First**: Use your own email to test before going live
2. **Check Spam**: First few emails might go to spam
3. **White List**: Add your sending email to contacts
4. **Monitor**: Check MongoDB to see all submissions
5. **Customize**: Edit email templates in `server.js` if needed

---

## 🆘 Need Help?

If emails still don't work after setup:

1. Check server logs for errors
2. Test with curl: `curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"your@email.com","message":"Test"}'`
3. Check MongoDB - submissions should save even if email fails
4. Contact: hello@hs21digital.com

---

**Once configured, emails will be sent automatically with every form submission!** 🎉
