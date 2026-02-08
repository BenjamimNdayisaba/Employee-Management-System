import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

const sampleDeadlines = [
  { id: 1, title: "Finalize UI kit", due: "2025-02-10", priority: "High" },
  { id: 2, title: "API contract review", due: "2025-02-12", priority: "Medium" },
];

const PriorityBadge = ({ level }) => {
  const variant = level === "High" ? "danger" : level === "Medium" ? "warning" : "secondary";
  return (
    <span className={`badge bg-${variant} ms-2`} style={{ textTransform: "capitalize" }}>
      {level}
    </span>
  );
};

const EmployeeProductivityHub = () => {
  const { id } = useParams();
  const upcoming = useMemo(() => sampleDeadlines.slice(0, 3), []);

  return (
    <div className="container-fluid py-3">
      <div className="row g-3">
        <div className="col-12">
          <div className="card shadow-sm p-3">
            <h4 className="mb-1">Welcome back!</h4>
            <p className="text-muted mb-0">Your productivity hub at a glance.</p>
          </div>
        </div>

        <div className="col-lg-6 col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Upcoming deadlines</h5>
                <Link to={`/employee_detail/${id}/tasks`} className="btn btn-sm btn-outline-primary">
                  View tasks
                </Link>
              </div>
            </div>
            <div className="card-body">
              {upcoming.length === 0 ? (
                <p className="text-muted mb-0">No deadlines yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {upcoming.map((d) => (
                    <li key={d.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{d.title}</div>
                        <small className="text-muted">Due: {d.due}</small>
                      </div>
                      <PriorityBadge level={d.priority} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Quick links</h5>
            </div>
            <div className="card-body d-flex flex-wrap gap-2">
              <Link to={`/employee_detail/${id}/tasks`} className="btn btn-outline-secondary">
                Tasks
              </Link>
              <Link to={`/employee_detail/${id}/submissions`} className="btn btn-outline-secondary">
                Project Submissions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProductivityHub;

