// src/components/BloodStats.jsx
import { useEffect, useRef, useState } from "react";
import {
  Droplet, Users, HeartPulse, Clock, TrendingUp,
  CheckCircle2, AlertCircle, ArrowUpRight, Building2,
} from "lucide-react";
import { bloodApi } from "../../services/bloodApi";
import "./BloodStats.css";

/* Static fallback labels/icons — values come from backend */
const KPI_META = [
  { key: "livesImpacted",  label: "Lives impacted",      suffix: "+", Icon: HeartPulse, accent: "rose"    },
  { key: "registeredDonors", label: "Registered donors", suffix: "+", Icon: Users,      accent: "crimson" },
  { key: "unitsCollected", label: "Units collected",     suffix: "",  Icon: Droplet,    accent: "blood"   },
  { key: "partnerBloodBanks", label: "Partner blood banks", suffix: "", Icon: Building2, accent: "plum"  },
];

const GROUPS_FALLBACK = ["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((g) => ({
  group: g, units: 0, capacity: 1, pct: 0, status: "critical",
}));

const groupColorClass = (group = "") => {
  if (group.startsWith("O")) return "bgs-o";
  if (group.startsWith("A")) return "bgs-a";
  if (group.startsWith("B")) return "bgs-b";
  return "bgs-ab";
};

const STATUS_META = {
  healthy:  { text: "Healthy",  Icon: CheckCircle2 },
  stable:   { text: "Stable",   Icon: TrendingUp },
  low:      { text: "Low",      Icon: Clock },
  critical: { text: "Critical", Icon: AlertCircle },
};

/* Count-up hook */
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    if (reduced) { setValue(target); return; }
    if (started.current) { setValue(target); return; }
    started.current = true;

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return value;
}

function KpiCard({ meta, value, index }) {
  const display = useCountUp(Number(value) || 0);
  const { Icon } = meta;
  return (
    <article
      className={`bstat-kpi bstat-kpi--${meta.accent}`}
      style={{ "--bstat-stagger": `${index * 60}ms` }}
    >
      <span className="bstat-kpi__icon" aria-hidden="true"><Icon size={18} /></span>
      <div className="bstat-kpi__body">
        <span className="bstat-kpi__value">
          {display.toLocaleString("en-IN")}{meta.suffix}
        </span>
        <span className="bstat-kpi__label">{meta.label}</span>
      </div>
    </article>
  );
}

function GroupBar({ item, index }) {
  const pct = item.pct ?? Math.round((item.units / (item.capacity || 1)) * 100);
  const meta = STATUS_META[item.status] || STATUS_META.stable;
  const { Icon } = meta;
  return (
    <li className={`bstat-grouproll__item bstat-status--${item.status}`}
        style={{ "--bstat-stagger": `${index * 45}ms` }}>
      <div className="bstat-grouproll__head">
        <span className={`bstat-badge ${groupColorClass(item.group)}`}>
          <Droplet size={11} fill="currentColor" /> {item.group}
        </span>
        <span className="bstat-grouproll__status"><Icon size={12} /> {meta.text}</span>
      </div>
      <div className="bstat-bar" role="progressbar" aria-valuenow={pct}
           aria-valuemin={0} aria-valuemax={100}>
        <span className="bstat-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="bstat-grouproll__meta">
        <span><strong>{item.units}</strong> / {item.capacity} units</span>
      </div>
    </li>
  );
}

export default function BloodStats() {
  const [summary, setSummary] = useState({});
  const [groups, setGroups]   = useState(GROUPS_FALLBACK);
  const [urgent, setUrgent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, g, u] = await Promise.all([
          bloodApi.summary(),
          bloodApi.groupStats(),
          bloodApi.urgentRequests(),
        ]);
        if (cancelled) return;
        setSummary(s || {});
        setGroups(g?.groups?.length ? g.groups : GROUPS_FALLBACK);
        setUrgent(u?.results || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bstat-section" aria-labelledby="bstat-heading">
      <header className="bstat-header">
        <div>
          <span className="bstat-eyebrow"><TrendingUp size={12} /> Community impact</span>
          <h2 id="bstat-heading" className="bstat-title">Every number is a life touched</h2>
          <p className="bstat-subtitle">
            Real-time snapshot of our donor network — updated whenever a unit
            is collected, dispatched, or used in an emergency.
          </p>
        </div>
        <a href="/donate-blood/register" className="bstat-cta">
          Join the network <ArrowUpRight size={16} />
        </a>
      </header>

      {error && <div className="bstat-error" role="alert">{error}</div>}

      <div className="bstat-kpis">
        {KPI_META.map((m, i) => (
          <KpiCard key={m.key} meta={m} value={summary?.[m.key] ?? 0} index={i} />
        ))}
      </div>

      <div className="bstat-main">
        <section className="bstat-panel" aria-labelledby="bstat-groups-heading">
          <div className="bstat-panel__head">
            <div>
              <h3 id="bstat-groups-heading">Blood group availability</h3>
              <p>Live inventory across partner banks</p>
            </div>
            <span className="bstat-panel__tag">
              <Clock size={11} /> updated just now
            </span>
          </div>
          <ul className="bstat-grouproll">
            {loading
              ? GROUPS_FALLBACK.map((g, i) => <GroupBar key={g.group} item={g} index={i} />)
              : groups.map((g, i) => <GroupBar key={g.group} item={g} index={i} />)}
          </ul>
        </section>

        <aside className="bstat-panel bstat-panel--urgent" aria-labelledby="bstat-urgent-heading">
          <div className="bstat-panel__head">
            <div>
              <h3 id="bstat-urgent-heading">Urgent needs</h3>
              <p>Active requests right now</p>
            </div>
            <span className="bstat-panel__tag bstat-panel__tag--urgent">
              <AlertCircle size={11} /> live
            </span>
          </div>

          <ul className="bstat-urgent">
            {urgent.length === 0 && !loading && (
              <li className="bstat-urgent__item">
                <span className="bstat-urgent__body">
                  <strong>No urgent requests</strong>
                  <small>All clear right now.</small>
                </span>
              </li>
            )}
            {urgent.map((u, i) => (
              <li key={u.id || `${u.group}-${u.city}-${i}`}
                  className="bstat-urgent__item"
                  style={{ "--bstat-stagger": `${i * 70}ms` }}>
                <span className={`bstat-badge ${groupColorClass(u.group)} bstat-badge--lg`}>
                  <Droplet size={12} fill="currentColor" /> {u.group}
                </span>
                <div className="bstat-urgent__body">
                  <strong>{u.city}</strong>
                  <small>Needs {u.need} · {u.urgency}</small>
                </div>
                <a
                  href={`/donate-blood/find-donors?group=${encodeURIComponent(u.group)}&city=${encodeURIComponent(u.city)}`}
                  className="bstat-urgent__btn"
                  aria-label={`Respond to ${u.group} request in ${u.city}`}
                >
                  Respond <ArrowUpRight size={13} />
                </a>
              </li>
            ))}
          </ul>

          <div className="bstat-impact">
            <span className="bstat-impact__icon" aria-hidden="true">
              <HeartPulse size={18} />
            </span>
            <div>
              <strong>1 donation = up to 3 lives</strong>
              <small>Whole blood is split into red cells, plasma, and platelets.</small>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}