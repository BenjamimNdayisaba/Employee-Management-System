# Task Management Troubleshooting

## "Network error. Please try again." - Common Causes

### 1. **Backend Server Not Running** ⚠️ MOST COMMON

**Symptoms:**
- "Cannot connect to server. Make sure the backend is running on port 3000."
- All task operations fail

**Solution:**
1. Open terminal in `Server Side` folder
2. Run: `npm start`
3. You should see: "Server is running on port 3000"
4. Keep this terminal open

**Test:** Open `http://localhost:3000/api/tasks` in browser
- If you see JSON (even with error), server is running ✅
- If "can't be reached", server is not running ❌

---

### 2. **Database Table Missing**

**Symptoms:**
- "Query error" or "Table 'tasks' doesn't exist"

**Solution:**
1. Open Navicat
2. Select `employeems` database
3. Run the SQL from `Server Side/database_setup.sql`
4. Make sure `tasks` table exists:
   ```sql
   SHOW TABLES LIKE 'tasks';
   ```

---

### 3. **Route Not Registered**

**Symptoms:**
- 404 errors in browser console
- "Cannot GET /api/tasks"

**Solution:**
1. Check `Server Side/index.js` has:
   ```javascript
   import { taskRouter } from "./Routes/TaskRoute.js";
   app.use('/api/tasks', taskRouter)
   ```
2. Restart backend server

---

### 4. **Authentication Issue**

**Symptoms:**
- "Not authenticated" or "Wrong Token" errors

**Solution:**
1. Make sure you're logged in
2. Check browser cookies (F12 → Application → Cookies)
3. Should have `token` cookie
4. Try logging out and logging back in

---

### 5. **CORS Configuration**

**Symptoms:**
- CORS errors in browser console
- "Access-Control-Allow-Origin" errors

**Solution:**
1. Check `Server Side/.env` has:
   ```
   FRONTEND_URL=http://localhost:5173
   ```
2. Restart backend server

---

## Quick Diagnostic Steps

### Step 1: Check Backend
```bash
cd "Server Side"
npm start
```
Look for: "Server is running on port 3000"

### Step 2: Test API Directly
Open browser: `http://localhost:3000/api/tasks`
- If you see JSON (even with auth error), backend is running ✅
- If "This site can't be reached", backend is not running ❌

### Step 3: Check Browser Console
1. Open DevTools (F12)
2. Console tab - look for errors
3. Network tab - see what requests are failing
4. Check the failed request - see status code and error message

### Step 4: Check Database
In Navicat, run:
```sql
SELECT * FROM tasks LIMIT 1;
```
- If it works, table exists ✅
- If "Table doesn't exist", run database_setup.sql ❌

---

## Common Error Messages & Fixes

### "Cannot connect to server"
- **Fix:** Start backend server (`npm start` in Server Side folder)

### "Query error: Table 'tasks' doesn't exist"
- **Fix:** Run `database_setup.sql` in Navicat

### "Only admins can create tasks"
- **Fix:** You're logged in as employee. Log in as admin.

### "Not authenticated"
- **Fix:** Log out and log back in

### "receiver_id and content are required"
- **Fix:** This is for messages, not tasks. Check you're on the right page.

---

## Still Having Issues?

1. **Check all logs:**
   - Backend terminal output
   - Browser console (F12)
   - Browser Network tab

2. **Verify files exist:**
   - `Server Side/Routes/TaskRoute.js`
   - `Server Side/index.js` (with taskRouter import)
   - `Front-End Folder/src/Components/TaskForm.jsx`
   - `Front-End Folder/src/Components/Tasks.jsx`

3. **Test step by step:**
   - Can you access `http://localhost:3000/verify`? (Backend test)
   - Can you access `http://localhost:3000/api/tasks`? (Route test)
   - Are you logged in? (Auth test)

The improved error messages will now tell you exactly what's wrong!

