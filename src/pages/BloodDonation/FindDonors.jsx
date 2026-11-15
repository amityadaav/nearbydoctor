// src/pages/BloodDonation/FindDonors.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, MapPin, Droplet, SlidersHorizontal, X, AlertCircle,
  ArrowUpDown, List, Map as MapIcon, RefreshCw, CheckCircle2,
  Clock, Users, Navigation, ArrowRight,
} from "lucide-react";

import DonorCard from "../../components/BloodDonation/DonorCard";
import { bloodApi } from "../../services/bloodApi";
import "./FindDonors.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SORT_OPTIONS = [
  { value: "distance",  label: "Nearest first"    },
  { value: "recent",    label: "Recently active"  },
  { value: "rating",    label: "Highest rated"    },
  { value: "donations", label: "Most donations"   },
];

const groupColorClass = (group = "") => {
  if (group.startsWith("O")) return "bgs-o";
  if (group.startsWith("A")) return "bgs-a";
  if (group.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

function FindDonors({ onDonorClick, onContact }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery]               = useState("");
  const [group, setGroup]               = useState(searchParams.get("group") || "");
  const [city, setCity]                 = useState(searchParams.get("city") || "All cities");
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sortBy, setSortBy]             = useState("recent");
  const [view, setView]                 = useState("list");
  const [filtersOpen, setFiltersOpen]   = useState(true);

  const [donors, setDonors]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [cities, setCities]   = useState(["All cities"]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const debounceRef = useRef();

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { availableOnly: String(onlyAvailable), limit: 50 };
      if (group) params.bloodGroup = group;
      if (city !== "All cities") params.city = city;
      if (query.trim()) params.q = query.trim();

      const data = await bloodApi.searchDonors(params);
      setDonors(data.results || []);
      setTotal(data.total || 0);

      if (data.results?.length) {
        const uniqueCities = Array.from(new Set(data.results.map((d) => d.city).filter(Boolean)));
        setCities(["All cities", ...uniqueCities]);
      }
    } catch (err) {
      setError(err.message);
      setDonors([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, group, city, onlyAvailable]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchDonors, 300);
    return () => clearTimeout(debounceRef.current);
  }, [fetchDonors]);

  /* Sync filters → URL so links are shareable */
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (group) next.set("group", group); else next.delete("group");
    if (city !== "All cities") next.set("city", city); else next.delete("city");
    setSearchParams(next, { replace: true });
  }, [group, city]); // eslint-disable-line

  /* Client-side sorting (backend already filtered) */
  const results = useMemo(() => {
    const sorted = [...donors];
    if (sortBy === "recent") {
      sorted.sort((a, b) => new Date(b.lastDonated || 0) - new Date(a.lastDonated || 0));
    } else if (sortBy === "rating") {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "donations") {
      sorted.sort((a, b) => (b.donations || 0) - (a.donations || 0));
    }
    return sorted;
  }, [donors, sortBy]);

  const hasActiveFilters = Boolean(query) || Boolean(group) || city !== "All cities" || !onlyAvailable;

  const clearAll = useCallback(() => {
    setQuery(""); setGroup(""); setCity("All cities"); setOnlyAvailable(true); setError("");
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDonors();
  }, [fetchDonors]);

  const handleContact = useCallback(async (donor, method) => {
    if (onContact) return onContact(donor, method);
    try { await bloodApi.contactDonor(donor.id); } catch { /* ignore */ }
    if (method === "phone" && donor.phone) {
      window.location.href = `tel:${donor.phone.replace(/\s/g, "")}`;
    } else if (method === "email" && donor.email) {
      window.location.href = `mailto:${donor.email}`;
    }
  }, [onContact]);

  return (
    <section className="fd-section" aria-labelledby="fd-heading">
      <header className="fd-header">
        <div>
          <span className="fd-eyebrow"><Droplet size={12} /> Donor search</span>
          <h1 id="fd-heading" className="fd-title">Find a blood donor near you</h1>
          <p className="fd-subtitle">
            Search verified donors by blood group, city, and availability.
            Reach out directly — every minute counts.
          </p>
        </div>

        <div className="fd-header__actions">
          <button type="button" className="fd-icon-btn" onClick={handleRefresh}
                  disabled={refreshing} aria-label="Refresh results" title="Refresh">
            <RefreshCw size={15} className={refreshing ? "fd-spin" : ""} />
          </button>
          <button type="button"
                  className={`fd-filter-toggle${hasActiveFilters ? " has-active" : ""}`}
                  onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <SlidersHorizontal size={15} /> Filters
            {hasActiveFilters && <span className="fd-filter-dot" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {error && (
        <div className="fd-error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      <div className="fd-searchbar">
        <Search size={18} className="fd-searchbar__icon" aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
               placeholder="Search by name, city, area, or blood group…"
               aria-label="Search donors" className="fd-searchbar__input" />
        {query && (
          <button type="button" className="fd-searchbar__clear" onClick={() => setQuery("")}
                  aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="fd-filters">
          <div className="fd-filter-group">
            <span className="fd-filter-label">Blood group</span>
            <div className="fd-chips">
              <button type="button" className={`fd-chip${!group ? " is-active" : ""}`}
                      onClick={() => setGroup("")}>Any</button>
              {BLOOD_GROUPS.map((g) => (
                <button key={g} type="button"
                        className={`fd-chip ${groupColorClass(g)}${group === g ? " is-active" : ""}`}
                        onClick={() => setGroup(g === group ? "" : g)}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="fd-filter-row">
            <label className="fd-field">
              <span className="fd-filter-label">City</span>
              <select className="fd-select" value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="fd-field">
              <span className="fd-filter-label"><ArrowUpDown size={11} /> Sort by</span>
              <select className="fd-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>

            <label className="fd-switch">
              <input type="checkbox" checked={onlyAvailable}
                     onChange={(e) => setOnlyAvailable(e.target.checked)} />
              <span className="fd-switch__track" aria-hidden="true"><span className="fd-switch__thumb" /></span>
              Available only
            </label>

            {hasActiveFilters && (
              <button type="button" className="fd-reset" onClick={clearAll}>
                <X size={13} /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div className="fd-meta">
        <div className="fd-meta__left">
          {loading ? "Searching…" : (
            <><strong>{total}</strong> {total === 1 ? "donor" : "donors"} found
              {group && <> · group <b>{group}</b></>}
              {city !== "All cities" && <> · in <b>{city}</b></>}
              {onlyAvailable && <> · available only</>}
            </>
          )}
        </div>

        <div className="fd-view" role="tablist" aria-label="Result view">
          <button type="button" role="tab" aria-selected={view === "list"}
                  className={`fd-view__btn${view === "list" ? " is-active" : ""}`}
                  onClick={() => setView("list")}>
            <List size={13} /> List
          </button>
          <button type="button" role="tab" aria-selected={view === "map"}
                  className={`fd-view__btn${view === "map" ? " is-active" : ""}`}
                  onClick={() => setView("map")}>
            <MapIcon size={13} /> Map
          </button>
        </div>
      </div>

      {!loading && results.length === 0 && !error ? (
        <div className="fd-empty">
          <AlertCircle size={30} />
          <p>No donors match your filters</p>
          <small>Try widening the blood group or city, or turn off “Available only”.</small>
          {hasActiveFilters && (
            <button type="button" className="fd-reset fd-reset--big" onClick={clearAll}>
              <X size={14} /> Reset filters
            </button>
          )}
        </div>
      ) : view === "list" ? (
        <ul className="fd-grid">
          {results.map((donor) => (
            <li key={donor.id}>
              <DonorCard
                donor={donor}
                variant="elevated"
                onContact={handleContact}
                onClick={onDonorClick ? (d) => onDonorClick(donor) : undefined}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="fd-map">
          <div className="fd-map__canvas" aria-label="Map placeholder">
            <div className="fd-map__grid" aria-hidden="true" />
            {results.slice(0, 6).map((d, i) => (
              <button key={d.id} type="button"
                      className={`fd-pin ${groupColorClass(d.group)}`}
                      style={{
                        "--pin-x": `${15 + ((i * 27) % 70)}%`,
                        "--pin-y": `${20 + ((i * 19) % 60)}%`,
                      }}
                      onClick={() => onDonorClick?.(d)}
                      title={`${d.name} · ${d.group}`}
                      aria-label={`${d.name}, ${d.group} blood type`}>
                <Navigation size={11} fill="currentColor" />
                <span>{d.group}</span>
              </button>
            ))}
            <span className="fd-map__hint">
              <MapPin size={12} /> Showing {Math.min(results.length, 6)} of {results.length} donors
            </span>
          </div>

          <ul className="fd-map__list">
            {results.slice(0, 6).map((d) => (
              <li key={d.id}>
                <button type="button" className="fd-map__item" onClick={() => onDonorClick?.(d)}>
                  <span className={`fd-map__badge ${groupColorClass(d.group)}`}>{d.group}</span>
                  <div>
                    <strong>{d.name}</strong>
                    <small><MapPin size={10} /> {d.area}, {d.city}</small>
                  </div>
                  <span className={`fd-map__avail ${d.available ? "is-yes" : "is-no"}`}>
                    {d.available ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  </span>
                  <ArrowRight size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="fd-foot">
        <Users size={13} />
        <span>
          Don&rsquo;t see the right donor?{" "}
          <a href="/donate-blood/request">Post a blood request</a> — we&rsquo;ll notify
          every matching donor nearby.
        </span>
      </div>
    </section>
  );
}

export default FindDonors;