import { ArrowRight, Search, MapPin, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./CTASection.css";

const CTASection = () => {
  return (
    <section className="cta-section">
      {/* Decorative elements */}
      <motion.div
        className="cta-orb cta-orb-one"
        animate={{
          y: [0, -15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="cta-orb cta-orb-two"
        animate={{
          y: [0, 15, 0],
          x: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="cta-container">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          {/* Icon */}
          <motion.div
            className="cta-icon"
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
            }}
            whileHover={{
              scale: 1.1,
              rotate: 5,
            }}
          >
            <Search size={24} strokeWidth={2} />
          </motion.div>

          {/* Label */}
          <motion.span
            className="cta-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
          >
            YOUR HEALTH MATTERS
          </motion.span>

          {/* Heading */}
          <h2>
            Find the right doctor
            <br />
            <span>for your healthcare needs.</span>
          </h2>

          {/* Description */}
          <p>
            Search trusted doctors, compare specialists, and book your
            appointment easily with NearbyDoctor.
          </p>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
          >
            <Link to="/find-doctors" className="cta-button">
              <span>Find a Doctor</span>

              <motion.span
                className="cta-button-icon"
                whileHover={{ x: 4 }}
              >
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating information cards */}
        <motion.div
          className="cta-floating-card cta-location-card"
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          animate={{
            y: [0, -6, 0],
          }}
        >
          <div className="floating-icon">
            <MapPin size={17} />
          </div>

          <div>
            <strong>Find Nearby</strong>
            <span>Doctors & Hospitals</span>
          </div>
        </motion.div>

        <motion.div
          className="cta-floating-card cta-health-card"
          initial={{ opacity: 0, x: 25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.75, duration: 0.5 }}
          animate={{
            y: [0, 6, 0],
          }}
        >
          <div className="floating-icon">
            <HeartPulse size={17} />
          </div>

          <div>
            <strong>Better Healthcare</strong>
            <span>Starts with the right doctor</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default CTASection;

