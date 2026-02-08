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
  const token = req.cookies?.token;
  if (!token) {
    return res.json({ success: false, error: "Not authenticated" });
  }
  jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ success: false, error: "Wrong Token" });
    }
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
};

// File upload for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Uploads/Tasks");
  },
  filename: (req, file, cb) => {
    cb(null, `task_${Date.now()}_${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Get all tasks (admin sees all, employee sees only assigned)
router.get("/", requireAuth, (req, res) => {
  let sql;
  let params;

  if (req.role === "admin") {
    sql = `
      SELECT t.*, 
             e.name AS assignee_name, 
             e.email AS assignee_email,
             a.email AS assigner_email
      FROM tasks t
      LEFT JOIN employee e ON t.assigned_to = e.id
      LEFT JOIN admin a ON t.assigned_by = a.id
      ORDER BY t.created_at DESC
    `;
    params = [];
  } else {
    sql = `
      SELECT t.*, 
             e.name AS assignee_name, 
             e.email AS assignee_email,
             a.email AS assigner_email
      FROM tasks t
      LEFT JOIN employee e ON t.assigned_to = e.id
      LEFT JOIN admin a ON t.assigned_by = a.id
      WHERE t.assigned_to = ?
      ORDER BY t.created_at DESC
    `;
    params = [req.userId];
  }

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Get tasks error:", err);
      return res.json({ success: false, error: "Query error: " + err.message });
    }
    return res.json({ success: true, tasks: result });
  });
});

// Get single task
router.get("/:id", requireAuth, (req, res) => {
  const taskId = req.params.id;
  const sql = `
    SELECT t.*, 
           e.name AS assignee_name, 
           e.email AS assignee_email,
           a.email AS assigner_email
    FROM tasks t
    LEFT JOIN employee e ON t.assigned_to = e.id
    LEFT JOIN admin a ON t.assigned_by = a.id
    WHERE t.id = ?
  `;

  con.query(sql, [taskId], (err, result) => {
    if (err) {
      return res.json({ success: false, error: "Query error: " + err.message });
    }
    if (result.length === 0) {
      return res.json({ success: false, error: "Task not found" });
    }
    return res.json({ success: true, task: result[0] });
  });
});

// Create task (admin only)
router.post("/", requireAuth, (req, res) => {
  if (req.role !== "admin") {
    return res.json({ success: false, error: "Only admins can create tasks" });
  }

  const { title, description, assigned_to, due_date, priority } = req.body;

  if (!title || !assigned_to) {
    return res.json({ success: false, error: "Title and assigned_to are required" });
  }

  const sql = `
    INSERT INTO tasks (title, description, assigned_to, assigned_by, due_date, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, 'todo')
  `;

  const values = [
    title.trim(),
    description ? description.trim() : null,
    parseInt(assigned_to),
    req.userId,
    due_date || null,
    priority || "medium",
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Create task error:", err);
      return res.json({ success: false, error: "Insert error: " + err.message });
    }
    return res.json({ success: true, taskId: result.insertId, message: "Task created successfully" });
  });
});

// Update task (admin can edit all, employee can only change status)
router.put("/:id", requireAuth, (req, res) => {
  const taskId = req.params.id;
  const { title, description, assigned_to, due_date, priority, status } = req.body;

  // Check if task exists and get current data
  const checkSql = "SELECT * FROM tasks WHERE id = ?";
  con.query(checkSql, [taskId], (err, taskResult) => {
    if (err || taskResult.length === 0) {
      return res.json({ success: false, error: "Task not found" });
    }

    const task = taskResult[0];

    // Employees can only update status
    if (req.role !== "admin") {
      if (status && ["todo", "in_progress", "done"].includes(status)) {
        const updateSql = "UPDATE tasks SET status = ? WHERE id = ?";
        con.query(updateSql, [status, taskId], (err, result) => {
          if (err) {
            return res.json({ success: false, error: "Update error: " + err.message });
          }
          return res.json({ success: true, message: "Task status updated" });
        });
      } else {
        return res.json({ success: false, error: "Employees can only update task status" });
      }
    } else {
      // Admin can update everything
      const updateSql = `
        UPDATE tasks 
        SET title = ?, 
            description = ?, 
            assigned_to = ?, 
            due_date = ?, 
            priority = ?,
            status = ?
        WHERE id = ?
      `;

      const values = [
        title ? title.trim() : task.title,
        description !== undefined ? (description ? description.trim() : null) : task.description,
        assigned_to ? parseInt(assigned_to) : task.assigned_to,
        due_date !== undefined ? (due_date || null) : task.due_date,
        priority || task.priority,
        status || task.status,
        taskId,
      ];

      con.query(updateSql, values, (err, result) => {
        if (err) {
          console.error("Update task error:", err);
          return res.json({ success: false, error: "Update error: " + err.message });
        }
        return res.json({ success: true, message: "Task updated successfully" });
      });
    }
  });
});

// Delete task (admin only)
router.delete("/:id", requireAuth, (req, res) => {
  if (req.role !== "admin") {
    return res.json({ success: false, error: "Only admins can delete tasks" });
  }

  const taskId = req.params.id;
  const sql = "DELETE FROM tasks WHERE id = ?";

  con.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error("Delete task error:", err);
      return res.json({ success: false, error: "Delete error: " + err.message });
    }
    if (result.affectedRows === 0) {
      return res.json({ success: false, error: "Task not found" });
    }
    return res.json({ success: true, message: "Task deleted successfully" });
  });
});

// Upload task attachment
router.post("/:id/attachments", requireAuth, upload.single("file"), (req, res) => {
  const taskId = req.params.id;
  if (!req.file) {
    return res.json({ success: false, error: "No file uploaded" });
  }

  const sql = "INSERT INTO task_attachments (task_id, filename, path, uploaded_by) VALUES (?, ?, ?, ?)";
  const values = [taskId, req.file.filename, req.file.path, req.userId];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Upload attachment error:", err);
      return res.json({ success: false, error: "Upload error: " + err.message });
    }
    return res.json({ success: true, attachmentId: result.insertId, message: "File uploaded successfully" });
  });
});

export { router as taskRouter };

