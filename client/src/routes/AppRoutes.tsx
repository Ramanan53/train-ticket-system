import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login      from "../pages/Login";
import Register   from "../pages/Register";
import SearchTrains from "../pages/SearchTrains";
import MyBookings from "../pages/MyBookings";
import AdminPanel from "../pages/AdminPanel";
import Navbar     from "../components/Navbar";

// ── Route Guards ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token)           return <Navigate to="/"       replace />;
  if (role !== "ADMIN") return <Navigate to="/search" replace />;
  return <>{children}</>;
}

// ── App Routes ────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/search" element={
          <ProtectedRoute><SearchTrains /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />

        {/* Admin Only */}
        <Route path="/admin" element={
          <AdminRoute><AdminPanel /></AdminRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}