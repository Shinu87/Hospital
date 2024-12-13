import Patient from "../models/Patient.js";
import Hospital from "../models/Hospital.js";

// Create an appointment for a patient
export const createAppointment = async (req, res) => {
  try {
    const { patientId, hospitalId, dateOfVisit } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const tokenNumber = patient.appointments.length + 1;

    const appointment = {
      hospital: hospitalId,
      dateOfVisit,
      tokenNumber,
      status: "Waiting",
    };

    patient.appointments.push(appointment);
    await patient.save();

    res
      .status(201)
      .json({ message: "Appointment created successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all appointments of a patient
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate(
      "appointments.hospital"
    );
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ appointments: patient.appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { patientId, appointmentId, status } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await patient.save();

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.remove();
    await patient.save();

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all appointments for a specific hospital
export const getAppointmentsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const patients = await Patient.find({
      "appointments.hospital": hospitalId,
    }).populate("appointments.hospital");

    const appointments = [];
    patients.forEach((patient) => {
      const filteredAppointments = patient.appointments.filter(
        (appointment) => String(appointment.hospital) === hospitalId
      );
      appointments.push(
        ...filteredAppointments.map((app) => ({ ...app.toObject(), patient }))
      );
    });

    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
