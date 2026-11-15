// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import "./Login.css";
import { Stethoscope, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  /* Show "this is taking a while" if the request exceeds 8 seconds */
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        email: email.trim(),
        password,
      });

      const { success, token, user } = response.data;

      if (!success || !token || !user || !user.fullname) {
        setError("Invalid login response from server.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("authChanged"));
      navigate("/", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (err.code === "ECONNABORTED" || /timeout/i.test(err.message || "")) {
        setError("Server is waking up. Please wait a moment and try again.");
      } else if (!err.response) {
        setError("Can't reach the server. Check your connection and try again.");
      } else if (status === 401) {
        setError(msg || "Invalid email or password.");
      } else {
        setError(msg || "Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* ================= LEFT SIDE ================= */}
        <div className="login-form-section">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Stethoscope size={20} />
            </div>
            <h3>NearbyDoctor</h3>
          </div>

          <p className="login-welcome">Welcome back</p>
          <h1>Login to NearbyDoctor</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            <div className="login-options">
              <div className="remember-me">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="login-spinner" />{" "}
                  {slow ? "WAKING UP SERVER..." : "LOGGING IN..."}
                </>
              ) : (
                "LOGIN"
              )}
            </button>

            {slow && loading && (
              <p className="login-slow-hint">
                First request after idle can take up to a minute. Please wait.
              </p>
            )}
          </form>

          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign Up
            </Link>
          </p>

          <div className="login-links">
            <span>FAQ</span>
            <b>|</b>
            <span>Features</span>
            <b>|</b>
            <span>Support</span>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="login-info-section">
          <div className="login-info-content">
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

          <div className="login-mountains">
            <span className="login-mountain login-mountain-one" />
            <span className="login-mountain login-mountain-two" />
            <span className="login-mountain login-mountain-three" />
            <span className="login-mountain login-mountain-four" />
          </div>

          <div className="login-info-footer">
            <span>NearbyDoctor</span>
            <span>Features</span>
            <span>Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;