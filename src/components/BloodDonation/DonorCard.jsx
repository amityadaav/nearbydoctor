// src/components/DonorCard.jsx
import {
  Droplet, MapPin, Phone, Mail, Clock, CheckCircle2,
  AlertCircle, HeartPulse, Star, ShieldCheck, ArrowUpRight,
} from "lucide-react";
import "./DonorCard.css";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const getInitials = (name = "") =>
  String(name)
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

const groupColorClass = (group = "") => {
  const g = String(group);
  if (g.startsWith("O")) return "bgs-o";
  if (g.startsWith("A")) return "bgs-a";
  if (g.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

const timeAgo = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 0) return "scheduled";   // future date (shouldn't happen but safe)
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

/* Normalize either backend shape or legacy shape into one */
const normalizeDonor = (raw = {}) => {
  const d = raw || {};
  return {
    id: d.id ?? d._id ?? null,
    name: d.name ?? d.fullname ?? "Unknown donor",
    group: d.group ?? d.bloodGroup ?? "O+",
    city: d.city ?? "",
    area: d.area ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    lastDonated: d.lastDonated ?? null,
    available: d.available !== false,   // default true
    verified: Boolean(d.verified),
    rating: d.rating ?? null,
    donations: Number(d.donations ?? d.totalDonations ?? 0) || 0,
  };
};

/* ------------------------------------------------------------------ */
/*  DonorCard                                                          */
/* ------------------------------------------------------------------ */
function DonorCard({
  donor = {},
  variant = "default",     // "default" | "compact" | "elevated"
  showActions = true,
  showBadges = true,
  onContact,               // optional (donor, method) => void
  onClick,                 // optional (donor) => void — makes whole card clickable
}) {
  const d = normalizeDonor(donor);
  const {
    name, group, city, area, phone, email,
    lastDonated, available, verified, rating, donations,
  } = d;

  const location = [area, city].filter(Boolean).join(", ") || "—";
  const isClickable = typeof onClick === "function";
  const hasPhone = Boolean(phone);
  const hasEmail = Boolean(email);

  const handleCardClick = (e) => {
    if (!isClickable) return;
    // Don't hijack clicks on inner interactive elements
    if (e.target.closest("a, button")) return;
    onClick(donor);
  };

  const handleKey = (e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(donor);
    }
  };

  const handleCall = (e) => {
    if (onContact) {
      e.preventDefault();
      onContact({ ...donor, method: "phone" });
    }
  };

  const handleEmail = (e) => {
    if (onContact) {
      e.preventDefault();
      onContact({ ...donor, method: "email" });
    }
  };

  return (
    <article
      className={`dc-card dc-card--${variant}${isClickable ? " dc-card--clickable" : ""}`}
      onClick={handleCardClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? handleKey : undefined}
    >
      {/* ---------- Top row: group + availability ---------- */}
      <header className="dc-card__head">
        <span className={`dc-badge ${groupColorClass(group)}`}>
          <Droplet size={11} fill="currentColor" /> {group}
        </span>

        <span className={`dc-avail ${available ? "is-yes" : "is-no"}`}>
          {available ? (
            <><CheckCircle2 size={12} /> Available</>
          ) : (
            <><Clock size={12} /> Unavailable</>
          )}
        </span>
      </header>

      {/* ---------- Body: avatar + identity ---------- */}
      <div className="dc-card__body">
        <span className="dc-avatar" aria-hidden="true">
          {getInitials(name)}
          {verified && (
            <span className="dc-avatar__verified" title="Verified donor">
              <ShieldCheck size={11} />
            </span>
          )}
        </span>

        <div className="dc-card__identity">
          <h3 className="dc-card__name">
            {name}
            {verified && <span className="dc-verified-pill">Verified</span>}
          </h3>

          <p className="dc-card__location">
            <MapPin size={11} /> {location}
          </p>

          {lastDonated && (
            <small className="dc-card__meta">
              <Clock size={10} /> Last donated {timeAgo(lastDonated)}
            </small>
          )}
        </div>
      </div>

      {/* ---------- Badges row (rating / donations) ---------- */}
      {showBadges && (rating != null || donations > 0) && (
        <ul className="dc-card__badges">
          {rating != null && (
            <li className="dc-stat">
              <Star size={11} fill="currentColor" />
              <strong>{Number(rating).toFixed(1)}</strong>
              <span>rating</span>
            </li>
          )}
          {donations > 0 && (
            <li className="dc-stat">
              <HeartPulse size={11} />
              <strong>{donations}</strong>
              <span>{donations === 1 ? "donation" : "donations"}</span>
            </li>
          )}
        </ul>
      )}

      {/* ---------- Actions ---------- */}
      {showActions && (
        <footer className="dc-card__actions">
          {hasPhone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="dc-btn dc-btn--primary"
              onClick={handleCall}
            >
              <Phone size={13} /> Call
            </a>
          ) : (
            <span className="dc-btn dc-btn--primary is-disabled" aria-disabled="true">
              <Phone size={13} /> No phone
            </span>
          )}

          {hasEmail ? (
            <a
              href={`mailto:${email}`}
              className="dc-btn dc-btn--ghost"
              onClick={handleEmail}
            >
              <Mail size={13} /> Email
            </a>
          ) : (
            <span className="dc-btn dc-btn--ghost is-disabled" aria-disabled="true">
              <Mail size={13} /> No email
            </span>
          )}

          {isClickable && (
            <span className="dc-arrow" aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
          )}
        </footer>
      )}

      {/* ---------- Unavailable overlay hint ---------- */}
      {!available && (
        <span className="dc-card__notice" role="note">
          <AlertCircle size={11} /> Currently not accepting requests
        </span>
      )}
    </article>
  );
}

export default DonorCard;