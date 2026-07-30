import { useState } from "react";
import api from "../api/axios";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const login = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role); // fixed: role is now top-level

      showToast("Welcome back!", "success");

      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/search");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  return (
    <div style={styles.page}>
      {/* Left hero panel */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroIcon}>🚂</div>
          <h1 style={styles.heroTitle}>RailBook</h1>
          <p style={styles.heroSub}>
            Book train tickets effortlessly. Search routes, check availability,
            and manage your journeys all in one place.
          </p>
          <div style={styles.heroBullets}>
            {["Real-time seat availability", "Instant booking confirmation", "Easy cancellations"].map((f) => (
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
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Sign in to your account</p>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div style={styles.fields}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={login}
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? <><span className="spinner" /> Signing in…</> : "Sign In"}
            </button>
          </div>

          <p style={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.switchLink}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
  },
  hero: {
    flex: 1,
    background: "linear-gradient(145deg, #0f1120 0%, #1a1040 50%, #0c0e14 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 56px",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: 400,
    position: "relative",
    zIndex: 1,
  },
  heroIcon: { fontSize: 52, marginBottom: 16 },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.04em",
    marginBottom: 16,
  },
  heroSub: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 32,
  },
  heroBullets: { display: "flex", flexDirection: "column", gap: 12 },
  heroBullet: { display: "flex", alignItems: "center", gap: 10, color: "#cbd5e1", fontSize: 14 },
  checkIcon: {
    width: 22, height: 22,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.2)",
    color: "#818cf8",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700,
    flexShrink: 0,
    lineHeight: "22px",
    textAlign: "center",
  },
  formSide: {
    width: 460,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    background: "var(--bg-base)",
  },
  formCard: {
    width: "100%",
    maxWidth: 380,
  },
  formHeader: { marginBottom: 28 },
  formTitle: { fontSize: "1.6rem", fontWeight: 700, marginBottom: 6 },
  formSub: { color: "#94a3b8", fontSize: 14 },
  fields: { display: "flex", flexDirection: "column", gap: 16 },
  switchText: { textAlign: "center", marginTop: 24, fontSize: 14, color: "#64748b" },
  switchLink: { color: "#818cf8", fontWeight: 600 },
};