import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const StatusBadge = ({ status }) => {
  const variants = {
    "approved": "success",
    "pending": "warning",
    "changes": "danger"
  };
  const variant = variants[status] || "secondary";
  const displayStatus = status === "pending" ? "Pending Review" : 
                        status === "approved" ? "Approved" : 
                        status === "changes" ? "Needs Changes" : status;
  return <span className={`badge bg-${variant}`}>{displayStatus}</span>;
};

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "", notes: "" });
  const [updating, setUpdating] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/submissions/${submissionId}`);
      if (res.data.success) {
        setSelectedSubmission(res.data);
        setStatusUpdate({
          status: res.data.submission.status,
          notes: res.data.submission.notes || ""
        });
      }
    } catch (err) {
      console.error("Error fetching submission details:", err);
      alert("Failed to load submission details");
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission || !statusUpdate.status) return;

    setUpdating(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/submissions/${selectedSubmission.submission.id}/status`,
        statusUpdate
      );
      if (res.data.success) {
        alert("Status updated successfully!");
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        alert(res.data.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadFile = (filename, path) => {
    window.open(`${API_BASE_URL}/Uploads/Submissions/${path}`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">Project Submissions</h4>
          <small className="text-muted">Review and manage employee submissions</small>
        </div>
        <Link to="/dashboard/hub" className="btn btn-outline-secondary btn-sm">
          Back to Hub
        </Link>
      </div>

      <div className="row">
        <div className={selectedSubmission ? "col-md-7" : "col-12"}>
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">All Submissions</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <p className="mb-0">No submissions yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Employee</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Files</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id} style={{ cursor: 'pointer' }} onClick={() => handleViewSubmission(sub.id)}>
                          <td>{sub.project_name || "N/A"}</td>
                          <td>{sub.employee_name || "N/A"}</td>
                          <td>v{sub.version}</td>
                          <td><StatusBadge status={sub.status} /></td>
                          <td>{sub.file_count || 0} file(s)</td>
                          <td>{formatDate(sub.created_at)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSubmission(sub.id);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSubmission && (
          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Submission Details</h5>
                <button
                  className="btn btn-sm btn-close"
                  onClick={() => setSelectedSubmission(null)}
                ></button>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <strong>Project:</strong>
                  <div>{selectedSubmission.submission.project_name}</div>
                </div>
                {selectedSubmission.submission.project_description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <div>{selectedSubmission.submission.project_description}</div>
                  </div>
                )}
                <div className="mb-3">
                  <strong>Submitted by:</strong>
                  <div>{selectedSubmission.submission.employee_name} ({selectedSubmission.submission.employee_email})</div>
                </div>
                <div className="mb-3">
                  <strong>Version:</strong>
                  <div>v{selectedSubmission.submission.version}</div>
                </div>
                <div className="mb-3">
                  <strong>Status:</strong>
                  <div><StatusBadge status={selectedSubmission.submission.status} /></div>
                </div>
                <div className="mb-3">
                  <strong>Date:</strong>
                  <div>{formatDate(selectedSubmission.submission.created_at)}</div>
                </div>

                <div className="mb-3">
                  <strong>Files ({selectedSubmission.files.length}):</strong>
                  <div className="list-group mt-2">
                    {selectedSubmission.files.map((file) => (
                      <div key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="small">
                          <i className="bi bi-file-earmark me-1"></i>
                          {file.filename}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleDownloadFile(file.filename, file.path)}
                        >
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <hr />

                <div className="mb-3">
                  <label htmlFor="status" className="form-label fw-semibold">
                    Update Status
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="changes">Needs Changes</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label fw-semibold">
                    Notes/Feedback
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    rows="3"
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    placeholder="Add feedback or notes..."
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleStatusUpdate}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
