import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout/Layout";
import "../App.css"; // Import custom CSS for additional styling
import {
  FaHospital,
  FaPhone,
  FaMapMarkerAlt,
  FaUserMd,
  FaTicketAlt,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "../context/auth"; // Import the useAuth hook

const HomePage = () => {
  const [auth] = useAuth(); // Access the auth context
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const { user } = auth; // Extract user data (name, phone, etc.) from auth

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [patientData, setPatientData] = useState({
    name: user?.name || "", // Pre-populate with name from auth
    age: "",
    phone: user?.phone || "", // Pre-populate with phone from auth
    address: "", // Add an address field for staff
  });
  const [tokenNumber, setTokenNumber] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientAccountCreated, setPatientAccountCreated] = useState(false);

  const isAdmin = user?.role === 1; // Check if the user is an admin (role 1)

  // Fetch hospital list
  useEffect(() => {
    const fetchHospitals = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "https://hospital-backend-f4od.onrender.com/api/v1/auth/hospitals"
        );
        setHospitals(response.data);
      } catch (error) {
        console.error("Failed to load hospitals:", error);
        alert("Failed to load hospitals. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Check if a patient account exists
  const checkPatientAccountExists = async () => {
    try {
      const response = await axios.get(
        `https://hospital-backend-f4od.onrender.com/api/v1/auth/check-patient/${patientData.phone}`
      );
      return response.data.exists; // This would return a boolean indicating if the patient exists
    } catch (error) {
      console.error("Failed to check if patient exists:", error);
      alert("Error checking patient account.");
      return false;
    }
  };

  // Create patient account
  const createPatientAccount = async () => {
    try {
      const response = await axios.post(
        "https://hospital-backend-f4od.onrender.com/api/v1/auth/register/staff/patient", // API endpoint for creating a patient account
        patientData
      );
      setPatientAccountCreated(true); // Indicate that the account was created
      alert("Patient account created successfully.");
    } catch (error) {
      console.error("Failed to create patient account:", error);
      alert("Failed to create patient account. Please try again later.");
    }
  };

  // Register patient after account creation
  const handleRegisterPatient = async (hospitalId) => {
    // Convert age to a number
    const patientDataWithValidAge = {
      ...patientData,
      age: parseInt(patientData.age, 10),
    };

    try {
      // Check if the account exists
      const accountExists = await checkPatientAccountExists();

      if (!accountExists) {
        // If account does not exist, create it first
        await createPatientAccount();
      }

      // Now, proceed to register the patient after account creation
      const response = await axios.post(
        `https://hospital-backend-f4od.onrender.com/api/v1/auth/register-patient/${hospitalId}`,
        patientDataWithValidAge
      );
      setTokenNumber(response.data.tokenAssigned);
      setIsDialogOpen(true); // Open dialog after successful registration
    } catch (error) {
      console.error("Failed to register patient:", error);
      alert("Failed to register. Please try again later.");
    }
  };

  const handleRegisterPatient1 = async (hospitalId) => {
    // Convert age to a number
    const patientDataWithValidAge = {
      ...patientData,
      age: parseInt(patientData.age, 10),
    };

    try {
      // Check if the account exists

      // Now, proceed to register the patient after account creation
      const response = await axios.post(
        `https://hospital-backend-f4od.onrender.com/api/v1/auth/register-patient/${hospitalId}`,
        patientDataWithValidAge
      );
      setTokenNumber(response.data.tokenAssigned);
      setIsDialogOpen(true); // Open dialog after successful registration
    } catch (error) {
      console.error("Failed to register patient:", error);
      alert("Failed to register. Please try again later.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Layout>
      <div
        className="alert alert-info text-center"
        role="alert"
        style={{ fontWeight: "bolder", fontSize: "1.2rem", color: "red" }}
      >
        Want to add your hospital to the list? Contact the admin for more
        details.
      </div>
      <div
        className="alert alert-info text-center"
        role="alert"
        style={{ fontWeight: "bold", fontSize: "1.0rem", color: "BlaCk" }}
      >
        Login to register for token
      </div>
      <div className="mb-2 text-danger font-weight-bold"></div>
      <div className="container mt-4">
        <h1
          className="text-center mb-4"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          <FaHospital className="me-2" /> Hospital List
        </h1>
        {isLoading ? (
          <div className="text-center">
            <FaSpinner className="spinner" />
            <p>Loading hospitals...</p>
          </div>
        ) : (
          <div className="row">
            {hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                <div className="col-md-6 col-lg-4 mb-4" key={hospital._id}>
                  <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                      <h5 className="card-title">
                        <FaHospital className="me-2" />
                        {hospital.name}
                      </h5>
                    </div>
                    <div className="card-body">
                      <p>
                        <FaMapMarkerAlt className="me-2 text-danger" />
                        {hospital.address}
                      </p>
                      <p>
                        <FaUserMd className="me-2 text-success" />
                        Doctor Status:{" "}
                        {hospital.doctorsAvailableStatus ? (
                          <span className="text-success font-weight-bold">
                            Available
                          </span>
                        ) : (
                          <span className="text-danger font-weight-bold">
                            Not Available
                          </span>
                        )}
                      </p>
                      <p>
                        <FaTicketAlt className="me-2 text-primary" />
                        Current Token: <strong>{hospital.liveCounter}</strong>
                      </p>
                      <p>
                        <FaPhone className="me-2 text-info" />
                        Contact: {hospital.contactNumber}
                      </p>
                    </div>
                    <div className="card-footer text-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedHospital(hospital._id);
                          setIsDialogOpen(true); // Open dialog for registration
                        }}
                      >
                        <FaUserPlus className="me-2" />
                        Register and Get Token
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-warning text-center" role="alert">
                  No hospitals available.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Patient Registration */}
      {auth.user?.role == 1 && isDialogOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register Patient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDialogOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!patientAccountCreated) {
                      // If patient account is not created, create it first
                      createPatientAccount();
                    } else {
                      // If account is created, proceed with registration
                      handleRegisterPatient(selectedHospital);
                    }
                  }}
                >
                  {isAdmin && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Name:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={patientData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone Number:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={patientData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  )}
                  {/* Staff can only update address */}
                  {user?.role === 1 && (
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Address:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={patientData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">
                      Enter 1 to Confirm
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      name="age"
                      value={patientData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary me-2">
                      {patientAccountCreated ? "Register" : "Create Account"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                {tokenNumber && (
                  <div className="mt-3 alert alert-success" role="alert">
                    Your Token Number: <strong>{tokenNumber}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {auth.user?.role == 0 && isDialogOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register Patient</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsDialogOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegisterPatient1(selectedHospital);
                  }}
                >
                  {
                    <>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Name:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={patientData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone Number:
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={patientData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </>
                  }
                  {/* Staff can only update address */}
                  {user?.role === 1 && (
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Address:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={patientData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">
                      Enter 1 to Confirm
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      name="age"
                      value={patientData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary me-2">
                      Register
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                {tokenNumber && (
                  <div className="mt-3 alert alert-success" role="alert">
                    Your Token Number: <strong>{tokenNumber}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
