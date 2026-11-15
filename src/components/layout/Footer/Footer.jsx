import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUpRight,
  Stethoscope,
} from "lucide-react";

import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <div className="footer-logo-icon">
              <Stethoscope size={20} strokeWidth={2.4} />
            </div>

            <span>
              Nearby<span>Doctor</span>
            </span>
          </a>

          <p className="footer-description">
            Find trusted doctors and quality healthcare near you.
            Book appointments easily and take control of your
            healthcare journey.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Facebook size={18} />
            </a>

            <a href="#" aria-label="Instagram">
              <Instagram size={18} />
            </a>

            <a href="#" aria-label="Twitter">
              <Twitter size={18} />
            </a>

            <a href="#" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <a href="/">
                Home
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/doctors">
                Find Doctors
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/specialties">
                Specialties
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/appointments">
                Appointments
                <ArrowUpRight size={14} />
              </a>
            </li>
          </ul>
        </div>

        {/* For Clinics */}
        <div className="footer-column">
          <h3>For Clinics</h3>

          <ul>
            <li>
              <a href="/list-clinic">
                List Your Clinic
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/register-doctor">
                Register as Doctor
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/dashboard">
                Clinic Dashboard
                <ArrowUpRight size={14} />
              </a>
            </li>

            <li>
              <a href="/resources">
                Resources
                <ArrowUpRight size={14} />
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <h3>Contact Us</h3>

          <div className="contact-item">
            <div className="contact-icon">
              <MapPin size={17} />
            </div>

            <span>
              Bengaluru, Karnataka,
              <br />
              India
            </span>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <Phone size={17} />
            </div>

            <a href="tel:+919999999999">
              +91 99999 99999
            </a>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <Mail size={17} />
            </div>

            <a href="mailto:support@nearbydoctor.com">
              support@nearbydoctor.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>
            © {currentYear} NearbyDoctor. All rights reserved.
          </p>

          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <span>•</span>
            <a href="/terms">Terms of Service</a>
            <span>•</span>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;