import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope } from "react-icons/fa";

const EmailVerification = ({ onEmailVerified }) => {
  const [email, setEmail] = useState("");

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/v1/auth/verify-email",
        { email }
      );
      if (response.status === 200) {
        toast.success("Email verified. Proceed to reset your password.");
        onEmailVerified(email); // Pass the verified email to the parent component
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Email not found in the database!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div>
      <h3 className="text-center">Forgot Password</h3>
      <form onSubmit={handleVerifyEmail} className="shadow-lg p-4 rounded">
        {/* Email Field */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Enter your email
          </label>
          <div className="input-group">
            <span className="input-group-text">
              <FaEnvelope />
            </span>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Verify Email
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailVerification;
