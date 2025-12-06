# HS21 Digital Backend

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your email credentials:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NOTIFICATION_EMAIL=hello@hs21digital.com
```

3. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "OK",
  "message": "HS21 Digital Backend is running",
  "timestamp": "2024-12-05T07:10:00.000Z"
}
```

### Contact Form Submission
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your services"
}
```

Response:
```json
{
  "success": true,
  "message": "Thank you! We'll be in touch soon.",
  "submissionId": 1701763800000
}
```

### View Contact Submissions (Admin)
```
GET /api/admin/contacts
```

Response:
```json
{
  "success": true,
  "total": 5,
  "submissions": [...]
}
```

### Chatbot
```
POST /api/chatbot
Content-Type: application/json

{
  "message": "What are your prices?"
}
```

## 📧 Email Setup

### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/security
3. Under "Signing in to Google", select "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `.env` file

### Using Other Email Services

Update the `transporter` configuration in `server.js`:

```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.your-provider.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

## 🗄️ Database

Currently using **in-memory storage** for simplicity. For production, integrate MongoDB:

1. Install MongoDB:
```bash
npm install mongoose
```

2. Uncomment MongoDB connection code in `server.js`

3. Add MongoDB URI to `.env`:
```
MONGODB_URI=mongodb://localhost:27017/hs21digital
```

## 🔐 Security Recommendations

For production deployment:

1. **Add authentication** to admin endpoints
2. **Implement rate limiting** to prevent abuse
3. **Add CSRF protection**
4. **Use HTTPS** (SSL/TLS certificates)
5. **Sanitize user inputs** to prevent XSS attacks
6. **Add request validation** middleware
7. **Set up proper CORS** policies

## 📁 Project Structure

```
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables (not committed)
├── .env.example      # Environment template
├── index.html        # Frontend
├── style.css         # Styles
└── script.js         # Frontend JavaScript
```

## 🚀 Deployment

### Heroku
```bash
heroku create hs21-digital
git push heroku main
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
```

### Vercel
```bash
vercel
```

### DigitalOcean / AWS / GCP
1. Upload files to server
2. Install Node.js
3. Run `npm install`
4. Set environment variables
5. Use PM2 for process management: `pm2 start server.js`

## 📝 To-Do / Future Enhancements

- [ ] Add MongoDB integration
- [ ] Implement user authentication
- [ ] Add rate limiting
- [ ] Create admin dashboard
- [ ] Add file upload for project inquiries
- [ ] Integrate AI chatbot (OpenAI)
- [ ] Add analytics tracking
- [ ] Implement caching
- [ ] Add automated testing
- [ ] Set up CI/CD pipeline

## 🆘 Support

For issues or questions, contact: hello@hs21digital.com

---

**HS21 Digital** | Elevating businesses through digital innovation
