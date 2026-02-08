import React from "react";
import { useOutletContext } from "react-router-dom";
import API_BASE_URL from "../config/api.js";

const EmployeeProfile = () => {
  const { employee } = useOutletContext();

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white text-center">
              <h4 className="mb-0">My Profile</h4>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                {employee.image && (
                  <img
                    src={`${API_BASE_URL}/Images/${employee.image}`}
                    alt={employee.name}
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                    }}
                  />
                )}
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Name:</strong>
                </div>
                <div className="col-sm-8">{employee.name}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Email:</strong>
                </div>
                <div className="col-sm-8">{employee.email}</div>
              </div>

              <div className="row mb-3">
                <div className="col-sm-4">
                  <strong>Salary:</strong>
                </div>
                <div className="col-sm-8">¥{employee.salary || "0"}</div>
              </div>

              {employee.address && (
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Address:</strong>
                  </div>
                  <div className="col-sm-8">{employee.address}</div>
                </div>
              )}

              <div className="text-center mt-4">
                <button className="btn btn-primary">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;


