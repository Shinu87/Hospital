import express from "express";
import mongoose from "mongoose";
import moment from "moment-timezone";
import bcrypt from "bcrypt";

import {
  registerPatient,
  registerAdmin,
  registerStaff,
  login,
  registerPatientWithToken,
  updateCurrentToken,
  getCurrentToken,
  updateDoctorStatus,
  bookAppointment,
  updateAppointmentStatus,
  getAppointmentHistory,
  deleteAppointment,
  staffregisterPatient,
  checkPatientByPhone,
  getHospitalById,
} from "../controllers/authController.js";

import {
  addHospital,
  updateHospitalDetails,
  deleteHospital,
  updateDoctorAvailability,
  addStaffToHospital,
  addPatientToHospital,
} from "../controllers/hospitalcontroller.js";

import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js"; // Assuming the Patient model is in the models folder
import { isAdmin } from "../middlewares/isadmin.js"; // Import the isAdmin middleware

const router = express.Router();

// Register patient route with hospital ID
router.post("/register-patient/:hospitalId", async (req, res) => {
  const { hospitalId } = req.params; // Extract hospitalId from URL params
  const { name, age, phone } = req.body; // Extract name and age from request body

  try {
    // Ensure the hospitalId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    // Find the hospital by ID
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Find the patient using phone number
    const patient = await Patient.findOne({ phone });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update patient details (name and age only in this case)
    // patient.name = name || patient.name;
    // patient.age = age || patient.age;

    // Save updated patient information
    await patient.save();

    // Check if the patient is already registered with this hospital
    const existingAppointment = patient.appointments.find(
      (appointment) => appointment.hospital.toString() === hospitalId
    );

    // if (existingAppointment) {
    //   return res
    //     .status(400)
    //     .json({ message: "Patient already registered at this hospital" });
    // }

    // Assign a token number (increment it from the hospital's currentTokenBeingServed)
    const tokenAssigned = hospital.currentTokenBeingServed;

    // Increment the hospital's token number for the next patient
    hospital.currentTokenBeingServed += 1;
    await hospital.save();

    // Create a new appointment for the patient at the hospital
    const appointment = {
      patientName: name,
      hospital: hospitalId,
      dateOfVisit: new Date(),
      tokenNumber: tokenAssigned,
      status: "Waiting",
    };

    // Add the new appointment to the patient's appointments array
    patient.appointments.push(appointment);
    await patient.save();

    // Return the success response with patient and token information
    res.status(201).json({
      message: "Appointment registered successfully",
      patient: patient,
      tokenAssigned: tokenAssigned,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-live-counter/:hospitalId", async (req, res) => {
  const { hospitalId } = req.params;

  try {
    // Ensure hospital ID is valid
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    // Find the hospital by ID
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Send the current live counter
    res.status(200).json({
      liveCounter: hospital.liveCounter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Route to increment live counter for hospitals
router.post("/increment-live-counter/:hospitalId", async (req, res) => {
  const { hospitalId } = req.params;

  try {
    // Ensure hospital ID is valid
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    // Find hospital by ID
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Increment the live counter
    hospital.liveCounter += 1;
    await hospital.save();

    // Current token served (the previous token)
    const tokenNumberServed = hospital.liveCounter - 1;

    // Get today's date in Indian Time Zone (Asia/Kolkata)
    const today = moment()
      .tz("Asia/Kolkata")
      .startOf("day")
      .format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"); // Get today's date in UTC format

    // Find the patient whose appointment is with the current token number and today's date
    const currentPatient = await Patient.findOne({
      "appointments.tokenNumber": tokenNumberServed,
      "appointments.dateOfVisit": {
        $gte: today, // Ensure it's today's date
        $lt: moment(today).add(1, "days").format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"), // Ensure it's before tomorrow
      },
    });

    // If the current patient is found, mark the appointment as completed
    if (currentPatient) {
      const currentAppointment = currentPatient.appointments.find(
        (appointment) => appointment.tokenNumber === tokenNumberServed
      );

      if (currentAppointment) {
        currentAppointment.status = "Completed";
        await currentPatient.save();
      }
    }

    // Find the next patient with the next token number (liveCounter)
    const nextPatient = await Patient.findOne({
      "appointments.tokenNumber": hospital.liveCounter,
      "appointments.dateOfVisit": {
        $gte: today,
        $lt: moment(today).add(1, "days").format("YYYY-MM-DD[T]HH:mm:ss.SSSZ"),
      },
    });

    // Prepare response data
    const response = {
      message: `Live counter updated to ${hospital.liveCounter}`,
      liveCounter: hospital.liveCounter,
      currentPatient: currentPatient
        ? {
            id: currentPatient._id,
            name: currentPatient.appointments.find(
              (appointment) => appointment.tokenNumber === tokenNumberServed
            )?.patientName, // Access patientName from appointments array for the matching tokenNumber
            tokenNumber: tokenNumberServed,
          }
        : null,
      nextPatient: nextPatient
        ? {
            id: nextPatient._id,
            name: nextPatient.appointments.find(
              (appointment) => appointment.tokenNumber === hospital.liveCounter
            )?.patientName, // Access patientName from appointments array for the matching tokenNumber
            tokenNumber: hospital.liveCounter,
          }
        : null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch today's patients
router.get("/get-todays-patients", async (req, res) => {
  try {
    const hospitalId = req.headers.hospitalid; // Get hospitalId from the headers
    if (!hospitalId) {
      return res.status(400).json({ message: "Hospital ID is required" });
    }

    const hospitalIdObjectId = new mongoose.Types.ObjectId(hospitalId); // Correct way to create ObjectId

    // Get today's date in Indian Time Zone (Asia/Kolkata) and convert to UTC format
    const today = moment().tz("Asia/Kolkata").startOf("day").toISOString(); // Start of today in UTC (ISO format)
    const tomorrow = moment(today).add(1, "day").toISOString(); // Start of tomorrow (next day's midnight)

    // Find all patients with appointments for the given hospitalId and today's date
    const patients = await Patient.find({
      "appointments.hospital": hospitalIdObjectId, // Use the ObjectId here
      "appointments.dateOfVisit": { $gte: today, $lt: tomorrow }, // Ensure the appointment date is today
    });

    // Filter and map the response to get patients with today's token numbers
    const todaysPatients = patients
      .map((patient) => {
        const todaysAppointments = patient.appointments.filter(
          (appointment) =>
            appointment.hospital.toString() === hospitalId &&
            new Date(appointment.dateOfVisit).toISOString() >= today &&
            new Date(appointment.dateOfVisit).toISOString() < tomorrow
        );
        return todaysAppointments.map((appointment) => ({
          patientId: patient._id,
          name: appointment.patientName,
          tokenNumber: appointment.tokenNumber,
          status: appointment.status,
        }));
      })
      .flat(); // Flatten the array of arrays

    res.status(200).json({
      hospitalId,
      todaysPatients,
    });
  } catch (error) {
    console.error("Error fetching today's patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register routes
router.get("/check-patient/:phone", checkPatientByPhone);
router.post("/register/patient", registerPatient); // Register a new patient
router.post("/register/staff/patient", staffregisterPatient); // Register a new patient
router.post("/register/admin", registerAdmin); // Register a new admin
router.post("/register/staff", registerStaff); // Register a new staff
router.post("/register/patient/token", registerPatientWithToken); // Register patient with token

// Login route
router.post("/login", login); // Login for all users (patients, staff, admins)

// Hospital-related routes
const getAllHospitals = async (req, res) => {
  try {
    // Fetch all hospitals from the database
    const hospitals = await Hospital.find();
    if (!hospitals || hospitals.length === 0) {
      return res.status(404).json({ message: "No hospitals found" });
    }

    // Return the list of hospitals
    res.status(200).json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
router.get("/hospitals", getAllHospitals); // Get all hospitals for patient registration
router.delete("/hospital/:hospitalId", deleteHospital); // Delete a hospital
router.put("/update-doctor-status", async (req, res) => {
  try {
    const { hospitalId, available } = req.body;

    // Find the hospital by ID
    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    // Update the doctor's availability status
    hospital.doctorsAvailableStatus = available;

    // Save the hospital document with the updated availability status
    await hospital.save();

    res.status(200).json({
      message: `Doctor's availability updated successfully.`,
      available: hospital.doctorsAvailableStatus,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating doctor availability.",
      error: error.message,
    });
  }
});
// Appointment-related routes
router.post("/patient/:patientId/appointment", bookAppointment); // Book an appointment for a patient
router.put(
  "/patient/:patientId/appointment/:appointmentId/status",
  updateAppointmentStatus
); // Update appointment status
router.get("/patient/:patientId/appointments", getAppointmentHistory); // Get appointment history for a patient
router.delete(
  "/patient/:patientId/appointment/:appointmentId",
  deleteAppointment
); // Delete an appointment

// Token-related routes
router.put("/hospital/update-token", updateCurrentToken); // Update current token being served
router.get("/hospital/:hospitalId/current-token", getCurrentToken); // Get current token being served

// Doctor-related routes
router.put("/hospital/:hospitalId/doctor/:doctorId/status", updateDoctorStatus); // Update doctor status (availability)

// Add staff to hospital
router.post("/hospital/:hospitalId/add-staff", addStaffToHospital); // Add staff to hospital
router.post("/hospital/:hospitalId/add-patient", addPatientToHospital); // Add patient to hospital

// Add a new hospital with admin check
router.post("/hospital", isAdmin, async (req, res) => {
  const { name, address, contactNumber } = req.body;

  try {
    const newHospital = new Hospital({
      name,
      address,
      contactNumber,
    });

    await newHospital.save();

    res.status(201).json({
      success: true,
      message: "Hospital added successfully",
      hospital: newHospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add hospital",
    });
  }
});

// Admin login route
import { loginAdmin } from "../controllers/authController.js";
import Staff from "../models/Staff.js";
import User from "../models/User.js";
router.post("/admin/register", registerAdmin); // Admin sign-up
router.post("/admin/login", loginAdmin); // Admin login

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found!" });
    }

    // Email exists, respond with success
    return res
      .status(200)
      .json({ message: "Email verified. Proceed to reset your password." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// Route for resetting the password
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Request Body:", req.body);

    // Check if both fields are provided
    if (!email || !password) {
      console.error("Email or password missing.");
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check if the user exists
    const user = await Patient.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(404).json({ message: "Email not found!" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

router.get("/get-patients", async (req, res) => {
  try {
    const hospitalId = req.headers.hospitalid; // Get hospitalId from the headers
    const date = req.query.date; // Get date from the query params

    if (!hospitalId || !date) {
      return res
        .status(400)
        .json({ message: "Hospital ID and date are required" });
    }

    // Get today's date in the required format (start of the day)
    const startDate = moment(date).startOf("day").toISOString();
    const endDate = moment(date).endOf("day").toISOString();

    // Find patients with appointments for the given date and hospitalId
    const patients = await Patient.find({
      "appointments.hospital": hospitalId,
      "appointments.dateOfVisit": {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Format and send the response with today's patients
    const todaysPatients = patients
      .map((patient) => {
        return patient.appointments
          .filter(
            (appointment) =>
              new Date(appointment.dateOfVisit).toISOString() >= startDate &&
              new Date(appointment.dateOfVisit).toISOString() < endDate
          )
          .map((appointment) => ({
            patientId: patient._id,
            name: appointment.patientName,
            phone: patient.phone,
            address: patient.address,
          }));
      })
      .flat();

    res.status(200).json({
      hospitalId,
      todaysPatients,
    });
  } catch (error) {
    console.error("Error fetching today's patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/updateprofile", async (req, res) => {
  try {
    const { name, email, phone, address, userId } = req.body;

    // Validate input
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update user
    const updatedUser = await Patient.findByIdAndUpdate(
      userId,
      { name, email, phone, address },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/updateprofile", async (req, res) => {
  try {
    const { name, email, phone, address, userId } = req.body;

    // Validate input
    if (!name || !email || !phone || !address || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Update the user profile in the database
    const updatedUser =
      (await Patient.findByIdAndUpdate(
        userId,
        { name, email, phone, address },
        { new: true }
      )) ||
      (await Staff.findByIdAndUpdate(
        userId,
        { name, email, phone, address },
        { new: true }
      )) ||
      (await User.findByIdAndUpdate(
        userId,
        { name, email, phone, address },
        { new: true }
      ));

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/hospital/:hospitalId", getHospitalById);

export default router;
