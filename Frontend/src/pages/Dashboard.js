import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSpinner, FaUser, FaCalendarCheck } from "react-icons/fa";
import { useAuth } from "../context/auth";
import Layout from "../components/Layout/Layout";
import { Alert, Table, Spinner, Container, Badge, Card } from "react-bootstrap"; // Import Bootstrap components

const TodaysPatients = () => {
  const [auth] = useAuth(); // Retrieve auth and setAuth from context
  const { user } = auth;
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return; // If no user is logged in, do not fetch data

    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch patients using the hospitalId from authUser
        const response = await axios.get(
          "http://localhost:8081/api/v1/auth/get-todays-patients",
          {
            headers: {
              hospitalid: user.hospitalId, // Get hospitalId from authUser context
            },
          }
        );
        setPatients(response.data.todaysPatients);
      } catch (err) {
        setError("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]); // Rerun this effect when authUser changes

  return (
    <Layout>
      <Container className="py-4">
        <Card className="shadow mb-4">
          <Card.Body>
            <Card.Title className="text-center text-primary mb-3">
              <FaCalendarCheck className="me-2" />
              Today's Patients
            </Card.Title>

            {loading ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            ) : (
              <>
                {patients.length > 0 ? (
                  <Table striped bordered hover responsive className="mt-3">
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>
                          <FaUser className="me-1" />
                          Patient Name
                        </th>
                        <th>
                          <FaCalendarCheck className="me-1" />
                          Token Number
                        </th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient, index) => (
                        <tr key={patient.patientId}>
                          <td>{index + 1}</td>
                          <td>{patient.name}</td>
                          <td>
                            <Badge bg="info">{patient.tokenNumber}</Badge>
                          </td>
                          <td>
                            <Badge
                              bg={
                                patient.status.toLowerCase() === "completed"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {patient.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info" className="text-center">
                    No patients for today.
                  </Alert>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  );
};

export default TodaysPatients;
