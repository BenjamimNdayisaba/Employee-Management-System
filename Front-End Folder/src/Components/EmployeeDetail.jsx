import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../config/api.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/employee/detail/${id}`);
        if (res.data && res.data.length > 0) {
          setEmployee(res.data[0]);
        } else {
          alert("Employee not found.");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching employee detail:", err);
        alert("Failed to load employee details.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/employee/logout`);
      if (res.data.Status) {
        localStorage.removeItem("valid");
        navigate("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center mt-5">
        <h3>Unable to load employee data.</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        {/* SIDEBAR */}
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to={`/employee_detail/${id}`}
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
                EMPLOYEE PORTAL
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}`}
                  className="nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}/hub`}
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-grid ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Productivity Hub</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}/tasks`}
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-kanban ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">My Tasks</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}/submissions`}
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-cloud-arrow-up ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">My Submissions</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to={`/employee_detail/${id}/profile`}
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-person ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">My Profile</span>
                </Link>
              </li>
              <li className="w-100" onClick={handleLogout}>
                <Link className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col p-0 m-0">
          <div className="p-2 d-flex justify-content-between shadow align-items-center">
            <h4 className="m-0">Welcome, {employee.name}!</h4>
            {employee.image && (
              <img
                src={`${API_BASE_URL}/Images/${employee.image}`}
                alt={employee.name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            )}
          </div>
          <Outlet context={{ employee }} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
