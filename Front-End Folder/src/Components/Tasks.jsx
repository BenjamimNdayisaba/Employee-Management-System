import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import TaskForm from "./TaskForm.jsx";

const columns = [
  { key: "todo", label: "To-Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Completed" },
];

const PriorityBadge = ({ level }) => {
  const levelMap = { high: "danger", medium: "warning", low: "secondary" };
  const displayMap = { high: "High", medium: "Medium", low: "Low" };
  const variant = levelMap[level?.toLowerCase()] || "secondary";
  return <span className={`badge bg-${variant} me-1`}>{displayMap[level?.toLowerCase()] || level}</span>;
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchRole();
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchRole = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/verify`);
      if (res.data.Status) {
        setRole(res.data.role);
      }
    } catch (err) {
      console.error("Role fetch error:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tasks`);
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      } else {
        console.error("Tasks fetch failed:", res.data.error);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
      } else if (err.request) {
        console.error("No response received. Is backend running?");
        alert("Cannot connect to server. Make sure the backend is running on port 3000.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/employee`);
      if (res.data.Status) {
        setEmployees(res.data.Result || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      if (res.data.success) {
        fetchTasks();
      } else {
        alert(res.data.error || "Failed to delete task");
      }
    } catch (err) {
      console.error("Delete task error:", err);
      if (err.response) {
        alert(err.response.data?.error || "Failed to delete task");
      } else if (err.request) {
        alert("Cannot connect to server. Make sure the backend is running.");
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, {
        status: newStatus,
      });
      if (res.data.success) {
        fetchTasks();
      } else {
        alert(res.data.error || "Failed to update task status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      if (err.response) {
        alert(err.response.data?.error || "Failed to update task status");
      } else if (err.request) {
        alert("Cannot connect to server. Make sure the backend is running.");
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      if (g[t.status]) {
        g[t.status].push(t);
      }
    });
    return g;
  }, [tasks]);

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Tasks</h4>
          <small className="text-muted">
            {role === "admin" ? "All tasks" : "Tasks assigned to you"}
          </small>
        </div>
        <div>
          {role === "admin" && (
            <button
              className="btn btn-primary me-2"
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Create Task
            </button>
          )}
          <Link to="/dashboard/hub" className="btn btn-outline-secondary btn-sm">
            Back to Hub
          </Link>
        </div>
      </div>

      <div className="row g-3">
        {columns.map((col) => (
          <div key={col.key} className="col-lg-4 col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h6 className="mb-0">{col.label}</h6>
              </div>
              <div className="card-body" style={{ minHeight: "200px", maxHeight: "600px", overflowY: "auto" }}>
                {grouped[col.key].length === 0 ? (
                  <p className="text-muted mb-0">No tasks here.</p>
                ) : (
                  grouped[col.key].map((task) => (
                    <div key={task.id} className="card mb-2 border">
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="fw-semibold small">{task.title}</div>
                          {role === "admin" && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowForm(true);
                                }}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(task.id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                        {task.description && (
                          <div className="text-muted small mb-2" style={{ fontSize: "0.85rem" }}>
                            {task.description.length > 50
                              ? task.description.substring(0, 50) + "..."
                              : task.description}
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <PriorityBadge level={task.priority} />
                          {task.due_date && (
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {formatDate(task.due_date)}
                            </small>
                          )}
                        </div>
                        <div className="small text-muted mb-2">
                          <i className="bi bi-person me-1"></i>
                          {task.assignee_name || "Unknown"}
                        </div>
                        {role === "admin" && (
                          <div className="btn-group btn-group-sm w-100">
                            {columns.map((c) => (
                              <button
                                key={c.key}
                                className={`btn btn-sm ${
                                  task.status === c.key ? "btn-primary" : "btn-outline-secondary"
                                }`}
                                onClick={() => handleStatusChange(task.id, c.key)}
                                disabled={task.status === c.key}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {role !== "admin" && task.status !== "done" && (
                          <select
                            className="form-select form-select-sm"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          >
                            {columns.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          employees={employees}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
};

export default Tasks;


