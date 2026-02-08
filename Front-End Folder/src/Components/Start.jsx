import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api.js'

const Start = () => {
    const navigate = useNavigate()
  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios.get(`${API_BASE_URL}/verify`)
    .then(result => {
      if(result.data.Status) {
        if(result.data.role === "admin") {
          navigate('/dashboard')
        } else {
          navigate('/employee_detail/'+result.data.id)
        }
      }
    }).catch(err => console.log(err))
  }, [navigate])

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="card shadow-lg border-0 bg-white" style={{ 
        width: '100%', 
        maxWidth: '450px',
        borderRadius: '15px',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="bi bi-briefcase-fill" style={{ fontSize: '4rem', color: '#667eea' }}></i>
            </div>
            <h2 className="fw-bold mb-2" style={{ color: '#333' }}>Employee Management System</h2>
            <p className="text-muted">Welcome! Please select your login type</p>
          </div>
          
          <div className="d-flex flex-column gap-3 mt-4">
            <button 
              type="button" 
              className="btn btn-lg btn-primary d-flex align-items-center justify-content-center gap-2"
              onClick={() => {navigate('/employee_login')}}
              style={{ 
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <i className="bi bi-person-fill" style={{ fontSize: '1.2rem' }}></i>
              Employee Login
            </button>
            <button 
              type="button" 
              className="btn btn-lg btn-success d-flex align-items-center justify-content-center gap-2"
              onClick={() => {navigate('/adminlogin')}}
              style={{ 
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <i className="bi bi-shield-lock-fill" style={{ fontSize: '1.2rem' }}></i>
              Admin Login
            </button>
          </div>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Select your role to continue
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
