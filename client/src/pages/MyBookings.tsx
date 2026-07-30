import { useEffect, useState } from "react";
import api from "../api/axios";
import axios from "axios";
import { useToast } from "../context/ToastContext";

interface Train    { trainNumber: string; trainName: string; }
interface Schedule { journeyDate: string; train: Train; }
interface Booking  { id: string; seatCount: number; status: string; schedule: Schedule; }

/* ── Confirm Modal ───────────────────────────────────── */
function ConfirmModal({
  onConfirm, onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Cancel Booking?</div>
        <p className="modal-desc">
          This action cannot be undone. Your seat will be released and made available to others.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Keep Booking</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton Card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="skeleton" style={{ height: 18, width: "50%" }} />
      <div className="skeleton" style={{ height: 13, width: "35%" }} />
      <div className="skeleton" style={{ height: 13, width: "40%" }} />
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function MyBookings() {
  const { showToast } = useToast();

  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmId,    setConfirmId]    = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load bookings.");
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setConfirmId(null);
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      showToast("Booking cancelled successfully.", "success");
      loadBookings();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || "Could not cancel booking.", "error");
      } else {
        showToast("Could not cancel booking.", "error");
      }
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="page">
      {confirmId && (
        <ConfirmModal
          onConfirm={() => cancelBooking(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">View and manage your train reservations</p>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="alert-error" style={{ marginBottom: 20 }}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <div className="empty-title">No bookings yet</div>
          <p className="empty-desc">Search for trains and book your first ticket!</p>
        </div>
      )}

      {/* Bookings list */}
      {!loading && bookings.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bookings.map((b) => (
            <div key={b.id} className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Train icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: b.status === "BOOKED" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>🚆</div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 4 }}>{b.schedule.train.trainName}</h3>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    🗓 {formatDate(b.schedule.journeyDate)}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    🎟 {b.seatCount} seat{b.seatCount > 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    #{b.schedule.train.trainNumber}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <span className={`badge ${b.status === "BOOKED" ? "badge-success" : "badge-danger"}`}>
                {b.status}
              </span>

              {/* Cancel */}
              {b.status === "BOOKED" && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setConfirmId(b.id)}
                  disabled={cancellingId === b.id}
                  style={{ flexShrink: 0 }}
                >
                  {cancellingId === b.id ? <><span className="spinner" /> Cancelling…</> : "Cancel"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}