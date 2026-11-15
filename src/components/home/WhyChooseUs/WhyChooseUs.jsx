import {
  ShieldCheck,
  CalendarCheck,
  LockKeyhole,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import "./WhyChooseUs.css";

const features = [
  {
    icon: BadgeCheck,
    title: "Verified Doctors",
    description:
      "Connect with verified doctors and healthcare professionals you can trust.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Appointment Booking",
    description:
      "Book appointments quickly with just a few simple steps.",
  },
  {
    icon: LockKeyhole,
    title: "Secure & Private",
    description:
      "Your personal and healthcare information is handled securely.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Healthcare",
    description:
      "Find reliable healthcare providers based on your needs.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-section">
      <div className="why-container">

        {/* Header */}
        <motion.div
          className="why-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="why-heading">
            <span className="why-label">WHY US</span>
            <h2>
              Healthcare made{" "}
              <span>simple and trusted.</span>
            </h2>
          </div>

          <p>
            Everything you need to find the right doctor and manage
            your healthcare appointments with confidence.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="why-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className="why-card"
                key={feature.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.25 },
                }}
              >
                <span className="why-number">
                  0{index + 1}
                </span>

                <motion.div
                  className="why-icon"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon size={24} strokeWidth={1.9} />
                </motion.div>

                <div className="why-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>

                <div className="why-card-footer">
                  <span>Learn more</span>

                  <motion.div
                    className="why-arrow"
                    whileHover={{ x: 4, y: -4 }}
                  >
                    <ArrowUpRight size={17} />
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;