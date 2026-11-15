import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Star, ArrowRight, Building2, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import "./PopularHospitals.css";

/* ------------------------------------------------------------------ */
/*  API config                                                         */
/* ------------------------------------------------------------------ */
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/api$/, "");
const HOSPITALS_API = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/hospitals`;
const DOCTORS_API = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/doctors`;

const ITEMS_PER_PAGE = 8;
const FETCH_TIMEOUT = 90000; // 90s — Render cold start

/* ------------------------------------------------------------------ */
/*  Fetch helper with timeout                                          */
/* ------------------------------------------------------------------ */
async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const PopularHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctorCounts, setDoctorCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [slowHint, setSlowHint] = useState(false);

  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /*  Data load                                                          */
  /* ------------------------------------------------------------------ */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSlowHint(false);

    const slowTimer = setTimeout(() => setSlowHint(true), 8000);

    try {
      const [hospitalResponse, doctorResponse] = await Promise.all([
        fetchWithTimeout(HOSPITALS_API, FETCH_TIMEOUT),
        fetchWithTimeout(DOCTORS_API, FETCH_TIMEOUT),
      ]);

      if (!hospitalResponse.ok) {
        throw new Error(`Failed to fetch hospitals (${hospitalResponse.status})`);
      }

      const hospitalResult = await hospitalResponse.json();
      const hospitalList = Array.isArray(hospitalResult)
        ? hospitalResult
        : hospitalResult.hospitals || [];

      const verifiedHospitals = hospitalList.filter(
        (h) => h.verificationStatus === "Verified" || h.isActive !== false
      );
      setHospitals(verifiedHospitals);

      if (doctorResponse.ok) {
        const doctorResult = await doctorResponse.json();
        const doctorList = Array.isArray(doctorResult)
          ? doctorResult
          : doctorResult.doctors || [];

        const counts = {};
        doctorList.forEach((doctor) => {
          const hospitalId =
            typeof doctor.hospitalId === "object"
              ? doctor.hospitalId?._id
              : doctor.hospitalId;

          if (hospitalId) counts[hospitalId] = (counts[hospitalId] || 0) + 1;
        });
        setDoctorCounts(counts);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Server is waking up. This can take up to 90 seconds on first visit.");
      } else if (String(err.message).includes("Failed to fetch")) {
        setError("Can't reach the server. Check your internet connection and try again.");
      } else {
        setError(err.message || "Unable to load hospitals");
      }
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const getHospitalLocation = (hospital) => {
    if (!hospital) return "Location unavailable";

    if (typeof hospital.address === "string" && hospital.address.trim()) {
      return hospital.city ? `${hospital.address}, ${hospital.city}` : hospital.address;
    }

    if (hospital.address && typeof hospital.address === "object") {
      const parts = [hospital.address.area, hospital.address.city, hospital.address.state].filter(Boolean);
      if (parts.length > 0) return parts.join(", ");
    }

    return hospital.city || hospital.location || "Location unavailable";
  };

  const getHospitalImage = (hospital) => {
    if (!hospital) return "https://placehold.co/900x500?text=Hospital";

    const path =
      hospital.logo ||
      (Array.isArray(hospital.images) && hospital.images[0]) ||
      hospital.image ||
      hospital.profileImage ||
      hospital.hospitalImage;

    if (!path) return "https://placehold.co/900x500?text=Hospital";
    if (/^https?:\/\//i.test(path)) return path;

    return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
  };

  const totalPages = Math.ceil(hospitals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHospitals = hospitals.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector(".hospitals-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const handleViewHospital = (hospital) => {
    navigate(`/hospitals/${hospital._id}`, { state: { hospital } });
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <section className="hospitals-section">
      <div className="hospitals-container">
        <motion.div
          className="hospitals-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hospitals-heading">
            <span className="hospitals-label">TRUSTED CARE</span>
            <h2>
              Popular <span>Hospitals</span>
            </h2>
            <p>Discover trusted hospitals and healthcare facilities near you.</p>
          </div>

          <motion.button
            type="button"
            className="hospitals-view-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/hospitals")}
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Loading spinner */}
        {loading && (
          <div className="hp-loading" role="status" aria-live="polite">
            <Loader2 className="hp-spinner" size={36} />
            <p className="hp-loading__text">
              {slowHint
                ? "Waking up the server… this can take up to 90 seconds."
                : "Loading hospitals…"}
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="hospital-status-error" role="alert">
            <AlertCircle size={28} />
            <h3>Unable to load hospitals</h3>
            <p>{error}</p>
            <button onClick={fetchData}>
              <RefreshCw size={14} /> Try again
            </button>
            <small style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              Our server sleeps when idle. The first request can take up to 90 seconds.
            </small>
          </div>
        )}

        {/* Data */}
        {!loading && !error && (
          <>
            <div className="hospitals-grid">
              {paginatedHospitals.map((hospital, index) => {
                const hospitalId = hospital._id;
                const doctorCount = doctorCounts[hospitalId] || 0;
                const rating = hospital.rating ?? hospital.averageRating;
                const reviews = hospital.reviewsCount ?? hospital.totalReviews;

                return (
                  <motion.article
                    key={hospitalId}
                    className="hospital-card"
                    onClick={() => handleViewHospital(hospital)}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="hospital-image">
                      <img
                        src={getHospitalImage(hospital)}
                        alt={hospital.hospitalName}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://placehold.co/900x500?text=Hospital";
                        }}
                      />
                      <div className="hospital-type">
                        <Building2 size={13} />
                        <span>{hospital.hospitalType || "Hospital"}</span>
                      </div>
                      {rating != null && (
                        <div className="hospital-rating-badge">
                          <Star size={12} fill="currentColor" />
                          {rating}
                        </div>
                      )}
                    </div>

                    <div className="hospital-content">
                      <h3 title={hospital.hospitalName}>
                        {hospital.hospitalName || "Unnamed Hospital"}
                      </h3>

                      <div className="hospital-location">
                        <MapPin size={15} />
                        <span>{getHospitalLocation(hospital)}</span>
                      </div>

                      <div className="hospital-info">
                        <div className="hospital-rating">
                          {rating != null && (
                            <span className="rating">
                              <Star size={13} fill="currentColor" />
                              {rating}
                            </span>
                          )}
                          {reviews != null && (
                            <span className="reviews">{reviews} Reviews</span>
                          )}
                        </div>
                        <span className="doctor-count">
                          {doctorCount} {doctorCount === 1 ? "Doctor" : "Doctors"}
                        </span>
                      </div>

                      <div className="hospital-footer">
                        <span>{hospital.specialties?.length || 0} Specialties</span>
                        <button
                          type="button"
                          className="hospital-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewHospital(hospital);
                          }}
                        >
                          View <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}

              {hospitals.length === 0 && (
                <div className="hospital-status-empty">
                  <Building2 size={32} />
                  <h3>No hospitals found</h3>
                  <p>There are no verified hospitals registered yet.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav className="hp-pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="hp-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <div className="hp-page-numbers">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="hp-page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        className={`hp-page-num ${currentPage === page ? "is-active" : ""}`}
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
                  className="hp-page-btn"
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

export default PopularHospitals;