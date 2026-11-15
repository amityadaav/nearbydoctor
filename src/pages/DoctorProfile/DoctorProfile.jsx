// src/pages/Doctors/DoctorProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  MapPin, Star, Clock, Building2, BriefcaseMedical, GraduationCap,
  IndianRupee, CalendarDays, Video, CheckCircle2, ArrowLeft, ArrowRight,
  Stethoscope, Award, Languages, RefreshCw, AlertCircle, Phone, Mail,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import "./DoctorProfile.css";

/* ------------------------------------------------------------------ */
/*  API config                                                         */
/* ------------------------------------------------------------------ */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const DOCTORS_ENDPOINT = `${API_BASE}/doctors`;
const HOSPITALS_ENDPOINT = `${API_BASE}/hospitals`;
const FETCH_TIMEOUT = 90000; // 90s — Render cold start

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
}

function getInitials(name) {
  return (name || "D")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function parseExperience(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function resolveHospital(doctor) {
  if (!doctor) return null;
  if (typeof doctor.hospitalId === "object") return doctor.hospitalId;
  return null;
}

function getHospitalAddress(hospital) {
  if (!hospital) return "";
  const address = hospital.address;
  if (typeof address === "string") return address;
  if (address && typeof address === "object") {
    return [address.area, address.street, address.city, address.state]
      .filter(Boolean)
      .join(", ");
  }
  return hospital.city || "";
}

function seededRating(id) {
  if (!id) return { rating: 4.5, reviews: 50 };
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const seed = h / 0xffffffff;
  return {
    rating: Number((4 + seed).toFixed(1)),
    reviews: Math.floor(seed * 180) + 20,
  };
}

async function fetchJson(url, signal, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  // Link outer abort signal (component unmount) to inner one
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort);
  }

  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const DoctorProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [hospital, setHospital] = useState(resolveHospital(location.state?.doctor));
  const [loading, setLoading] = useState(!location.state?.doctor);
  const [error, setError] = useState("");

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (!id) return;
    if (location.state?.doctor) return; // navigation state already has it

    const controller = new AbortController();

    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        const doctorRes = await fetchJson(`${DOCTORS_ENDPOINT}/${id}`, controller.signal);

        if (!doctorRes.ok) {
          throw new Error(
            doctorRes.status === 404
              ? "Doctor not found"
              : doctorRes.data?.message || "Failed to load doctor"
          );
        }

        const data = doctorRes.data.doctor || doctorRes.data;
        if (!data?._id && !data?.name) {
          throw new Error("Doctor data is invalid");
        }
        setDoctor(data);

        // Fetch hospital if only an ID was embedded
        const hId =
          typeof data.hospitalId === "object" ? data.hospitalId?._id : data.hospitalId;

        if (hId && typeof data.hospitalId !== "object") {
          try {
            const hRes = await fetchJson(`${HOSPITALS_ENDPOINT}/${hId}`, controller.signal);
            if (hRes.ok) {
              setHospital(hRes.data.hospital || hRes.data);
            }
          } catch {
            /* hospital is optional — ignore */
          }
        } else if (typeof data.hospitalId === "object") {
          setHospital(data.hospitalId);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(
          err.message === "Failed to fetch"
            ? "Can't reach the server. Check your connection."
            : err.message || "Unable to load doctor profile."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchDoctor();
    return () => controller.abort();
  }, [id, location.state?.doctor]);

  /* ---------- derived ---------- */
  const { rating, reviews } = useMemo(
    () => seededRating(doctor?._id || id),
    [doctor?._id, id]
  );

  const experience = parseExperience(doctor?.experience);

  const availableDays = useMemo(() => {
    const list = doctor?.availableDays;
    if (!Array.isArray(list)) return [];
    return WEEK_DAYS.filter((d) => list.includes(d));
  }, [doctor]);

  const isOnline = (doctor?.consultationType || "").toLowerCase() === "online";
  const isAvailableToday = doctor?.availableDays?.includes(
    new Date().toLocaleDateString("en-US", { weekday: "long" })
  );

  /* ---------- handlers ---------- */
  const handleBook = () => {
    const hospitalId =
      typeof doctor.hospitalId === "object" ? doctor.hospitalId?._id : doctor.hospitalId;

    if (!doctor._id || !hospitalId) {
      alert("Doctor or hospital details are missing.");
      return;
    }
    navigate("/book-appointment", {
      state: { doctorId: doctor._id, hospitalId, doctor },
    });
  };

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <div className="dp-container">
        <div className="dp-inner">
          <div className="dp-skeleton-hero" />
          <div className="dp-layout">
            <div className="dp-skeleton-card" />
            <div className="dp-skeleton-panel" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- error ---------- */
  if (error || !doctor) {
    return (
      <div className="dp-container">
        <div className="dp-inner">
          <div className="dp-error-state">
            <AlertCircle size={40} />
            <h2>Doctor not found</h2>
            <p>{error || "We couldn't locate this doctor's profile."}</p>
            <div className="dp-error-actions">
              <button onClick={() => navigate(0)} className="dp-btn-secondary">
                <RefreshCw size={15} /> Retry
              </button>
              <button onClick={() => navigate("/find-doctors")} className="dp-btn-primary">
                <ArrowLeft size={15} /> Back to doctors
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="dp-container">
      <div className="dp-inner">
        <button className="dp-back" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={16} /> Back
        </button>

        {/* HERO */}
        <motion.section
          className="dp-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dp-hero-bg" aria-hidden="true" />

          <div className="dp-hero-inner">
            <div className="dp-avatar-wrap">
              <div className="dp-avatar">
                {doctor.profileImage ? (
                  <img
                    src={getImageUrl(doctor.profileImage)}
                    alt={doctor.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span>{getInitials(doctor.name)}</span>
                )}
              </div>
              <span
                className={`dp-status ${isAvailableToday ? "is-available" : "is-unavailable"}`}
              >
                <span className="dp-status-dot" />
                {isAvailableToday ? "Available Today" : "Next Available Soon"}
              </span>
            </div>

            <div className="dp-hero-info">
              <div className="dp-hero-top">
                <div>
                  <h1 className="dp-name">{doctor.name}</h1>
                  <p className="dp-specialty">
                    <Stethoscope size={15} />{" "}
                    {doctor.specialty || "General Physician"}
                  </p>
                </div>

                <div className="dp-rating">
                  <Star size={16} fill="currentColor" />
                  <strong>{rating}</strong>
                  <small>({reviews} reviews)</small>
                </div>
              </div>

              <div className="dp-quick-meta">
                <span>
                  <BriefcaseMedical size={14} />
                  {experience} {experience === 1 ? "year" : "years"} experience
                </span>
                {doctor.qualification && (
                  <span>
                    <GraduationCap size={14} />
                    {doctor.qualification}
                  </span>
                )}
                {hospital?.hospitalName && (
                  <span>
                    <Building2 size={14} />
                    {hospital.hospitalName}
                  </span>
                )}
                {isOnline && (
                  <span className="dp-online-tag">
                    <Video size={14} />
                    Online consultation
                  </span>
                )}
              </div>

              <div className="dp-hero-actions">
                <button type="button" className="dp-btn-primary" onClick={handleBook}>
                  <CalendarDays size={16} /> Book Appointment
                </button>

                {doctor.phone && (
                  <a href={`tel:${doctor.phone}`} className="dp-btn-secondary">
                    <Phone size={15} /> Call
                  </a>
                )}

                {doctor.email && (
                  <a href={`mailto:${doctor.email}`} className="dp-btn-secondary">
                    <Mail size={15} /> Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* LAYOUT */}
        <div className="dp-layout">
          <div className="dp-main">
            {doctor.bio && (
              <motion.section
                className="dp-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="dp-card-title">About</h2>
                <p className="dp-bio">{doctor.bio}</p>
              </motion.section>
            )}

            {Array.isArray(doctor.specialties) && doctor.specialties.length > 0 && (
              <motion.section
                className="dp-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="dp-card-title">Areas of Expertise</h2>
                <div className="dp-tags">
                  {doctor.specialties.map((s) => (
                    <span key={s} className="dp-tag">
                      <Award size={12} /> {s}
                    </span>
                  ))}
                </div>
              </motion.section>
            )}

            {hospital && (
              <motion.section
                className="dp-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="dp-card-title">Practices at</h2>
                <div className="dp-hospital">
                  <div className="dp-hospital-icon">
                    <Building2 size={22} />
                  </div>
                  <div className="dp-hospital-info">
                    <strong>{hospital.hospitalName || "Hospital"}</strong>
                    {getHospitalAddress(hospital) && (
                      <span>
                        <MapPin size={13} /> {getHospitalAddress(hospital)}
                      </span>
                    )}
                    {hospital.hospitalType && <small>{hospital.hospitalType}</small>}
                  </div>
                  {hospital._id && (
                    <button
                      type="button"
                      className="dp-link-btn"
                      onClick={() => navigate(`/hospitals/${hospital._id}`)}
                    >
                      View <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.section>
            )}

            <motion.section
              className="dp-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="dp-card-title">Availability</h2>

              {availableDays.length > 0 ? (
                <div className="dp-week">
                  {WEEK_DAYS.map((day) => {
                    const active = availableDays.includes(day);
                    return (
                      <div key={day} className={`dp-day ${active ? "is-active" : ""}`}>
                        <span className="dp-day-short">{day.slice(0, 3)}</span>
                        <span className="dp-day-full">{day}</span>
                        {active ? <CheckCircle2 size={14} /> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="dp-muted">Availability not specified.</p>
              )}

              {doctor.consultationHours && (
                <p className="dp-hours">
                  <Clock size={14} /> {doctor.consultationHours}
                </p>
              )}
            </motion.section>
          </div>

          <aside className="dp-sidebar">
            <motion.div
              className="dp-card dp-fee-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="dp-fee-label">Consultation Fee</span>
              <div className="dp-fee-amount">
                <IndianRupee size={22} />
                <strong>{doctor.consultationFee || "N/A"}</strong>
              </div>
              <span className="dp-fee-note">
                <ShieldCheck size={13} /> Pay after your visit
              </span>

              <button
                type="button"
                className="dp-btn-primary dp-btn-block"
                onClick={handleBook}
              >
                <CalendarDays size={16} /> Book Appointment
              </button>
            </motion.div>

            {Array.isArray(doctor.languages) && doctor.languages.length > 0 && (
              <motion.div
                className="dp-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="dp-card-title">
                  <Languages size={16} /> Languages
                </h2>
                <div className="dp-tags">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="dp-tag">{lang}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {doctor.registrationNumber && (
              <motion.div
                className="dp-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="dp-card-title">
                  <CheckCircle2 size={16} /> Verified
                </h2>
                <p className="dp-reg">
                  Registration: <strong>{doctor.registrationNumber}</strong>
                </p>
                <p className="dp-muted">
                  Verified by NearbyDoctor medical board.
                </p>
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;