import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Basic Account Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique across all users
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Role Management
    role: {
      type: Number,
      default: 0, // 0: Patient, 1: Staff, 2: Admin
      enum: [0, 1, 2],
    },

    // Appointment Information
    appointments: [
      {
        hospital: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hospital", // References the Hospital model
          required: true,
        },
        dateOfVisit: {
          type: Date,
          required: true,
        },
        tokenNumber: {
          type: Number,
          default: null, // Assigned upon appointment registration
        },
        status: {
          type: String,
          enum: ["Waiting", "In Consultation", "Completed"],
          default: "Waiting",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
