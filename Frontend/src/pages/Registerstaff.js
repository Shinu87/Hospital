import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout/Layout";

const RegisterStaff = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    hospitalId: "", // Changed to hospitalId
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "https://hospital-backend-f4od.onrender.com/api/v1/auth/register/staff",
        formData
      );
      setLoading(false);
      setSuccessMessage(response.data.message);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title text-center mb-4">
                  Register New Staff
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter staff name"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter staff email"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter staff password"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter staff phone number"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="hospitalId">Hospital ID</label>
                    <input
                      type="text"
                      id="hospitalId"
                      name="hospitalId" // Changed from hospitalName to hospitalId
                      className="form-control"
                      value={formData.hospitalId}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter hospital ID (MongoDB ObjectId)"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register Staff"}
                  </button>
                </form>

                {errorMessage && (
                  <div className="alert alert-danger mt-3">{errorMessage}</div>
                )}
                {successMessage && (
                  <div className="alert alert-success mt-3">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterStaff;
