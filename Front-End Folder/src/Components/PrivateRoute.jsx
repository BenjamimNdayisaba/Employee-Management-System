import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import API_BASE_URL from '../config/api.js'

const PrivateRoute = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.defaults.withCredentials = true
    // Verify token with server
    axios.get(`${API_BASE_URL}/verify`)
      .then(result => {
        if(result.data.Status) {
          setIsAuthenticated(true)
          localStorage.setItem("valid", "true")
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem("valid")
        }
      })
      .catch(err => {
        console.error('Auth verification error:', err)
        setIsAuthenticated(false)
        localStorage.removeItem("valid")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/" />
}

export default PrivateRoute