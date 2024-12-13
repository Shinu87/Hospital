import React, { useContext, useState, useEffect } from "react";
import { useAuth } from "../context/auth"; // Adjust the import path based on your project structure
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHospitalAlt,
  FaCalendarAlt,
  FaSpinner,
  FaHospital,
} from "react-icons/fa";
import Layout from "../components/Layout/Layout";
import axios from "axios"; // Import axios to make API requests
import { useNavigate } from "react-router-dom"; // For navigation

const ProfilePage = () => {
  const [auth] = useAuth(); // Retrieve auth and setAuth from context
  const { user, setUser } = auth; // Assuming setUser is used to update the user in context
  const [loading, setLoading] = useState(true);
  const [hospitalNames, setHospitalNames] = useState({}); // State to store hospital names for appointments
  const navigate = useNavigate(); // Use navigate for routing

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  // Fetch updated user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch updated user data from the server (e.g., via an API)
        const response = await axios.get("/api/user/profile"); // Replace with the actual endpoint
        setUser(response.data); // Assuming `setUser` is a function to update the auth context
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    if (!user) {
      fetchUserData();
    }
  }, [user, setUser]); // Re-fetch when `user` changes or is not set

  // Fetch hospital names for appointments
  useEffect(() => {
    const fetchHospitalNames = async () => {
      try {
        const names = {}; // Initialize names object
        if (user && user.appointments) {
          // Iterate over each appointment to fetch hospital names
          for (const appointment of user.appointments) {
            if (appointment.hospital) {
              const response = await axios.get(
                `https://hospital-backend-f4od.onrender.com/api/v1/auth/hospital/${appointment.hospital}`
              );
              // Add the hospital name to the names object
              names[appointment.hospital] = response.data.name;
            }
          }
          // Use a functional form of setState to ensure we don't overwrite state
          setHospitalNames((prevNames) => ({
            ...prevNames,
            ...names,
          }));
        }
      } catch (error) {
        console.error("Error fetching hospital names:", error);
      }
    };

    fetchHospitalNames();
  }, [user]); // Run effect when user object changes

  // Ensure the user object exists before rendering the profile page
  if (loading) {
    return (
      <Layout>
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
          <FaSpinner
            className="spinner-grow text-primary"
            style={{ fontSize: "2rem" }}
          />
          <h3>Loading...</h3>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center p-5">
          <h3>User data not available. Please try again later.</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container my-5 p-4 bg-white rounded shadow">
        <h1 className="text-center text-primary mb-4">Profile</h1>

        {/* User Information */}
        <div className="bg-light p-4 rounded mb-4 text-center">
          <h2 className="text-secondary">
            <FaUser className="me-2 text-info" />
            {user.name}
          </h2>
          <p className="mb-2">
            <FaEnvelope className="me-2 text-warning" />
            {user.email}
          </p>
          <p className="mb-2">
            <FaPhone className="me-2 text-success" />
            {user.phone}
          </p>
          <p className="mb-2">
            <FaHospital className="me-2 text-danger" />
            {user.hospitalId}
          </p>
          <p className="mb-2">
            <FaMapMarkerAlt className="me-2 text-danger" />
            {user.address}
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/update-profile")}
            className="btn btn-primary btn-lg"
          >
            Update Profile
          </button>
        </div>

        {/* Appointments */}
        <div className="bg-light p-4 rounded mt-5">
          <h2 className="text-secondary">Appointments</h2>
          {user.appointments && user.appointments.length > 0 ? (
            user.appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-3 my-3 border rounded bg-white shadow-sm"
              >
                <p className="mb-2">
                  <p className="mb-2">
                    <FaHospitalAlt className="me-2 text-primary" />
                    Hospital: {hospitalNames[appointment.hospital]}
                  </p>
                </p>
                <p className="mb-2">
                  <FaCalendarAlt className="me-2 text-success" />
                  Date of Booking:{" "}
                  {new Date(appointment.dateOfVisit).toLocaleString()}
                </p>
                <p className="mb-2">
                  <strong>Token Number:</strong> {appointment.tokenNumber}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {appointment.status}
                </p>
              </div>
            ))
          ) : (
            <p>No appointments available.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
