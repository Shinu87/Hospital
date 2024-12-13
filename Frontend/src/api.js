import axios from "axios";

// Base URL for your backend API
const API_URL = "http://localhost:8081/api/v1/auth"; // Base URL

// Function to fetch all hospitals
export const fetchAllHospitals = async () => {
  try {
    const response = await axios.get(`${API_URL}/hospitals`);
    return response.data; // This returns the data from the backend
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register/patient`, userData);
    return response.data; // This returns the response data from the backend
  } catch (error) {
    console.error("Error during signup:", error);
    throw error;
  }
};

// Function to register a new patient
export const registerPatient = async (hospitalId, patientData) => {
  try {
    const response = await axios.post(
      `${API_URL}/register-patient/${hospitalId}`,
      patientData
    );
    return response.data; // Assuming response contains tokenAssigned
  } catch (error) {
    console.error("Error registering patient:", error);
    throw error;
  }
};
