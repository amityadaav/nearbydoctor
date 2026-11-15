// src/pages/BloodDonation/BloodDonation.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Droplet, Users, AlertCircle } from "lucide-react";

import BloodHero from "../../components/BloodDonation/BloodHero";
import BloodGroupCard from "../../components/BloodDonation/BloodGroupCard";
import BloodSearch from "../../components/BloodDonation/BloodSearch";
import BloodStats from "../../components/BloodDonation/BloodStats";
import DonorCard from "../../components/BloodDonation/DonorCard";
import { bloodApi } from "../../services/bloodApi";
import "./BloodDonation.css";

const GROUPS_FALLBACK = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((g) => ({
  group: g, units: 0, capacity: 1, pct: 0, status: "critical", donors: 0, trend: null,
}));

const BloodDonation = () => {
  const [groups, setGroups] = useState(GROUPS_FALLBACK);
  const [featured, setFeatured] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [error, setError] = useState("");

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Load blood group inventory */
  useEffect(() => {
    let cancelled = false;
    bloodApi.groupStats()
      .then((data) => {
        if (cancelled) return;
        setGroups(data?.groups?.length ? data.groups : GROUPS_FALLBACK);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingGroups(false); });
    return () => { cancelled = true; };
  }, []);

  /* Load featured donors */
  useEffect(() => {
    let cancelled = false;
    bloodApi.searchDonors({ availableOnly: "true", limit: 4 })
      .then((data) => {
        if (cancelled) return;
        setFeatured(data?.results || []);
      })
      .catch(() => { /* silently fall back to empty */ })
      .finally(() => { if (!cancelled) setLoadingFeatured(false); });
    return () => { cancelled = true; };
  }, []);

  const handleContact = useCallback(async (donor, method) => {
    try { await bloodApi.contactDonor(donor.id); } catch { /* ignore */ }
    if (method === "phone" && donor.phone) {
      window.location.href = `tel:${donor.phone.replace(/\s/g, "")}`;
    } else if (method === "email" && donor.email) {
      window.location.href = `mailto:${donor.email}`;
    }
  }, []);

  const groupCount = useMemo(() => groups.length, [groups]);

  return (
    <div className="blood-donation-page">
      <section id="hero" className="bd-section bd-section--hero">
        <BloodHero />
      </section>

      <section id="groups" className="bd-section">
        <header className="bd-section__head">
          <div>
            <span className="bd-eyebrow"><Droplet size={12} /> Blood groups</span>
            <h2 className="bd-title">All 8 blood types, tracked live</h2>
            <p className="bd-subtitle">
              Availability, compatibility, and active donors for every group —
              updated in real time from partner blood banks.
            </p>
          </div>
          <span className="bd-count">{groupCount} groups</span>
        </header>

        {error && (
          <div className="bd-error" role="alert">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="bd-grid">
          {groups.map((g) => (
            <BloodGroupCard
              key={g.group}
              group={g.group}
              units={g.units}
              capacity={g.capacity}
              donors={g.donors || 0}
              trend={g.trend || null}
              status={g.status}
              compact={loadingGroups}
              onClick={() => scrollTo("search")}
            />
          ))}
        </div>
      </section>

      <section id="search" className="bd-section">
        <BloodSearch />
      </section>

      <section id="stats" className="bd-section">
        <BloodStats />
      </section>

      <section id="donors" className="bd-section">
        <header className="bd-section__head">
          <div>
            <span className="bd-eyebrow"><Users size={12} /> Featured donors</span>
            <h2 className="bd-title">Heroes in our community</h2>
            <p className="bd-subtitle">
              A few of the verified donors who keep our shelves stocked —
              and our patients alive.
            </p>
          </div>
        </header>

        {!loadingFeatured && featured.length === 0 ? (
          <div className="bd-empty">
            <Users size={28} />
            <p>No featured donors yet.</p>
            <small>Be the first — <a href="/donate-blood/become-donor">register as a donor</a>.</small>
          </div>
        ) : (
          <div className="bd-grid">
            {featured.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                variant="elevated"
                onContact={(d) => handleContact(donor, d.method)}
                onClick={() => scrollTo("search")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BloodDonation;