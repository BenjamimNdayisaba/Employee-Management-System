# Troubleshooting Guide

## "Network error. Please try again." - Common Causes & Solutions

### 1. **Backend Server Not Running** ⚠️ MOST COMMON

**Symptoms:**
- "Cannot connect to server. Make sure the backend is running on port 3000."
- All API calls fail

**Solution:**
1. Open a terminal/command prompt
2. Navigate to `Server Side` directory
3. Run: `npm start` or `node index.js`
4. You should see: "Server is running on port 3000"
5. Keep this terminal open while using the app

**Check:** Open `http://localhost:3000/verify` in browser - should return JSON (may show error, but server is running)

---

### 2. **CORS Configuration Issue**

**Symptoms:**
- Browser console shows CORS error
- "Access-Control-Allow-Origin" errors

**Solution:**
1. Check your frontend URL (usually `http://localhost:5173` for Vite)
2. Open `Server Side/.env` file
3. Set `FRONTEND_URL=http://localhost:5173` (or your actual frontend URL)
4. Restart the backend server

**Alternative:** Check `Server Side/index.js` - make sure your frontend URL is in the `allowedOrigins` array

---

### 3. **Wrong API URL Configuration**

**Symptoms:**
- Frontend trying to connect to wrong port/URL

**Solution:**
1. Check `Front-End Folder/.env` file exists
2. Should contain: `VITE_API_BASE_URL=http://localhost:3000`
3. If file doesn't exist, create it
4. Restart the frontend dev server (Vite needs restart after .env changes)

**Verify:** Check browser console Network tab - see what URL is being called

---

### 4. **Database Connection Failed**

**Symptoms:**
- Backend server starts but crashes on database operations
- "connection error" in backend console

**Solution:**
1. Check MySQL is running
2. Verify `Server Side/.env` has correct database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password
   DB_NAME=employeems
   ```
3. Test database connection manually
4. Make sure database `employeems` exists

---

### 5. **Missing Environment Variables**

**Symptoms:**
- Backend crashes on startup
- "Cannot read property" errors

**Solution:**
1. Create `Server Side/.env` file (copy from `.env.example` if exists)
2. Fill in all required values:
   - Database credentials
   - JWT_SECRET
   - PORT
   - FRONTEND_URL
3. Restart backend server

---

### 6. **Port Already in Use**

**Symptoms:**
- "Port 3000 is already in use" error
- Backend won't start

**Solution:**
1. Find what's using port 3000:
   - Windows: `netstat -ano | findstr :3000`
   - Mac/Linux: `lsof -i :3000`
2. Kill the process or change PORT in `.env` file
3. Restart backend

---

### 7. **Frontend Dev Server Not Running**

**Symptoms:**
- Can't access the app at all
- "This site can't be reached"

**Solution:**
1. Navigate to `Front-End Folder` directory
2. Run: `npm run dev`
3. Should see: "Local: http://localhost:5173" (or similar)
4. Open that URL in browser

---

## Quick Diagnostic Steps

### Step 1: Check Backend
```bash
cd "Server Side"
npm start
```
Look for: "Server is running on port 3000"

### Step 2: Check Frontend
```bash
cd "Front-End Folder"
npm run dev
```
Look for: "Local: http://localhost:XXXX"

### Step 3: Test API Directly
Open browser: `http://localhost:3000/verify`
- If you see JSON (even with error), backend is running ✅
- If "This site can't be reached", backend is not running ❌

### Step 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Go to Network tab
5. Try the action that fails
6. Check the failed request - see status code and error message

---

## Common Error Messages & Fixes

### "Cannot connect to server"
- **Fix:** Start backend server (`npm start` in Server Side folder)

### "CORS policy: No 'Access-Control-Allow-Origin'"
- **Fix:** Update `FRONTEND_URL` in backend `.env` file

### "Query error" or "Database connection error"
- **Fix:** Check database credentials in `.env` and ensure MySQL is running

### "Wrong Token" or "Not authenticated"
- **Fix:** Clear browser cookies and try logging in again

### "Module not found: dotenv"
- **Fix:** Run `npm install` in `Server Side` folder

---

## Still Having Issues?

1. **Check all logs:**
   - Backend terminal output
   - Browser console (F12)
   - Browser Network tab

2. **Verify files exist:**
   - `Server Side/.env`
   - `Front-End Folder/.env`
   - `Server Side/node_modules` (run `npm install` if missing)
   - `Front-End Folder/node_modules` (run `npm install` if missing)

3. **Test step by step:**
   - Can you access `http://localhost:3000/verify`? (Backend test)
   - Can you access frontend URL? (Frontend test)
   - Do API calls show in Network tab? (Connection test)

4. **Common mistakes:**
   - Forgot to create `.env` files
   - Wrong port numbers
   - Database not running
   - Forgot to restart after `.env` changes

---

## Need More Help?

Check the error details:
1. Open browser DevTools (F12)
2. Console tab - shows JavaScript errors
3. Network tab - shows API call details
4. Check the Response tab for server error messages

The improved error messages will now tell you exactly what's wrong!




