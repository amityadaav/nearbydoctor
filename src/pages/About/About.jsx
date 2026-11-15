import React from "react";
import {
  Search, MapPin, CalendarCheck, ShieldCheck, HeartPulse,
  Users, Stethoscope, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./About.css";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-content">
            <span className="about-badge">
              <HeartPulse size={16} />
              Trusted Healthcare Platform
            </span>

            <h1>
              Healthcare that is
              <span> closer to you.</span>
            </h1>

            <p>
              NearbyDoctor makes it easier to discover trusted doctors,
              explore specialties, and find the right healthcare
              professional near you.
            </p>

            <div className="about-hero-actions">
              <button
                type="button"
                className="about-primary-btn"
                onClick={() => navigate("/find-doctors")}
              >
                Find a Doctor
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="about-secondary-btn"
                onClick={() => navigate("/specialties")}
              >
                Explore Specialists
              </button>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="hero-card-icon">
              <Stethoscope size={30} />
            </div>

            <h3>Find the right doctor</h3>

            <p>
              Search doctors by specialty, location,
              experience and consultation preferences.
            </p>

            <div className="hero-search">
              <Search size={18} />
              <span>Search doctors...</span>
            </div>

            <div className="hero-location">
              <MapPin size={16} />
              <span>Doctors near you</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="about-section">
        <div className="container about-section-inner">
          <div className="about-section-heading">
            <span>ABOUT NEARBYDOCTOR</span>
            <h2>
              Making healthcare
              <br />
              easier to access.
            </h2>
          </div>

          <div className="about-section-content">
            <p>
              NearbyDoctor is a healthcare discovery platform built
              to simplify the way people find doctors and healthcare
              professionals.
            </p>

            <p>
              We believe finding the right doctor should be simple,
              transparent and convenient. Our platform allows users
              to discover doctors based on their specialty, location,
              experience and other preferences.
            </p>

            <p>
              Whether you need a general physician, specialist or
              healthcare professional, NearbyDoctor helps you take
              the next step toward better healthcare with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MISSION VISION ================= */}
      <section className="mission-section">
        <div className="container mission-inner">
          <div className="mission-card">
            <div className="mission-icon">
              <HeartPulse size={25} />
            </div>
            <span>OUR MISSION</span>
            <h3>Simplifying the journey to better healthcare.</h3>
            <p>
              Our mission is to make doctor discovery simple and
              accessible by connecting people with trusted healthcare
              professionals in their area.
            </p>
          </div>

          <div className="mission-card">
            <div className="mission-icon">
              <Users size={25} />
            </div>
            <span>OUR VISION</span>
            <h3>A healthcare experience built around people.</h3>
            <p>
              We envision a future where everyone can easily find
              the right healthcare professional whenever they need one.
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-section">
        <div className="container why-inner">
          <div className="why-heading">
            <span>WHY NEARBYDOCTOR</span>
            <h2>
              Healthcare discovery,
              <br />
              made simple.
            </h2>
            <p>
              Everything you need to make a more informed decision
              about your healthcare.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon"><Search size={23} /></div>
              <h3>Easy Doctor Search</h3>
              <p>
                Quickly discover doctors based on specialty,
                location and your healthcare needs.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon"><MapPin size={23} /></div>
              <h3>Find Doctors Nearby</h3>
              <p>
                Discover healthcare professionals conveniently
                located near you.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon"><ShieldCheck size={23} /></div>
              <h3>Trusted Information</h3>
              <p>
                Explore doctor profiles and information to help
                you make confident healthcare decisions.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon"><CalendarCheck size={23} /></div>
              <h3>Simple Experience</h3>
              <p>
                A clean and straightforward platform designed
                to make healthcare discovery easier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section">
        <div className="container how-inner">
          <div className="how-heading">
            <span>HOW IT WORKS</span>
            <h2>
              Find your doctor in
              <br />
              three simple steps.
            </h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <Search size={24} />
              <h3>Search</h3>
              <p>
                Search for doctors based on your specialty
                or healthcare requirement.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <MapPin size={24} />
              <h3>Compare</h3>
              <p>
                Explore doctor profiles, experience,
                specialties and locations.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <CalendarCheck size={24} />
              <h3>Connect</h3>
              <p>
                Choose the healthcare professional that
                best matches your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="about-cta-wrap">
        <div className="container">
          <div className="about-cta">
            <div>
              <span>YOUR HEALTH MATTERS</span>
              <h2>
                Find the right doctor
                <br />
                for your healthcare needs.
              </h2>
              <p>
                Start exploring trusted doctors and healthcare
                professionals near you.
              </p>
            </div>

            <button
              type="button"
              className="about-cta-btn"
              onClick={() => navigate("/find-doctors")}
            >
              Find a Doctor
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;