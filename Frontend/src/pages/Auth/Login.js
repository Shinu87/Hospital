import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPhoneAlt, FaLock, FaSignInAlt } from "react-icons/fa";
import Layout from "../../components/Layout/Layout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/auth";

const LoginPage = () => {
  const [auth, setauth] = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/api/v1/auth/login",
        formData
      );
      if (response) {
        setauth({
          ...auth,
          user: response.data.user,
          token: response.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(response.data));
      }
      if (response.status === 200) {
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => navigate("/"), 3000); // Redirect after showing toast
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid phone number or password!",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center mb-4">Login</h2>
            <form
              onSubmit={handleSubmit}
              className="shadow-lg p-4 rounded bg-white"
            >
              {/* Phone Number Field */}
              <div className="mb-4">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <FaPhoneAlt />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button type="submit" className="btn btn-primary">
                  Login <FaSignInAlt />
                </button>
              </div>

              {/* Link to Register Page */}
              <div className="text-center mt-3">
                <p>
                  Don&apos;t have an account?{" "}
                  <a href="/register" className="text-primary">
                    Register here
                  </a>
                </p>
              </div>

              {/* Link to Forgot Password */}
              <div className="text-center mt-3">
                <p>
                  Forgot your password?{" "}
                  <a href="/forgot-password" className="text-primary">
                    Click here to reset
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
