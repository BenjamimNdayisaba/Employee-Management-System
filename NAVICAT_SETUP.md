# Setting Up Admin in Navicat

## Option 1: Use the Script (Easiest)

1. Open `Server Side/createAdmin.js` in a text editor
2. Change these lines (around line 20-21):
   ```javascript
   const adminEmail = 'admin@example.com';  // Change to your email
   const adminPassword = 'admin123';  // Change to your password
   ```
3. Save the file
4. Open terminal in `Server Side` folder
5. Run: `node createAdmin.js`
6. It will create the admin automatically and show you the credentials

---

## Option 2: Manual Setup in Navicat

### Step 1: Generate Password Hash

1. Open terminal in `Server Side` folder
2. Run this command to generate a hash:
   ```bash
   node -e "const bcrypt=require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10, (e,h)=>console.log(h));"
   ```
   Replace `YOUR_PASSWORD` with your desired password (keep the quotes)

3. Copy the long hash that appears (starts with `$2b$10$...`)

### Step 2: Insert Admin in Navicat

1. Open Navicat
2. Connect to your MySQL database
3. Select the `employeems` database
4. Open the `admin` table
5. Click "New Record" or use SQL Query tab

**SQL Query:**
```sql
INSERT INTO admin (email, password) 
VALUES ('your_email@example.com', 'paste_the_hash_here');
```

**Or if admin table doesn't exist, create it first:**
```sql
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### Step 3: Verify

Run this query to see your admin:
```sql
SELECT * FROM admin;
```

You should see your email and the hashed password.

---

## Option 3: Update Existing Admin Password

If you already have an admin but password is in plain text:

1. Generate hash using Step 1 above
2. Run this SQL in Navicat:
```sql
UPDATE admin 
SET password = 'paste_the_hash_here' 
WHERE email = 'your_email@example.com';
```

---

## Quick Test

After creating admin, try logging in with:
- **Email:** The email you used
- **Password:** The plain text password (before hashing)

The system will automatically compare your plain password with the hash.

---

## Common Issues

### "Table 'admin' doesn't exist"
Create the table first:
```sql
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### "Duplicate entry for email"
The email already exists. Either:
- Use a different email
- Or update the existing admin's password (Option 3)

### Password not working
Make sure:
- The password in database is hashed (starts with `$2b$10$`)
- You're using the plain text password when logging in
- The email matches exactly (case-sensitive)




