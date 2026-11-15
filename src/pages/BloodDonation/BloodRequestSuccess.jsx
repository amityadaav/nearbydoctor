// src/pages/BloodDonation/BloodRequestSuccess.jsx
import { useMemo, useState } from "react";
import {
  CheckCircle2, Droplet, MapPin, Clock, Phone, Mail,
  Share2, ArrowRight, Home, Copy, HeartPulse, UserRound, CalendarDays,
} from "lucide-react";
import "./BloodRequestSuccess.css";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

function BloodRequestSuccess({
  requestId,
  bloodGroup = "O-",
  units = 2,
  patientName = "Anonymous",
  hospitalName = "City General Hospital",
  city = "Bengaluru",
  submittedAt,
  contactPhone = "+91 98450 00000",
  contactEmail = "help@nearbydoctor.in",
  onViewRequest,
  onGoHome,
  onShare,
  onCopyId,
}) {
  // Stable IDs generated once per mount
  const [fallbackId]        = useState(() => "BR-" + Math.floor(100000 + Math.random() * 900000));
  const [fallbackSubmitted] = useState(() => new Date().toISOString());

  const id  = requestId || fallbackId;
  const at  = submittedAt || fallbackSubmitted;
  const fmt = useMemo(() => formatDateTime(at), [at]);

  const handleShare = async () => {
    if (onShare) return onShare({ requestId: id, bloodGroup, city });
    const text = `Urgent: ${units} unit${units > 1 ? "s" : ""} of ${bloodGroup} blood needed at ${hospitalName}, ${city}. Request ID: ${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Blood Request", text }); } catch { /* cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleCopyId = async () => {
    if (onCopyId) return onCopyId(id);
    if (navigator.clipboard) await navigator.clipboard.writeText(id);
  };

  return (
    <section className="brs-section" aria-labelledby="brs-heading">
      <div className="brs-hero">
        <span className="brs-hero__ring brs-hero__ring--1" aria-hidden="true" />
        <span className="brs-hero__ring brs-hero__ring--2" aria-hidden="true" />
        <span className="brs-check" aria-hidden="true">
          <CheckCircle2 size={36} strokeWidth={2.2} />
        </span>
        <span className="brs-eyebrow"><HeartPulse size={11} /> Request submitted</span>
        <h1 id="brs-heading" className="brs-title">Thank you — your request is live</h1>
        <p className="brs-subtitle">
          We&rsquo;ve broadcast your request to matching donors in <b>{city}</b>.
          You&rsquo;ll receive updates as soon as someone responds.
        </p>

        <button type="button" className="brs-id" onClick={handleCopyId} title="Copy request ID">
          <span className="brs-id__label">Request ID</span>
          <code className="brs-id__value">{id}</code>
          <Copy size={13} className="brs-id__copy" aria-hidden="true" />
        </button>
      </div>

      <div className="brs-card">
        <header className="brs-card__head">
          <div><h2>Request summary</h2><p>Save this for your records</p></div>
          <span className={`brs-badge ${bloodGroup.startsWith("O") ? "bgs-o" : bloodGroup.startsWith("A") ? "bgs-a" : bloodGroup.startsWith("B") ? "bgs-b" : "bgs-ab"}`}>
            <Droplet size={12} fill="currentColor" />
            {bloodGroup} · {units} unit{units > 1 ? "s" : ""}
          </span>
        </header>

        <dl className="brs-list">
          <div className="brs-list__row"><dt><UserRound size={13} /> Patient</dt><dd>{patientName}</dd></div>
          <div className="brs-list__row"><dt><MapPin size={13} /> Hospital</dt><dd>{hospitalName}, {city}</dd></div>
          <div className="brs-list__row"><dt><CalendarDays size={13} /> Submitted</dt><dd>{fmt}</dd></div>
          <div className="brs-list__row"><dt><Phone size={13} /> Contact phone</dt>
            <dd><a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a></dd>
          </div>
          <div className="brs-list__row"><dt><Mail size={13} /> Contact email</dt>
            <dd><a href={`mailto:${contactEmail}`}>{contactEmail}</a></dd>
          </div>
        </dl>
      </div>

      <div className="brs-next">
        <h3>What happens next?</h3>
        <ol className="brs-next__list">
          <li><span className="brs-next__num">1</span><div>
            <strong>Donors are notified</strong>
            <small>Matching donors within 15 km of the hospital get an SMS and app alert.</small>
          </div></li>
          <li><span className="brs-next__num">2</span><div>
            <strong>You review responses</strong>
            <small>We&rsquo;ll notify you here and by email whenever someone accepts.</small>
          </div></li>
          <li><span className="brs-next__num">3</span><div>
            <strong>Coordinate directly</strong>
            <small>Once a donor accepts, you can call them directly to arrange pickup.</small>
          </div></li>
        </ol>
      </div>

      <div className="brs-actions">
        <button type="button" className="brs-btn brs-btn--primary" onClick={onViewRequest}>
          <Clock size={15} /> View request status <ArrowRight size={15} />
        </button>
        <button type="button" className="brs-btn brs-btn--ghost" onClick={handleShare}>
          <Share2 size={15} /> Share request
        </button>
        <button type="button" className="brs-btn brs-btn--ghost" onClick={onGoHome}>
          <Home size={15} /> Back to home
        </button>
      </div>

      <p className="brs-foot">
        <Droplet size={11} /> Every minute counts. If this is an emergency,
        call <a href="tel:108">108</a> or your nearest blood bank directly.
      </p>
    </section>
  );
}

export default BloodRequestSuccess;