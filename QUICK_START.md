# 🚀 HS21 Digital - Quick Start Guide

## Your Backend is Ready!

### What We've Built:
✅ Express.js REST API
✅ MongoDB Atlas Database Integration
✅ Contact Form Processing
✅ Email Notifications (Nodemailer)
✅ Chatbot API
✅ Admin Dashboard Endpoint

---

## 📋 Setup Checklist

### 1. Get MongoDB Atlas Connection String
- [ ] Log in to https://cloud.mongodb.com
- [ ] Go to your cluster → Click "Connect"
- [ ] Copy the connection string

**See `MONGODB_SETUP.md` for detailed instructions**

### 2. Configure Environment Variables
Edit `.env` file:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hs21digital?retryWrites=true&w=majority
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Start the Server
```bash
npm start
```

---

## 🎯 Test Your Backend

### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "database": "Connected",
  "unreadContacts": 0
}
```

### Test Contact Form
1. Open `index.html` in browser
2. Fill out contact form
3. Submit
4. Check:
   - ✅ Success notification appears
   - ✅ Email received
   - ✅ Data saved in MongoDB

### View Submissions
```bash
curl http://localhost:3000/api/admin/contacts
```

---

## 📂 Project Structure

```
├── server.js              # Main backend server
├── models/
│   ├── Contact.js         # Contact form schema
│   └── ChatLog.js         # Chat conversation schema
├── index.html             # Frontend
├── script.js              # Frontend JavaScript
├── style.css              # Styles
├── .env                   # Your configuration
├── package.json           # Dependencies
├── README.md              # Main documentation
├── MONGODB_SETUP.md       # MongoDB setup guide
└── QUICK_START.md         # This file
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/admin/contacts` | View all submissions |
| POST | `/api/chatbot` | Chat with bot |

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start with auto-reload (development)
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health

# View all submissions
curl http://localhost:3000/api/admin/contacts
```

---

## 📧 Email Setup (Optional)

For Gmail:
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

---

## 🎨 Database Collections

Once running, MongoDB will have:

### `contacts` Collection
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested...",
  "status": "new",
  "ipAddress": "192.168.1.1",
  "createdAt": "2024-12-05T...",
  "updatedAt": "2024-12-05T..."
}
```

### `chatlogs` Collection
```json
{
  "_id": "...",
  "sessionId": "abc123",
  "userMessage": "How much does a website cost?",
  "botResponse": "Our pricing varies...",
  "type": "pricing",
  "createdAt": "2024-12-05T..."
}
```

---

## 🆘 Need Help?

1. **MongoDB Connection Issues?**
   → See `MONGODB_SETUP.md`

2. **Email Not Working?**
   → Emails are optional. Backend works without it.

3. **Full Documentation?**
   → See `README.md`

4. **Contact Support:**
   → hello@hs21digital.com

---

**🎉 You're all set! Start the server and test your website!**
