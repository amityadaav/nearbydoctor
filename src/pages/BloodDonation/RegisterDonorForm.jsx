// src/pages/BloodDonation/RegisterDonorForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { bloodApi } from "../../services/bloodApi";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterDonorForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    bloodGroup: "", phone: "", email: "", city: "", area: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.bloodGroup || !form.phone || !form.email || !form.city) {
      setError("Blood group, phone, email and city are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    try {
      await bloodApi.registerDonor(form);
      navigate("/donate-blood");
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rb-section">
      <header className="rb-header">
        <div>
          <span className="rb-eyebrow"><Droplet size={12} /> Donor registration</span>
          <h1 className="rb-title">Become a donor</h1>
          <p className="rb-subtitle">Two-minute sign-up. You can update details later.</p>
        </div>
      </header>

      {error && (
        <div className="rb-alert rb-alert--error" role="alert">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      <form className="rb-form" onSubmit={onSubmit}>
        <div className="rb-field">
          <label className="rb-label">Blood group *</label>
          <div className="rb-chips">
            {BLOOD_GROUPS.map((g) => (
              <button key={g} type="button"
                      className={`rb-chip${form.bloodGroup === g ? " is-active" : ""}`}
                      onClick={() => set("bloodGroup", g)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="rb-row">
          <div className="rb-field"><label className="rb-label">Phone *</label>
            <input className="rb-input" type="tel" value={form.phone}
                   onChange={(e) => set("phone", e.target.value)} placeholder="+91 98450 12345" />
          </div>
          <div className="rb-field"><label className="rb-label">Email *</label>
            <input className="rb-input" type="email" value={form.email}
                   onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
          </div>
        </div>

        <div className="rb-row">
          <div className="rb-field"><label className="rb-label">City *</label>
            <input className="rb-input" value={form.city}
                   onChange={(e) => set("city", e.target.value)} placeholder="Bengaluru" />
          </div>
          <div className="rb-field"><label className="rb-label">Area</label>
            <input className="rb-input" value={form.area}
                   onChange={(e) => set("area", e.target.value)} placeholder="Indiranagar" />
          </div>
        </div>

        <div className="rb-actions">
          <button type="submit" className="rb-btn rb-btn--primary" disabled={submitting}>
            {submitting ? <>Submitting…</> : <><ShieldCheck size={15} /> Register <ArrowRight size={15} /></>}
          </button>
        </div>
      </form>
    </section>
  );
}