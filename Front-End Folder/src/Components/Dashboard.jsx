import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

import API_BASE_URL from '../config/api.js'

const Dashboard = () => {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  axios.defaults.withCredentials = true

  useEffect(() => {
    axios.get(`${API_BASE_URL}/verify`)
      .then(res => {
        if (res.data.Status) {
          setRole(res.data.role)
        } else {
          navigate('/')
        }
      })
      .catch(err => {
        console.error('Role fetch error:', err)
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    axios.get(`${API_BASE_URL}/auth/logout`)
    .then(result => {
      if(result.data.Status) { 
        localStorage.removeItem("valid")
        navigate('/')
      }
    })
    .catch(err => console.error('Logout error:', err))
  }
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to="/dashboard"
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
               EMPLOYEES MANAGEMENT 
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/hub"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-grid ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Productivity Hub</span>
                </Link>
              </li>
              {role === 'admin' && (
                <li className="w-100">
                  <Link
                    to="/dashboard/employee"
                    className="nav-link px-0 align-middle text-white"
                  >
                    <i className="fs-4 bi-people ms-2"></i>
                    <span className="ms-2 d-none d-sm-inline">
                      Manage Employees
                    </span>
                  </Link>
                </li>
              )}
              <li className="w-100">
                <Link
                  to="/dashboard/tasks"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-kanban ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Tasks</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/submissions"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-cloud-arrow-up ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Submissions</span>
                </Link>
              </li>
              {role === 'admin' && (
                <li className="w-100">
                  <Link
                    to="/dashboard/category"
                    className="nav-link px-0 align-middle text-white"
                  >
                    <i className="fs-4 bi-columns ms-2"></i>
                    <span className="ms-2 d-none d-sm-inline">Category</span>
                  </Link>   
                </li>
              )}
              <li className="w-100">
                <Link
                  to="/dashboard/profile"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-person ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Profile</span>
                </Link>
              </li>
              <li className="w-100" onClick={handleLogout}>
              <Link
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col p-0 m-0">
            <div className="p-2 d-flex justify-content-center shadow">
                <h4>Employee Management System</h4>
            </div>
            <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
