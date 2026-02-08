// Script to create admin with hashed password
// Run this once: node createAdmin.js

import bcrypt from 'bcrypt';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "employeems",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// CHANGE THESE VALUES
const adminEmail = 'admin@example.com';  // Change to your desired email
const adminPassword = 'admin123';  // Change to your desired password

// Hash the password
bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    console.log('\n=== Admin Credentials ===');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Hashed Password:', hash);
    console.log('\n=== SQL Query for Navicat ===');
    console.log(`INSERT INTO admin (email, password) VALUES ('${adminEmail}', '${hash}');`);
    console.log('\n=== Or use this script to insert directly ===\n');

    // Insert into database
    const sql = "INSERT INTO admin (email, password) VALUES (?, ?)";
    pool.query(sql, [adminEmail, hash], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.error('Error: Admin with this email already exists!');
                console.log('You can update the existing admin with this SQL:');
                console.log(`UPDATE admin SET password = '${hash}' WHERE email = '${adminEmail}';`);
            } else {
                console.error('Database error:', err.message);
            }
        } else {
            console.log('✅ Admin created successfully!');
            console.log('You can now login with:');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPassword);
        }
        pool.end();
    });
});




