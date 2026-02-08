import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/verify`);

        if (res.data.Status) {
          setUser({ id: res.data.id, role: res.data.role });
        } else {
          setError(res.data.Error || "Not authenticated");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${API_BASE_URL}/auth/logout`);
      localStorage.removeItem("valid");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed, please try again.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading profile…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h4 className="text-danger mb-2">Error</h4>
          <p>{error}</p>
          <button className="btn btn-secondary mt-2" onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "450px" }}>
        <h3 className="text-center mb-4">Your Profile</h3>

        <div className="mb-3">
          <strong>User ID:</strong>
          <div>{user.id}</div>
        </div>

        <div className="mb-3">
          <strong>Role:</strong>
          <div>{user.role}</div>
        </div>

        <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
