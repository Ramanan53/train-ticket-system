import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes     from "./routes/auth.routes.js";
import stationRoutes  from "./routes/station.routes.js";
import trainRoutes    from "./routes/train.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import bookingRoutes  from "./routes/booking.routes.js";
import adminRoutes    from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// ── Security & Parsing ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/stations",  stationRoutes);
app.use("/api/trains",    trainRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/bookings",  bookingRoutes);
app.use("/api/admin",     adminRoutes);

app.get("/", (_, res) => res.send("Train Ticket Backend Running ✅"));

// ── Centralized Error Handler (must be last) ──────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚂 Server running on http://localhost:${PORT}`));