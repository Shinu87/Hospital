import React from "react";
import { Link, NavLink } from "react-router-dom";
import { BsHospital } from "react-icons/bs"; // Hospital icon from react-icons
import { useAuth } from "../../context/auth";
import { toast } from "react-toastify";
const Header = () => {
  const [auth, setauth] = useAuth();
  const handleLogout = () => {
    setauth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
  };
  return (
    <div className="Navbar">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <BsHospital size={40} className="mr-2" style={{ color: "white" }} />{" "}
          {/* Hospital icon */}
          <Link className="navbar-brand" to="/">
            <h1 className="m-0"> ShinuCare</h1> {/* Your app's name */}{" "}
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">
                  Home
                </Link>
              </li>
              {!auth?.user ? (
                <>
                  <li className="nav-item dropdown">
                    <NavLink
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      style={{ border: "none" }}
                    >
                      Register
                    </NavLink>
                    <ul className="dropdown-menu">
                      <li>
                        <NavLink to="/register" className="dropdown-item">
                          Patient
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          onClick={handleLogout}
                          to="/register/staff"
                          className="dropdown-item"
                        >
                          Staff
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/login" className="nav-link">
                      Login
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item dropdown">
                    <NavLink
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      style={{ border: "none" }}
                    >
                      {auth?.user?.name}
                    </NavLink>
                    <ul className="dropdown-menu">
                      {/* Dashboard Navigation Item */}
                      {auth.user?.role === 1 && (
                        <li>
                          <NavLink to="/dashboard" className="dropdown-item">
                            Dashboard
                          </NavLink>
                        </li>
                      )}

                      <li>
                        <NavLink
                          onClick={handleLogout}
                          to="/login"
                          className="dropdown-item"
                        >
                          Logout
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                </>
              )}
              {auth?.user?.role === 1 && (
                <li className="nav-item">
                  <Link className="nav-link" to="/counter">
                    Counter
                  </Link>
                </li>
              )}
              {auth?.user?.role === 1 && (
                <li className="nav-item">
                  <Link className="nav-link" to="/patientlist">
                    Patients
                  </Link>
                </li>
              )}
              {auth?.user?.role === 2 && (
                <li className="nav-item">
                  <Link className="nav-link" to="/registerhospital">
                    registerhospital
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
