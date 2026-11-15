import { useState } from "react";
import {
  BadgeCheck, Briefcase, Building2, MapPin, Star, GraduationCap, CalendarCheck,
} from "lucide-react";
import "./DoctorCard.css";

const WEEK = [
  ["Monday", "M"], ["Tuesday", "T"], ["Wednesday", "W"], ["Thursday", "T"],
  ["Friday", "F"], ["Saturday", "S"], ["Sunday", "S"],
];

const getInitials = (name = "") =>
  name
    .replace(/^dr\.?\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "DR";

function DoctorCard({ doctor, onBook }) {
  const [imageFailed, setImageFailed] = useState(false);

  const hospital = typeof doctor.hospitalId === "object" ? doctor.hospitalId : null;

  const name = doctor.name || "Doctor";
  const image = doctor.profileImage || doctor.image || "";
  const hospitalName = hospital?.hospitalName || doctor.hospitalName || "";
  const city = hospital?.address?.city || doctor.city || "";
  const days = Array.isArray(doctor.availableDays) ? doctor.availableDays : null;
  const rating = Number(doctor.rating) || 0;
  const reviews = Number(doctor.reviews) || 0;
  const experience = doctor.experience;
  const fee = Number(doctor.consultationFee);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const availableToday = days ? days.includes(today) : Boolean(doctor.available);

  return (
    <article className="dc-card">
      <div className="dc-top">
        <span className={`dc-availability ${availableToday ? "dc-on" : "dc-off"}`}>
          <span className="dc-dot" />
          {availableToday ? "Available Today" : days ? "Not available today" : "Not available"}
        </span>

        {rating > 0 && (
          <span className="dc-rating" title={reviews ? `${reviews} reviews` : undefined}>
            <Star size={13} fill="currentColor" /> {rating.toFixed(1)}
          </span>
        )}

        <div className="dc-avatar">
          {image && !imageFailed ? (
            <img src={image} alt={name} onError={() => setImageFailed(true)} loading="lazy" />
          ) : (
            <span>{getInitials(name)}</span>
          )}
        </div>
      </div>

      <div className="dc-body">
        <h3 className="dc-name">
          <span>{name}</span>
          <BadgeCheck size={17} className="dc-verified" aria-label="Verified doctor" />
        </h3>

        <span className="dc-specialty">{doctor.specialty}</span>

        {doctor.qualification && (
          <p className="dc-qualification">
            <GraduationCap size={14} /> {doctor.qualification}
          </p>
        )}

        <ul className="dc-meta">
          {experience !== undefined && experience !== null && (
            <li><Briefcase size={14} /> {experience} {Number(experience) === 1 ? "year" : "years"} experience</li>
          )}
          {hospitalName && <li><Building2 size={14} /> {hospitalName}</li>}
          {city && <li><MapPin size={14} /> {city}</li>}
          {reviews > 0 && <li><Star size={14} /> {reviews.toLocaleString("en-IN")} reviews</li>}
        </ul>

        {days && (
          <div className="dc-days" aria-label={`Available on ${days.join(", ")}`}>
            {WEEK.map(([full, letter]) => (
              <span
                key={full}
                title={full}
                className={`dc-day ${days.includes(full) ? "dc-day-on" : ""} ${full === today ? "dc-day-today" : ""}`}
              >
                {letter}
              </span>
            ))}
          </div>
        )}

        <div className="dc-footer">
          <div className="dc-fee">
            <small>Consultation fee</small>
            <strong>{Number.isFinite(fee) ? `₹${fee.toLocaleString("en-IN")}` : "N/A"}</strong>
          </div>

          <button type="button" className="dc-book" onClick={() => onBook?.(doctor)}>
            <CalendarCheck size={15} /> Book
          </button>
        </div>
      </div>
    </article>
  );
}

export default DoctorCard;