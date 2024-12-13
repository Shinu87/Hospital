import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Assuming your User model is in 'models/User'
import Patient from "../models/Patient.js";

export const isAdmin = async (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your JWT secret key
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has admin role
    if (user.role !== 2) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = user; // Add user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
