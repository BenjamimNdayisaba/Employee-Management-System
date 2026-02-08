import express from 'express'
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Input validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

router.post("/employee_login", (req, res) => {
    // Input validation
    if (!req.body.email || !req.body.password) {
        return res.json({ loginStatus: false, Error: "Email and password are required" });
    }
    
    if (!validateEmail(req.body.email)) {
        return res.json({ loginStatus: false, Error: "Invalid email format" });
    }
    
    const sql = "SELECT * from employee Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });
      if (result.length > 0) {
        bcrypt.compare(req.body.password, result[0].password, (err, response) => {
            if (err) return res.json({ loginStatus: false, Error: "Authentication error" });
            if(response) {
                const email = result[0].email;
                const token = jwt.sign(
                    { role: "employee", email: email, id: result[0].id },
                    process.env.JWT_SECRET || "jwt_secret_key",
                    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
                );
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                    maxAge: 24 * 60 * 60 * 1000, // 1 day
                    path: '/'
                })
                return res.json({ loginStatus: true, id: result[0].id });
            } else {
                return res.json({ loginStatus: false, Error: "Wrong email or password" });
            }
        })
        
      } else {
          return res.json({ loginStatus: false, Error:"wrong email or password" });
      }
    });
  });

// Employee self-registration
router.post("/register", (req, res) => {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password) {
        return res.json({ Status: false, Error: "Name, email, and password are required" });
    }

    if (!validateEmail(email)) {
        return res.json({ Status: false, Error: "Invalid email format" });
    }

    // Check if email exists
    const checkSql = "SELECT id FROM employee WHERE email = ?";
    con.query(checkSql, [email], (err, result) => {
        if (err) return res.json({ Status: false, Error: "Query error" });
        if (result.length > 0) {
            return res.json({ Status: false, Error: "Email already registered" });
        }

        bcrypt.hash(password, 10, (hashErr, hash) => {
            if (hashErr) return res.json({ Status: false, Error: "Password hashing error" });

            const insertSql = `INSERT INTO employee (name, email, password, address, salary, image, category_id)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const values = [
                name.trim(),
                email.trim().toLowerCase(),
                hash,
                address ? address.trim() : null,
                0,               // default salary
                null,            // no image on self-register
                null             // no category yet
            ];

            con.query(insertSql, values, (insertErr, insertResult) => {
                if (insertErr) return res.json({ Status: false, Error: "Registration failed: " + insertErr.message });
                return res.json({ Status: true, Message: "Registration successful. Please log in." });
            });
        });
    });
});

  router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    })
  })

  router.get('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })
    return res.json({Status: true})
  })

  export {router as EmployeeRouter}