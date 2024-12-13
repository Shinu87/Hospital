import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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
      unique: true,
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
      default: 2, // 2: Admin
      enum: [2],
    },

    // Assigned Hospitals
    assignedHospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital", // References the Hospital model
      },
    ],

    // Activity Logs
    activityLogs: [
      {
        action: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
