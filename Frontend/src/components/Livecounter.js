import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../context/auth";
import Layout from "../components/Layout/Layout";

const ManageCounterPage = () => {
  const [auth] = useAuth();
  const [liveCounter, setLiveCounter] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [nextPatient, setNextPatient] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for counter
  const [available, setAvailable] = useState(false); // Doctor's availability
  const [availabilityLoading, setAvailabilityLoading] = useState(false); // Loading for availability update
  const [message, setMessage] = useState(""); // Feedback for availability update

  // Fetch the live counter on page load
  const fetchLiveCounter = async () => {
    if (!auth?.user?.hospitalId) {
      toast.error("Hospital ID is missing. Please login again.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8081/api/v1/auth/get-live-counter/${auth.user.hospitalId}`
      );
      if (response.status === 200) {
        setLiveCounter(response.data.liveCounter);
        setLoading(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error fetching live counter",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCounter();
  }, []);

  // Increment counter
  const handleIncrementCounter = async () => {
    if (!auth?.user?.hospitalId) {
      toast.error("Hospital ID is missing. Please login again.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8081/api/v1/auth/increment-live-counter/${auth.user.hospitalId}`
      );
      if (response.status === 200) {
        setLiveCounter(response.data.liveCounter);
        setCurrentPatient(response.data.currentPatient);
        setNextPatient(response.data.nextPatient);
        toast.success(`Counter updated to ${response.data.liveCounter}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error incrementing counter",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  // Toggle Doctor's Availability
  const toggleAvailability = () => {
    setAvailable(!available);
  };

  // Update Doctor's Availability
  const updateAvailability = async () => {
    if (!auth?.user?.hospitalId) {
      setMessage("Hospital ID is required.");
      return;
    }

    setAvailabilityLoading(true);
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:8081/api/v1/auth/update-doctor-status",
        {
          hospitalId: auth.user.hospitalId, // Use auth's hospitalId directly
          available,
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating status.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <h2 className="text-center mb-4 text-primary">
              Manage Counter (काउंटर व्यवस्थापित करा)
            </h2>
            <div className="card shadow-lg p-4 rounded">
              {loading ? (
                <div className="text-center">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                    aria-hidden="true"
                  ></div>
                  <p>Loading counter data...</p>
                </div>
              ) : (
                <>
                  <h4 className="text-center mb-4">
                    Token Now Serving (चालू टोकन):{" "}
                    <span
                      className="badge bg-success"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {liveCounter ?? "N/A"}
                    </span>
                  </h4>

                  <div className="mb-4">
                    <h5>Patient Being Served (सेवेत असलेला रुग्ण):</h5>
                    {currentPatient ? (
                      <p>
                        <strong>Name (नाव):</strong> {currentPatient.name}{" "}
                        <br />
                        <strong>Token Number (टोकन क्रमांक):</strong>{" "}
                        {currentPatient.tokenNumber}
                      </p>
                    ) : (
                      <p className="text-muted">
                        No patient is currently being served (सध्या कोणताही
                        रुग्ण सेवेत नाही).
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h5>Next in Line (पुढील रुग्ण):</h5>
                    {nextPatient ? (
                      <p>
                        <strong>Name (नाव):</strong> {nextPatient.name} <br />
                        <strong>Token Number (टोकन क्रमांक):</strong>{" "}
                        {nextPatient.tokenNumber}
                      </p>
                    ) : (
                      <p className="text-muted">
                        No upcoming patient in the queue (रांगेत पुढील रुग्ण
                        नाही).
                      </p>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleIncrementCounter}
                    >
                      Increment Counter (काउंटर वाढवा) <FaPlus />
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Update Doctor Availability */}
            <div className="card shadow-lg p-4 rounded mt-4">
              <h3 className="text-center text-primary mb-4">
                Update Doctor Availability
              </h3>
              <div className="mb-3">
                <label htmlFor="hospitalId" className="form-label">
                  Hospital ID
                </label>
                <input
                  type="text"
                  id="hospitalId"
                  value={auth?.user?.hospitalId || ""}
                  className="form-control"
                  placeholder="Hospital ID"
                  readOnly
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Doctor's Availability</label>
                <div className="d-flex align-items-center">
                  <button
                    className={`btn ${
                      available ? "btn-success" : "btn-danger"
                    } me-3`}
                    onClick={toggleAvailability}
                  >
                    {available ? (
                      <>
                        <FaToggleOn className="me-2" />
                        Available
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="me-2" />
                        Not Available
                      </>
                    )}
                  </button>
                  <span className="text-muted">
                    Current Status: {available ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>
              <div className="d-grid">
                <button
                  className="btn btn-primary"
                  onClick={updateAvailability}
                  disabled={availabilityLoading}
                >
                  {availabilityLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
              {message && (
                <div
                  className={`alert mt-3 ${
                    message.includes("successfully")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageCounterPage;
