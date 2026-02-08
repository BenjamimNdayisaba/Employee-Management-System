import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

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

const EmployeeTasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tasks`);
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
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
      alert("Failed to update task status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          <h4 className="mb-0">My Tasks</h4>
          <small className="text-muted">Tasks assigned to you ({tasks.length} total)</small>
        </div>
        <Link to={`/employee_detail/${id}/hub`} className="btn btn-outline-secondary btn-sm">
          Back to Hub
        </Link>
      </div>

      <div className="row g-3">
        {columns.map((col) => (
          <div key={col.key} className="col-lg-4 col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h6 className="mb-0">
                  {col.label} ({grouped[col.key].length})
                </h6>
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTasks;

