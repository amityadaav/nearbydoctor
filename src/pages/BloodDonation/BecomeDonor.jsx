// src/pages/BloodDonation/BecomeDonor.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet, HeartPulse, ShieldCheck, Clock, CheckCircle2,
  AlertCircle, ArrowRight, UserPlus, CalendarCheck, Award,
  Sparkles, Phone, Mail, MapPin, ChevronDown,
} from "lucide-react";
import "./BecomeDonor.css";

const STEPS = [
  { n: 1, Icon: UserPlus,      title: "Create your profile",     text: "Sign up with your name, blood group, and city. Takes under a minute." },
  { n: 2, Icon: CalendarCheck, title: "Book a donation slot",    text: "Pick a partner blood bank and a time that works for you." },
  { n: 3, Icon: Award,         title: "Donate & save lives",     text: "A single donation can help up to three patients. You're a hero." },
];

const ELIGIBILITY = [
  { Icon: CheckCircle2, label: "Age 18 – 65 years",                     status: "yes" },
  { Icon: CheckCircle2, label: "Weight at least 50 kg",                 status: "yes" },
  { Icon: CheckCircle2, label: "Haemoglobin ≥ 12.5 g/dL",               status: "yes" },
  { Icon: CheckCircle2, label: "Last donation 90+ days ago",            status: "yes" },
  { Icon: AlertCircle,  label: "No fever or infection (last 14 days)",  status: "no"  },
  { Icon: AlertCircle,  label: "Not pregnant or breastfeeding",         status: "no"  },
];

const BENEFITS = [
  { Icon: HeartPulse,  title: "Free health check",  text: "BP, pulse, haemoglobin, and infection screening before every donation." },
  { Icon: ShieldCheck, title: "Safe & sterile",     text: "Single-use needles and trained staff at all partner banks." },
  { Icon: Clock,       title: "Just 10 minutes",    text: "The donation itself is quick — refreshments and rest included." },
  { Icon: Sparkles,    title: "Save up to 3 lives", text: "One whole-blood donation is split into red cells, plasma, and platelets." },
];

const FAQS = [
  { q: "How often can I donate blood?",         a: "Whole blood every 90 days (about 3 months) for men, and every 120 days for women. Platelet donations can be more frequent — every 14 days, up to 24 times a year." },
  { q: "Does donating blood hurt?",             a: "You'll feel a small pinch when the needle goes in, similar to a quick injection. After that, most donors feel nothing during the 8–10 minute donation." },
  { q: "What should I do before donating?",     a: "Eat a healthy meal, drink plenty of water, avoid alcohol for 24 hours, and bring a valid photo ID. Get a good night's sleep the night before." },
  { q: "Will I feel weak afterwards?",          a: "Most people feel fine. Rest for 10–15 minutes, have the provided refreshments, and avoid heavy lifting or strenuous exercise for the rest of the day." },
];

function BecomeDonor() {
  const [openFaq, setOpenFaq] = useState(0);
  const faqList = useMemo(() => FAQS, []);
  const toggleFaq = (i) => setOpenFaq((cur) => (cur === i ? -1 : i));

  return (
    <section className="bdn-section" aria-labelledby="bdn-heading">
      <header className="bdn-header">
        <div>
          <span className="bdn-eyebrow"><Droplet size={12} /> Become a donor</span>
          <h2 id="bdn-heading" className="bdn-title">
            Your blood can be someone&rsquo;s second chance
          </h2>
          <p className="bdn-subtitle">
            Join thousands of everyday heroes who donate regularly. It takes
            ten minutes to give — and can mean a lifetime to receive.
          </p>
        </div>
      </header>

      <ol className="bdn-steps">
        {STEPS.map(({ n, Icon, title, text }, i) => (
          <li key={n} className="bdn-step" style={{ "--bdn-stagger": `${i * 70}ms` }}>
            <span className="bdn-step__badge" aria-hidden="true">{n}</span>
            <span className="bdn-step__icon" aria-hidden="true"><Icon size={18} /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>

      <div className="bdn-main">
        <div className="bdn-panel">
          <div className="bdn-panel__head">
            <div><h3>Can I donate today?</h3><p>A quick self-check before you book</p></div>
            <span className="bdn-panel__tag"><ShieldCheck size={11} /> Eligibility</span>
          </div>
          <ul className="bdn-eligibility">
            {ELIGIBILITY.map(({ Icon, label, status }) => (
              <li key={label} className={`bdn-elig ${status === "no" ? "is-no" : "is-yes"}`}>
                <span className="bdn-elig__icon" aria-hidden="true"><Icon size={14} /></span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <p className="bdn-elig__note">
            <AlertCircle size={12} /> If you answer <b>no</b> to any red item,
            please wait — and try again later. Your safety comes first.
          </p>
        </div>

        <div className="bdn-panel">
          <div className="bdn-panel__head">
            <div><h3>Why donate with us?</h3><p>Safety, speed, and a real impact</p></div>
            <span className="bdn-panel__tag bdn-panel__tag--rose"><HeartPulse size={11} /> Benefits</span>
          </div>
          <ul className="bdn-benefits">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li key={title} className="bdn-benefit">
                <span className="bdn-benefit__icon" aria-hidden="true"><Icon size={16} /></span>
                <div><strong>{title}</strong><small>{text}</small></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bdn-faq">
        <div className="bdn-faq__head">
          <h3>Frequently asked questions</h3>
          <p>Everything first-time donors want to know</p>
        </div>
        <ul className="bdn-faq__list">
          {faqList.map((item, i) => {
            const open = openFaq === i;
            return (
              <li key={item.q} className={`bdn-faq__item${open ? " is-open" : ""}`}>
                <button type="button" className="bdn-faq__q"
                        onClick={() => toggleFaq(i)} aria-expanded={open}>
                  <span>{item.q}</span>
                  <ChevronDown size={16} className="bdn-faq__chev" aria-hidden="true" />
                </button>
                {open && <p className="bdn-faq__a">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bdn-cta">
        <div className="bdn-cta__glow" aria-hidden="true" />
        <div className="bdn-cta__body">
          <span className="bdn-cta__eyebrow"><Sparkles size={11} /> Ready when you are</span>
          <h3>Become a donor in under 2 minutes</h3>
          <p>Create your profile, pick a slot, and we&rsquo;ll take care of the rest.</p>

          <div className="bdn-cta__actions">
            <Link to="/donate-blood/register" className="bdn-btn bdn-btn--primary">
              <UserPlus size={15} /> Register as donor <ArrowRight size={15} />
            </Link>
            <Link to="/donate-blood/find-donors" className="bdn-btn bdn-btn--ghost">
              <MapPin size={15} /> Find a blood bank
            </Link>
          </div>

          <ul className="bdn-cta__meta">
            <li><Phone size={12} /> 24/7 helpline</li>
            <li><Mail size={12} /> donor@nearbydoctor.in</li>
            <li><ShieldCheck size={12} /> Verified banks only</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default BecomeDonor;