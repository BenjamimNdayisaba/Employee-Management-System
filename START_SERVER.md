# How to Start the Backend Server

## Quick Start Guide

### Step 1: Open Terminal/Command Prompt
- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac/Linux:** Open Terminal app

### Step 2: Navigate to Server Directory
```bash
cd "Server Side"
```
Or if you're in the project root:
```bash
cd "C:\Users\ben\Desktop\Updated Employee MS with React + Node + MySQL\Server Side"
```

### Step 3: Check if .env file exists
The server needs a `.env` file. If it doesn't exist, create it:

**Create `Server Side/.env` file with this content:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Ben1234@
DB_NAME=employeems
JWT_SECRET=jwt_secret_key_change_this_to_random_string
JWT_EXPIRES_IN=1d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 4: Install Dependencies (if not already done)
```bash
npm install
```

### Step 5: Start the Server
```bash
npm start
```

**You should see:**
```
Server is running on port 3000
Database connected successfully
```

### Step 6: Keep Terminal Open
**IMPORTANT:** Keep this terminal window open while using the app. Closing it will stop the server.

---

## Troubleshooting

### Error: "Cannot find module 'dotenv'"
**Fix:** Run `npm install` in the Server Side folder

### Error: "Port 3000 is already in use"
**Fix:** 
- Find what's using port 3000 and close it
- Or change PORT in `.env` file to another number (like 3001)

### Error: "Database connection error"
**Fix:**
1. Make sure MySQL is running
2. Check database credentials in `.env` file
3. Make sure database `employeems` exists

### Server starts but immediately crashes
**Check:**
1. Is `.env` file in `Server Side` folder?
2. Are all required values in `.env`?
3. Check the error message in terminal

---

## Verify Server is Running

Open your browser and go to:
```
http://localhost:3000/verify
```

- If you see JSON (even with an error), server is running ✅
- If "This site can't be reached", server is not running ❌

---

## Alternative: Start Without Nodemon

If `npm start` doesn't work, try:
```bash
node index.js
```

This will start the server but won't auto-restart on file changes.




