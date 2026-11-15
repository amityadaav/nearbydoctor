import { Phone, MessageCircle, Star, Clock, Building2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import "./FeaturedDoctors.css";

const featuredDoctors = [
  {
    name: "Dr. Amit Sharma",
    specialty: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    clinic: "City Heart Care",
    area: "Indore",
    experience: 12,
    fee: 800,
    rating: 4.8,
    reviews: 124,
  },
  {
    name: "Dr. Neha Verma",
    specialty: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    clinic: "Skin Plus Clinic",
    area: "Indore",
    experience: 8,
    fee: 600,
    rating: 4.9,
    reviews: 98,
  },
  {
    name: "Dr. Raj Malhotra",
    specialty: "Orthopedic",
    qualification: "MBBS, MS (Ortho)",
    clinic: "Ortho Care",
    area: "Indore",
    experience: 15,
    fee: 900,
    rating: 4.7,
    reviews: 156,
  },
];

const FeaturedDoctors = () => {
  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-headers">
          <div>
            <span className="section-label">Top Rated</span>
            <h2>Featured Doctors</h2>
          </div>
        </div>

        <div className="doctor-data">
          {featuredDoctors.map((doc, index) => (
            <motion.article
              key={doc.name}
              className="doctor-card"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <div className="doctor-image">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=ccfbf1&color=0f766e&size=160`}
                  alt={doc.name}
                  loading="lazy"
                />
                <div className="availability-badge is-available">
                  <span className="status-dot" />
                  Available Today
                </div>
              </div>

              <div className="doctor-info">
                <div className="doctor-header">
                  <h3>{doc.name}</h3>
                  <div className="doctor-rating">
                    <Star size={13} fill="currentColor" />
                    <span>{doc.rating}</span>
                    <small>({doc.reviews})</small>
                  </div>
                </div>

                <p className="specialty">{doc.specialty}</p>
                <p className="qualification">{doc.qualification}</p>

                <div className="doctor-meta">
                  <span>
                    <Clock size={13} />
                    {doc.experience} years exp
                  </span>
                  <span>
                    <Building2 size={13} />
                    {doc.clinic}
                  </span>
                  <span>
                    <MapPin size={13} />
                    {doc.area}
                  </span>
                </div>

                <div className="doctor-bottom">
                  <div className="fee">
                    <small>Fee</small>
                    <strong>₹{doc.fee}</strong>
                  </div>
                  <div className="actions">
                    <button className="call" aria-label={`Call ${doc.name}`}>
                      <Phone size={14} /> Call
                    </button>
                    <button className="whatsapp" aria-label={`WhatsApp ${doc.name}`}>
                      <MessageCircle size={14} /> Chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctors;