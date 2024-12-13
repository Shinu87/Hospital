import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth"; // Import your custom hook for AuthContext
import axios from "axios";
import Layout from "../components/Layout/Layout";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { Spinner } from "react-bootstrap";

const PatientList = () => {
  const [auth] = useAuth(); // Retrieve auth and setAuth from context
  const [hospitalId, setHospitalId] = useState(null); // Hospital ID will be fetched from auth context
  const [date, setDate] = useState(""); // Date input from user
  const [patients, setPatients] = useState([]); // Store patients list
  const [loading, setLoading] = useState(false); // Loading state to show loader

  useEffect(() => {
    if (auth?.user?.hospitalId) {
      setHospitalId(auth.user.hospitalId); // Assuming the hospital ID is stored in auth.user.hospital
    }
  }, [auth]);

  const handleDateChange = (e) => {
    setDate(e.target.value); // Handle date input change
  };

  const fetchPatients = async () => {
    if (!date || !hospitalId) return; // Return if date or hospitalId is missing

    setLoading(true); // Start loading

    try {
      const response = await axios.get(
        `https://hospital-backend-f4od.onrender.com/api/v1/auth/get-patients`, // Your API endpoint to get today's patients
        {
          headers: {
            hospitalid: hospitalId, // Send the hospital ID from the context
          },
          params: {
            date: date, // Send the date as a query parameter
          },
        }
      );
      setPatients(response.data.todaysPatients); // Set the patients in state
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <Layout>
      <div className="container mt-5">
        <h2 className="text-center mb-4">Patient List</h2>
        <div className="row mb-4">
          <div className="col-md-4 offset-md-2">
            <label htmlFor="date" className="form-label">
              <FaCalendarAlt className="me-2" />
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={handleDateChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={fetchPatients}
              disabled={!date}
            >
              <FaSearch className="me-2" />
              Fetch Patients
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Patient Name</th>
                <th>Phone Number</th>
                <th>Address Number</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No patients found for the selected date.
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={index}>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PatientList;
