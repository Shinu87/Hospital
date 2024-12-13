import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/auth"; // Adjust the import path based on your project structure
import Layout from "../components/Layout/Layout";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"; // Import React Icons
import { Button, Form, Spinner, Alert } from "react-bootstrap"; // Import Bootstrap components

const ProfileUpdate = () => {
  const [auth] = useAuth(); // Retrieve auth from context
  const { user } = auth;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    userId: "", // Set userId from the context
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        userId: user._id || auth.user.user._id || "", // Assign userId from auth context
      });
    }
  }, [auth, user]); // Run only when auth or user changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // Reset the message before attempting to submit

    try {
      const { data } = await axios.put(
        `https://hospital-backend-f4od.onrender.com/api/v1/auth/updateprofile`,
        formData
      );
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Update Profile</h1>

        {message && (
          <Alert variant={message.includes("Error") ? "danger" : "success"}>
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <FaUser />
                </span>
              </div>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
              </div>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group controlId="phone">
            <Form.Label>Phone</Form.Label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <FaPhone />
                </span>
              </div>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Form.Group controlId="address">
            <Form.Label>Address</Form.Label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <FaMapMarkerAlt />
                </span>
              </div>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </Form.Group>

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Updating...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </Form>
      </div>
    </Layout>
  );
};

export default ProfileUpdate;
