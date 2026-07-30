import { useState } from "react";
import api from "../api/axios";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);

  const validate = (): string => {
    if (!name.trim())                    return "Full name is required.";
    if (!email.includes("@"))            return "Enter a valid email address.";
    if (password.length < 6)             return "Password must be at least 6 characters.";
    if (password !== confirmPassword)    return "Passwords do not match.";
    return "";
  };

  const register = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      showToast("Account created! Please sign in.", "success");
      navigate("/");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroIcon}>🎫</div>
          <h1 style={styles.heroTitle}>Join RailBook</h1>
          <p style={styles.heroSub}>
            Create your free account and start booking train tickets in seconds.
          </p>
          <div style={styles.heroBullets}>
            {[
              "Free account, no credit card needed",
              "View and manage all your bookings",
              "Cancel anytime with ease",
            ].map((f) => (
              <div key={f} style={styles.heroBullet}>
                <span style={styles.checkIcon}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create account</h2>
            <p style={styles.formSub}>Fill in your details to get started</p>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div style={styles.fields}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={register}
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? <><span className="spinner" /> Creating account…</> : "Create Account"}
            </button>
          </div>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <Link to="/" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:        { display: "flex", minHeight: "100vh" },
  hero: {
    flex: 1,
    background: "linear-gradient(145deg, #0f1120 0%, #0d2040 50%, #0c0e14 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "48px 56px",
  },
  heroContent: { maxWidth: 400 },
  heroIcon:    { fontSize: 52, marginBottom: 16 },
  heroTitle: {
    fontSize: "3rem", fontWeight: 800,
    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "-0.04em", marginBottom: 16,
  },
  heroSub:     { color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 32 },
  heroBullets: { display: "flex", flexDirection: "column", gap: 12 },
  heroBullet:  { display: "flex", alignItems: "center", gap: 10, color: "#cbd5e1", fontSize: 14 },
  checkIcon: {
    width: 22, height: 22, borderRadius: "50%",
    background: "rgba(99,102,241,0.2)", color: "#818cf8",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, flexShrink: 0, lineHeight: "22px", textAlign: "center",
  },
  formSide: {
    width: 460, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 32, background: "var(--bg-base)",
  },
  formCard:   { width: "100%", maxWidth: 380 },
  formHeader: { marginBottom: 28 },
  formTitle:  { fontSize: "1.6rem", fontWeight: 700, marginBottom: 6 },
  formSub:    { color: "#94a3b8", fontSize: 14 },
  fields:     { display: "flex", flexDirection: "column", gap: 16 },
  switchText: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" },
  switchLink: { color: "#818cf8", fontWeight: 600 },
};