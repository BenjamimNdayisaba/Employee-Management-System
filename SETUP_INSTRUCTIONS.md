# Setup Instructions

## Important: Environment Variables Required

This project now uses environment variables for security. You **must** create the following files before running the application.

## Backend Setup

1. Navigate to `Server Side` directory
2. Create a `.env` file with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=employeems

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string
JWT_EXPIRES_IN=1d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

3. Install dependencies:
```bash
cd "Server Side"
npm install
```

4. **IMPORTANT**: Update the admin password in your database to be hashed with bcrypt. The admin login now uses password hashing. You'll need to:
   - Either update existing admin passwords in the database to be bcrypt hashed
   - Or create a new admin with a hashed password

5. Start the server:
```bash
npm start
```

## Frontend Setup

1. Navigate to `Front-End Folder` directory
2. Create a `.env` file with the following content:

```env
VITE_API_BASE_URL=http://localhost:3000
```

3. Install dependencies:
```bash
cd "Front-End Folder"
npm install
```

4. Start the development server:
```bash
npm run dev
```

## Security Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Change JWT_SECRET** - Use a strong random string in production
3. **Update database password** - Use a strong password and store it in `.env`
4. **Admin passwords** - Must be hashed with bcrypt in the database

## Database Migration for Admin Passwords

If you have existing admin accounts with plain text passwords, you need to hash them. You can use this Node.js script:

```javascript
const bcrypt = require('bcrypt');
const password = 'your_admin_password';
bcrypt.hash(password, 10, (err, hash) => {
    console.log('Hashed password:', hash);
    // Update your admin table with this hash
});
```

Or use a SQL query after hashing:
```sql
UPDATE admin SET password = 'hashed_password_here' WHERE email = 'admin@example.com';
```

## What Was Fixed

### Security Fixes
- ✅ Database credentials moved to environment variables
- ✅ JWT secret key moved to environment variables
- ✅ Admin passwords now hashed with bcrypt (was plain text)
- ✅ Cookie security settings added (httpOnly, secure, sameSite)
- ✅ File upload validation (type and size limits)
- ✅ Input validation added to all routes
- ✅ CORS configuration improved

### Code Quality Fixes
- ✅ Fixed JSX attributes (`for` → `htmlFor`)
- ✅ Added React keys to all map functions
- ✅ Fixed typos (anvigate → navigate, Emoployee → Employee, Cetegory → Category)
- ✅ Fixed useEffect dependencies
- ✅ Removed unused dependencies (mysql2 from frontend, path from backend)
- ✅ Improved error handling consistency

### Functional Improvements
- ✅ Added form validation
- ✅ Centralized API configuration
- ✅ Improved authentication check (verifies with server)
- ✅ Added loading states
- ✅ Added confirmation dialogs for delete operations
- ✅ Fixed hardcoded URLs

### Architectural Improvements
- ✅ Created `.gitignore` file
- ✅ Environment configuration setup
- ✅ API configuration centralization
- ✅ Database connection pooling
- ✅ Better error handling

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Frontend is running on the port specified in `FRONTEND_URL`

### Authentication Issues
If login doesn't work:
1. Check that admin passwords are hashed in the database
2. Verify JWT_SECRET is set in backend `.env`
3. Check browser console for errors

### Database Connection Issues
1. Verify database credentials in `.env`
2. Make sure MySQL is running
3. Check that the database `employeems` exists

## Production Deployment

Before deploying to production:
1. Set `NODE_ENV=production` in backend `.env`
2. Use strong, unique values for all secrets
3. Update CORS to allow only your production domain
4. Use HTTPS (required for secure cookies)
5. Set up proper database credentials
6. Remove any console.log statements
7. Set up proper logging system




