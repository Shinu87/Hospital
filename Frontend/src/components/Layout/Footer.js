import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4" style={{ minHeight: "15vh" }}>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>About Us</h5>
            <p>
              We are committed to providing the best healthcare services and
              ensuring patient satisfaction.
            </p>
            <p className="text-italic">
              "आरोग्य म्हणजे जीवनाचा सर्वश्रेष्ठ आनंद" - Health is the greatest
              joy of life.
            </p>
          </div>
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li>
                <FaEnvelope /> <span className="text-white">Email:</span>{" "}
                shrinivasmore51@gmail.com
              </li>
              <li>
                <FaPhone /> <span className="text-white">Phone:</span>
                8766979575 | 9158712980
              </li>
              <li>
                <FaMapMarkerAlt /> <span className="text-white">Address:</span>{" "}
                Ancholi Tq.Naigaon Dist.Nanded
              </li>
            </ul>
            <div>
              <a
                href="https://www.linkedin.com/in/shrinivas-more-39a19a299?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                className="text-white me-3"
              >
                <FiLinkedin size={24} />
              </a>
              <a
                href="https://www.instagram.com/_shinu_patil_96k/profilecard/?igsh=MWFub2t3N2l1dHdtZQ=="
                className="text-white"
              >
                <FiInstagram size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12 text-center">
            <p>&copy; 2024 Hospital. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
