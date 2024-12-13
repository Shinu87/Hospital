import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
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
      unique: true,
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
        patientName: {
          type: String,
          trim: true, // Trim whitespace from the name
          default: "none", // Default value if no patient name is provided
        },
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

// Explicitly specify the collection name in lowercase
export default mongoose.model("Patient", patientSchema, "patients");
