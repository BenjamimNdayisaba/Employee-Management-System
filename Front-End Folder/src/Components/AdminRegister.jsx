import React, { useState } from 'react'
import './style.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api.js'

const AdminRegister = () => {
    const [values, setValues] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    axios.defaults.withCredentials = true;
    
    const handleSubmit = (event) => {
        event.preventDefault()
        setError(null)
        setLoading(true)
        
        // Basic validation
        if (!values.email || !values.password || !values.confirmPassword) {
            setError('All fields are required')
            setLoading(false)
            return
        }

        if (values.password !== values.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (values.password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }
        
        axios.post(`${API_BASE_URL}/auth/adminregister`, {
            email: values.email,
            password: values.password
        })
        .then(result => {
            if(result.data.Status) {
                alert('Admin account created successfully! Please login.')
                navigate('/adminlogin')
            } else {
                setError(result.data.Error || 'Registration failed')
            }
        })
        .catch(err => {
            console.error('Registration error:', err)
            if (err.response) {
                setError(err.response.data?.Error || 'Server error. Please try again.')
            } else if (err.request) {
                setError('Cannot connect to server. Make sure the backend is running on port 3000.')
            } else {
                setError('Network error. Please try again.')
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100 loginPage'>
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
              <i className="bi bi-shield-check-fill" style={{ fontSize: '3.5rem', color: '#28a745' }}></i>
            </div>
            <h2 className="fw-bold mb-2" style={{ color: '#333' }}>Admin Registration</h2>
            <p className="text-muted">Create your admin account</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='mb-3'>
              <label htmlFor="email" className="form-label fw-semibold">
                <i className="bi bi-envelope me-2"></i>Email Address
              </label>
              <input 
                type="email" 
                name='email' 
                id="email"
                autoComplete='off' 
                placeholder='admin@example.com'
                value={values.email}
                onChange={(e) => setValues({...values, email : e.target.value})} 
                className='form-control'
                style={{ borderRadius: '10px', padding: '12px' }}
                required
              />
            </div>
            <div className='mb-3'> 
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="bi bi-lock-fill me-2"></i>Password
              </label>
              <input 
                type="password" 
                name='password' 
                id="password"
                placeholder='Enter your password (min. 6 characters)'
                value={values.password}
                onChange={(e) => setValues({...values, password : e.target.value})} 
                className='form-control'
                style={{ borderRadius: '10px', padding: '12px' }}
                required
                minLength={6}
              />
            </div>
            <div className='mb-4'> 
              <label htmlFor="confirmPassword" className="form-label fw-semibold">
                <i className="bi bi-lock-fill me-2"></i>Confirm Password
              </label>
              <input 
                type="password" 
                name='confirmPassword' 
                id="confirmPassword"
                placeholder='Confirm your password'
                value={values.confirmPassword}
                onChange={(e) => setValues({...values, confirmPassword : e.target.value})} 
                className='form-control'
                style={{ borderRadius: '10px', padding: '12px' }}
                required
                minLength={6}
              />
            </div>
            <button 
              className='btn btn-success w-100 mb-3' 
              disabled={loading}
              style={{ 
                borderRadius: '10px', 
                padding: '12px',
                fontWeight: '500',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Create Admin Account
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-muted mb-2">Already have an account?</p>
            <button 
              className="btn btn-link text-decoration-none"
              onClick={() => navigate('/adminlogin')}
              style={{ color: '#28a745' }}
            >
              <i className="bi bi-box-arrow-in-right me-1"></i>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister


