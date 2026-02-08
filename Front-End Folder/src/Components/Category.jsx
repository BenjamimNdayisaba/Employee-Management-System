import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config/api.js'

const Category = () => {
    const [category, setCategory] = useState([])
    const [loading, setLoading] = useState(true)
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
        .finally(() => {
            setLoading(false);
        })
    }, [])
  return (
    <div className='px-5 mt-3'>
        <div className='d-flex justify-content-center'>
            <h3>Category List</h3>
        </div>
        <Link to="/dashboard/add_category" className='btn btn-success'>Add Category</Link>
        <div className='mt-3'>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </td>
                        </tr>
                    ) : category.length === 0 ? (
                        <tr>
                            <td className="text-center">No categories found</td>
                        </tr>
                    ) : (
                        category.map(c => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

    </div>
  )
}

export default Category