import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignUp from "./pages/SignUp";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Profile from "./pages/Profile";
import Livecounter from "./components/Livecounter";
import Dashboard from "./pages/Dashboard";
import Registerhospital from "./pages/RegisterHospital";
import RegisterStaff from "./pages/Registerstaff";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import Patients from "./pages/Patients";
import UpdateProfile from "./pages/UpdateProfile";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/counter" element={<Livecounter />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registerhospital" element={<Registerhospital />} />
        <Route path="/register/staff" element={<RegisterStaff />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/patientlist" element={<Patients />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
      </Routes>
    </>
  );
}

export default App;
