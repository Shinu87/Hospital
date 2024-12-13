import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Staff from "../models/Staff.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "./../helpers/authHelper.js";

/**
 * Register a new patient
 */
export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new patient
    const newPatient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 0, // Role for patients
    });

    // Omit the password field from the response
    const { password: _, ...patientWithoutPassword } = newPatient.toObject();

    res.status(201).json({
      message: "Patient registered successfully.",
      patient: patientWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering patient:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

export const staffregisterPatient = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const email = `${phone}@hospital.com`;
    const password = "12345"; // Default password

    // Validate required fields
    if (!name || !phone || !address) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if patient already exists with the default email
    const existingPatient = await Patient.findOne({ phone });

    // If patient doesn't exist, create the patient account
    if (!existingPatient) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save the new patient
      const newPatient = await Patient.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 0, // Role for patients
      });

      // Omit the password field from the response
      const { password: _, ...patientWithoutPassword } = newPatient.toObject();

      res.status(201).json({
        message: "Patient account created successfully.",
        patient: patientWithoutPassword,
      });
    } else {
      // If the patient account already exists, just register them
      res.status(200).json({
        message: "Patient already exists. Proceeding with registration.",
        patient: existingPatient,
      });
    }
  } catch (error) {
    console.error("Error registering patient:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};
export const registerStaff = async (req, res) => {
  try {
    const { name, email, password, phone, hospitalId } = req.body; // hospitalId instead of hospitalName

    // Validate required fields
    if (!name || !email || !password || !phone || !hospitalId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff already exists." });
    }

    // Check if hospital exists using hospitalId (MongoDB ObjectId)
    const hospital = await Hospital.findById(hospitalId); // Search by hospitalId
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new staff
    const newStaff = await Staff.create({
      name,
      email,
      password: hashedPassword,
      phone,
      hospital: hospital._id, // Store the hospital ObjectId in the staff document
      role: 1, // Role for staff (can be updated based on your requirements)
    });

    // Log new staff details for debugging
    console.log("New Staff Created:", newStaff);

    // Add the new staff member to the hospital's staff list
    hospital.staff.push(newStaff._id);

    // Log hospital staff array before saving
    console.log("Hospital Staff Array Before Save:", hospital.staff);

    // Save the updated hospital document
    await hospital.save();

    // Log hospital after save
    console.log("Hospital After Save:", hospital);

    // Send response
    res.status(201).json({
      message: "Staff registered successfully.",
      staff: { id: newStaff._id, name: newStaff.name, email: newStaff.email },
    });
  } catch (error) {
    console.error("Error registering staff:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// patientController.js
// Controller to check if patient exists by phone number
export const checkPatientByPhone = async (req, res) => {
  const { phone } = req.params; // Retrieve phone from the URL parameter
  try {
    // Find the patient by phone number
    const patient = await Patient.findOne({ phone });

    if (patient) {
      // If the patient exists, return true
      return res.status(200).json({ exists: true });
    } else {
      // If no patient found, return false
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking patient by phone:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid phone number or password",
      });
    }

    // Check user by phone number
    const user =
      (await Patient.findOne({ phone })) ||
      (await Staff.findOne({ phone })) ||
      (await User.findOne({ phone }));

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Phone number is not registered",
      });
    }

    // Compare passwords
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }

    // Generate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Respond with user data and token
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        appointments: user.appointments,
        role: user.role,
        hospitalId: user.hospital,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

/**
 * Login for all users (patients, staff, admins)
 */
// Login for all users (patients, staff, admins)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        adddress: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    //validations
    if (!name) {
      return res.send({ error: "Name is Required" });
    }
    if (!email) {
      return res.send({ error: "Email is Required" });
    }
    if (!password) {
      return res.send({ error: "Password is Required" });
    }
    if (!phone) {
      return res.send({ error: "Phone no is Required" });
    }
    if (!address) {
      return res.send({ error: "Address is Required" });
    }
    //check user
    const exisitingUser = await User.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: true,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new User({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: 2,
    }).save();

    res.status(201).send({
      user,
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
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
  const { name, email, password, phone, address, hospitalId } = req.body;

  try {
    // Check if hospital exists and retrieve currentToken in a single call
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found." });
    }

    // Default currentToken to 1 if not set
    if (!hospital.currentToken) {
      hospital.currentToken = 1;
    }

    // Generate the token number
    const tokenNumber = hospital.currentToken;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient object with the token and hospital ID
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

    // Update hospital's currentToken atomically
    hospital.currentToken += 1;

    // Save hospital and patient in parallel to improve performance
    await Promise.all([hospital.save(), newPatient.save()]);

    // Respond with the new patient and token
    res.status(201).json({
      message: "Patient registered successfully.",
      patient: newPatient,
      token: tokenNumber,
    });
  } catch (error) {
    console.error(error);
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

// Controller to get the hospital name by ID
export const getHospitalById = async (req, res) => {
  const { hospitalId } = req.params; // Get the hospitalId from the request parameters

  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json({ name: hospital.name }); // Assuming the hospital model has a 'name' field
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
