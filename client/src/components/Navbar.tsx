import { useNavigate, NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const token   = localStorage.getItem("token");
  const role    = localStorage.getItem("role");
  const isLoggedIn = !!token;
  const isAdmin    = role === "ADMIN";

  // Hide on auth pages
  const hideOn = ["/", "/register"];
  if (hideOn.includes(location.pathname)) return null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🚂</span>
          <span style={styles.brandText}>RailBook</span>
        </div>

        {/* Nav links */}
        <nav style={styles.nav}>
          {isLoggedIn && (
            <NavLink
              to="/search"
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              Search Trains
            </NavLink>
          )}
          {isLoggedIn && (
            <NavLink
              to="/bookings"
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}
            >
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div style={styles.actions}>
          {isLoggedIn ? (
            <button onClick={logout} className="btn btn-ghost btn-sm">
              Sign Out
            </button>
          ) : (
            <NavLink to="/" className="btn btn-primary btn-sm">Login</NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(12, 14, 20, 0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    WebkitBackdropFilter: "blur(12px)",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 24px",
    height: 60,
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  brandIcon: { fontSize: 22 },
  brandText: {
    fontSize: 17,
    fontWeight: 700,
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  link: {
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#94a3b8",
    transition: "all 0.15s ease",
    textDecoration: "none",
  },
  linkActive: {
    color: "#f1f5f9",
    background: "rgba(255,255,255,0.07)",
  },
  actions: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};