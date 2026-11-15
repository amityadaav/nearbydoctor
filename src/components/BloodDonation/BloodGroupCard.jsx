// src/components/BloodGroupCard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet, ArrowRight, ArrowLeft, CheckCircle2,
  Clock, AlertCircle, TrendingUp, Users, HeartPulse,
} from "lucide-react";
import { bloodApi } from "../../services/bloodApi";
import "./BloodGroupCard.css";

/* Fallback so the card still renders if backend is down */
const COMPATIBILITY = {
  "O-":  { canDonateTo: ["O-","O+","A-","A+","B-","B+","AB-","AB+"], canReceiveFrom: ["O-"] },
  "O+":  { canDonateTo: ["O+","A+","B+","AB+"],                     canReceiveFrom: ["O-","O+"] },
  "A-":  { canDonateTo: ["A-","A+","AB-","AB+"],                    canReceiveFrom: ["O-","A-"] },
  "A+":  { canDonateTo: ["A+","AB+"],                               canReceiveFrom: ["O-","O+","A-","A+"] },
  "B-":  { canDonateTo: ["B-","B+","AB-","AB+"],                    canReceiveFrom: ["O-","B-"] },
  "B+":  { canDonateTo: ["B+","AB+"],                               canReceiveFrom: ["O-","O+","B-","B+"] },
  "AB-": { canDonateTo: ["AB-","AB+"],                              canReceiveFrom: ["O-","A-","B-","AB-"] },
  "AB+": { canDonateTo: ["AB+"],                                    canReceiveFrom: ["O-","O+","A-","A+","B-","B+","AB-","AB+"] },
};

const STATUS_META = {
  healthy:  { label: "Healthy",  Icon: CheckCircle2 },
  stable:   { label: "Stable",   Icon: TrendingUp },
  low:      { label: "Low",      Icon: Clock },
  critical: { label: "Critical", Icon: AlertCircle },
};

/* Normalize unknown / capitalized statuses back to a known key */
const normalizeStatus = (s) => {
  const key = String(s || "").toLowerCase().trim();
  return STATUS_META[key] ? key : "stable";
};

const groupColorClass = (group = "") => {
  if (group.startsWith("O")) return "bgs-o";
  if (group.startsWith("A")) return "bgs-a";
  if (group.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

/* Coerce anything (number | numeric string | undefined) to a safe non-negative int */
const toSafeInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/* Indian-format a number that might arrive as a string */
const formatIN = (v) => toSafeInt(v).toLocaleString("en-IN");

/* Session-wide cache of compatibility lookups */
const compatCache = new Map();

export default function BloodGroupCard({
  group = "O+",
  units = 0,
  capacity = 0,
  donors = 0,
  trend = null,
  status = "stable",
  city = null,
  compact = false,
  onClick,
  showCompatibility = true,
}) {
  const [compat, setCompat] = useState(
    () => compatCache.get(group) || COMPATIBILITY[group] || { canDonateTo: [], canReceiveFrom: [] }
  );

  useEffect(() => {
    if (!showCompatibility) return;
    if (compatCache.has(group)) {
      setCompat(compatCache.get(group));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await bloodApi.compatibility(group);
        if (cancelled) return;
        const value = {
          canDonateTo:    Array.isArray(data?.canDonateTo)    ? data.canDonateTo    : [],
          canReceiveFrom: Array.isArray(data?.canReceiveFrom) ? data.canReceiveFrom : [],
        };
        compatCache.set(group, value);
        setCompat(value);
      } catch {
        /* fall back to local map */
      }
    })();
    return () => { cancelled = true; };
  }, [group, showCompatibility]);

  /* Safe numbers */
  const safeUnits    = toSafeInt(units);
  const safeCapacity = toSafeInt(capacity);
  const safeDonors   = toSafeInt(donors);

  const pct = safeCapacity > 0
    ? Math.min(100, Math.round((safeUnits / safeCapacity) * 100))
    : 0;

  const statusKey = normalizeStatus(status);
  const meta = STATUS_META[statusKey];
  const StatusIcon = meta.Icon;
  const isClickable = typeof onClick === "function";

  const { donatePreview, receivePreview, donateMore, receiveMore } = useMemo(() => {
    const MAX = compact ? 3 : 5;
    const donate  = compat.canDonateTo    || [];
    const receive = compat.canReceiveFrom || [];
    return {
      donatePreview:  donate.slice(0, MAX),
      receivePreview: receive.slice(0, MAX),
      donateMore:  Math.max(0, donate.length  - MAX),
      receiveMore: Math.max(0, receive.length - MAX),
    };
  }, [compat, compact]);

  const handleClick = (e) => {
    if (!isClickable) return;
    /* Guard against clicks on anchors / buttons inside the card */
    if (e.target instanceof Element && e.target.closest("a, button")) return;
    onClick(group);
  };

  const handleKeyDown = (e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(group);
    }
  };

  const href = `/donate-blood/find-donors?group=${encodeURIComponent(group)}${city ? `&city=${encodeURIComponent(city)}` : ""}`;

  return (
    <article
      className={`bgc-card bgc-card--${statusKey}${compact ? " bgc-card--compact" : ""}${isClickable ? " bgc-card--clickable" : ""}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={isClickable ? `Blood group ${group} — ${meta.label}` : undefined}
    >
      <header className="bgc-card__head">
        <span className={`bgc-group ${groupColorClass(group)}`}>
          <Droplet size={13} fill="currentColor" /> {group}
        </span>
        <span className="bgc-status">
          <StatusIcon size={12} /> {meta.label}
        </span>
      </header>

      <div className="bgc-card__title">
        <h3>Blood group {group}</h3>
        {city && <small>Availability in {city}</small>}
      </div>

      <div className="bgc-card__meter">
        <div className="bgc-meter__row">
          <span className="bgc-meter__label">
            <Droplet size={11} /> {formatIN(safeUnits)} / {formatIN(safeCapacity)} units
          </span>
          <span className="bgc-meter__pct">{pct}%</span>
        </div>
        <div
          className="bgc-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${group} availability`}
        >
          <span className="bgc-bar__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="bgc-meter__meta">
          <span>
            <Users size={11} /> {formatIN(safeDonors)} active donor{safeDonors === 1 ? "" : "s"}
          </span>
          {trend && (
            <span className={`bgc-trend ${String(trend).startsWith("-") ? "is-down" : "is-up"}`}>
              {trend}
            </span>
          )}
        </div>
      </div>

      {showCompatibility && (
        <div className="bgc-compat">
          <div className="bgc-compat__row">
            <span className="bgc-compat__label">
              <ArrowRight size={11} /> Can donate to
            </span>
            <div className="bgc-chips">
              {donatePreview.map((g) => (
                <span key={`d-${g}`} className={`bgc-chip ${groupColorClass(g)}`}>{g}</span>
              ))}
              {donateMore > 0 && <span className="bgc-chip bgc-chip--more">+{donateMore}</span>}
            </div>
          </div>
          <div className="bgc-compat__row">
            <span className="bgc-compat__label">
              <ArrowLeft size={11} /> Can receive from
            </span>
            <div className="bgc-chips">
              {receivePreview.map((g) => (
                <span key={`r-${g}`} className={`bgc-chip ${groupColorClass(g)}`}>{g}</span>
              ))}
              {receiveMore > 0 && <span className="bgc-chip bgc-chip--more">+{receiveMore}</span>}
            </div>
          </div>
        </div>
      )}

      <footer className="bgc-card__footer">
        {/* ✅ Use <Link> — avoids a full page reload */}
        <Link to={href} className="bgc-cta">
          <HeartPulse size={13} /> Find {group} donors <ArrowRight size={13} />
        </Link>
      </footer>
    </article>
  );
}