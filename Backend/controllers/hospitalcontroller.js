import Hospital from "../models/Hospital.js";

// Add a new hospital
async function addHospital(name, address, contactNumber) {
  try {
    const newHospital = new Hospital({ name, address, contactNumber });
    await newHospital.save();
    return {
      success: true,
      message: "Hospital added successfully",
      hospital: newHospital,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error adding hospital",
      error: error.message,
    };
  }
}

// Get hospital by ID
async function getHospitalById(hospitalId) {
  try {
    const hospital = await Hospital.findById(hospitalId)
      .populate("staff")
      .populate("patients");
    if (!hospital) {
      return { success: false, message: "Hospital not found" };
    }
    return { success: true, hospital };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching hospital",
      error: error.message,
    };
  }
}

// Get all hospitals
async function getAllHospitals() {
  try {
    const hospitals = await Hospital.find()
      .populate("staff")
      .populate("patients");
    return { success: true, hospitals };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching hospitals",
      error: error.message,
    };
  }
}

// Update hospital details
async function updateHospitalDetails(hospitalId, updateData) {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updateData,
      { new: true }
    );
    if (!updatedHospital) {
      return { success: false, message: "Hospital not found" };
    }
    return {
      success: true,
      message: "Hospital details updated successfully",
      updatedHospital,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating hospital details",
      error: error.message,
    };
  }
}

// Delete a hospital
async function deleteHospital(hospitalId) {
  try {
    const deletedHospital = await Hospital.findByIdAndDelete(hospitalId);
    if (!deletedHospital) {
      return { success: false, message: "Hospital not found" };
    }
    return { success: true, message: "Hospital deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting hospital",
      error: error.message,
    };
  }
}

// Check and update doctor availability status
async function updateDoctorAvailability(hospitalId, status) {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { doctorsAvailable: status },
      { new: true }
    );
    if (!updatedHospital) {
      return { success: false, message: "Hospital not found" };
    }
    return {
      success: true,
      message: "Doctor availability status updated",
      updatedHospital,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating doctor availability",
      error: error.message,
    };
  }
}

// Add staff to a hospital
async function addStaffToHospital(hospitalId, staffId) {
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return { success: false, message: "Hospital not found" };
    }
    if (!hospital.staff.includes(staffId)) {
      hospital.staff.push(staffId);
      await hospital.save();
    }
    return {
      success: true,
      message: "Staff added to hospital successfully",
      hospital,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error adding staff to hospital",
      error: error.message,
    };
  }
}

// Add patient to a hospital
async function addPatientToHospital(hospitalId, patientId) {
  try {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return { success: false, message: "Hospital not found" };
    }
    if (!hospital.patients.includes(patientId)) {
      hospital.patients.push(patientId);
      await hospital.save();
    }
    return {
      success: true,
      message: "Patient added to hospital successfully",
      hospital,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error adding patient to hospital",
      error: error.message,
    };
  }
}

export {
  addHospital,
  getHospitalById,
  getAllHospitals,
  updateHospitalDetails,
  deleteHospital,
  updateDoctorAvailability,
  addStaffToHospital,
  addPatientToHospital,
};
