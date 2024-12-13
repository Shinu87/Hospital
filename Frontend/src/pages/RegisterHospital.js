import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHospital, FaMapMarkerAlt, FaPhoneAlt, FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import Layout from "../components/Layout/Layout";

const AddHospital = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8081/api/v1/auth/hospital",
        formData
      );

      if (response.status === 201) {
        const hospitalId = response.data.hospital._id;

        // Toast message with countdown
        let countdown = 3;
        const toastId = toast.success(
          `Hospital added successfully! Redirecting in ${countdown}s. Hospital ID: ${hospitalId}`,
          {
            position: "top-right",
            autoClose: false, // Prevent auto close until countdown is complete
          }
        );

        // Countdown logic
        const interval = setInterval(() => {
          countdown -= 1;
          toast.update(toastId, {
            render: `Hospital added successfully! Redirecting in ${countdown}s. Hospital ID: ${hospitalId}`,
          });

          if (countdown === 0) {
            clearInterval(interval);
            toast.dismiss(toastId); // Close the toast
            setTimeout(() => navigate("/"), 500); // Redirect after toast is closed
          }
        }, 1000);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add hospital. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
    setLoading(false);
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h2 className="text-center mb-4">Add New Hospital</h2>
            <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded">
              {/* Hospital Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Hospital Name
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaHospital />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter hospital name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="mb-4">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaMapMarkerAlt />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    placeholder="Enter hospital address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Contact Number Field */}
              <div className="mb-4">
                <label htmlFor="contactNumber" className="form-label">
                  Contact Number
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaPhoneAlt />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    pattern="^[0-9]{10}$"
                    title="Contact number must be 10 digits long"
                    maxlength="10"
                    minlength="10"
                    aria-describedby="contactNumberHelp"
                  />
                  <div id="contactNumberHelp" className="form-text">
                    Please enter a valid 10-digit contact number.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Adding Hospital..." : "Add Hospital"} <FaPlus />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddHospital;
