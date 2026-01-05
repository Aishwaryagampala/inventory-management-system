import React, { useState } from "react";
import { toast } from "react-toastify";
import "../Modal.css";

const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    password: "",
    email: "",
    user_role: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("/api/user/add/user", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User added successfully:", result);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Failed to add user.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setErrorMessage("Network error. Could not add user.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Add User</h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <p
              className="error-message"
              style={{ color: "#ff4444", marginBottom: "16px" }}
            >
              {errorMessage}
            </p>
          )}

          <div className="modal-form-group">
            <label>User ID</label>
            <input
              name="user_id"
              type="text"
              placeholder="Enter user ID"
              value={formData.user_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Username</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>User Role</label>
            <select
              name="user_role"
              value={formData.user_role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-button-primary">
              Add User
            </button>
            <button
              type="button"
              className="modal-button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
