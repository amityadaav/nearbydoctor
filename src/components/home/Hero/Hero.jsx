// src/components/home/Hero.jsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play, Stethoscope, HeartPulse, Loader2 } from "lucide-react";
import "./Hero.css";
import heroImage from "../../../assets/images/HealthcareTeams.png";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const FETCH_TIMEOUT = 90000;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const formatCount = (n) => {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n === 0) return "0";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k+`;
  }
  return `${n}+`;
};

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const json = await res.json().catch(() => ({}));
    return res.ok ? json : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const Hero = () => {
  const [counts, setCounts] = useState({
    patients: null,
    doctors: null,
    hospitals: null,
  });
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    setLoading(true);

    const [doctorsData, hospitalsData] = await Promise.all([
      fetchJson(`${API_BASE}/doctors`),
      fetchJson(`${API_BASE}/hospitals`),
    ]);

    const doctorList = Array.isArray(doctorsData)
      ? doctorsData
      : doctorsData?.doctors || [];
    const hospitalList = Array.isArray(hospitalsData)
      ? hospitalsData
      : hospitalsData?.hospitals || [];

    /*
      "Patients" isn't in an endpoint you already have.
      Two honest choices:
        a) Show the number of distinct patients who have booked appointments
           → requires /api/appointments which you DO have mounted in server.js
        b) Fall back to "—" if the call fails

      We'll try /api/appointments once. If it 404s or isn't public,
      patients shows "—" and we don't lie.
    */
    let patientCount = null;
    const appointmentsData = await fetchJson(`${API_BASE}/appointments`);
    if (appointmentsData) {
      const apptList = Array.isArray(appointmentsData)
        ? appointmentsData
        : appointmentsData?.appointments || [];

      // Count distinct patient ids if present
      const ids = new Set();
      apptList.forEach((a) => {
        const id =
          a?.patientId?._id ||
          a?.patientId ||
          a?.patient?._id ||
          a?.patient ||
          a?.userId;
        if (id) ids.add(String(id));
      });
      if (ids.size > 0) patientCount = ids.size;
      else if (apptList.length > 0) patientCount = apptList.length;
    }

    setCounts({
      patients: patientCount,
      doctors: doctorList.length || null,
      hospitals: hospitalList.length || null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const actions = [
    { href: "/doctors", label: "Find a doctor", Icon: Stethoscope, variant: "primary" },
    { href: "/donate-blood", label: "Donate blood", Icon: HeartPulse, variant: "blood" },
  ];

  const stats = [
    { value: formatCount(counts.patients), label: "Patients served" },
    { value: formatCount(counts.doctors), label: "Verified doctors" },
    { value: formatCount(counts.hospitals), label: "Partner hospitals" },
  ];

  return (
    <section className="sm-hero">
      <div className="sm-stage">
        <div className="sm-panel" aria-hidden="true" />

        {/* LEFT */}
        <div className="sm-left">
          <h1 className="sm-title">
            Your Trusted
            <span className="sm-title__line">
              Healthcare<span className="sm-orb" aria-hidden="true" />Partner.
            </span>
          </h1>

          <p className="sm-tagline">
            Find trusted doctors near you, explore verified specialists,
            and book appointments effortlessly. Your health deserves
            the right care.
          </p>

          <div className="sm-actions">
            {actions.map(({ href, label, Icon, variant }) => (
              <Link
                key={label}
                to={href}
                className={`sm-action${variant ? ` sm-action--${variant}` : ""}`}
              >
                <span className="sm-action__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {label}
                {variant === "primary" && (
                  <ArrowRight size={16} aria-hidden="true" className="sm-action__arrow" />
                )}
              </Link>
            ))}
          </div>

          <div className="sm-stats">
            <div className="sm-stats__thumb">
              <button type="button" className="sm-stats__play" aria-label="Play virtual tour">
                <Play size={14} fill="currentColor" aria-hidden="true" />
              </button>
              <span className="sm-stats__tour">Virtual tour</span>
            </div>

            <dl className="sm-stats__grid" aria-live="polite">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd className="sm-stats__value">
                    {loading && s.value === "—" ? (
                      <Loader2 size={14} className="sm-spinner" aria-hidden="true" />
                    ) : (
                      s.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* CENTER */}
        <img src={heroImage} alt="Healthcare team" className="sm-person" />

        <span className="sm-chip sm-chip--1">Reliable</span>
        <span className="sm-chip sm-chip--2">Experienced</span>
        <span className="sm-chip sm-chip--3">Professional</span>

        {/* RIGHT */}
        <div className="sm-right">
          <div className="sm-right__top">
            <h2>Verified specialists, ready to see you</h2>
            <p>
              Every doctor is background-checked and reviewed by real
              patients. Pick a time, no phone calls needed.
            </p>
          </div>

          <div className="sm-right__bottom">
            <p className="sm-feedback">Every review helps us improve.</p>
            <div className="sm-right__row">
              <div className="sm-avatars" aria-hidden="true">
                <span>A</span>
                <span>R</span>
                <span>S</span>
              </div>
              <Link to="/doctors" className="sm-arrow" aria-label="Browse doctors">
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;