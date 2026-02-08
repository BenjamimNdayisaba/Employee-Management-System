// Quick script to hash your existing password
// Run: node hashPassword.js

import bcrypt from 'bcrypt';

const plainPassword = '1234'; // Your current password as stored in the database

bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('\n=== Copy this hash and update in Navicat ===\n');
    console.log(hash);
    console.log('\n=== SQL Query for Navicat ===');
    console.log(`UPDATE admin SET password = '${hash}' WHERE email = 'ad@gmail.com';`);
    console.log('\n');
});




