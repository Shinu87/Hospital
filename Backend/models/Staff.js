import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
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
    role: {
      type: Number,
      default: 1, // 1: Staff (default), 2: Admin
      enum: [1, 2],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital", // Links staff to a specific hospital
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);
