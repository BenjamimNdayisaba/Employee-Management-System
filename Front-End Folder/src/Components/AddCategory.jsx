import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config/api.js'

const AddCategory = () => {
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)
        
        if (!category || category.trim() === '') {
            setError('Category name is required');
            return;
        }
        
        setLoading(true)
        axios.post(`${API_BASE_URL}/auth/add_category`, {category: category.trim()})
        .then(result => {
            if(result.data.Status) {
                navigate('/dashboard/category')
            } else {
                setError(result.data.Error || 'Failed to add category')
            }
        })
        .catch(err => {
            console.error('Add category error:', err);
            if (err.response) {
                setError(err.response.data?.Error || 'Server error. Please try again.');
            } else if (err.request) {
                setError('Cannot connect to server. Make sure the backend is running on port 3000.');
            } else {
                setError('Network error. Please try again.');
            }
        })
        .finally(() => {
            setLoading(false);
        })
    }
  return (
    <div className='d-flex justify-content-center align-items-center h-75'>
        <div className='p-3 rounded w-25 border'>
            <h2>Add Category</h2>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                    <label htmlFor="category"><strong>Category:</strong></label>
                    <input 
                        type="text" 
                        name='category' 
                        id="category"
                        placeholder='Enter Category'
                        value={category}
                        onChange={(e) => setCategory(e.target.value)} 
                        className='form-control rounded-0'
                        required
                    />
                </div>
                <button 
                    className='btn btn-success w-100 rounded-0 mb-2'
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Category'}
                </button>
            </form>
        </div>
    </div>
  )
}

export default AddCategory