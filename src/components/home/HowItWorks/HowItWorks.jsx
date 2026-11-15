import {
  Video,
  Search,
  UserRound,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search a Doctor",
    description:
      "Search doctors by specialty, location, hospital, or name.",
  },
  {
    number: "02",
    icon: UserRound,
    title: "Choose Your Doctor",
    description:
      "Compare profiles, experience, ratings, fees, and availability.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book Appointment",
    description:
      "Select a convenient date and time and book your appointment.",
  },
  {
    number: "04",
    icon: Video,
    title: "Get Consultation",
    description:
      "Visit the doctor at the scheduled time and get the care you need.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-section">
      <div className="how-container">

        {/* Header */}
        <motion.div
          className="how-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="how-label">SIMPLE PROCESS</span>
          <h2>
            How <span>NearbyDoctor</span> Works
          </h2>

          <p>
            Find the right doctor and book your appointment
            in just a few simple steps.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          className="how-progress"
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="progress-line">
            <motion.div
              className="progress-active"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Steps */}
        <div className="how-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                className="how-step-wrapper"
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.15,
                }}
              >
                <motion.div
                  className="how-step"
                  whileHover={{
                    y: -8,
                    transition: { duration: 0.25 },
                  }}
                >
                  <motion.div
                    className="step-number"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {step.number}
                  </motion.div>

                  <motion.div
                    className="step-icon"
                    whileHover={{ scale: 1.12, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon size={27} strokeWidth={1.8} />
                  </motion.div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>

                  <div className="step-footer">
                    <span>
                      Step {index + 1} of {steps.length}
                    </span>
                    <CheckCircle2 size={16} />
                  </div>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    className="step-connector"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.15 + 0.3,
                    }}
                  >
                    <ArrowRight size={19} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="how-bottom"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div>
            <strong>Ready to find your doctor?</strong>
            <span>Start your healthcare journey today.</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Find a Doctor
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;