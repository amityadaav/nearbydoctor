import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Droplet,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  LoaderCircle,
  CalendarCheck,
} from "lucide-react";
import { bloodDonationApi } from "../../services/bloodDonationApi";
import "./BecomeDonor.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const INITIAL_FORM = {
  name: "",
  bloodGroup: "O+",
  location: "",
  city: "",
  pincode: "",
  phone: "",
  lastDonationDate: "",
  consentToContact: false,
};

const INITIAL_ELIGIBILITY = {
  age: "",
  weight: "",
  feelsWell: "",
  feverOrInfection: "",
  donationIntervalPassed: "",
  needsMedicalReview: "",
};

const TODAY = new Date().toISOString().slice(0, 10);

function getEligibilityResult(answers) {
  const complete = Object.values(answers).every((value) => value !== "");

  if (!complete) {
    return {
      type: "incomplete",
      title: "Complete all questions",
      message: "Answer all six questions to see your general screening guidance.",
    };
  }

  const age = Number(answers.age);
  const weight = Number(answers.weight);

  if (!Number.isFinite(age) || !Number.isFinite(weight) || age <= 0 || weight <= 0) {
    return {
      type: "incomplete",
      title: "Check your answers",
      message: "Enter a valid age and weight before checking again.",
    };
  }

  if (age < 18 || age > 65 || weight < 45) {
    return {
      type: "review",
      title: "You may not meet the basic criteria",
      message:
        "Common whole-blood donation criteria include age 18–65 and a minimum weight of 45 kg, but requirements can vary by donation volume and blood bank. Contact a licensed blood bank for guidance.",
    };
  }

  if (
    answers.feelsWell === "no" ||
    answers.feverOrInfection === "yes" ||
    answers.donationIntervalPassed === "no"
  ) {
    return {
      type: "wait",
      title: "Please check before donating",
      message:
        "Your answers suggest you may need to wait or be assessed by blood bank staff before donating. Do not donate while unwell.",
    };
  }

  if (
    answers.feelsWell === "unsure" ||
    answers.feverOrInfection === "unsure" ||
    answers.donationIntervalPassed === "unsure" ||
    answers.needsMedicalReview === "yes" ||
    answers.needsMedicalReview === "unsure"
  ) {
    return {
      type: "review",
      title: "Medical confirmation needed",
      message:
        "Please discuss your situation confidentially with qualified blood bank staff. This self-check cannot assess medical conditions, medications or other deferral criteria.",
    };
  }

  return {
    type: "basic",
    title: "Basic criteria appear to be met",
    message:
      "This is only preliminary guidance, not medical clearance. Blood bank staff must confirm your haemoglobin, vital signs, medical history and final eligibility.",
  };
}

function EligibilityChoice({ label, value, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`bd-eligibility-option${selected ? " selected" : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}

export default function BecomeDonor() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [eligibility, setEligibility] = useState(INITIAL_ELIGIBILITY);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const answeredCount = Object.values(eligibility).filter(
    (value) => value !== ""
  ).length;

  const eligibilityResult = getEligibilityResult(eligibility);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateEligibility = (name, value) => {
    setEligibility((previous) => ({
      ...previous,
      [name]: value,
    }));
    setEligibilityChecked(false);
  };

  const handleEligibilityCheck = () => {
    setEligibilityChecked(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.lastDonationDate && form.lastDonationDate > TODAY) {
      setError("Last donation date cannot be in the future.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        location: form.location.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        phone: form.phone.trim(),
        lastDonationDate: form.lastDonationDate || "",
      };

      const response = await bloodDonationApi.registerDonor(payload);

      setSuccess(
        response?.message ||
          "Your donor registration has been submitted for verification."
      );
      setForm(INITIAL_FORM);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bd-become-page">
      <div className="bd-become-container">
        <Link to="/blood-donation" className="bd-back-link">
          <ArrowLeft size={18} />
          Back to Blood Donation
        </Link>

        <section className="bd-become-hero">
          <div className="bd-become-hero-content">
            <span className="bd-become-eyebrow">
              <Heart size={16} />
              BE A LIFESAVER
            </span>

            <h1>Become a Blood Donor</h1>
            <p>
              Your willingness to donate could help someone in their time of
              need. Register your details to join the NearbyDoctor donor
              community.
            </p>

            <div className="bd-become-points">
              <span><CheckCircle2 size={17} /> Free registration</span>
              <span><ShieldCheck size={17} /> Privacy-conscious listing</span>
              <span><Heart size={17} /> Help your community</span>
            </div>
          </div>

          <div className="bd-become-hero-icon" aria-hidden="true">
            <Droplet size={92} fill="currentColor" />
            <Heart className="bd-become-heart" size={34} fill="currentColor" />
          </div>
        </section>

        {error && (
          <div className="bd-become-alert bd-become-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="bd-become-alert bd-become-success" role="status">
            <CheckCircle2 size={21} />
            <div>
              <strong>Registration submitted!</strong>
              <p>{success}</p>
              <span>
                Your profile will appear in the public donor directory only
                after verification.
              </span>
              <button
                type="button"
                className="bd-become-text-btn"
                onClick={() => navigate("/blood-donation")}
              >
                Explore blood donation page
              </button>
            </div>
          </div>
        )}

        <section className="bd-eligibility-card">
          <div className="bd-eligibility-heading">
            <div>
              <span className="bd-become-section-label">QUICK SELF-CHECK</span>
              <h2>Check Your Eligibility</h2>
              <p>
                Answer these questions for general guidance before registering.
                Your answers stay in this page and are not sent to the server.
              </p>
            </div>
            <div className="bd-eligibility-icon" aria-hidden="true">
              <ShieldCheck size={27} />
            </div>
          </div>

          <div className="bd-eligibility-progress">
            <div className="bd-eligibility-progress-labels">
              <span>{answeredCount} of 6 answered</span>
              <span>{Math.round((answeredCount / 6) * 100)}%</span>
            </div>
            <div
              className="bd-eligibility-progress-track"
              role="progressbar"
              aria-label="Eligibility questions completed"
              aria-valuemin={0}
              aria-valuemax={6}
              aria-valuenow={answeredCount}
            >
              <div
                className="bd-eligibility-progress-fill"
                style={{ width: `${(answeredCount / 6) * 100}%` }}
              />
            </div>
          </div>

          <div className="bd-eligibility-grid">
            <div className="bd-eligibility-question">
              <label htmlFor="eligibility-age">1. What is your age?</label>
              <input
                id="eligibility-age"
                type="number"
                min="1"
                max="120"
                inputMode="numeric"
                placeholder="Age in years"
                value={eligibility.age}
                onChange={(event) => updateEligibility("age", event.target.value)}
              />
            </div>

            <div className="bd-eligibility-question">
              <label htmlFor="eligibility-weight">2. What is your weight?</label>
              <div className="bd-eligibility-input-suffix">
                <input
                  id="eligibility-weight"
                  type="number"
                  min="1"
                  max="400"
                  inputMode="decimal"
                  placeholder="Your weight"
                  value={eligibility.weight}
                  onChange={(event) =>
                    updateEligibility("weight", event.target.value)
                  }
                />
                <span>kg</span>
              </div>
            </div>

            <div className="bd-eligibility-question">
              <label>3. Are you feeling well today?</label>
              <div className="bd-eligibility-options">
                <EligibilityChoice
                  label="Yes"
                  value="yes"
                  selected={eligibility.feelsWell === "yes"}
                  onSelect={(value) => updateEligibility("feelsWell", value)}
                />
                <EligibilityChoice
                  label="No"
                  value="no"
                  selected={eligibility.feelsWell === "no"}
                  onSelect={(value) => updateEligibility("feelsWell", value)}
                />
                <EligibilityChoice
                  label="Not sure"
                  value="unsure"
                  selected={eligibility.feelsWell === "unsure"}
                  onSelect={(value) => updateEligibility("feelsWell", value)}
                />
              </div>
            </div>

            <div className="bd-eligibility-question">
              <label>4. Do you currently have fever or an infection?</label>
              <div className="bd-eligibility-options">
                <EligibilityChoice
                  label="No"
                  value="no"
                  selected={eligibility.feverOrInfection === "no"}
                  onSelect={(value) => updateEligibility("feverOrInfection", value)}
                />
                <EligibilityChoice
                  label="Yes"
                  value="yes"
                  selected={eligibility.feverOrInfection === "yes"}
                  onSelect={(value) => updateEligibility("feverOrInfection", value)}
                />
                <EligibilityChoice
                  label="Not sure"
                  value="unsure"
                  selected={eligibility.feverOrInfection === "unsure"}
                  onSelect={(value) => updateEligibility("feverOrInfection", value)}
                />
              </div>
            </div>

            <div className="bd-eligibility-question">
              <label>
                5. Has the required interval passed since your last whole-blood
                donation?
              </label>
              <p className="bd-eligibility-hint">
                If you have never donated, select “Never donated”. If unsure,
                ask your blood bank.
              </p>
              <div className="bd-eligibility-options">
                <EligibilityChoice
                  label="Yes"
                  value="yes"
                  selected={eligibility.donationIntervalPassed === "yes"}
                  onSelect={(value) =>
                    updateEligibility("donationIntervalPassed", value)
                  }
                />
                <EligibilityChoice
                  label="No"
                  value="no"
                  selected={eligibility.donationIntervalPassed === "no"}
                  onSelect={(value) =>
                    updateEligibility("donationIntervalPassed", value)
                  }
                />
                <EligibilityChoice
                  label="Never donated"
                  value="never"
                  selected={eligibility.donationIntervalPassed === "never"}
                  onSelect={(value) =>
                    updateEligibility("donationIntervalPassed", value)
                  }
                />
                <EligibilityChoice
                  label="Not sure"
                  value="unsure"
                  selected={eligibility.donationIntervalPassed === "unsure"}
                  onSelect={(value) =>
                    updateEligibility("donationIntervalPassed", value)
                  }
                />
              </div>
            </div>

            <div className="bd-eligibility-question">
              <label>
                6. Do you have a medical condition, take medication, or have
                another circumstance that may need medical review?
              </label>
              <p className="bd-eligibility-hint">
                For example, pregnancy or recent childbirth. You do not need
                to share details here.
              </p>
              <div className="bd-eligibility-options">
                <EligibilityChoice
                  label="No"
                  value="no"
                  selected={eligibility.needsMedicalReview === "no"}
                  onSelect={(value) =>
                    updateEligibility("needsMedicalReview", value)
                  }
                />
                <EligibilityChoice
                  label="Yes"
                  value="yes"
                  selected={eligibility.needsMedicalReview === "yes"}
                  onSelect={(value) =>
                    updateEligibility("needsMedicalReview", value)
                  }
                />
                <EligibilityChoice
                  label="Not sure"
                  value="unsure"
                  selected={eligibility.needsMedicalReview === "unsure"}
                  onSelect={(value) =>
                    updateEligibility("needsMedicalReview", value)
                  }
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="bd-eligibility-check-btn"
            onClick={handleEligibilityCheck}
          >
            <ShieldCheck size={19} />
            Check My Eligibility
          </button>

          {eligibilityChecked && (
            <div
              className={`bd-eligibility-result ${eligibilityResult.type}`}
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 size={23} />
              <div>
                <h3>{eligibilityResult.title}</h3>
                <p>{eligibilityResult.message}</p>
              </div>
            </div>
          )}

          <p className="bd-eligibility-disclaimer">
            This self-check does not diagnose, medically clear or disqualify
            you. A blood bank must make the final decision after screening.
          </p>
        </section>

        <div className="bd-become-layout">
          <section className="bd-become-form-card">
            <div className="bd-become-form-heading">
              <span className="bd-become-section-label">DONOR REGISTRATION</span>
              <h2>Your Details</h2>
              <p>
                Enter accurate information so your registration can be reviewed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bd-become-form">
              <div className="bd-become-field">
                <label htmlFor="donor-name">Full name *</label>
                <input
                  id="donor-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-blood-group">Blood group *</label>
                <select
                  id="donor-blood-group"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-area">Area / locality *</label>
                <div className="bd-become-input-icon">
                  <MapPin size={18} />
                  <input
                    id="donor-area"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. BTM Layout"
                    maxLength={100}
                    autoComplete="address-line1"
                    required
                  />
                </div>
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-city">City *</label>
                <input
                  id="donor-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  maxLength={80}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-pincode">PIN code *</label>
                <input
                  id="donor-pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                />
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-phone">Contact number *</label>
                <div className="bd-become-input-icon">
                  <Phone size={18} />
                  <input
                    id="donor-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    pattern="[+]?[0-9\s-]{8,15}"
                    maxLength={15}
                    autoComplete="tel"
                    required
                  />
                </div>
                <small>
                  Your number should not be shown in the public directory.
                </small>
              </div>

              <div className="bd-become-field">
                <label htmlFor="donor-last-date">
                  Last donation date <span>(optional)</span>
                </label>
                <div className="bd-become-input-icon">
                  <CalendarCheck size={18} />
                  <input
                    id="donor-last-date"
                    name="lastDonationDate"
                    type="date"
                    value={form.lastDonationDate}
                    onChange={handleChange}
                    max={TODAY}
                  />
                </div>
              </div>

              <label className="bd-become-consent">
                <input
                  type="checkbox"
                  name="consentToContact"
                  checked={form.consentToContact}
                  onChange={handleChange}
                  required
                />
                <span>
                  I consent to being contacted about blood donation requests.
                  I understand that my contact number will remain private in
                  the public donor directory. *
                </span>
              </label>

              <button
                type="submit"
                className="bd-become-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="bd-become-spinner" size={19} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Heart size={19} />
                    Submit Donor Registration
                  </>
                )}
              </button>

              <p className="bd-become-form-note">
                Registration is not medical clearance. A qualified medical
                professional must confirm your eligibility before donation.
              </p>
            </form>
          </section>

          <aside className="bd-become-sidebar">
            <div className="bd-become-side-card">
              <div className="bd-become-side-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Your privacy matters</h3>
              <p>
                Your phone number should be stored privately and excluded from
                public donor search results.
              </p>
            </div>

            <div className="bd-become-side-card">
              <div className="bd-become-side-icon">
                <CheckCircle2 size={24} />
              </div>
              <h3>What happens next?</h3>
              <ol>
                <li>Submit your registration.</li>
                <li>Your details remain pending verification.</li>
                <li>After approval, your profile can appear in donor search.</li>
              </ol>
            </div>

            <div className="bd-become-medical-note">
              <strong>Before donating</strong>
              <p>
                Blood donation eligibility, timing between donations and
                compatibility must be assessed by qualified medical staff.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
