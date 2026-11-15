// src/components/DoctorsNearYou.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Search, ChevronDown, Star, Clock,
  Stethoscope, Building2, ArrowRight, X, ChevronLeft, ChevronRight,
  RefreshCw,
} from "lucide-react";
import "./DoctorsNearYou.css";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */
const API_URL = `${import.meta.env.VITE_API_URL}/doctors`;
const ITEMS_PER_PAGE = 8;
const FETCH_TIMEOUT = 90000;

/* Stable pseudo-rating derived from the doctor id */
const seededRating = (id) => {
  if (!id) return { rating: "4.5", reviews: 50 };
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  const seed = h / 0xffffffff;
  return {
    rating: (4 + seed).toFixed(1),
    reviews: Math.floor(seed * 180) + 20,
  };
};

const DoctorsNearYou = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /*  Fetch                                                              */
  /* ------------------------------------------------------------------ */
  const fetchDoctors = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        signal,
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || `Request failed (${response.status})`);
      }

      setDoctors(Array.isArray(result) ? result : result.doctors || []);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("aborted");
      } else {
        setError("failed");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Initial load + abort on unmount                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    fetchDoctors(controller.signal).finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchDoctors]);

  /* ------------------------------------------------------------------ */
  /*  Manual retry                                                       */
  /* ------------------------------------------------------------------ */
  const handleRetry = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    fetchDoctors(controller.signal).finally(() => clearTimeout(timeoutId));
  };

  /* ------------------------------------------------------------------ */
  /*  Filtering + pagination                                             */
  /* ------------------------------------------------------------------ */
  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter((doctor) => {
      return (
        doctor.name?.toLowerCase().includes(query) ||
        doctor.specialty?.toLowerCase().includes(query) ||
        doctor.hospitalId?.hospitalName?.toLowerCase().includes(query)
      );
    });
  }, [doctors, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector(".near-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
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

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                         */
  /* ------------------------------------------------------------------ */
  const handleViewProfile = (doctor) => {
    navigate(`/doctors/${doctor._id}`, { state: { doctor } });
  };

  const handleBookAppointment = (doctor) => {
    const hospitalId =
      typeof doctor.hospitalId === "object"
        ? doctor.hospitalId?._id
        : doctor.hospitalId;

    if (!doctor._id || !hospitalId) {
      alert("Doctor or hospital details are missing.");
      return;
    }

    navigate("/book-appointment", {
      state: { doctorId: doctor._id, hospitalId, doctor },
    });
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <section className="near-section">
      <div className="container">
        {/* Header */}
        <div className="section-headers">
          <div>
            <span className="section-label">Top Rated</span>
            <h2>Doctors Near You</h2>
          </div>
          <button className="view-all" onClick={() => navigate("/find-doctors")}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="doctor-toolbar">
          <button type="button" className="location-box" title="Current location">
            <div className="location-icon-wrap">
              <MapPin size={18} />
            </div>
            <div className="location-content">
              <small>Your Location</small>
              <strong>BTM Layout, Bengaluru</strong>
            </div>
            <ChevronDown size={16} className="location-arrow" />
          </button>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search doctors, specialties, or hospitals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Loading — silent animation */}
        {loading && (
          <div className="dny-loading" role="status" aria-label="Loading doctors">
            <div className="dny-loader">
              <span className="dny-loader-dot" />
              <span className="dny-loader-dot" />
              <span className="dny-loader-dot" />
            </div>
            <div className="dny-loader-bar">
              <span className="dny-loader-bar-fill" />
            </div>
          </div>
        )}

        {/* Error — silent, retry only */}
        {!loading && error && (
          <div className="dny-error" role="alert">
            <div className="dny-error-visual">
              <Stethoscope size={36} strokeWidth={1.5} />
            </div>
            <button
              className="dny-retry"
              onClick={handleRetry}
              aria-label="Retry loading doctors"
            >
              <RefreshCw size={15} />
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Data Grid */}
        {!loading && !error && (
          <>
            <div className="doctor-data">
              {paginatedDoctors.map((doctor) => {
                const hospital =
                  typeof doctor.hospitalId === "object" ? doctor.hospitalId : null;

                const availableToday = doctor.availableDays?.includes(today);
                const { rating, reviews } = seededRating(doctor._id);

                return (
                  <div
                    className="doctor-card"
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
                    <div className="doctor-image">
                      <img
                        src={
                          doctor.profileImage ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=ccfbf1&color=0f766e&size=160`
                        }
                        alt={doctor.name}
                        loading="lazy"
                      />
                      <div className={`availability-badge ${availableToday ? "is-available" : "is-unavailable"}`}>
                        <span className="status-dot" />
                        {availableToday ? "Available Today" : "Next Available Soon"}
                      </div>
                    </div>

                    <div className="doctor-info">
                      <div className="doctor-header">
                        <h3>{doctor.name}</h3>
                        <div className="doctor-rating">
                          <Star size={13} fill="currentColor" />
                          <span>{rating}</span>
                          <small>({reviews})</small>
                        </div>
                      </div>

                      <p className="specialty">{doctor.specialty}</p>
                      <p className="qualification">{doctor.qualification}</p>

                      <div className="doctor-meta">
                        <span>
                          <Clock size={13} />
                          {doctor.experience ?? 0} years exp
                        </span>
                        <span>
                          <Building2 size={13} />
                          {hospital?.hospitalName || "Hospital info unavailable"}
                        </span>
                      </div>

                      <div className="doctor-bottom">
                        <div className="fee">
                          <strong>₹{doctor.consultationFee}</strong>
                        </div>
                        <button
                          className="book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookAppointment(doctor);
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDoctors.length === 0 && (
                <div className="empty-state">
                  <Stethoscope size={32} />
                  <h3>No doctors found</h3>
                  <p>
                    {search
                      ? `We couldn't find any doctors matching "${search}".`
                      : "There are no doctors available in your area right now."}
                  </p>
                  {search && (
                    <button className="clear-search-btn" onClick={() => setSearch("")}>
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav className="dny-pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="dny-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="dny-page-numbers">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="dny-page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`dny-page-num ${currentPage === page ? "is-active" : ""}`}
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
                  className="dny-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-label="Next page"
                >
                  Next <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DoctorsNearYou;