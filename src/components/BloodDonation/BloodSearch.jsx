// src/components/BloodSearch.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search, MapPin, Droplet, Phone, Mail, Clock,
  SlidersHorizontal, X, CheckCircle2, AlertCircle, HeartPulse,
} from "lucide-react";
import { bloodApi } from "../../services/bloodApi";
import "./BloodSearch.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CITIES_FALLBACK = ["All cities"];

const groupColor = (g = "") => {
  if (g.startsWith("O")) return "bgs-o";
  if (g.startsWith("A")) return "bgs-a";
  if (g.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

const timeAgo = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

/* Prefer `_id` (Mongo) or fall back to `id` */
const donorKey = (d) => d?.id ?? d?._id ?? "";

export default function BloodSearch() {
  const [query, setQuery]                     = useState("");
  const [group, setGroup]                     = useState("");
  const [city, setCity]                       = useState("All cities");
  const [onlyAvailable, setOnlyAvailable]     = useState(true);
  const [filtersOpen, setFiltersOpen]         = useState(false);

  const [donors, setDonors]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [cities, setCities]   = useState(CITIES_FALLBACK);

  const debounceRef = useRef();
  const abortRef    = useRef();

  /* Fetch on filter change with 300ms debounce on query */
  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      /* Cancel any in-flight request so older responses can't overwrite newer ones */
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const params = {
          availableOnly: String(onlyAvailable),
          limit: 50,
        };
        if (group) params.bloodGroup = group;
        if (city !== "All cities") params.city = city;
        if (query.trim()) params.q = query.trim();

        const data = await bloodApi.searchDonors(params, { signal: controller.signal });

        if (controller.signal.aborted) return;

        const results = data.results || [];
        setDonors(results);
        setTotal(data.total || 0);

        /* Merge cities from every response — dropdown grows, never shrinks */
        setCities((prev) => {
          const merged = new Set(prev);
          results.forEach((d) => { if (d.city) merged.add(d.city); });
          return Array.from(merged);
        });
      } catch (err) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Something went wrong");
        setDonors([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, group, city, onlyAvailable]);

  /* Abort any pending request on unmount */
  useEffect(() => () => abortRef.current?.abort(), []);

  const clearAll = () => {
    setQuery("");
    setGroup("");
    setCity("All cities");
    setOnlyAvailable(true);
  };

  const handleContact = async (donor, method) => {
    const id = donorKey(donor);
    try { await bloodApi.contactDonor(id); } catch { /* logging failure is non-fatal */ }

    if (method === "phone") {
      if (!donor.phone) {
        alert("This donor hasn't shared a phone number yet.");
        return;
      }
      /* Use an anchor click instead of window.location to avoid breaking SPA history */
      const a = document.createElement("a");
      a.href = `tel:${String(donor.phone).replace(/\s/g, "")}`;
      a.rel = "noopener";
      a.click();
    } else if (method === "email") {
      if (!donor.email) {
        alert("This donor hasn't shared an email address yet.");
        return;
      }
      const a = document.createElement("a");
      a.href = `mailto:${donor.email}`;
      a.click();
    }
  };

  const hasActiveFilters = query || group || city !== "All cities" || !onlyAvailable;

  return (
    <section className="bs-section">
      <header className="bs-header">
        <div>
          <span className="bs-eyebrow"><HeartPulse size={12} /> Donor directory</span>
          <h2 className="bs-title">Find a blood donor near you</h2>
          <p className="bs-subtitle">
            Search verified donors by blood group, city, and availability.
            Reach out directly — every minute counts.
          </p>
        </div>
        <button
          type="button"
          className="bs-filter-toggle"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={15} />
          {filtersOpen ? "Hide filters" : "Filters"}
          {hasActiveFilters && <span className="bs-filter-dot" aria-hidden="true" />}
        </button>
      </header>

      <div className="bs-searchbar">
        <Search size={18} className="bs-searchbar__icon" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, city, area, or blood group…"
          aria-label="Search donors"
          className="bs-searchbar__input"
        />
        {query && (
          <button
            type="button"
            className="bs-searchbar__clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="bs-filters">
          <div className="bs-filter-group">
            <span className="bs-filter-label">Blood group</span>
            <div className="bs-chips">
              <button
                type="button"
                className={`bs-chip${!group ? " is-active" : ""}`}
                onClick={() => setGroup("")}
              >
                Any
              </button>
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`bs-chip ${groupColor(g)}${group === g ? " is-active" : ""}`}
                  onClick={() => setGroup(g === group ? "" : g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="bs-filter-row">
            <div className="bs-filter-group">
              <span className="bs-filter-label">City</span>
              <select
                className="bs-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Filter by city"
              >
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <label className="bs-switch">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              <span className="bs-switch__track" aria-hidden="true">
                <span className="bs-switch__thumb" />
              </span>
              Only show available donors
            </label>

            {hasActiveFilters && (
              <button type="button" className="bs-reset" onClick={clearAll}>
                <X size={13} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bs-meta" role="status" aria-live="polite">
        {loading ? "Searching…" : (
          <>
            <strong>{total}</strong> {total === 1 ? "donor" : "donors"} found
            {group && <> · group <b>{group}</b></>}
            {city !== "All cities" && <> · in <b>{city}</b></>}
            {onlyAvailable && <> · available only</>}
          </>
        )}
      </div>

      {error && (
        <div className="bs-empty" role="alert">
          <AlertCircle size={30} />
          <p>{error}</p>
        </div>
      )}

      {!error && !loading && donors.length === 0 && (
        <div className="bs-empty">
          <AlertCircle size={30} />
          <p>No donors match your filters</p>
          <small>Try widening the blood group or city, or turn off "available only".</small>
          {hasActiveFilters && (
            <button type="button" className="bs-reset bs-reset--big" onClick={clearAll}>
              <X size={14} /> Reset filters
            </button>
          )}
        </div>
      )}

      {!error && donors.length > 0 && (
        <ul className="bs-grid">
          {donors.map((donor, i) => (
            <li
              key={donorKey(donor)}
              className="bs-card"
              style={{ "--bs-stagger": `${i * 40}ms` }}
              aria-label={`${donor.name}, ${donor.group}, ${donor.city || "location unknown"}`}
            >
              <div className="bs-card__head">
                <span className={`bs-group ${groupColor(donor.group)}`}>
                  <Droplet size={12} fill="currentColor" /> {donor.group}
                </span>
                <span className={`bs-avail ${donor.available ? "is-yes" : "is-no"}`}>
                  {donor.available
                    ? <><CheckCircle2 size={12} /> Available</>
                    : <><Clock size={12} /> Unavailable</>}
                </span>
              </div>

              <div className="bs-card__body">
                <span className="bs-avatar" aria-hidden="true">{getInitials(donor.name)}</span>
                <div className="bs-card__identity">
                  <h4>{donor.name}</h4>
                  <p><MapPin size={11} /> {[donor.area, donor.city].filter(Boolean).join(", ") || "Location not shared"}</p>
                  <small>Last donated {timeAgo(donor.lastDonated)}</small>
                </div>
              </div>

              <div className="bs-card__actions">
                <button
                  type="button"
                  className="bs-btn bs-btn--primary"
                  onClick={() => handleContact(donor, "phone")}
                  disabled={!donor.phone}
                  aria-label={donor.phone ? `Call ${donor.name}` : "Phone not available"}
                >
                  <Phone size={14} /> Call
                </button>
                <button
                  type="button"
                  className="bs-btn bs-btn--ghost"
                  onClick={() => handleContact(donor, "email")}
                  disabled={!donor.email}
                  aria-label={donor.email ? `Email ${donor.name}` : "Email not available"}
                >
                  <Mail size={14} /> Email
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}