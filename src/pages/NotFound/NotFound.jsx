// src/pages/NotFound.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Home,
  ArrowLeft,
  Search,
  HeartPulse,
} from "lucide-react";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <div className="nf-glow nf-glow--1" aria-hidden="true" />
      <div className="nf-glow nf-glow--2" aria-hidden="true" />

      <div className="nf-card">
        <div className="nf-brand">
          <div className="nf-brand-icon">
            <Stethoscope size={18} />
          </div>
          <span>NearbyDoctor</span>
        </div>

        <div className="nf-illustration" aria-hidden="true">
          <div className="nf-pulse-ring nf-pulse-ring--1" />
          <div className="nf-pulse-ring nf-pulse-ring--2" />
          <div className="nf-pulse-core">
            <HeartPulse size={44} strokeWidth={1.6} />
          </div>
          <span className="nf-code">404</span>
        </div>

        <h1 className="nf-title">Page not found</h1>
        <p className="nf-subtitle">
          The page you're looking for may have been moved, renamed, or is
          temporarily unavailable. Let's get you back on track.
        </p>

        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn--primary">
            <Home size={16} /> Go to Home
          </Link>
          <button
            type="button"
            className="nf-btn nf-btn--ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <div className="nf-suggestions">
          <span className="nf-suggestions__label">
            <Search size={13} /> Try these instead
          </span>
          <div className="nf-links">
            <Link to="/find-doctors">Find doctors</Link>
            <Link to="/hospitals">Browse hospitals</Link>
            <Link to="/specialties">Specialties</Link>
            <Link to="/donate-blood">Donate blood</Link>
          </div>
        </div>
      </div>

      <p className="nf-footer">
        Need help? <a href="mailto:support@nearbydoctor.in">Contact support</a>
      </p>
    </div>
  );
}

export default NotFound;