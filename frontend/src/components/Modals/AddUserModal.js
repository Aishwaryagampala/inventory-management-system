// src/components/Modals/AddUserModal.js
import React, { useState } from "react";

const AddUserModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    password: "",
    email: "",
    user_role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/add/user", {
        method: "POST",
        credentials: "include", // ✅ send cookies for auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("User added successfully");
        onClose();
      } else {
        const error = await response.json();
        alert(`Error adding user: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <input
          name="user_id"
          placeholder="User ID"
          onChange={handleChange}
          required
        />
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <select name="user_role" onChange={handleChange} required>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
        <button type="submit">Add User</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddUserModal;
