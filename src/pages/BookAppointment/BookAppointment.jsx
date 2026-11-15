// src/pages/Appointments/BookAppointment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock3, MapPin, Stethoscope, UserRound, CheckCircle2,
  Video, Building2, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight,
  BadgeCheck, Sparkles, Info, Award
} from "lucide-react";
import { motion } from "framer-motion";
import "./BookAppointment.css";

/* ------------------------------------------------------------------ */
/*  API config                                                         */
/* ------------------------------------------------------------------ */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const BOOK_TIMEOUT = 90000; // 90s — Render cold start

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:30 AM", "12:30 PM",
  "02:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
];

const getAuthToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("authToken");

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
    );
  } catch {
    return {};
  }
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = API_BASE.replace(/\/api$/, "");
  return `${origin}/${String(path).replace(/^\/+/, "")}`;
};

/* ------------------------------------------------------------------ */
/*  Fetch with timeout + abort                                         */
/* ------------------------------------------------------------------ */
async function postJSON(url, body, token, ms = BOOK_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getAuthToken();
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
          },
          message: "Please login first to book an appointment.",
        },
      });
    }
  }, [isAuthenticated, navigate, location]);

  const selectedDoctor = location.state?.doctor;
  const doctorId = location.state?.doctorId || selectedDoctor?._id;
  const hospitalId =
    location.state?.hospitalId ||
    (typeof selectedDoctor?.hospitalId === "object"
      ? selectedDoctor?.hospitalId?._id
      : selectedDoctor?.hospitalId);
  const hospitalData =
    typeof selectedDoctor?.hospitalId === "object" ? selectedDoctor.hospitalId : {};

  const doctor = {
    name: selectedDoctor?.name || "",
    specialty: selectedDoctor?.specialty || "",
    qualification: selectedDoctor?.qualification || "",
    experience: selectedDoctor?.experience ?? 0,
    hospital: hospitalData?.hospitalName || "",
    address:
      typeof hospitalData?.address === "string"
        ? hospitalData.address
        : [hospitalData?.address?.street, hospitalData?.address?.city]
            .filter(Boolean)
            .join(", "),
    fee: Number(selectedDoctor?.consultationFee ?? 0),
    image: getImageUrl(selectedDoctor?.profileImage || ""),
  };

  const storedUser = getStoredUser();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("In-Clinic");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [patientName, setPatientName] = useState(storedUser.fullname || "");
  const [patientEmail, setPatientEmail] = useState(storedUser.email || "");
  const [patientPhone, setPatientPhone] = useState(storedUser.phone || "");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + currentWeek * 7);
    const start = new Date(today);
    const day = start.getDay();
    start.setDate(start.getDate() + (day === 0 ? 1 : 1 - day));

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        value: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-"),
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        number: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        disabled: date < new Date(new Date().setHours(0, 0, 0, 0)),
      };
    });
  }, [currentWeek]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "";
    return new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  }, [selectedDate]);

  const changeWeek = (direction) => {
    const nextWeek = currentWeek + direction;
    if (nextWeek < 0 || nextWeek > 8) return;
    setCurrentWeek(nextWeek);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBookingError("");

    const activeToken = getAuthToken();
    if (!activeToken) {
      navigate("/login", { replace: true, state: { message: "Please login to continue." } });
      return;
    }

    if (!doctorId || !hospitalId) {
      setBookingError("Doctor or hospital information is missing. Please select a doctor from Find Doctors.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setBookingError("Please select an appointment date and time.");
      return;
    }
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      setBookingError("Please fill in your name, email, and phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail.trim())) {
      setBookingError("Please enter a valid email address.");
      return;
    }
    if (!/^[0-9]{10}$/.test(patientPhone)) {
      setBookingError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!Number.isFinite(doctor.fee) || doctor.fee < 0) {
      setBookingError("The doctor's consultation fee is invalid.");
      return;
    }

    const appointmentData = {
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone,
      doctorId,
      hospitalId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      appointmentType,
      reason: reason.trim(),
      consultationFee: doctor.fee,
    };

    try {
      setLoading(true);
      const { ok, status, data } = await postJSON(
        `${API_BASE}/appointments/book`,
        appointmentData,
        activeToken
      );

      if (status === 401) {
        ["token", "user", "authToken"].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        window.dispatchEvent(new Event("authChanged"));
        navigate("/login", {
          replace: true,
          state: { message: "Your session expired. Please log in again." },
        });
        return;
      }

      if (!ok) {
        const missing = data.missingFields?.length
          ? ` Missing fields: ${data.missingFields.join(", ")}`
          : "";
        throw new Error((data.message || "Failed to book appointment.") + missing);
      }

      setBookingId(data.appointment?._id || data.booking?._id || data._id || "");
      setShowConfirmation(true);
    } catch (error) {
      if (error.name === "AbortError") {
        setBookingError("Server is waking up. Please try again in a moment.");
      } else if (String(error.message).includes("Failed to fetch")) {
        setBookingError("Can't reach the server. Check your connection and try again.");
      } else {
        setBookingError(error.message || "Unable to book appointment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (!selectedDoctor || !doctorId || !hospitalId) {
    return (
      <main className="book-appointment">
        <div className="booking-empty">
          <div className="booking-empty-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Select a doctor first</h2>
          <p>You need to choose a doctor before you can book an appointment.</p>
          <button className="btn-primary" onClick={() => navigate("/find-doctors")}>
            Find Doctors <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="book-appointment">
      {/* Hero */}
      <motion.section
        className="booking-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="booking-hero-content">
          <span className="booking-eyebrow">
            <Sparkles size={11} /> Book Appointment
          </span>
          <h1>
            Your health, <span>our priority.</span>
          </h1>
          <p>
            Schedule your consultation with a trusted healthcare professional in a few simple steps.
          </p>
        </div>
        <div className="booking-trust">
          <ShieldCheck size={16} />
          <span>Secure appointment booking</span>
        </div>
      </motion.section>

      <div className="booking-layout">
        <section className="booking-main">
          {/* Doctor Card */}
          <article className="doctor-card">
            <div className="doctor-card-main">
              <div className="doctor-avatar">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} />
                ) : (
                  <UserRound size={36} />
                )}
              </div>

              <div className="doctor-info">
                <span className="doctor-specialty-badge">{doctor.specialty}</span>
                <h2>{doctor.name}</h2>
                <p className="doctor-qualification">{doctor.qualification}</p>

                <div className="doctor-meta-row">
                  {doctor.experience > 0 && (
                    <span className="doctor-meta-item">
                      <Award size={14} /> {doctor.experience} yrs exp
                    </span>
                  )}
                  <span className="doctor-meta-item doctor-verified">
                    <BadgeCheck size={14} /> Verified Doctor
                  </span>
                </div>

                {doctor.hospital && (
                  <div className="doctor-location">
                    <MapPin size={15} />
                    <span>
                      {doctor.hospital}
                      {doctor.address ? `, ${doctor.address}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="doctor-fee-box">
              <span className="fee-label">Consultation Fee</span>
              <div className="fee-amount">
                <span>₹</span>{doctor.fee}
              </div>
              <small className="fee-note">Per visit</small>
            </div>
          </article>

          <form className="booking-card" onSubmit={handleSubmit}>
            {/* DATE */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon"><CalendarDays size={18} /></div>
                <div>
                  <h3>Select Date</h3>
                  <p>Choose a convenient day for your visit.</p>
                </div>
              </div>

              <div className="week-navigation">
                <span className="week-label">
                  {dates[0].month} {dates[0].number} – {dates[6].month} {dates[6].number}
                </span>
                <div className="week-buttons">
                  <button type="button" onClick={() => changeWeek(-1)} disabled={currentWeek === 0} aria-label="Previous week">
                    <ChevronLeft size={16} />
                  </button>
                  <button type="button" onClick={() => changeWeek(1)} disabled={currentWeek === 8} aria-label="Next week">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="date-grid">
                {dates.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={item.disabled}
                    className={`date-option ${selectedDate === item.value ? "is-selected" : ""}`}
                    onClick={() => {
                      setSelectedDate(item.value);
                      setSelectedTime("");
                    }}
                  >
                    <span className="date-day">{item.day}</span>
                    <strong className="date-number">{item.number}</strong>
                    <small className="date-month">{item.month}</small>
                  </button>
                ))}
              </div>
            </section>

            {/* TIME */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon"><Clock3 size={18} /></div>
                <div>
                  <h3>Select Time</h3>
                  <p>Choose your preferred consultation slot.</p>
                </div>
              </div>

              <div className="time-grid">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-option ${selectedTime === time ? "is-selected" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    <Clock3 size={13} />
                    {time}
                  </button>
                ))}
              </div>
            </section>

            {/* TYPE */}
            <section className="booking-section">
              <div className="section-title">
                <div className="section-icon"><Stethoscope size={18} /></div>
                <div>
                  <h3>Consultation Type</h3>
                  <p>Choose how you'd like to meet your doctor.</p>
                </div>
              </div>

              <div className="appointment-type">
                <button
                  type="button"
                  className={`type-option ${appointmentType === "In-Clinic" ? "is-selected" : ""}`}
                  onClick={() => setAppointmentType("In-Clinic")}
                >
                  <div className="type-icon"><Building2 size={20} /></div>
                  <div className="type-content">
                    <strong>In-Clinic</strong>
                    <span>Visit the hospital in person.</span>
                  </div>
                  <span className="type-radio" />
                </button>

                <button
                  type="button"
                  className={`type-option ${appointmentType === "Online" ? "is-selected" : ""}`}
                  onClick={() => setAppointmentType("Online")}
                >
                  <div className="type-icon"><Video size={20} /></div>
                  <div className="type-content">
                    <strong>Online Consultation</strong>
                    <span>Consult through a video call.</span>
                  </div>
                  <span className="type-radio" />
                </button>
              </div>
            </section>

            {/* PATIENT DETAILS */}
            <section className="booking-section patient-section">
              <div className="section-title">
                <div className="section-icon"><UserRound size={18} /></div>
                <div>
                  <h3>Your Details</h3>
                  <p>Enter your contact information for the booking.</p>
                </div>
              </div>

              <div className="patient-form-grid">
                <label>
                  Full Name *
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Email Address *
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Phone Number *
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label>
                  Reason for Visit
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Regular checkup"
                  />
                </label>
              </div>
            </section>

            {bookingError && (
              <div className="booking-error" role="alert">
                <Info size={15} /> {bookingError}
              </div>
            )}

            <button type="submit" className="confirm-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" /> Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirm Appointment
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="booking-privacy">
              <ShieldCheck size={13} /> Your personal information is handled securely.
            </p>
          </form>
        </section>

        {/* SUMMARY SIDEBAR */}
        <aside className="booking-summary">
          <div className="summary-heading">
            <h3>Booking Summary</h3>
            <p>Review your appointment details</p>
          </div>

          <div className="summary-doctor">
            <div className="summary-doctor-avatar">
              {doctor.image ? <img src={doctor.image} alt="" /> : <UserRound size={20} />}
            </div>
            <div>
              <strong>{doctor.name}</strong>
              <span>{doctor.specialty}</span>
            </div>
          </div>

          <div className="summary-row">
            <CalendarDays size={16} />
            <div>
              <span>Date</span>
              <strong>{selectedDateLabel || "Not selected"}</strong>
            </div>
          </div>

          <div className="summary-row">
            <Clock3 size={16} />
            <div>
              <span>Time</span>
              <strong>{selectedTime || "Not selected"}</strong>
            </div>
          </div>

          <div className="summary-row">
            {appointmentType === "Online" ? <Video size={16} /> : <Building2 size={16} />}
            <div>
              <span>Type</span>
              <strong>{appointmentType}</strong>
            </div>
          </div>

          <div className="summary-row">
            <MapPin size={16} />
            <div>
              <span>Hospital</span>
              <strong>{doctor.hospital || "N/A"}</strong>
              {doctor.address && <small>{doctor.address}</small>}
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{doctor.fee}</strong>
          </div>

          <div className="summary-note">
            <ShieldCheck size={15} />
            <p>You'll receive a confirmation once your booking is processed.</p>
          </div>
        </aside>
      </div>

      {/* SUCCESS MODAL */}
      {showConfirmation && (
        <div className="modal-backdrop" onClick={() => setShowConfirmation(false)}>
          <motion.div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h2>Appointment Booked!</h2>
            <p>Your appointment request has been saved successfully.</p>

            <div className="success-details">
              {bookingId && <div><span>Booking ID</span><strong>#{bookingId.slice(-8)}</strong></div>}
              <div><span>Patient</span><strong>{patientName}</strong></div>
              <div><span>Doctor</span><strong>{doctor.name}</strong></div>
              <div><span>Date</span><strong>{selectedDateLabel}</strong></div>
              <div><span>Time</span><strong>{selectedTime}</strong></div>
              <div><span>Fee</span><strong>₹{doctor.fee}</strong></div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => navigate("/user/appointments")}>
                View My Appointments
              </button>
              <button className="btn-primary" onClick={() => navigate("/")}>
                Back to Home <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default BookAppointment;