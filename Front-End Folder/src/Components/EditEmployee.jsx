import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../config/api.js'

const EditEmployee = () => {
    const {id} = useParams()
    const [employee, setEmployee] = useState({
        name: "",
        email: "",
        salary: "",
        address: "",
        category_id: "",
      });
      const [category, setCategory] = useState([])
      const [loading, setLoading] = useState(true)
      const [submitting, setSubmitting] = useState(false)
      const [error, setError] = useState(null)
      const navigate = useNavigate()
      axios.defaults.withCredentials = true;

      useEffect(()=> {
        axios.get(`${API_BASE_URL}/auth/category`)
        .then(result => {
            if(result.data.Status) {
                setCategory(result.data.Result);
            } else {
                alert(result.data.Error)
            }
        }).catch(err => {
            console.error('Error fetching categories:', err);
            alert('Failed to load categories');
        })

        axios.get(`${API_BASE_URL}/auth/employee/${id}`)
        .then(result => {
            if(result.data.Status && result.data.Result.length > 0) {
                setEmployee({
                    name: result.data.Result[0].name,
                    email: result.data.Result[0].email,
                    address: result.data.Result[0].address,
                    salary: result.data.Result[0].salary,
                    category_id: result.data.Result[0].category_id,
                })
            }
        }).catch(err => {
            console.error('Error fetching employee:', err);
            alert('Failed to load employee data');
        })
        .finally(() => {
            setLoading(false);
        })
    }, [id])

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)
        
        // Validation
        if (!employee.name || !employee.email || !employee.salary || !employee.category_id) {
            setError('All required fields must be filled');
            return;
        }
        
        if (isNaN(employee.salary) || parseFloat(employee.salary) < 0) {
            setError('Salary must be a valid positive number');
            return;
        }
        
        setSubmitting(true)
        axios.put(`${API_BASE_URL}/auth/edit_employee/${id}`, employee)
        .then(result => {
            if(result.data.Status) {
                navigate('/dashboard/employee')
            } else {
                setError(result.data.Error || 'Failed to update employee')
            }
        })        .catch(err => {
            console.error('Update error:', err);
            if (err.response) {
                setError(err.response.data?.Error || 'Server error. Please try again.');
            } else if (err.request) {
                setError('Cannot connect to server. Make sure the backend is running on port 3000.');
            } else {
                setError('Network error. Please try again.');
            }
        })
        .finally(() => {
            setSubmitting(false);
        })
    }
    
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center">Edit Employee</h3>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputName" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputName"
              placeholder="Enter Name"
              value={employee.name}
              onChange={(e) =>
                setEmployee({ ...employee, name: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputEmail4" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-0"
              id="inputEmail4"
              placeholder="Enter Email"
              autoComplete="off"
              value={employee.email}
              onChange={(e) =>
                setEmployee({ ...employee, email: e.target.value })
              }
            />
          </div>
          <div className='col-12'>
            <label htmlFor="inputSalary" className="form-label">
              Salary
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputSalary"
              placeholder="Enter Salary"
              autoComplete="off"
              value={employee.salary}
              onChange={(e) =>
                setEmployee({ ...employee, salary: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputAddress" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputAddress"
              placeholder="1234 Main St"
              autoComplete="off"
              value={employee.address}
              onChange={(e) =>
                setEmployee({ ...employee, address: e.target.value })
              }
            />
          </div>
          <div className="col-12">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select name="category" id="category" className="form-select"
                onChange={(e) => setEmployee({...employee, category_id: e.target.value})}
                value={employee.category_id}>
              {category.map((c) => {
                return <option key={c.id} value={c.id}>{c.name}</option>;
              })}
            </select>
          </div>
          
          <div className="col-12">
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? 'Updating...' : 'Edit Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEmployee