import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Staff from "../models/Staff.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";

/**
 * Register a new patient
 */
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new patient
    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 0, // Role for patients
    });

    await newPatient.save();
    res.status(201).json({
      message: "Patient registered successfully.",
      patient: newPatient,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering patient.", error });
  }
};

/**
 * Register a new admin (admin-only route)
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new admin
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 2, // Role for admin
    });

    await newAdmin.save();
    res
      .status(201)
      .json({ message: "Admin registered successfully.", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin.", error });
  }
};

/**
 * Register a new staff (admin-only route)
 */
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, phone, hospitalId } = req.body;

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff already exists." });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new staff
    const newStaff = new Staff({
      name,
      email,
      password: hashedPassword,
      phone,
      hospital: hospitalId,
      role: 1, // Role for staff
    });

    await newStaff.save();
    res
      .status(201)
      .json({ message: "Staff registered successfully.", staff: newStaff });
  } catch (error) {
    res.status(500).json({ message: "Error registering staff.", error });
  }
};

/**
 * Login for all users (patients, staff, admins)
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;
    if (role === 0) {
      user = await Patient.findOne({ email });
    } else if (role === 1) {
      user = await Staff.findOne({ email });
    } else if (role === 2) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error });
  }
};

/**
 * Get all hospitals (for patient registration dropdown)
 */
export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hospitals.", error });
  }
};

/**
 * Check if doctor is available (status route)
 */
export const checkDoctorAvailability = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.params;

    const hospital = await Hospital.findById(hospitalId).populate("doctors");
    const doctor = hospital?.doctors?.find(
      (doc) => doc._id.toString() === doctorId
    );

    if (!doctor) {
      return res
        .status(404)
        .json({ message: "Doctor not found in this hospital." });
    }

    res.status(200).json({ doctorId: doctor._id, available: doctor.available });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking doctor availability.", error });
  }
};

import cron from "node-cron";
import Hospital from "../models/Hospital.js";

// Daily token reset at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const hospitals = await Hospital.updateMany(
      {},
      { $set: { currentToken: 1 } }
    );
    console.log("Daily tokens reset for all hospitals.");
  } catch (error) {
    console.error("Error resetting tokens:", error);
  }
});

export const registerPatientWithToken = async (req, res) => {
  try {
    const { name, email, password, phone, address, hospitalId } = req.body;

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate new token
    const tokenNumber = hospital.currentToken;

    // Register new patient
    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      hospital: hospitalId,
      token: tokenNumber,
      role: 0, // Role for patients
    });

    // Increment token in hospital
    hospital.currentToken += 1;
    await hospital.save();

    await newPatient.save();
    res.status(201).json({
      message: "Patient registered successfully.",
      patient: newPatient,
      token: tokenNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering patient.", error });
  }
};

export const updateCurrentToken = async (req, res) => {
  try {
    const { hospitalId, currentToken } = req.body;

    // Update current token for the hospital
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { currentTokenBeingServed: currentToken },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    res.status(200).json({
      message: "Current token updated successfully.",
      currentTokenBeingServed: hospital.currentTokenBeingServed,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating current token.", error });
  }
};

export const getCurrentToken = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    res.status(200).json({
      currentTokenBeingServed: hospital.currentTokenBeingServed,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching current token.", error });
  }
};

export const updateDoctorStatus = async (req, res) => {
  try {
    const { hospitalId, doctorId, available } = req.body;

    const hospital = await Hospital.findById(hospitalId).populate("doctors");
    const doctor = hospital?.doctors?.find(
      (doc) => doc._id.toString() === doctorId
    );

    if (!doctor) {
      return res
        .status(404)
        .json({ message: "Doctor not found in this hospital." });
    }

    doctor.available = available;
    await doctor.save();

    res.status(200).json({
      message: `Doctor ${doctorId} availability updated successfully.`,
      available: doctor.available,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating doctor availability.", error });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hospitalId, dateOfVisit } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const newAppointment = {
      hospital: hospitalId,
      dateOfVisit: new Date(dateOfVisit),
    };

    patient.appointments.push(newAppointment);
    await patient.save();

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error booking appointment.", error });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { status } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    appointment.status = status;
    await patient.save();

    res.status(200).json({
      message: "Appointment status updated successfully.",
      appointment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating appointment status.", error });
  }
};

export const getAppointmentHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate(
      "appointments.hospital"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    res.status(200).json({
      message: "Appointment history retrieved successfully.",
      appointments: patient.appointments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving appointment history.", error });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.status === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot delete a completed appointment." });
    }

    appointment.remove();
    await patient.save();

    res.status(200).json({ message: "Appointment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment.", error });
  }
};
