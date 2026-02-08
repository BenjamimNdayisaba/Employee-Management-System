import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const PriorityBadge = ({ level }) => {
  const levelMap = { high: "danger", medium: "warning", low: "secondary" };
  const displayMap = { high: "High", medium: "Medium", low: "Low" };
  const variant = levelMap[level?.toLowerCase()] || "secondary";
  return <span className={`badge bg-${variant} me-1`}>{displayMap[level?.toLowerCase()] || level}</span>;
};

const StatusBadge = ({ status }) => {
  const statusMap = {
    todo: { label: "To-Do", variant: "secondary" },
    in_progress: { label: "In Progress", variant: "primary" },
    done: { label: "Done", variant: "success" }
  };
  const statusInfo = statusMap[status] || { label: status, variant: "secondary" };
  return <span className={`badge bg-${statusInfo.variant}`}>{statusInfo.label}</span>;
};

const EmployeeDashboard = () => {
  const { employee } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (employee) {
      fetchTasks();
    }
  }, [employee]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getUpcomingTasks = () => {
    return tasks.filter(task => {
      if (task.status === "done") return false;
      if (!task.due_date) return true;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    }).slice(0, 5);
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    done: tasks.filter(t => t.status === "done").length
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        {/* Welcome Card */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              {employee.image && (
                <img
                  src={`${API_BASE_URL}/Images/${employee.image}`}
                  alt={employee.name}
                  className="mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                  }}
                />
              )}
              <h3 className="mb-2">Welcome back, {employee.name}!</h3>
              <p className="text-muted mb-0">Here's your personal dashboard</p>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Profile Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Name:</strong>
                <div>{employee.name}</div>
              </div>
              <div className="mb-3">
                <strong>Email:</strong>
                <div>{employee.email}</div>
              </div>
              <div className="mb-3">
                <strong>Salary:</strong>
                <div>${employee.salary || "0"}</div>
              </div>
              {employee.address && (
                <div className="mb-3">
                  <strong>Address:</strong>
                  <div>{employee.address}</div>
                </div>
              )}
              <Link
                to={`/employee_detail/${employee.id}/profile`}
                className="btn btn-primary btn-sm"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Task Overview</h5>
              <Link
                to={`/employee_detail/${employee.id}/tasks`}
                className="btn btn-sm btn-outline-primary"
              >
                View All
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row text-center mb-3">
                    <div className="col-3">
                      <div className="fw-bold text-primary">{taskStats.total}</div>
                      <small className="text-muted">Total</small>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold text-secondary">{taskStats.todo}</div>
                      <small className="text-muted">To-Do</small>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold text-info">{taskStats.inProgress}</div>
                      <small className="text-muted">In Progress</small>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold text-success">{taskStats.done}</div>
                      <small className="text-muted">Done</small>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <h6 className="mb-2">Upcoming Tasks</h6>
                    {getUpcomingTasks().length === 0 ? (
                      <p className="text-muted small mb-0">No upcoming tasks</p>
                    ) : (
                      <div className="list-group list-group-flush">
                        {getUpcomingTasks().map((task) => (
                          <div key={task.id} className="list-group-item px-0 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="fw-semibold small">{task.title}</div>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <PriorityBadge level={task.priority} />
                                  <StatusBadge status={task.status} />
                                </div>
                                {task.due_date && (
                                  <small className="text-muted d-block mt-1">
                                    <i className="bi bi-calendar me-1"></i>
                                    Due: {formatDate(task.due_date)}
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body d-flex flex-wrap gap-2">
              <Link
                to={`/employee_detail/${employee.id}/hub`}
                className="btn btn-outline-primary"
              >
                <i className="bi bi-grid me-2"></i>
                Productivity Hub
              </Link>
              <Link
                to={`/employee_detail/${employee.id}/tasks`}
                className="btn btn-outline-success"
              >
                <i className="bi bi-kanban me-2"></i>
                My Tasks ({taskStats.total})
              </Link>
              <Link
                to={`/employee_detail/${employee.id}/submissions`}
                className="btn btn-outline-info"
              >
                <i className="bi bi-cloud-arrow-up me-2"></i>
                My Submissions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

