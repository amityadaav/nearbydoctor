// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import "./Signup.css";
import {
  Stethoscope,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Signup() {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  /* Show "waking up" hint if the request exceeds 8s (Render cold start) */
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  function handleInput(e) {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (input.fullname.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (input.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (input.password !== input.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/signup", {
        fullname: input.fullname.trim(),
        email: input.email.trim(),
        password: input.password,
        confirmPassword: input.confirmPassword,
      });

      // Success — clear form and show modal
      setShowSuccess(true);
      setInput({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
        setError("Server is waking up. Please wait a moment and try again.");
      } else if (!err.response) {
        setError("Can't reach the server. Check your connection and try again.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* LEFT SIDE */}
        <div className="signup-form-section">
          <div className="signup-brand">
            <div className="brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <p className="welcome-text">Create your account</p>
          <h1>Join NearbyDoctor</h1>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">FULL NAME</label>
              <input
                id="name"
                type="text"
                placeholder="Full name"
                name="fullname"
                value={input.fullname}
                onChange={handleInput}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                name="email"
                value={input.email}
                onChange={handleInput}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={input.password}
                onChange={handleInput}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                name="confirmPassword"
                value={input.confirmPassword}
                onChange={handleInput}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {error && (
              <p className="signup-error" role="alert">
                {error}
              </p>
            )}

            <div className="terms-row">
              <input id="terms" type="checkbox" required disabled={loading} />
              <label htmlFor="terms">
                I agree to the Terms &amp; Conditions
              </label>
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="signup-spinner" />{" "}
                  {slow ? "WAKING UP SERVER..." : "CREATING ACCOUNT..."}
                </>
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>

            {slow && loading && (
              <p className="signup-slow-hint">
                First request after idle can take up to a minute. Please wait.
              </p>
            )}
          </form>

          <p className="login-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <div className="signup-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="signup-info-section">
          <div className="info-content">
            <h2>About NearbyDoctor</h2>
            <p>
              NearbyDoctor is a modern healthcare platform that helps patients
              find trusted doctors and healthcare professionals near them.
            </p>
            <h3>Features</h3>
            <ul>
              <li>Find doctors based on location and specialty.</li>
              <li>Browse experienced and trusted doctors.</li>
              <li>Simple and convenient doctor search.</li>
            </ul>
          </div>

          <div className="mountains">
            <span className="mountain mountain-one" />
            <span className="mountain mountain-two" />
            <span className="mountain mountain-three" />
            <span className="mountain mountain-four" />
          </div>

          <div className="info-footer">
            <span>NearbyDoctor</span>
            <span>Features</span>
            <span>Support</span>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="signup-success-overlay">
          <div
            className="signup-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
          >
            <div className="signup-success-icon">
              <CheckCircle2 size={52} />
            </div>
            <h2 id="signup-success-title">Signup Successful!</h2>
            <p>
              Welcome to NearbyDoctor! Your account has been created
              successfully.
            </p>
            <button
              type="button"
              className="signup-success-button"
              onClick={() => navigate("/login")}
            >
              Continue to Login
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;