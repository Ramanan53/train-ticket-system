import { useEffect, useState } from "react";
import api from "../api/axios";
import axios from "axios";
import { useToast } from "../context/ToastContext";

// ── Types ──────────────────────────────────────────────────────────────────
interface User     { id: string; name: string; email: string; }
interface Station  { id: string; code: string; name: string; }
interface Train    {
  id: string; trainNumber: string; trainName: string; totalSeats: number;
  from: Station; to: Station;
}
interface Schedule {
  id: string; journeyDate: string; availableSeats: number;
  train: Train & { from: Station; to: Station };
}
interface Booking  {
  id: string; seatCount: number; status: string;
  user: User;
  schedule: { journeyDate: string; train: { trainName: string; trainNumber: string; } };
}

type Tab = "bookings" | "trains" | "schedules" | "stations";
type BookingFilter = "ALL" | "BOOKED" | "CANCELLED";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

// ── Confirm Modal ──────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Confirm Action</div>
        <p className="modal-desc">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB: BOOKINGS
// ══════════════════════════════════════════════════════════════════════════
function BookingsTab() {
  const { showToast } = useToast();
  const [bookings,     setBookings]     = useState<Booking[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<BookingFilter>("ALL");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmId,    setConfirmId]    = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data);
    } catch { showToast("Failed to load bookings.", "error"); }
    finally { setLoading(false); }
  };

  const cancel = async (id: string) => {
    setConfirmId(null);
    setCancellingId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      showToast("Booking cancelled.", "success");
      load();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed.", "error");
    } finally { setCancellingId(null); }
  };

  useEffect(() => { load(); }, []);

  const filtered = bookings.filter((b) => filter === "ALL" || b.status === filter);
  const total    = bookings.length;
  const active   = bookings.filter((b) => b.status === "BOOKED").length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div>
      {confirmId && (
        <ConfirmModal
          message="Cancel this booking on behalf of the user? This cannot be undone."
          onConfirm={() => cancel(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">📊</div>
          <div className="stat-info">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✓</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: "var(--success)" }}>{active}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger">✕</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: "var(--danger)" }}>{cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="section-header">
        <div className="tabs">
          {(["ALL", "BOOKED", "CANCELLED"] as BookingFilter[]).map((f) => (
            <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{filtered.length} records</span>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No bookings found</div>
          <p className="empty-desc">No bookings match the current filter.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Train</th>
                <th>Journey Date</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.user.email}</div>
                  </td>
                  <td>
                    <div>{b.schedule.train.trainName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>#{b.schedule.train.trainNumber}</div>
                  </td>
                  <td>{fmtDate(b.schedule.journeyDate)}</td>
                  <td>{b.seatCount}</td>
                  <td>
                    <span className={`badge ${b.status === "BOOKED" ? "badge-success" : "badge-danger"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === "BOOKED" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={cancellingId === b.id}
                        onClick={() => setConfirmId(b.id)}
                      >
                        {cancellingId === b.id ? <><span className="spinner" /> …</> : "Cancel"}
                      </button>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB: STATIONS
// ══════════════════════════════════════════════════════════════════════════
function StationsTab() {
  const { showToast } = useToast();
  const [stations,   setStations]   = useState<Station[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [code,       setCode]       = useState("");
  const [name,       setName]       = useState("");
  const [adding,     setAdding]     = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get("/stations"); setStations(r.data); }
    catch { showToast("Failed to load stations.", "error"); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!code.trim() || !name.trim()) { showToast("Code and name are required.", "error"); return; }
    setAdding(true);
    try {
      await api.post("/stations", { code: code.toUpperCase(), name });
      showToast(`Station ${name} added!`, "success");
      setCode(""); setName("");
      load();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to add station.", "error");
    } finally { setAdding(false); }
  };

  const remove = async (id: string) => {
    setDeleteId(null); setDeleting(id);
    try { await api.delete(`/stations/${id}`); showToast("Station deleted.", "success"); load(); }
    catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to delete.", "error");
    } finally { setDeleting(null); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {deleteId && (
        <ConfirmModal
          message="Delete this station? Any trains using it will be affected."
          onConfirm={() => remove(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Add form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add New Station</h3>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group">
            <label className="form-label">Code</label>
            <input className="form-input" placeholder="MAS" value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={10} />
          </div>
          <div className="form-group">
            <label className="form-label">Station Name</label>
            <input className="form-input" placeholder="Chennai Central" value={name}
              onChange={(e) => setName(e.target.value)} />
          </div>
          <button className="btn btn-success" onClick={add} disabled={adding} style={{ height: 44 }}>
            {adding ? <><span className="spinner" /> Adding…</> : "+ Add Station"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      ) : stations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚉</div>
          <div className="empty-title">No stations yet</div>
          <p className="empty-desc">Add your first station above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Code</th><th>Name</th><th>Action</th></tr></thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id}>
                  <td><span className="badge badge-primary">{s.code}</span></td>
                  <td>{s.name}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={deleting === s.id}
                      onClick={() => setDeleteId(s.id)}>
                      {deleting === s.id ? <><span className="spinner" /> …</> : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB: TRAINS
// ══════════════════════════════════════════════════════════════════════════
function TrainsTab() {
  const { showToast } = useToast();
  const [trains,    setTrains]    = useState<Train[]>([]);
  const [stations,  setStations]  = useState<Station[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [number,    setNumber]    = useState("");
  const [trainName, setTrainName] = useState("");
  const [fromId,    setFromId]    = useState("");
  const [toId,      setToId]      = useState("");
  const [seats,     setSeats]     = useState("");
  const [adding,    setAdding]    = useState(false);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.get("/trains"), api.get("/stations")]);
      setTrains(t.data); setStations(s.data);
    } catch { showToast("Failed to load.", "error"); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!number || !trainName || !fromId || !toId || !seats) {
      showToast("All fields are required.", "error"); return;
    }
    if (fromId === toId) { showToast("From and To stations must differ.", "error"); return; }
    setAdding(true);
    try {
      await api.post("/trains", { trainNumber: number, trainName, fromId, toId, totalSeats: Number(seats) });
      showToast(`Train ${trainName} added!`, "success");
      setNumber(""); setTrainName(""); setFromId(""); setToId(""); setSeats("");
      load();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to add train.", "error");
    } finally { setAdding(false); }
  };

  const remove = async (id: string) => {
    setDeleteId(null); setDeleting(id);
    try { await api.delete(`/trains/${id}`); showToast("Train deleted.", "success"); load(); }
    catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to delete.", "error");
    } finally { setDeleting(null); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {deleteId && (
        <ConfirmModal
          message="Delete this train? All its schedules and bookings will be affected."
          onConfirm={() => remove(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Add form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add New Train</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Train Number</label>
            <input className="form-input" placeholder="12345" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Train Name</label>
            <input className="form-input" placeholder="Express Name" value={trainName} onChange={(e) => setTrainName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">From Station</label>
            <select className="form-input" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              <option value="">Select station</option>
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To Station</label>
            <select className="form-input" value={toId} onChange={(e) => setToId(e.target.value)}>
              <option value="">Select station</option>
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Seats</label>
            <input className="form-input" type="number" placeholder="200" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-success btn-full" onClick={add} disabled={adding} style={{ height: 44 }}>
              {adding ? <><span className="spinner" /> Adding…</> : "+ Add Train"}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      ) : trains.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚆</div>
          <div className="empty-title">No trains yet</div>
          <p className="empty-desc">Add your first train above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Number</th><th>Name</th><th>Route</th><th>Total Seats</th><th>Action</th></tr></thead>
            <tbody>
              {trains.map((t) => (
                <tr key={t.id}>
                  <td><span className="badge badge-primary">#{t.trainNumber}</span></td>
                  <td style={{ fontWeight: 600 }}>{t.trainName}</td>
                  <td>
                    <span style={{ color: "var(--text-secondary)" }}>{t.from.name}</span>
                    <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>→</span>
                    <span style={{ color: "var(--text-secondary)" }}>{t.to.name}</span>
                  </td>
                  <td>{t.totalSeats}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={deleting === t.id}
                      onClick={() => setDeleteId(t.id)}>
                      {deleting === t.id ? <><span className="spinner" /> …</> : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  TAB: SCHEDULES
// ══════════════════════════════════════════════════════════════════════════
function SchedulesTab() {
  const { showToast } = useToast();
  const [schedules,  setSchedules]  = useState<Schedule[]>([]);
  const [trains,     setTrains]     = useState<Train[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [trainId,    setTrainId]    = useState("");
  const [date,       setDate]       = useState("");
  const [avail,      setAvail]      = useState("");
  const [adding,     setAdding]     = useState(false);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([api.get("/schedules"), api.get("/trains")]);
      setSchedules(s.data); setTrains(t.data);
    } catch { showToast("Failed to load.", "error"); }
    finally { setLoading(false); }
  };

  const add = async () => {
    if (!trainId || !date || !avail) { showToast("All fields are required.", "error"); return; }
    setAdding(true);
    try {
      await api.post("/schedules", { trainId, journeyDate: date, availableSeats: Number(avail) });
      showToast("Schedule created!", "success");
      setTrainId(""); setDate(""); setAvail("");
      load();
    } catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to add schedule.", "error");
    } finally { setAdding(false); }
  };

  const remove = async (id: string) => {
    setDeleteId(null); setDeleting(id);
    try { await api.delete(`/schedules/${id}`); showToast("Schedule deleted.", "success"); load(); }
    catch (err: unknown) {
      showToast(axios.isAxiosError(err) ? err.response?.data?.message : "Failed to delete.", "error");
    } finally { setDeleting(null); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {deleteId && (
        <ConfirmModal
          message="Delete this schedule? Any existing bookings will be affected."
          onConfirm={() => remove(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Add form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Add New Schedule</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, alignItems: "flex-end" }}>
          <div className="form-group">
            <label className="form-label">Train</label>
            <select className="form-input" value={trainId} onChange={(e) => setTrainId(e.target.value)}>
              <option value="">Select train</option>
              {trains.map((t) => <option key={t.id} value={t.id}>{t.trainName} (#{t.trainNumber})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Journey Date</label>
            <input className="form-input" type="date" value={date}
              min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Available Seats</label>
            <input className="form-input" type="number" placeholder="200" min={0} value={avail} onChange={(e) => setAvail(e.target.value)} />
          </div>
          <button className="btn btn-success" onClick={add} disabled={adding} style={{ height: 44 }}>
            {adding ? <><span className="spinner" /> Adding…</> : "+ Add"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <div className="empty-title">No schedules yet</div>
          <p className="empty-desc">Add your first train schedule above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Train</th><th>Route</th><th>Journey Date</th><th>Available Seats</th><th>Action</th></tr></thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.train.trainName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>#{s.train.trainNumber}</div>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {s.train.from.name} → {s.train.to.name}
                  </td>
                  <td>{fmtDate(s.journeyDate)}</td>
                  <td>
                    <span className={s.availableSeats === 0 ? "seats-low" : s.availableSeats <= 10 ? "seats-medium" : "seats-high"}>
                      {s.availableSeats} seats
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" disabled={deleting === s.id}
                      onClick={() => setDeleteId(s.id)}>
                      {deleting === s.id ? <><span className="spinner" /> …</> : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN PANEL
// ══════════════════════════════════════════════════════════════════════════
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "bookings",  label: "Bookings",  icon: "🎫" },
  { key: "trains",    label: "Trains",    icon: "🚆" },
  { key: "schedules", label: "Schedules", icon: "📅" },
  { key: "stations",  label: "Stations",  icon: "🚉" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage all aspects of the train ticket system</p>
      </div>

      {/* Tab navigation */}
      <div className="tabs" style={{ marginBottom: 32 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "bookings"  && <BookingsTab />}
      {activeTab === "trains"    && <TrainsTab />}
      {activeTab === "schedules" && <SchedulesTab />}
      {activeTab === "stations"  && <StationsTab />}
    </main>
  );
}
