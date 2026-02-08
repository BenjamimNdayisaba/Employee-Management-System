import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();

const router = express.Router();

// Auth middleware
const requireAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};

// File upload configuration for submissions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Uploads/Submissions");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, `submission_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Test endpoint to check if route is accessible
router.get("/test", (req, res) => {
  return res.json({ success: true, message: "Submissions route is working" });
});

// Create a new submission (employee only)
router.post("/", requireAuth, upload.array('files', 10), (req, res) => {
  console.log("=== SUBMISSION CREATE REQUEST ===");
  console.log("Role:", req.role);
  console.log("UserId:", req.userId);
  console.log("Body:", req.body);
  console.log("Files:", req.files ? req.files.length : 0);

  if (req.role !== "employee") {
    console.error("Access denied: Not an employee");
    return res.json({ success: false, error: "Only employees can create submissions" });
  }

  const { title, description, notes } = req.body;
  const submittedBy = req.userId;

  if (!title || !title.trim()) {
    return res.json({ success: false, error: "Title is required" });
  }

  if (!req.files || req.files.length === 0) {
    return res.json({ success: false, error: "At least one file is required" });
  }

  // First, create a project entry (or use a default project)
  // For simplicity, we'll create a project for each submission
  const projectSql = "INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)";
  console.log("Creating project with SQL:", projectSql);
  console.log("Project values:", [title.trim(), description || null, submittedBy]);
  
  con.query(projectSql, [title.trim(), description || null, submittedBy], (err, projectResult) => {
    if (err) {
      console.error("Create project error:", err);
      console.error("Error code:", err.code);
      console.error("Error SQL state:", err.sqlState);
      return res.json({ success: false, error: "Database error: " + err.message });
    }

    console.log("Project created with ID:", projectResult.insertId);
    const projectId = projectResult.insertId;

    // Get the next version number for this project
    const versionSql = "SELECT MAX(version) as maxVersion FROM project_submissions WHERE project_id = ?";
    con.query(versionSql, [projectId], (err, versionResult) => {
      if (err) {
        console.error("Get version error:", err);
        return res.json({ success: false, error: "Database error: " + err.message });
      }

      const nextVersion = (versionResult[0]?.maxVersion || 0) + 1;

      // Create the submission
      const submissionSql = "INSERT INTO project_submissions (project_id, submitted_by, version, status, notes) VALUES (?, ?, ?, 'pending', ?)";
      console.log("Creating submission with SQL:", submissionSql);
      console.log("Submission values:", [projectId, submittedBy, nextVersion, notes || null]);
      
      con.query(submissionSql, [projectId, submittedBy, nextVersion, notes || null], (err, submissionResult) => {
        if (err) {
          console.error("Create submission error:", err);
          console.error("Error code:", err.code);
          console.error("Error SQL state:", err.sqlState);
          return res.json({ success: false, error: "Database error: " + err.message });
        }

        console.log("Submission created with ID:", submissionResult.insertId);
        const submissionId = submissionResult.insertId;

        // Insert file records
        const filePromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            // Store relative path from Public folder
            const relativePath = `Uploads/Submissions/${file.filename}`;
            const fileSql = "INSERT INTO submission_files (submission_id, filename, path) VALUES (?, ?, ?)";
            con.query(fileSql, [submissionId, file.originalname, relativePath], (err, fileResult) => {
              if (err) {
                reject(err);
              } else {
                resolve(fileResult);
              }
            });
          });
        });

        Promise.all(filePromises)
          .then(() => {
            return res.json({ 
              success: true, 
              message: "Submission created successfully",
              submissionId: submissionId,
              filesCount: req.files.length
            });
          })
          .catch((err) => {
            console.error("File insert error:", err);
            return res.json({ success: false, error: "Error saving files: " + err.message });
          });
      });
    });
  });
});

// Get all submissions (admin sees all, employee sees only their own)
router.get("/", requireAuth, (req, res) => {
  let sql;
  let params;

  if (req.role === "admin") {
    sql = `
      SELECT ps.*,
             p.name AS project_name,
             p.description AS project_description,
             e.name AS employee_name,
             e.email AS employee_email,
             COUNT(sf.id) AS file_count
      FROM project_submissions ps
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN employee e ON ps.submitted_by = e.id
      LEFT JOIN submission_files sf ON ps.id = sf.submission_id
      GROUP BY ps.id
      ORDER BY ps.created_at DESC
    `;
    params = [];
  } else {
    sql = `
      SELECT ps.*,
             p.name AS project_name,
             p.description AS project_description,
             COUNT(sf.id) AS file_count
      FROM project_submissions ps
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN submission_files sf ON ps.id = sf.submission_id
      WHERE ps.submitted_by = ?
      GROUP BY ps.id
      ORDER BY ps.created_at DESC
    `;
    params = [req.userId];
  }

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Get submissions error:", err);
      return res.json({ success: false, error: "Query error: " + err.message });
    }
    return res.json({ success: true, submissions: result });
  });
});

// Get single submission with files
router.get("/:id", requireAuth, (req, res) => {
  const submissionId = req.params.id;
  
  let sql = `
    SELECT ps.*,
           p.name AS project_name,
           p.description AS project_description,
           e.name AS employee_name,
           e.email AS employee_email
    FROM project_submissions ps
    LEFT JOIN projects p ON ps.project_id = p.id
    LEFT JOIN employee e ON ps.submitted_by = e.id
    WHERE ps.id = ?
  `;
  
  let params = [submissionId];
  
  // Employees can only see their own submissions
  if (req.role !== "admin") {
    sql += " AND ps.submitted_by = ?";
    params.push(req.userId);
  }

  con.query(sql, params, (err, submissionResult) => {
    if (err) {
      console.error("Get submission error:", err);
      return res.json({ success: false, error: "Query error: " + err.message });
    }

    if (submissionResult.length === 0) {
      return res.json({ success: false, error: "Submission not found" });
    }

    // Get files for this submission
    const filesSql = "SELECT * FROM submission_files WHERE submission_id = ?";
    con.query(filesSql, [submissionId], (err, filesResult) => {
      if (err) {
        console.error("Get files error:", err);
        return res.json({ success: false, error: "Query error: " + err.message });
      }

      return res.json({
        success: true,
        submission: submissionResult[0],
        files: filesResult || []
      });
    });
  });
});

// Update submission status (admin only)
router.put("/:id/status", requireAuth, (req, res) => {
  if (req.role !== "admin") {
    return res.json({ success: false, error: "Only admins can update submission status" });
  }

  const { status, notes } = req.body;
  const submissionId = req.params.id;

  if (!status || !['pending', 'approved', 'changes'].includes(status)) {
    return res.json({ success: false, error: "Invalid status. Must be: pending, approved, or changes" });
  }

  const sql = "UPDATE project_submissions SET status = ?, notes = ? WHERE id = ?";
  con.query(sql, [status, notes || null, submissionId], (err, result) => {
    if (err) {
      console.error("Update status error:", err);
      return res.json({ success: false, error: "Update error: " + err.message });
    }
    return res.json({ success: true, message: "Status updated successfully" });
  });
});

// Delete submission (admin only, or employee can delete their own)
router.delete("/:id", requireAuth, (req, res) => {
  const submissionId = req.params.id;

  // Check if submission exists and user has permission
  const checkSql = "SELECT submitted_by FROM project_submissions WHERE id = ?";
  con.query(checkSql, [submissionId], (err, result) => {
    if (err) {
      return res.json({ success: false, error: "Query error: " + err.message });
    }

    if (result.length === 0) {
      return res.json({ success: false, error: "Submission not found" });
    }

    // Admin can delete any, employee can only delete their own
    if (req.role !== "admin" && result[0].submitted_by !== req.userId) {
      return res.json({ success: false, error: "You don't have permission to delete this submission" });
    }

    const deleteSql = "DELETE FROM project_submissions WHERE id = ?";
    con.query(deleteSql, [submissionId], (err, result) => {
      if (err) {
        console.error("Delete submission error:", err);
        return res.json({ success: false, error: "Delete error: " + err.message });
      }
      return res.json({ success: true, message: "Submission deleted successfully" });
    });
  });
});

export { router as submissionRouter };

