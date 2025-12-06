# 🔌 MongoDB Atlas Setup Guide

## Step 1: Get Your Connection String from MongoDB Atlas

1. **Log in to MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Sign in with your account

2. **Navigate to your Cluster**
   - Click on "Database" in the left sidebar
   - Find your cluster (the one you created)

3. **Get Connection String**
   - Click the "Connect" button for your cluster
   - Select "Connect your application"
   - Choose "Node.js" as driver and latest version
   - Copy the connection string

Your connection string will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 2: Update Your .env File

1. **Open your `.env` file** in the project root

2. **Replace the placeholder** with your actual connection string:
```bash
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/hs21digital?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your MongoDB Atlas username
- Replace `<password>` with your MongoDB Atlas password
- Add `/hs21digital` before the `?` to specify the database name
- Remove `<>` brackets

Example:
```bash
MONGODB_URI=mongodb+srv://harjot:MyPass123@cluster0.abc123.mongodb.net/hs21digital?retryWrites=true&w=majority
```

## Step 3: Configure Database Access (If needed)

If you get authentication errors:

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Set username and password
4. Set privileges to "Atlas Admin" or "Read and write to any database"
5. Click **"Add User"**

## Step 4: Configure Network Access (If needed)

If you get connection timeout errors:

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

⚠️ **For production**: Only allow specific IP addresses

## Step 5: Test the Connection

1. **Start your server:**
```bash
npm start
```

2. **Look for this message:**
```
✅ MongoDB Atlas connected successfully
```

3. **If successful, check the health endpoint:**
```bash
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "HS21 Digital Backend is running",
  "database": "Connected",
  "unreadContacts": 0,
  "timestamp": "2024-12-05T..."
}
```

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Check username and password in connection string
- Make sure there are no special characters that need encoding
- Verify user exists in Database Access

### Error: "MongooseServerSelectionError: connect ETIMEDOUT"
- Check Network Access whitelist
- Make sure you're connected to internet
- Try allowing access from anywhere (0.0.0.0/0)

### Error: "URI does not have hostname"
- Make sure you've added the database name: `/hs21digital` before `?`
- Check that the entire connection string is on one line

### Special Characters in Password
If your password has special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `#` → `%23`
- `?` → `%3F`

Example:
```
Password: My@Pass#123
Encoded: My%40Pass%23123
```

## What Happens After Connection?

Once connected, your backend will:
✅ Store all contact form submissions in MongoDB
✅ Log all chatbot conversations
✅ Allow you to query and analyze data
✅ Automatically create collections and indexes

## Viewing Your Data

### Option 1: MongoDB Atlas UI
1. Go to your cluster
2. Click "Browse Collections"
3. You'll see:
   - `contacts` collection
   - `chatlogs` collection

### Option 2: API Endpoint
```bash
curl http://localhost:3000/api/admin/contacts
```

### Option 3: MongoDB Compass (Desktop App)
1. Download from https://www.mongodb.com/try/download/compass
2. Use your connection string to connect
3. Browse collections visually

---

**Need help?** Email: hello@hs21digital.com
