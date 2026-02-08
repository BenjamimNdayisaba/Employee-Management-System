import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router();

// Input validation middleware
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Admin registration endpoint
router.post("/adminregister", (req, res) => {
  // Input validation
  if (!req.body.email || !req.body.password) {
    return res.json({ Status: false, Error: "Email and password are required" });
  }
  
  if (!validateEmail(req.body.email)) {
    return res.json({ Status: false, Error: "Invalid email format" });
  }

  if (req.body.password.length < 6) {
    return res.json({ Status: false, Error: "Password must be at least 6 characters long" });
  }

  // Check if admin with this email already exists
  const checkSql = "SELECT * FROM admin WHERE email = ?";
  con.query(checkSql, [req.body.email.trim().toLowerCase()], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error: " + err.message });
    
    if (result.length > 0) {
      return res.json({ Status: false, Error: "Admin with this email already exists" });
    }

    // Hash password and create admin
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) return res.json({ Status: false, Error: "Password hashing error" });
      
      const sql = "INSERT INTO admin (email, password) VALUES (?, ?)";
      con.query(sql, [req.body.email.trim().toLowerCase(), hash], (err, result) => {
        if (err) {
          return res.json({ Status: false, Error: "Database error: " + err.message });
        }
        return res.json({ Status: true, message: "Admin account created successfully" });
      });
    });
  });
});

router.post("/adminlogin", (req, res) => {
  // Input validation
  if (!req.body.email || !req.body.password) {
    return res.json({ loginStatus: false, Error: "Email and password are required" });
  }
  
  if (!validateEmail(req.body.email)) {
    return res.json({ loginStatus: false, Error: "Invalid email format" });
  }

  const sql = "SELECT * from admin Where email = ?";
  con.query(sql, [req.body.email], (err, result) => {
    if (err) return res.json({ loginStatus: false, Error: "Query error" });
    if (result.length > 0) {
      // Compare hashed password
      bcrypt.compare(req.body.password, result[0].password, (err, response) => {
        if (err) return res.json({ loginStatus: false, Error: "Authentication error" });
        if (response) {
          const email = result[0].email;
          const token = jwt.sign(
            { role: "admin", email: email, id: result[0].id },
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
          return res.json({ loginStatus: true });
        } else {
          return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
      });
    } else {
        return res.json({ loginStatus: false, Error:"wrong email or password" });
    }
  });
});

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_category', (req, res) => {
    // Input validation
    if (!req.body.category || req.body.category.trim() === '') {
        return res.json({Status: false, Error: "Category name is required"})
    }
    
    const sql = "INSERT INTO category (`name`) VALUES (?)"
    con.query(sql, [req.body.category.trim()], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

// Image upload configuration with validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

// File filter for image uploads
const fileFilter = (req, file, cb) => {
    // Allowed image types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
})
// end image upload 

router.post('/add_employee', upload.single('image'), (req, res) => {
    // Input validation
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.salary || !req.body.category_id) {
        return res.json({Status: false, Error: "All required fields must be filled"})
    }
    
    if (!validateEmail(req.body.email)) {
        return res.json({Status: false, Error: "Invalid email format"})
    }
    
    if (!req.file) {
        return res.json({Status: false, Error: "Image file is required"})
    }
    
    if (isNaN(req.body.salary) || parseFloat(req.body.salary) < 0) {
        return res.json({Status: false, Error: "Salary must be a valid positive number"})
    }
    
    const sql = `INSERT INTO employee 
    (name,email,password, address, salary,image, category_id) 
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Password hashing error"})
        const values = [
            req.body.name.trim(),
            req.body.email.trim().toLowerCase(),
            hash,
            req.body.address ? req.body.address.trim() : null,
            parseFloat(req.body.salary), 
            req.file.filename,
            parseInt(req.body.category_id)
        ]
        con.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: "Database error: " + err.message})
            return res.json({Status: true})
        })
    })
})

router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    
    // Input validation
    if (!req.body.name || !req.body.email || !req.body.salary || !req.body.category_id) {
        return res.json({Status: false, Error: "All required fields must be filled"})
    }
    
    if (!validateEmail(req.body.email)) {
        return res.json({Status: false, Error: "Invalid email format"})
    }
    
    if (isNaN(req.body.salary) || parseFloat(req.body.salary) < 0) {
        return res.json({Status: false, Error: "Salary must be a valid positive number"})
    }
    
    const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`
    const values = [
        req.body.name.trim(),
        req.body.email.trim().toLowerCase(),
        parseFloat(req.body.salary),
        req.body.address ? req.body.address.trim() : null,
        parseInt(req.body.category_id)
    ]
    con.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error: " + err.message})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    con.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as salaryOFEmp from employee";
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    con.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
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

export { router as adminRouter };
