const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff"); // Assuming you have a Staff model

// Secret key for JWT
const JWT_SECRET = "ABCDEFGHI";

// Register a new staff member
async function registerStaff(name, email, password, role) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = new Staff({ name, email, password: hashedPassword, role });
    await newStaff.save();
    return { success: true, message: "Staff registered successfully!" };
  } catch (error) {
    return {
      success: false,
      message: "Error registering staff",
      error: error.message,
    };
  }
}

// Staff login
async function loginStaff(email, password) {
  try {
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return { success: false, message: "Staff not found" };
    }
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid credentials" };
    }
    const token = jwt.sign({ id: staff._id, role: staff.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return { success: true, message: "Login successful", token };
  } catch (error) {
    return {
      success: false,
      message: "Error during login",
      error: error.message,
    };
  }
}

// Update staff details
async function updateStaffDetails(staffId, updateData) {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(staffId, updateData, {
      new: true,
    });
    if (!updatedStaff) {
      return { success: false, message: "Staff not found" };
    }
    return {
      success: true,
      message: "Staff details updated successfully",
      updatedStaff,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error updating staff details",
      error: error.message,
    };
  }
}

// Get staff by ID
async function getStaffById(staffId) {
  try {
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return { success: false, message: "Staff not found" };
    }
    return { success: true, staff };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching staff details",
      error: error.message,
    };
  }
}

// Get all staff
async function getAllStaff() {
  try {
    const staffList = await Staff.find();
    return { success: true, staffList };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching staff list",
      error: error.message,
    };
  }
}

// Delete a staff member
async function deleteStaff(staffId) {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(staffId);
    if (!deletedStaff) {
      return { success: false, message: "Staff not found" };
    }
    return { success: true, message: "Staff deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting staff",
      error: error.message,
    };
  }
}

// Staff logout (optional, can involve token blacklisting)
function logoutStaff(token) {
  try {
    // Token invalidation logic can be implemented here (e.g., store the token in a blacklist)
    return { success: true, message: "Logout successful" };
  } catch (error) {
    return {
      success: false,
      message: "Error during logout",
      error: error.message,
    };
  }
}

module.exports = {
  registerStaff,
  loginStaff,
  updateStaffDetails,
  getStaffById,
  getAllStaff,
  deleteStaff,
  logoutStaff,
};
