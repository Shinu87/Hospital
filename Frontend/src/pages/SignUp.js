import React, { useState } from "react";
import { signup } from "../api"; // Importing the signup API function

const SignUp = () => {
  // State hooks for form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = { name, email, password, phone, address };

    try {
      const response = await signup(user); // Call the signup API
      if (response.status === 201) {
        // Handle successful signup (e.g., redirect to login page)
        console.log("Signup successful:", response.data);
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            pattern="^[0-9]{10}$"
            title="Phone number must be 10 digits long"
            maxlength="10"
            minlength="10"
            aria-describedby="phoneHelp"
          />
          <div id="phoneHelp" className="form-text">
            Please enter a valid 10-digit phone number.
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
