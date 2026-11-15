// src/components/BloodHero.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play, Droplet, HeartPulse } from "lucide-react";
import { bloodApi } from "../../services/bloodApi";
import "./BloodHero.css";
import bloodHeroImage from "../../assets/images/HealthcareTeams.png";

const actions = [
  { to: "/donate-blood/become-donor", label: "Become a donor", Icon: Droplet,    variant: "primary" },
  { to: "/donate-blood/find-donors",  label: "Find blood",     Icon: HeartPulse, variant: "urgent"  },
];

/* Neutral placeholders — never claim invented numbers */
const PLACEHOLDER_STATS = {
  lives:  null,
  donors: null,
  banks:  null,
};

/* Robust number formatter: 999 → "999+", 1234 → "1.2k+", 2500000 → "2.5M+" */
const formatStat = (n) => {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k+`;
  }
  return `${n}+`;
};

/* Read a numeric field from several possible API shapes */
const pickNumber = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
};

const BloodHero = () => {
  const [summary, setSummary] = useState(PLACEHOLDER_STATS);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    bloodApi
      .summary({ signal: controller.signal })
      .then((res) => {
        if (cancelled || !res) return;

        // Accept flat shape OR { summary: {...} } OR { data: {...} }
        const s = res.summary || res.data || res;

        setSummary({
          lives:  pickNumber(s, ["livesImpacted", "lives", "livesSaved"]),
          donors: pickNumber(s, ["registeredDonors", "donors", "activeDonors"]),
          banks:  pickNumber(s, ["partnerBloodBanks", "bloodBanks", "banks"]),
        });
        setLive(true);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        // Silent failure is OK here — we keep placeholders rather than fake data
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const stats = [
    { value: formatStat(summary.lives),  label: "Lives saved"   },
    { value: formatStat(summary.donors), label: "Active donors" },
    { value: live ? "24/7" : "—",        label: "Emergency aid" },
  ];

  return (
    <section className="bh-hero">
      <div className="bh-stage">
        <div className="bh-panel" aria-hidden="true" />

        {/* LEFT */}
        <div className="bh-left">
          <h1 className="bh-title">
            Every Drop
            <span className="bh-title__line">
              Saves A<span className="bh-orb" aria-hidden="true" />Life.
            </span>
          </h1>

          <p className="bh-tagline">
            Join a community of everyday heroes. Donate blood, find
            nearby blood banks in seconds, and give someone a second
            chance at life.
          </p>

          <div className="bh-actions">
            {actions.map(({ to, label, Icon, variant }) => (
              <Link
                key={label}
                to={to}
                className={`bh-action${variant ? ` bh-action--${variant}` : ""}`}
              >
                <span className="bh-action__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {label}
                {variant === "primary" && (
                  <ArrowRight size={16} aria-hidden="true" className="bh-action__arrow" />
                )}
              </Link>
            ))}
          </div>

          <div className="bh-stats">
            <div className="bh-stats__thumb">
              <button type="button" className="bh-stats__play" aria-label="Watch donor stories">
                <Play size={14} fill="currentColor" aria-hidden="true" />
              </button>
              <span className="bh-stats__tour">Donor stories</span>
            </div>

            <dl className="bh-stats__grid" aria-live="polite">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* CENTER */}
        <img
          src={bloodHeroImage}
          alt=""
          aria-hidden="true"
          className="bh-person"
        />

        <span className="bh-chip bh-chip--1">Compatible</span>
        <span className="bh-chip bh-chip--2">Life-saving</span>
        <span className="bh-chip bh-chip--3">Trusted</span>

        {/* RIGHT */}
        <div className="bh-right">
          <div className="bh-right__top">
            <h2>Donate today, be someone&rsquo;s tomorrow</h2>
            <p>
              A single donation can save up to three lives. Book a
              slot at the nearest blood bank — it takes just 10
              minutes.
            </p>
          </div>

          <div className="bh-right__bottom">
            <p className="bh-feedback">Every donor makes a difference.</p>
            <div className="bh-right__row">
              <div className="bh-avatars" aria-hidden="true">
                <span>A</span>
                <span>R</span>
                <span>S</span>
              </div>
              <Link
                to="/donate-blood/find-donors"
                className="bh-arrow"
                aria-label="Find blood banks"
              >
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BloodHero;