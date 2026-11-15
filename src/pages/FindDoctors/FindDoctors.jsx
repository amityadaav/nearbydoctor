// src/pages/Doctors/FindDoctors.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin, Search, SlidersHorizontal, X, RefreshCw, Video, Building2,
  CheckCircle2, ChevronLeft, ChevronRight, Sparkles,
  BriefcaseMedical, ArrowRight, Filter, IndianRupee,
} from "lucide-react";
import "./FindDoctors.css";

/* ------------------------------------------------------------------ */
/*  API config                                                         */
/* ------------------------------------------------------------------ */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api$/, "");
const API_BASE = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;
const DOCTORS_ENDPOINT = `${API_BASE}/doctors`;
const FETCH_TIMEOUT = 90000; // 90s — Render cold start

const ITEMS_PER_PAGE = 12;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getHospitalName(doctor) {
  return typeof doctor.hospitalId === "object"
    ? doctor.hospitalId?.hospitalName || "Hospital"
    : "Hospital";
}

function getHospitalAddress(doctor) {
  const address = typeof doctor.hospitalId === "object" ? doctor.hospitalId?.address : "";
  if (typeof address === "string") return address;
  if (address && typeof address === "object") {
    return [address.street, address.city].filter(Boolean).join(", ");
  }
  return "";
}

function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
}

function getInitials(name) {
  return (name || "D").trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function parseExperience(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/*  Fetch with timeout                                                 */
/* ------------------------------------------------------------------ */
async function fetchWithTimeout(url, signal, ms = FETCH_TIMEOUT) {
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

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */
function DoctorAvatar({ name, imageUrl }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="app-dr-avatar">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={name || "Doctor"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function FindDoctors() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [specialty, setSpecialty] = useState(searchParams.get("specialty") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [consultationType, setConsultationType] = useState(searchParams.get("type") || "");
  const [experience, setExperience] = useState(searchParams.get("experience") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- data ---------- */
  const fetchDoctors = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const { ok, status, data } = await fetchWithTimeout(DOCTORS_ENDPOINT, signal);

      if (!ok) {
        throw new Error(
          data?.message ||
          (status === 404 ? "Doctors endpoint not found" : `Request failed (${status})`)
        );
      }

      const list = Array.isArray(data) ? data : data.doctors || [];
      setDoctors(list);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        String(err.message).includes("Failed to fetch")
          ? "Can't reach the server. Check your connection."
          : err.message || "Unable to load doctors."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
    return () => controller.abort();
  }, [fetchDoctors]);

  /* ---------- debounce ---------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------- URL sync ---------- */
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (specialty) params.set("specialty", specialty);
    if (consultationType) params.set("type", consultationType);
    if (experience) params.set("experience", experience);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, specialty, consultationType, experience, setSearchParams]);

  /* ---------- pagination reset ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, specialty, consultationType, experience]);

  /* ---------- derived ---------- */
  const specialties = useMemo(
    () => [...new Set(doctors.map((d) => d.specialty).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [doctors]
  );

  const filteredDoctors = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const hospitalName = getHospitalName(doctor);
      const hospitalAddress = getHospitalAddress(doctor);

      const matchesSearch =
        !query ||
        [doctor.name, doctor.specialty, doctor.qualification, hospitalName, hospitalAddress]
          .some((v) => String(v || "").toLowerCase().includes(query));

      const matchesSpecialty =
        !specialty ||
        (doctor.specialty || "").toLowerCase() === specialty.toLowerCase();

      const type = (doctor.consultationType || "").toLowerCase().replace("in-person", "in-clinic");
      const selectedType = consultationType.toLowerCase().replace("in-person", "in-clinic");
      const matchesType = !consultationType || type === selectedType;

      const matchesExperience =
        !experience || parseExperience(doctor.experience) >= Number(experience);

      return matchesSearch && matchesSpecialty && matchesType && matchesExperience;
    });
  }, [doctors, debouncedSearch, specialty, consultationType, experience]);

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /* ---------- handlers ---------- */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector(".app-dr-results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const clearFilters = () => {
    setSearch("");
    setSpecialty("");
    setConsultationType("");
    setExperience("");
    setCurrentPage(1);
  };

  const handleRetry = () => {
    const controller = new AbortController();
    fetchDoctors(controller.signal);
  };

  const handleViewProfile = (doctor) => {
    navigate(`/doctors/${doctor._id}`, { state: { doctor } });
  };

  const handleBookAppointment = (doctor) => {
    const hospitalId =
      typeof doctor.hospitalId === "object" ? doctor.hospitalId?._id : doctor.hospitalId;

    if (!doctor._id || !hospitalId) {
      alert("Doctor or hospital ID is missing.");
      return;
    }
    navigate("/book-appointment", {
      state: { doctorId: doctor._id, hospitalId, doctor },
    });
  };

  const activeFilterCount = [specialty, consultationType, experience].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  /* ---------- render ---------- */
  return (
    <div className="app-dr-container">
      <div className="app-dr-inner">
        {/* HERO */}
        <header className="app-dr-hero">
          <div className="app-dr-hero-content">
            <div>
              <span className="app-dr-eyebrow">
                <Sparkles size={12} /> Find care
              </span>
              <h1 className="app-dr-h1">
                Find your <span className="app-dr-accent">perfect doctor</span>
              </h1>
              <p className="app-dr-subtitle">
                Book appointments with trusted specialists — online or in-clinic.
              </p>
            </div>

            <div className="app-dr-stats">
              <div>
                <span className="app-dr-stat-val">{loading ? "—" : doctors.length}+</span>
                <span className="app-dr-stat-lbl">Verified doctors</span>
              </div>
              <div className="app-dr-stat-div" />
              <div>
                <span className="app-dr-stat-val">{specialties.length}</span>
                <span className="app-dr-stat-lbl">Specialties</span>
              </div>
            </div>
          </div>
        </header>

        {/* TOOLBAR */}
        <section className="app-dr-toolbar">
          <div className="app-dr-search">
            <Search size={18} className="app-dr-search-icon" />
            <input
              type="search"
              placeholder="Search by name, specialty, or hospital…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search doctors"
            />
            {search && (
              <button
                className="app-dr-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`app-dr-filter-btn ${showFilters ? "is-active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <Filter size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="app-dr-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </section>

        <div className="app-dr-layout">
          {/* SIDEBAR */}
          <aside className={`app-dr-sidebar ${showFilters ? "is-open" : ""}`}>
            <div className="app-dr-sidebar-head">
              <h2>
                <SlidersHorizontal size={16} /> Refine
              </h2>
              {hasActiveFilters && (
                <button type="button" className="app-dr-reset" onClick={clearFilters}>
                  Reset
                </button>
              )}
            </div>

            <div className="app-dr-group">
              <label htmlFor="fd-specialty">Specialty</label>
              <select
                id="fd-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">All specialties</option>
                {specialties.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="app-dr-group">
              <span className="app-dr-group-label" id="fd-consult-label">
                Consultation
              </span>
              <div
                className="app-dr-toggle"
                role="group"
                aria-labelledby="fd-consult-label"
              >
                <button
                  type="button"
                  className={consultationType === "" ? "is-active" : ""}
                  onClick={() => setConsultationType("")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={consultationType === "in-person" ? "is-active" : ""}
                  onClick={() => setConsultationType("in-person")}
                >
                  Clinic
                </button>
                <button
                  type="button"
                  className={consultationType === "online" ? "is-active" : ""}
                  onClick={() => setConsultationType("online")}
                >
                  Video
                </button>
              </div>
            </div>

            <div className="app-dr-group">
              <label htmlFor="fd-experience">Experience</label>
              <select
                id="fd-experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Any experience</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
                <option value="15">15+ years</option>
              </select>
            </div>
          </aside>

          {/* RESULTS */}
          <main className="app-dr-results">
            <div className="app-dr-results-head">
              <h2>{hasActiveFilters ? "Matching doctors" : "Available doctors"}</h2>
              <p>
                {loading
                  ? "Searching…"
                  : `Showing ${filteredDoctors.length} result${
                      filteredDoctors.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            {loading ? (
              <div className="app-dr-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="app-dr-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="app-dr-empty">
                <RefreshCw size={32} />
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button type="button" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <>
                <div className="app-dr-grid">
                  {paginatedDoctors.map((doctor) => {
                    const isOnline =
                      (doctor.consultationType || "").toLowerCase() === "online";

                    return (
                      <article
                        className="app-dr-card"
                        key={doctor._id}
                        onClick={() => handleViewProfile(doctor)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleViewProfile(doctor);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                        aria-label={`View profile of ${doctor.name}`}
                      >
                        <div className="app-dr-card-top">
                          <div className="app-dr-avatar-wrap">
                            <DoctorAvatar
                              name={doctor.name}
                              imageUrl={getImageUrl(doctor.profileImage)}
                            />
                            <span
                              className={`app-dr-dot ${isOnline ? "is-online" : ""}`}
                              title={isOnline ? "Available online" : "In-clinic"}
                            />
                          </div>
                          <div className="app-dr-card-info">
                            <h3>{doctor.name}</h3>
                            <p>{doctor.specialty || "General physician"}</p>
                          </div>
                        </div>

                        <div className="app-dr-card-meta">
                          <div className="app-dr-meta-row">
                            <Building2 size={14} /> {getHospitalName(doctor)}
                          </div>
                          <div className="app-dr-meta-row">
                            <MapPin size={14} />{" "}
                            {getHospitalAddress(doctor) || "Address not provided"}
                          </div>
                        </div>

                        <div className="app-dr-card-facts">
                          <span className="app-dr-fact">
                            <BriefcaseMedical size={13} />{" "}
                            {parseExperience(doctor.experience)} yrs
                          </span>
                          <span className="app-dr-fact">
                            {isOnline ? <Video size={13} /> : <CheckCircle2 size={13} />}{" "}
                            {isOnline ? "Video" : "Clinic"}
                          </span>
                        </div>

                        <div className="app-dr-card-bottom">
                          <div className="app-dr-fee">
                            <small>Fee</small>
                            <strong>
                              <IndianRupee size={13} />{" "}
                              {doctor.consultationFee || "N/A"}
                            </strong>
                          </div>
                          <button
                            type="button"
                            className="app-dr-book"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookAppointment(doctor);
                            }}
                          >
                            Book <ArrowRight size={14} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav className="app-dr-pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="app-dr-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    <div className="app-dr-page-numbers">
                      {getPageNumbers().map((page, index) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="app-dr-page-ellipsis"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={page}
                            type="button"
                            className={`app-dr-page-num ${
                              currentPage === page ? "is-active" : ""
                            }`}
                            onClick={() => handlePageChange(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="app-dr-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-label="Next page"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="app-dr-empty">
                <Search size={32} />
                <h3>No doctors found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button type="button" onClick={clearFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default FindDoctors;