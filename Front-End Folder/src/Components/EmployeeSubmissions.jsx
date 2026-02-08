import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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

const EmployeeSubmissions = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    notes: ""
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/submissions`);
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      } else {
        setError(res.data.error || "Failed to fetch submissions");
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Network error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      alert("Maximum 10 files allowed");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("notes", formData.notes || "");
      
      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const res = await axios.post(`${API_BASE_URL}/api/submissions`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        alert("Submission created successfully!");
        setShowModal(false);
        setFormData({ title: "", description: "", notes: "" });
        setFiles([]);
        fetchSubmissions();
      } else {
        setError(res.data.error || "Failed to create submission");
      }
    } catch (err) {
      console.error("Error creating submission:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      if (err.response) {
        setError(err.response.data?.error || `Server error (${err.response.status}): ${err.response.statusText}`);
      } else if (err.request) {
        setError("Cannot connect to server. Please check if the backend is running on port 3000.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewSubmission = async (submissionId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/submissions/${submissionId}`);
      if (res.data.success) {
        const { submission, files: submissionFiles } = res.data;
        let message = `Project: ${submission.project_name}\n`;
        message += `Version: ${submission.version}\n`;
        message += `Status: ${submission.status}\n`;
        message += `Files (${submissionFiles.length}):\n`;
        submissionFiles.forEach((file, index) => {
          message += `${index + 1}. ${file.filename}\n`;
        });
        if (submission.notes) {
          message += `\nNotes: ${submission.notes}`;
        }
        alert(message);
      }
    } catch (err) {
      console.error("Error fetching submission details:", err);
      alert("Failed to load submission details");
    }
  };

  const handleDownloadFile = (filename, path) => {
    window.open(`${API_BASE_URL}/Uploads/Submissions/${path}`, '_blank');
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0">My Submissions</h4>
          <small className="text-muted">Your project submissions and versions</small>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            New Submission
          </button>
          <Link to={`/employee_detail/${id}/hub`} className="btn btn-outline-secondary btn-sm">
            Back to Hub
          </Link>
        </div>
      </div>

      {error && !showModal && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Submissions</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : submissions.length === 0 ? (
                <p className="text-muted mb-0">No submissions yet. Create your first submission!</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Files</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td>{sub.project_name || "N/A"}</td>
                          <td>v{sub.version}</td>
                          <td><StatusBadge status={sub.status} /></td>
                          <td>{sub.file_count || 0} file(s)</td>
                          <td>{formatDate(sub.created_at)}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => handleViewSubmission(sub.id)}
                            >
                              View
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
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Submission</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setFormData({ title: "", description: "", notes: "" });
                    setFiles([]);
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Project Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter project description (optional)"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label fw-semibold">
                      Notes
                    </label>
                    <textarea
                      className="form-control"
                      id="notes"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes (optional)"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="files" className="form-label fw-semibold">
                      Files <span className="text-danger">*</span> (Max 10 files, 50MB each)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="files"
                      multiple
                      onChange={handleFileChange}
                      required
                    />
                    {files.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Selected files ({files.length}):</small>
                        <ul className="list-unstyled mt-1">
                          {files.map((file, index) => (
                            <li key={index} className="small">
                              <i className="bi bi-file-earmark me-1"></i>
                              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setError(null);
                      setFormData({ title: "", description: "", notes: "" });
                      setFiles([]);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1"></i>
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSubmissions;
