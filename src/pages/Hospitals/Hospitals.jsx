// src/pages/Hospitals/Hospitals.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, Phone, ArrowRight, ChevronDown, Building2,
  ShieldCheck, Stethoscope, X, ArrowUpDown, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import "./Hospitals.css";

/* ------------------------------------------------------------------ */
/*  API config                                                         */
/* ------------------------------------------------------------------ */
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");
const API_ROOT = API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
const HOSPITALS_ENDPOINT = `${API_ROOT}/hospitals`;
const FETCH_TIMEOUT = 90000; // 90s — Render cold start

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const getImageUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
};

const normalize = (value = "") =>
  String(value).toLowerCase().replace(/[\s_-]/g, "");

async function fetchJson(url, signal, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

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

const CATEGORIES = [
  { label: "All Hospitals", value: "all" },
  { label: "Multi-specialty", value: "multispecialty" },
  { label: "General", value: "general" },
  { label: "Specialty", value: "specialty" },
];

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */
const SkeletonCard = () => (
  <div className="hp-card-skeleton">
    <div className="hp-skeleton-image" />
    <div className="hp-skeleton-content">
      <div className="hp-skeleton-line hp-skeleton-long" />
      <div className="hp-skeleton-line hp-skeleton-medium" />
      <div className="hp-skeleton-line hp-skeleton-short" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHospitals = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const { ok, status, data } = await fetchJson(HOSPITALS_ENDPOINT, signal);

      if (!ok) {
        throw new Error(
          data?.message ||
          (status === 404
            ? "Hospitals endpoint not found."
            : `Could not load hospitals (${status}).`)
        );
      }

      const list = Array.isArray(data) ? data : data.hospitals ?? data.data ?? [];

      setHospitals(
        list.map((hospital) => {
          const locationParts = [
            hospital.address?.area,
            hospital.address?.city,
            hospital.address?.state,
          ]
            .filter(Boolean)
            .filter((v, i, arr) => arr.indexOf(v) === i);

          return {
            ...hospital,
            id: hospital._id || hospital.id,
            name: hospital.hospitalName || hospital.name || "Hospital",
            type: hospital.hospitalType || hospital.type || "",
            location:
              locationParts.length > 0
                ? locationParts.join(", ")
                : "Location not provided",
            phone: hospital.phone || "",
            image: getImageUrl(
              hospital.logo || hospital.images?.[0] || hospital.image
            ),
            specialties: Array.isArray(hospital.specialties)
              ? hospital.specialties.filter(Boolean)
              : [],
            emergencyAvailable: hospital.emergencyAvailable === true,
            createdAt: hospital.createdAt || "",
          };
        })
      );
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        String(err.message).includes("Failed to fetch")
          ? "Can't reach the server. Check your connection and try again."
          : err.message || "Something went wrong."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchHospitals(controller.signal);
    return () => controller.abort();
  }, [fetchHospitals]);

  const handleRetry = () => {
    const controller = new AbortController();
    fetchHospitals(controller.signal);
  };

  const filteredHospitals = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = hospitals.filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(term) ||
        (hospital.location || "").toLowerCase().includes(term) ||
        (hospital.type || "").toLowerCase().includes(term) ||
        hospital.specialties.some((item) =>
          String(item).toLowerCase().includes(term)
        );

      const type = normalize(hospital.type);
      const isMulti = type.includes("multi") || type.includes("multispecial");
      const matchesCategory =
        category === "all" ||
        (category === "multispecialty" && isMulti) ||
        (category === "general" && type.includes("general")) ||
        (category === "specialty" && !isMulti && !type.includes("general"));

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "emergency") {
      result.sort(
        (a, b) => Number(b.emergencyAvailable) - Number(a.emergencyAvailable)
      );
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [hospitals, search, category, sortBy]);

  const handleViewDetails = (hospital) => {
    navigate(`/hospitals/${hospital.id}`, {
      state: { hospital },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
  };

  const hasFilters = Boolean(search.trim()) || category !== "all";

  return (
    <main className="hp-page-container">
      {/* HERO */}
      <motion.section
        className="hp-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="hp-hero-glow" aria-hidden="true" />

        <div className="hp-hero-content">
          <span className="hp-eyebrow">
            <Sparkles size={11} /> Healthcare Directory
          </span>
          <h1>
            Find care that's <span>closer to you.</span>
          </h1>
          <p>
            Explore verified hospitals, check services, and contact the right care team.
          </p>

          <form className="hp-search" onSubmit={(e) => e.preventDefault()}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by hospital name, location or specialty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search hospitals"
            />
            {search && (
              <button
                type="button"
                className="hp-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        <div className="hp-hero-stats">
          <div className="hp-hero-stat">
            <Building2 size={20} className="hp-hero-stat-icon" />
            <div>
              <strong>{loading ? "…" : hospitals.length}</strong>
              <span>Hospitals</span>
            </div>
          </div>
          <div className="hp-hero-stat">
            <ShieldCheck size={20} className="hp-hero-stat-icon" />
            <div>
              <strong>
                {hospitals.filter((h) => h.emergencyAvailable).length}
              </strong>
              <span>24/7 Emergency</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* TOOLBAR */}
      <section className="hp-toolbar">
        <div className="hp-toolbar-location">
          <div className="hp-toolbar-location-icon">
            <MapPin size={18} />
          </div>
          <div>
            <small>Browse</small>
            <strong>Hospitals near you</strong>
          </div>
          <ChevronDown size={15} className="hp-toolbar-chevron" />
        </div>

        <div className="hp-toolbar-categories">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              className={category === item.value ? "is-active" : ""}
              onClick={() => setCategory(item.value)}
              aria-pressed={category === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS */}
      <section className="hp-results">
        <div className="hp-results-header">
          <div>
            <span className="hp-results-kicker">Discover Care</span>
            <h2>Available hospitals</h2>
            <p aria-live="polite">
              {loading
                ? "Finding hospitals…"
                : `${filteredHospitals.length} ${
                    filteredHospitals.length === 1 ? "hospital" : "hospitals"
                  } found`}
            </p>
          </div>

          <label className="hp-sort">
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort hospitals"
            >
              <option value="newest">Recently added</option>
              <option value="name">Name (A-Z)</option>
              <option value="emergency">Emergency first</option>
            </select>
          </label>
        </div>

        {hasFilters && !loading && !error && (
          <div className="hp-active-filters">
            <span className="hp-active-label">Active:</span>
            {search && (
              <button className="hp-chip" onClick={() => setSearch("")}>
                "{search}" <X size={11} />
              </button>
            )}
            {category !== "all" && (
              <button className="hp-chip" onClick={() => setCategory("all")}>
                {CATEGORIES.find((c) => c.value === category)?.label}{" "}
                <X size={11} />
              </button>
            )}
            <button className="hp-chip-clear" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}

        {loading && (
          <div className="hp-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="hp-state hp-state-error">
            <div className="hp-state-icon">
              <X size={28} />
            </div>
            <h3>Unable to load hospitals</h3>
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredHospitals.length === 0 && (
          <div className="hp-state">
            <div className="hp-state-icon">
              <Search size={26} />
            </div>
            <h3>No hospitals found</h3>
            <p>
              {hasFilters
                ? "Try adjusting your search or filters."
                : "There are no hospitals registered yet."}
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredHospitals.length > 0 && (
          <div className="hp-grid">
            {filteredHospitals.map((hospital, index) => (
              <motion.article
                className="hp-card"
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.04, 0.4),
                }}
                onClick={() => handleViewDetails(hospital)}
                style={{ cursor: "pointer" }}
              >
                <div className="hp-card-image">
                  {hospital.image ? (
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hp-hidden"
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`hp-card-image-placeholder ${
                      hospital.image ? "hp-hidden" : ""
                    }`}
                  >
                    <Building2 size={34} strokeWidth={1.5} />
                  </div>
                  <span className="hp-card-image-shade" />
                  {hospital.emergencyAvailable && (
                    <span className="hp-badge hp-badge-emergency">
                      <ShieldCheck size={11} /> Emergency
                    </span>
                  )}
                  {hospital.type && (
                    <span className="hp-badge hp-badge-type">
                      {hospital.type}
                    </span>
                  )}
                </div>

                <div className="hp-card-content">
                  <h3 title={hospital.name}>{hospital.name}</h3>

                  <div className="hp-card-location">
                    <MapPin size={14} />
                    <span>{hospital.location}</span>
                  </div>

                  {hospital.specialties.length > 0 ? (
                    <div className="hp-card-specialties">
                      {hospital.specialties.slice(0, 3).map((spec) => (
                        <span className="hp-specialty" key={spec}>
                          {spec}
                        </span>
                      ))}
                      {hospital.specialties.length > 3 && (
                        <span className="hp-specialty hp-specialty-more">
                          +{hospital.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="hp-card-empty-spec">
                      <Stethoscope size={14} />
                      <span>Contact for specialties</span>
                    </div>
                  )}

                  <div className="hp-card-footer">
                    <button
                      type="button"
                      className="hp-btn-view"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(hospital);
                      }}
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                    <a
                      className={`hp-btn-call ${!hospital.phone ? "is-disabled" : ""}`}
                      href={hospital.phone ? `tel:${hospital.phone}` : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hospital.phone) e.preventDefault();
                      }}
                      aria-label={
                        hospital.phone
                          ? `Call ${hospital.name}`
                          : "Phone unavailable"
                      }
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Hospitals;