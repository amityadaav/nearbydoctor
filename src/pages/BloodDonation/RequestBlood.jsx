// src/pages/BloodDonation/RequestBlood.jsx
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Droplet, AlertCircle, ArrowRight, ArrowLeft, UserRound,
  Building2, MapPin, Phone, Mail, Clock, FileText,
  CheckCircle2, ShieldCheck, HeartPulse, Zap,
} from "lucide-react";
import { bloodApi } from "../../services/bloodApi";
import "./RequestBlood.css";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = [
  { value: "normal",   label: "Normal",   desc: "Within 24 hours",         Icon: Clock,       tone: "calm"   },
  { value: "urgent",   label: "Urgent",   desc: "Within 6 hours",          Icon: AlertCircle, tone: "warn"   },
  { value: "critical", label: "Critical", desc: "Immediate · 1–2 hours",   Icon: Zap,         tone: "danger" },
];
const CITIES = [
  "Bengaluru", "Mumbai", "Delhi", "Chennai",
  "Hyderabad", "Pune", "Kochi", "Kolkata",
];

const groupColorClass = (group = "") => {
  if (group.startsWith("O")) return "bgs-o";
  if (group.startsWith("A")) return "bgs-a";
  if (group.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

const EMPTY_FORM = {
  bloodGroup: "",
  units: 1,
  urgency: "normal",
  patientName: "",
  patientAge: "",
  patientGender: "",
  hospitalName: "",
  city: "",
  address: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  reason: "",
  notes: "",
  consent: false,
};

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */
function validate(form) {
  const errors = {};
  if (!form.bloodGroup) errors.bloodGroup = "Select the required blood group.";
  if (!Number.isFinite(Number(form.units)) || Number(form.units) < 1) {
    errors.units = "Enter at least 1 unit.";
  }
  if (Number(form.units) > 10) errors.units = "Maximum 10 units per request.";
  if (!form.patientName.trim()) errors.patientName = "Patient name is required.";
  if (form.patientAge && (Number(form.patientAge) < 0 || Number(form.patientAge) > 120)) {
    errors.patientAge = "Enter a valid age (0–120).";
  }
  if (!form.hospitalName.trim()) errors.hospitalName = "Hospital name is required.";
  if (!form.city) errors.city = "Select a city.";
  if (!form.contactName.trim()) errors.contactName = "Contact name is required.";
  if (!form.contactPhone.trim() || !/^[+\d][\d\s-]{7,}$/.test(form.contactPhone)) {
    errors.contactPhone = "Enter a valid phone number.";
  }
  if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
    errors.contactEmail = "Enter a valid email address.";
  }
  if (!form.consent) errors.consent = "Please confirm the information is accurate.";
  return errors;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function RequestBlood({ onSubmitted, onCancel, defaultValues = {} }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...defaultValues });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const formRef = useRef(null);

  /* ---------------------- Field change ---------------------- */
  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /* ---------------------- Submit ---------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = formRef.current?.querySelector(`[name="${firstKey}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      /* Build payload matching backend bloodRequestRoutes */
      const payload = {
        bloodGroup: form.bloodGroup,
        units: Number(form.units),
        urgency: form.urgency,
        patientName: form.patientName.trim(),
        patientAge: form.patientAge ? Number(form.patientAge) : null,
        patientGender: form.patientGender || null,
        hospitalName: form.hospitalName.trim(),
        city: form.city,
        address: form.address.trim() || null,
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim() || null,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      };

      /* Real API call — POST /api/blood-requests */
      const response = await bloodApi.createRequest(payload);

      onSubmitted?.({
        ...payload,
        requestId: response?.requestId || response?._id || response?.id || null,
        submittedAt: response?.submittedAt || response?.createdAt || new Date().toISOString(),
      });
    } catch (err) {
      setSubmitError(err?.message || "Couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = useMemo(() => Object.keys(errors).length, [errors]);

  return (
    <section className="rb-section" aria-labelledby="rb-heading">
      {/* ---------- Header ---------- */}
      <header className="rb-header">
        <div>
          <span className="rb-eyebrow">
            <Droplet size={12} /> New blood request
          </span>
          <h1 id="rb-heading" className="rb-title">
            Request blood
          </h1>
          <p className="rb-subtitle">
            Submit a request in under a minute. We&rsquo;ll instantly notify
            every matching donor near the hospital.
          </p>
        </div>
      </header>

      {submitError && (
        <div className="rb-alert rb-alert--error" role="alert">
          <AlertCircle size={15} /> <span>{submitError}</span>
        </div>
      )}
      {errorCount > 0 && (
        <div className="rb-alert rb-alert--warn" role="alert">
          <AlertCircle size={15} />
          <span>
            {errorCount} field{errorCount > 1 ? "s" : ""} need
            {errorCount === 1 ? "s" : ""} attention — see below.
          </span>
        </div>
      )}

      <form ref={formRef} className="rb-form" onSubmit={handleSubmit} noValidate>
        {/* ---------- Section 1: Blood requirement ---------- */}
        <fieldset className="rb-group">
          <legend className="rb-group__title">
            <span className="rb-step">1</span> Blood requirement
          </legend>

          {/* Blood group chips */}
          <div className="rb-field">
            <label className="rb-label">
              <Droplet size={12} /> Blood group <span className="rb-req">*</span>
            </label>
            <div className={`rb-chips${errors.bloodGroup ? " is-invalid" : ""}`}>
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`rb-chip ${groupColorClass(g)}${form.bloodGroup === g ? " is-active" : ""}`}
                  onClick={() => setField("bloodGroup", g)}
                  aria-pressed={form.bloodGroup === g}
                >
                  {g}
                </button>
              ))}
            </div>
            <input type="hidden" name="bloodGroup" value={form.bloodGroup} readOnly />
            {errors.bloodGroup && <small className="rb-error">{errors.bloodGroup}</small>}
          </div>

          {/* Units + urgency */}
          <div className="rb-row">
            <div className="rb-field">
              <label htmlFor="units" className="rb-label">
                Units required <span className="rb-req">*</span>
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min="1"
                max="10"
                value={form.units}
                onChange={(e) => setField("units", e.target.value)}
                className={`rb-input${errors.units ? " is-invalid" : ""}`}
              />
              {errors.units && <small className="rb-error">{errors.units}</small>}
            </div>

            <div className="rb-field rb-field--grow">
              <label className="rb-label">
                <Clock size={12} /> Urgency <span className="rb-req">*</span>
              </label>
              <div className="rb-urgency" role="radiogroup" aria-label="Urgency level">
                {URGENCY_LEVELS.map(({ value, label, desc, Icon, tone }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={form.urgency === value}
                    className={`rb-urgency__btn rb-urgency--${tone}${form.urgency === value ? " is-active" : ""}`}
                    onClick={() => setField("urgency", value)}
                  >
                    <Icon size={15} />
                    <span>
                      <strong>{label}</strong>
                      <small>{desc}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        {/* ---------- Section 2: Patient ---------- */}
        <fieldset className="rb-group">
          <legend className="rb-group__title">
            <span className="rb-step">2</span> Patient details
          </legend>

          <div className="rb-row rb-row--3">
            <div className="rb-field">
              <label htmlFor="patientName" className="rb-label">
                <UserRound size={12} /> Patient name <span className="rb-req">*</span>
              </label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                value={form.patientName}
                onChange={(e) => setField("patientName", e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className={`rb-input${errors.patientName ? " is-invalid" : ""}`}
              />
              {errors.patientName && <small className="rb-error">{errors.patientName}</small>}
            </div>

            <div className="rb-field">
              <label htmlFor="patientAge" className="rb-label">Age</label>
              <input
                id="patientAge"
                name="patientAge"
                type="number"
                min="0"
                max="120"
                value={form.patientAge}
                onChange={(e) => setField("patientAge", e.target.value)}
                placeholder="Years"
                className={`rb-input${errors.patientAge ? " is-invalid" : ""}`}
              />
              {errors.patientAge && <small className="rb-error">{errors.patientAge}</small>}
            </div>

            <div className="rb-field">
              <label htmlFor="patientGender" className="rb-label">Gender</label>
              <select
                id="patientGender"
                name="patientGender"
                value={form.patientGender}
                onChange={(e) => setField("patientGender", e.target.value)}
                className="rb-select"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="rb-field">
            <label htmlFor="reason" className="rb-label">
              <HeartPulse size={12} /> Reason (optional)
            </label>
            <input
              id="reason"
              name="reason"
              type="text"
              value={form.reason}
              onChange={(e) => setField("reason", e.target.value)}
              placeholder="e.g. Surgery, accident, anaemia, thalassaemia…"
              className="rb-input"
            />
          </div>
        </fieldset>

        {/* ---------- Section 3: Hospital / location ---------- */}
        <fieldset className="rb-group">
          <legend className="rb-group__title">
            <span className="rb-step">3</span> Hospital &amp; location
          </legend>

          <div className="rb-row">
            <div className="rb-field rb-field--grow">
              <label htmlFor="hospitalName" className="rb-label">
                <Building2 size={12} /> Hospital name <span className="rb-req">*</span>
              </label>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                value={form.hospitalName}
                onChange={(e) => setField("hospitalName", e.target.value)}
                placeholder="e.g. Apollo Hospital"
                className={`rb-input${errors.hospitalName ? " is-invalid" : ""}`}
              />
              {errors.hospitalName && <small className="rb-error">{errors.hospitalName}</small>}
            </div>

            <div className="rb-field">
              <label htmlFor="city" className="rb-label">
                <MapPin size={12} /> City <span className="rb-req">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                className={`rb-select${errors.city ? " is-invalid" : ""}`}
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <small className="rb-error">{errors.city}</small>}
            </div>
          </div>

          <div className="rb-field">
            <label htmlFor="address" className="rb-label">Address / landmark</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Street, ward number, landmark"
              className="rb-input"
            />
          </div>
        </fieldset>

        {/* ---------- Section 4: Contact ---------- */}
        <fieldset className="rb-group">
          <legend className="rb-group__title">
            <span className="rb-step">4</span> Contact details
          </legend>

          <div className="rb-row rb-row--3">
            <div className="rb-field">
              <label htmlFor="contactName" className="rb-label">
                Contact name <span className="rb-req">*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                value={form.contactName}
                onChange={(e) => setField("contactName", e.target.value)}
                placeholder="Full name"
                className={`rb-input${errors.contactName ? " is-invalid" : ""}`}
              />
              {errors.contactName && <small className="rb-error">{errors.contactName}</small>}
            </div>

            <div className="rb-field">
              <label htmlFor="contactPhone" className="rb-label">
                <Phone size={12} /> Phone <span className="rb-req">*</span>
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
                placeholder="+91 98450 12345"
                className={`rb-input${errors.contactPhone ? " is-invalid" : ""}`}
              />
              {errors.contactPhone && <small className="rb-error">{errors.contactPhone}</small>}
            </div>

            <div className="rb-field">
              <label htmlFor="contactEmail" className="rb-label">
                <Mail size={12} /> Email (optional)
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                placeholder="you@example.com"
                className={`rb-input${errors.contactEmail ? " is-invalid" : ""}`}
              />
              {errors.contactEmail && <small className="rb-error">{errors.contactEmail}</small>}
            </div>
          </div>

          <div className="rb-field">
            <label htmlFor="notes" className="rb-label">
              <FileText size={12} /> Additional notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Blood type compatibility, doctor reference, etc."
              className="rb-textarea"
            />
          </div>
        </fieldset>

        {/* ---------- Consent ---------- */}
        <label className={`rb-consent${errors.consent ? " is-invalid" : ""}`}>
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={(e) => setField("consent", e.target.checked)}
          />
          <span className="rb-consent__box" aria-hidden="true">
            <CheckCircle2 size={14} />
          </span>
          <span>
            I confirm the details above are accurate and that I&rsquo;m
            authorised to submit this request on behalf of the patient.
          </span>
        </label>
        {errors.consent && <small className="rb-error">{errors.consent}</small>}

        {/* ---------- Submit row ---------- */}
        <div className="rb-actions">
          {onCancel && (
            <button type="button" className="rb-btn rb-btn--ghost" onClick={onCancel}>
              <ArrowLeft size={15} /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="rb-btn rb-btn--primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="rb-spinner" aria-hidden="true" />
                Submitting…
              </>
            ) : (
              <>
                <ShieldCheck size={15} /> Submit request
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        <p className="rb-foot">
          <ShieldCheck size={12} />
          Your data is encrypted and only shared with matching donors and
          verified blood banks.
        </p>
      </form>
    </section>
  );
}

export default RequestBlood;