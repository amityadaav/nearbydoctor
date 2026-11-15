import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Brain, Eye, Bone, Baby, Stethoscope, Pill, Activity,
  ArrowRight, Ear, Syringe, Scan, HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import "./SpecialtiesSection.css";

const SPECIALTY_NAMES = [
  "General Medicine", "Cardiology", "Dermatology", "Dentistry", "Neurology",
  "Orthopedics", "Pediatrics", "Gynecology", "Ophthalmology", "Oncology",
  "Psychiatry", "Urology", "ENT", "Radiology", "Other",
];

const ICON_MAP = {
  "General Medicine": Stethoscope,
  "Cardiology": Heart,
  "Dermatology": Pill,
  "Dentistry": Activity,
  "Neurology": Brain,
  "Orthopedics": Bone,
  "Pediatrics": Baby,
  "Gynecology": Baby,
  "Ophthalmology": Eye,
  "Oncology": Activity,
  "Psychiatry": Brain,
  "Urology": Syringe,
  "ENT": Ear,
  "Radiology": Scan,
  "Other": HelpCircle,
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const DOCTORS_ENDPOINT = `${API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`}/doctors`;

const SpecialtiesSection = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch(DOCTORS_ENDPOINT);
        const result = await response.json();
        if (!response.ok) throw new Error("Failed to fetch");
        setDoctors(Array.isArray(result) ? result : result.doctors || []);
      } catch (err) {
        console.error("Specialties count fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const specialtiesWithCounts = useMemo(() => {
    return SPECIALTY_NAMES.map((name) => {
      const count = doctors.filter((doc) => {
        if (!doc.specialty) return false;
        return doc.specialty.trim().toLowerCase() === name.toLowerCase();
      }).length;

      return {
        name,
        count,
        icon: ICON_MAP[name] || Stethoscope,
      };
    });
  }, [doctors]);

  const handleCardClick = (specialtyName) => {
    navigate(`/find-doctors?specialty=${encodeURIComponent(specialtyName)}`);
  };

  return (
    <section id="specialties" className="specialties-section">
      <div className="specialties-container">
        <motion.div
          className="specialties-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="specialties-heading">
            <span className="specialties-label">EXPLORE CARE</span>
            <h2>
              Browse by <span>Specialty</span>
            </h2>
            <p>
              Explore experienced doctors across different medical specialties.
            </p>
          </div>

          <motion.button
            className="specialties-view-all"
            onClick={() => navigate("/find-doctors")}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            View All
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        <div className="specialties-grid">
          {specialtiesWithCounts.map((spec, index) => {
            const Icon = spec.icon;

            return (
              <motion.article
                key={spec.name}
                className="specialty-card"
                onClick={() => handleCardClick(spec.name)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                whileHover={{ y: -7, transition: { duration: 0.25 } }}
              >
                <span className="specialty-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <motion.div
                  className="specialty-icon"
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon size={24} strokeWidth={1.8} />
                </motion.div>

                <div className="specialty-content">
                  <h3>{spec.name}</h3>
                  {loading ? (
                    <div className="specialty-skeleton-text" />
                  ) : (
                    <p>
                      {spec.count} Doctor{spec.count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <motion.div className="specialty-arrow" whileHover={{ x: 4 }}>
                  <ArrowRight size={17} />
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;