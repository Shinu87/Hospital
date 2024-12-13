import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaLock, FaEnvelope } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/v1/auth/reset-password",
        formData
      );
      if (response.status === 200) {
        toast.success(
          "Password reset successfully. You can now login with your new password."
        );
        // Clear the form after success
        setFormData({ email: "", password: "" });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error resetting password!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div>
      <h3 className="text-center">Reset Password</h3>
      <form onSubmit={handleResetPassword} className="shadow-lg p-4 rounded">
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <FaEnvelope />
            </span>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            New Password
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <FaLock />
            </span>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Reset Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
