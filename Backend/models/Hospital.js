import mongoose from "mongoose";
import cron from "node-cron";

// Define the hospital schema
const hospitalSchema = new mongoose.Schema(
  {
    name: {
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
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    doctorsAvailableStatus: {
      type: Boolean,
      default: false, // Tracks doctor availability
    },
    currentTokenBeingServed: {
      type: Number,
      default: 1, // Start from token 1
    },
    liveCounter: {
      type: Number,
      default: 1, // This will be the live counter shown to the users
    },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff", // Reference to the Staff model
      },
    ],
    patients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient", // Reference to the Patient model
      },
    ],
  },
  { timestamps: true }
);

// Method to generate a token for the next patient
hospitalSchema.methods.generateNextToken = function () {
  this.currentTokenBeingServed += 1;
  return this.save();
};

// Method to register a patient and assign a token
hospitalSchema.methods.registerPatient = async function (patientData) {
  const newPatient = await mongoose.model("Patient").create(patientData);
  this.patients.push(newPatient._id);
  await this.generateNextToken();
  await this.save();
  return newPatient;
};

// Method to reset the token counter and live counter at a specific time
hospitalSchema.methods.resetCounters = async function () {
  this.currentTokenBeingServed = 1; // Reset token counter
  this.liveCounter = 1; // Reset live counter
  await this.save();
};

// Function to check and reset counters at 1:05 AM (via setInterval)
// Function to reset counters at 6:00 AM (using cron)
cron.schedule("0 0 * * *", async () => {
  console.log("[Cron Job] Resetting counters at 1:50 PM...");
  try {
    const hospitals = await mongoose.model("Hospital").find();
    for (const hospital of hospitals) {
      await hospital.resetCounters();
      console.log(`[Cron Job] Counters reset for hospital: ${hospital.name}`);
    }
  } catch (error) {
    console.error("[Cron Job] Error resetting counters:", error);
  }
}, {
  timezone: "Asia/Kolkata", // Adjust this to your desired timezone (for 1:50 PM IST, use 'Asia/Kolkata')
});

// Start the check for reset at 1:05 AM

// Create the Hospital model
export default mongoose.model("Hospital", hospitalSchema, "hospitals");
