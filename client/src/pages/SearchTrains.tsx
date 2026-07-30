import { useState, useEffect } from "react";
import api from "../api/axios";
import axios from "axios";
import { useToast } from "../context/ToastContext";

interface Station { id: string; code: string; name: string; }
interface Train {
  scheduleId: string;
  trainNumber: string;
  trainName: string;
  availableSeats: number;
}

function seatClass(seats: number): string {
  if (seats === 0) return "seats-low";
  if (seats <= 10) return "seats-medium";
  return "seats-high";
}

export default function SearchTrains() {
  const { showToast } = useToast();

  const [stations,   setStations]   = useState<Station[]>([]);
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [date,       setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [trains,     setTrains]     = useState<Train[]>([]);
  const [error,      setError]      = useState("");
  const [searched,   setSearched]   = useState(false);
  const [searching,  setSearching]  = useState(false);
  const [bookingId,  setBookingId]  = useState<string | null>(null);

  // Fetch stations from API (not hardcoded)
  useEffect(() => {
    api.get("/stations").then((r) => setStations(r.data)).catch(() => {});
  }, []);

  const validate = (): string => {
    if (!from)         return "Please select a departure station.";
    if (!to)           return "Please select a destination station.";
    if (from === to)   return "Departure and destination cannot be the same.";
    if (!date)         return "Please select a date.";
    return "";
  };

  const searchTrains = async () => {
    const ve = validate();
    if (ve) { setError(ve); return; }

    setError("");
    setSearching(true);
    setSearched(false);
    setTrains([]);

    try {
      const res = await api.get("/trains/search", { params: { from, to, date } });
      setTrains(res.data);
      setSearched(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to search trains.");
      } else {
        setError("Failed to search trains.");
      }
    } finally {
      setSearching(false);
    }
  };

  const bookTicket = async (scheduleId: string) => {
    setBookingId(scheduleId);
    try {
      await api.post("/bookings", { scheduleId, seatCount: 1 });
      showToast("Ticket booked successfully! 🎉", "success");
      searchTrains();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || "Booking failed.", "error");
      } else {
        showToast("Booking failed.", "error");
      }
    } finally {
      setBookingId(null);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">Search Trains</h1>
        <p className="page-subtitle">Find available trains and book your seat instantly</p>
      </div>

      {/* Search card */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "flex-end" }}>
          <div className="form-group">
            <label className="form-label">From</label>
            <select className="form-input" value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">Select station</option>
              {stations.map((s) => (
                <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">To</label>
            <select className="form-input" value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Select station</option>
              {stations.map((s) => (
                <option key={s.id} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Journey Date</label>
            <input
              className="form-input"
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={searchTrains}
            disabled={searching}
            style={{ height: 44, padding: "0 28px" }}
          >
            {searching ? <><span className="spinner" /> Searching…</> : "🔍 Search"}
          </button>
        </div>

        {error && <div className="alert-error" style={{ marginTop: 16 }}><span>⚠</span> {error}</div>}
      </div>

      {/* Results */}
      {searching && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 100 }}>
              <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 12, width: "25%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "20%" }} />
            </div>
          ))}
        </div>
      )}

      {searched && !searching && trains.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚉</div>
          <div className="empty-title">No trains found</div>
          <p className="empty-desc">No trains available for this route and date. Try a different date.</p>
        </div>
      )}

      {trains.length > 0 && !searching && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            {trains.length} train{trains.length > 1 ? "s" : ""} found
          </p>
          {trains.map((train) => (
            <div key={train.scheduleId} className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Train icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "rgba(99,102,241,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>🚆</div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 4 }}>{train.trainName}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>#{train.trainNumber}</p>
              </div>

              {/* Seats */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div className={seatClass(train.availableSeats)} style={{ fontSize: 22, fontWeight: 700 }}>
                  {train.availableSeats}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>seats left</div>
              </div>

              {/* Book button */}
              <button
                className={`btn ${train.availableSeats === 0 ? "btn-ghost" : "btn-primary"}`}
                style={{ flexShrink: 0, minWidth: 130 }}
                onClick={() => bookTicket(train.scheduleId)}
                disabled={train.availableSeats === 0 || bookingId === train.scheduleId}
              >
                {bookingId === train.scheduleId
                  ? <><span className="spinner" /> Booking…</>
                  : train.availableSeats === 0
                    ? "Sold Out"
                    : "Book Ticket"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
