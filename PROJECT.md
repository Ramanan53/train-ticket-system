# RailBook — Train Ticket System

> Full-stack train ticket booking system with role-based access control, real-time seat management, and a premium dark-mode UI.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Backend Architecture](#7-backend-architecture)
8. [Validation Layer](#8-validation-layer)
9. [Security Measures](#9-security-measures)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Design System](#11-design-system)
12. [State Management & Notifications](#12-state-management--notifications)
13. [Environment Variables](#13-environment-variables)
14. [Setup & Running](#14-setup--running)
15. [Admin Credentials](#15-admin-credentials)
16. [Key Bug Fixes Applied](#16-key-bug-fixes-applied)
17. [Known Limitations & Future Improvements](#17-known-limitations--future-improvements)

---

## 1. Project Overview

RailBook is a full-stack web application that allows users to:

- Register and log in with JWT-based authentication
- Search available train schedules by route and date
- Book train tickets with real-time seat availability
- View and cancel their own bookings

Administrators can additionally:

- Manage all bookings (view, cancel on behalf of users)
- Create, view, and delete stations
- Create, view, and delete trains (with route assignment)
- Create, view, and delete train schedules (with seat capacity)

---

## 2. Tech Stack

### Backend (`/server`)

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | LTS |
| Language | TypeScript | ~6.0 |
| Framework | Express | ^5.2.1 |
| ORM | Prisma | ^6.19 |
| Database | PostgreSQL | — |
| Auth | JSON Web Token (`jsonwebtoken`) | ^9.0 |
| Password Hashing | bcryptjs | ^3.0 |
| Validation | Zod | ^4.4 |
| Rate Limiting | express-rate-limit | ^7.x |
| CORS | cors | ^2.8 |
| Dev Runner | tsx (watch mode) | ^4.x |

### Frontend (`/client`)

| Category | Technology | Version |
|---|---|---|
| Language | TypeScript | ~6.0 |
| Framework | React | ^19.2 |
| Build Tool | Vite | ^8.0 |
| Routing | React Router DOM | ^7.17 |
| HTTP Client | Axios | ^1.17 |
| Styling | Vanilla CSS (custom design system) | — |
| Font | Inter (Google Fonts) | — |

---

## 3. Project Structure

```
train-ticket-system/
├── client/                         # React frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx                # App entry point
│       ├── App.tsx                 # Root component (wraps ToastProvider)
│       ├── index.css               # Full design system (CSS variables, utilities)
│       ├── App.css                 # Minimal overrides
│       ├── api/
│       │   └── axios.ts            # Axios instance + JWT + 401 interceptor
│       ├── context/
│       │   └── ToastContext.tsx    # Global toast notification system
│       ├── components/
│       │   └── Navbar.tsx          # Glassmorphic sticky navigation bar
│       ├── pages/
│       │   ├── Login.tsx           # Split-screen login page
│       │   ├── Register.tsx        # Split-screen register page
│       │   ├── SearchTrains.tsx    # Train search + booking page
│       │   ├── MyBookings.tsx      # User booking history + cancel
│       │   └── AdminPanel.tsx      # Tabbed admin dashboard
│       └── routes/
│           └── AppRoutes.tsx       # Route definitions + guards
│
└── server/                         # Express backend
    ├── .env                        # Environment variables
    ├── tsconfig.json
    ├── prisma/
    │   ├── schema.prisma           # Data models
    │   ├── seed.ts                 # Admin user seed
    │   └── migrations/             # Auto-generated SQL migrations
    └── src/
        ├── index.ts                # App entry: middleware, routes, error handler
        ├── config/
        │   └── prisma.ts           # Singleton PrismaClient export
        ├── utils/
        │   └── jwt.ts              # generateToken() utility
        ├── schemas/                # Zod validation schemas
        │   ├── auth.schema.ts
        │   ├── booking.schema.ts
        │   ├── train.schema.ts
        │   ├── schedule.schema.ts
        │   └── station.schema.ts
        ├── middlewares/
        │   ├── auth.middlewares.ts  # JWT authentication (authenticate)
        │   ├── role.middlewares.ts  # Role-based authorization (authorize)
        │   ├── validate.middleware.ts # Zod validation factory
        │   └── error.middleware.ts  # Centralized error handler
        ├── services/               # Business logic layer
        │   ├── auth.service.ts
        │   ├── booking.service.ts
        │   ├── train.service.ts
        │   ├── schedule.service.ts
        │   ├── station.service.ts
        │   └── admin.service.ts
        ├── controllers/            # Thin HTTP layer (calls services)
        │   ├── auth.controllers.ts
        │   ├── booking.controllers.ts
        │   ├── train.controllers.ts
        │   ├── schedule.controller.ts
        │   ├── station.controllers.ts
        │   └── admin.controllers.ts
        └── routes/                 # Express routers
            ├── auth.routes.ts
            ├── booking.routes.ts
            ├── train.routes.ts
            ├── schedule.routes.ts
            ├── station.routes.ts
            └── admin.routes.ts
```

---

## 4. Database Schema

### Prisma Schema (`prisma/schema.prisma`)

**Database:** PostgreSQL  
**ORM:** Prisma Client JS

#### Enums

```prisma
enum Role {
  ADMIN
  CUSTOMER    ← default for all registered users
}

enum BookingStatus {
  BOOKED      ← default on creation
  CANCELLED
}
```

#### Models

```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  password  String                         ← bcryptjs hashed, cost factor 12
  role      Role      @default(CUSTOMER)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Station {
  id         String  @id @default(uuid())
  code       String  @unique               ← e.g. "MAS", "SBC", "CBE"
  name       String                        ← e.g. "Chennai Central"
  fromTrains Train[] @relation("FromStation")
  toTrains   Train[] @relation("ToStation")
}

model Train {
  id          String     @id @default(uuid())
  trainNumber String     @unique
  trainName   String
  fromId      String
  toId        String
  totalSeats  Int
  from        Station    @relation("FromStation", fields: [fromId], references: [id])
  to          Station    @relation("ToStation",   fields: [toId],   references: [id])
  schedules   Schedule[]
}

model Schedule {
  id             String    @id @default(uuid())
  trainId        String
  journeyDate    DateTime
  availableSeats Int
  train          Train     @relation(fields: [trainId], references: [id])
  bookings       Booking[]
}

model Booking {
  id         String        @id @default(uuid())
  userId     String
  scheduleId String
  seatCount  Int
  status     BookingStatus @default(BOOKED)
  bookedAt   DateTime      @default(now())
  user       User          @relation(fields: [userId],     references: [id])
  schedule   Schedule      @relation(fields: [scheduleId], references: [id])
}
```

#### Entity Relationships

```
User ──< Booking >── Schedule ──< Train >── Station (from)
                                         └── Station (to)
```

- One **User** has many **Bookings**
- One **Schedule** has many **Bookings**
- One **Train** has many **Schedules**
- One **Train** has one **from Station** and one **to Station**

---

## 5. API Reference

Base URL: `http://localhost:5000/api`

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| `POST` | `/auth/register` | None | `{ name, email, password }` | `{ message, user: { id, name, email, role } }` |
| `POST` | `/auth/login` | None | `{ email, password }` | `{ token, role, user: { id, name, email, role } }` |

> Both routes are rate-limited to **20 requests per 15 minutes** per IP.

**Register Notes:**
- `role` field is intentionally **not accepted** — all self-registered users are `CUSTOMER`
- Admin users are created only via the seed script

**Login Notes:**
- Returns `role` at the **top level** of the response for easy client-side access
- JWT expires in **7 days**

---

### Station Routes (`/api/stations`)

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `GET` | `/stations` | None | — | List all stations (sorted A–Z) |
| `POST` | `/stations` | ADMIN | `{ code, name }` | Create a station |
| `DELETE` | `/stations/:id` | ADMIN | `:id` (UUID) | Delete a station |

---

### Train Routes (`/api/trains`)

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `GET` | `/trains` | ✅ JWT | — | List all trains with station info |
| `POST` | `/trains` | ADMIN | `{ trainNumber, trainName, fromId, toId, totalSeats }` | Create a train |
| `DELETE` | `/trains/:id` | ADMIN | `:id` (UUID) | Delete a train |
| `GET` | `/trains/search` | ✅ JWT | `?from=MAS&to=SBC&date=2026-06-15` | Search schedules by route & date |

**Search Response Array:**
```json
[
  {
    "scheduleId": "uuid",
    "trainNumber": "12345",
    "trainName": "Express Name",
    "availableSeats": 120
  }
]
```

---

### Schedule Routes (`/api/schedules`)

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `GET` | `/schedules` | ✅ JWT | — | List all schedules (sorted by date) |
| `POST` | `/schedules` | ADMIN | `{ trainId, journeyDate, availableSeats }` | Create a schedule |
| `DELETE` | `/schedules/:id` | ADMIN | `:id` (UUID) | Delete a schedule |

---

### Booking Routes (`/api/bookings`)

| Method | Endpoint | Auth | Body / Params | Description |
|--------|----------|------|---------------|-------------|
| `POST` | `/bookings` | ✅ JWT | `{ scheduleId, seatCount }` | Book a ticket |
| `GET` | `/bookings/my` | ✅ JWT | — | Get current user's bookings (newest first) |
| `PATCH` | `/bookings/:bookingId/cancel` | ✅ JWT | `:bookingId` (UUID) | Cancel a booking |

**Booking Rules:**
- `seatCount` must be between 1 and 10
- Booking is **atomic** (`prisma.$transaction`) — seat decrement and booking creation happen in a single DB transaction, preventing race conditions
- Cancellation restores `availableSeats` atomically
- Users can only cancel **their own** bookings; admins can cancel **any** booking

---

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/bookings` | ADMIN | All bookings with user + train info (newest first) |

---

## 6. Authentication & Authorization

### Flow

```
Client → POST /api/auth/login
       ← { token, role, user }

Client stores:
  localStorage.setItem("token", token)
  localStorage.setItem("role",  role)   ← "ADMIN" or "CUSTOMER"

Client → GET /api/trains/search
  Headers: Authorization: Bearer <token>

Server:
  authenticate middleware → verifies JWT → attaches req.user = { id, email, role }
  authorize("ADMIN")      → checks req.user.role
```

### JWT Payload

```json
{
  "id":   "user-uuid",
  "role": "ADMIN | CUSTOMER",
  "iat":  1234567890,
  "exp":  1234567890   ← 7 days from issue
}
```

### Middleware Chain (per request)

```
Request
  │
  ├─ authenticate     → verifies Bearer token, populates req.user
  ├─ authorize(role)  → checks req.user.role against allowed roles
  ├─ validate(schema) → runs Zod schema against req.body
  │
  └─ Controller → Service → Prisma → DB
```

### Frontend Route Guards

```tsx
// Blocks unauthenticated users (no token in localStorage)
<ProtectedRoute> → redirects to / if no token

// Blocks non-admin users
<AdminRoute>     → redirects to / if no token
                 → redirects to /search if role !== "ADMIN"
```

### 401 Auto-Redirect

The Axios instance has a response interceptor:
```ts
if (error.response?.status === 401) {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
}
```

---

## 7. Backend Architecture

### Layered Architecture

```
HTTP Request
     │
  Routes (Express Router)
     │  applies middleware: authenticate, authorize, validate
     │
  Controllers (thin HTTP layer)
     │  extracts req.body / req.params / req.user
     │  calls service function
     │  sends JSON response
     │
  Services (business logic)
     │  validates business rules (ownership, seat count, etc.)
     │  orchestrates Prisma calls
     │  throws typed errors with .status codes
     │
  Prisma (ORM)
     │
  PostgreSQL
```

### Error Handling

**Service-level errors:** Services throw typed errors:
```ts
const err = new Error("Not enough seats available.");
(err as any).status = 400;
throw err;
```

**Controller-level:** Checks for `.status` and responds immediately; otherwise forwards to centralized handler:
```ts
catch (err: any) {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);  // → errorHandler middleware
}
```

**Centralized error middleware** (`error.middleware.ts`) — registered last in `index.ts`:
```ts
app.use(errorHandler);  // catches all unhandled errors
```

Handles Prisma-specific error codes:
- `P2002` → `409 Conflict` ("record already exists")
- `P2025` → `404 Not Found` ("record not found")

### Atomic Transactions

Both booking creation and cancellation use `prisma.$transaction()`:

```ts
// Create booking (prevents race conditions on last seat)
await prisma.$transaction(async (tx) => {
  const schedule = await tx.schedule.findUnique(...);
  // re-check seats inside transaction
  const booking  = await tx.booking.create(...);
  await tx.schedule.update({ availableSeats: seats - count });
});

// Cancel booking (atomically restores seats)
await prisma.$transaction(async (tx) => {
  await tx.booking.update({ status: "CANCELLED" });
  await tx.schedule.update({ availableSeats: { increment: seatCount } });
});
```

---

## 8. Validation Layer

Every mutating route is protected by the `validate(schema)` middleware factory:

```ts
// middleware/validate.middleware.ts
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((e: ZodIssue) => ({
      field:   e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ message: errors[0]?.message, errors });
  }
  req.body = result.data;  // ← sanitized & typed data replaces raw body
  next();
};
```

### Schema Definitions

| Schema | Rules |
|--------|-------|
| `registerSchema` | name ≥ 2 chars, valid email, password ≥ 6 chars |
| `loginSchema` | valid email, password required |
| `createBookingSchema` | valid UUID scheduleId, seatCount 1–10 |
| `createTrainSchema` | valid UUIDs for fromId/toId, totalSeats 1–1000 |
| `createScheduleSchema` | valid UUID trainId, date string, availableSeats ≥ 0 |
| `createStationSchema` | code 2–10 chars (uppercase), name ≥ 2 chars |

---

## 9. Security Measures

| Measure | Implementation |
|---------|---------------|
| **Password hashing** | `bcryptjs` with cost factor 12 |
| **JWT authentication** | 7-day expiry, verified on every protected route |
| **Role-based authorization** | `authorize(...roles)` middleware on all admin routes |
| **Rate limiting on auth** | 20 req / 15 min per IP via `express-rate-limit` |
| **Input validation** | Zod schemas on all mutating endpoints |
| **CORS restriction** | Only `http://localhost:5173` allowed (configurable via `CLIENT_URL` env) |
| **No self-promotion** | `role` field stripped from register request body — admins only via seed |
| **Ownership enforcement** | Users can only cancel their own bookings; admins bypass this check |
| **Race condition prevention** | Seat booking wrapped in `prisma.$transaction()` |
| **Centralized error handling** | No stack traces leaked to client in production |
| **Prisma parameterized queries** | ORM prevents SQL injection by default |

---

## 10. Frontend Architecture

### Page Map

| Route | Component | Guard | Description |
|-------|-----------|-------|-------------|
| `/` | `Login.tsx` | Public | Split-screen login |
| `/register` | `Register.tsx` | Public | Split-screen register |
| `/search` | `SearchTrains.tsx` | ProtectedRoute | Search & book trains |
| `/bookings` | `MyBookings.tsx` | ProtectedRoute | View & cancel bookings |
| `/admin` | `AdminPanel.tsx` | AdminRoute | Full admin dashboard |
| `*` | — | — | Redirects to `/` |

### Axios Instance (`src/api/axios.ts`)

```ts
const api = axios.create({ baseURL: "http://localhost:5000/api" });

// Request: auto-attach JWT header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: auto-handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Admin Panel Tabs

`AdminPanel.tsx` is a single component with 4 internal tabs, each lazy-loading its own data:

```
AdminPanel
├── BookingsTab   → GET /admin/bookings
│   ├── Stat cards (Total / Active / Cancelled)
│   ├── Filter tabs (ALL / BOOKED / CANCELLED)
│   └── Data table with admin cancel action
│
├── TrainsTab     → GET /trains + GET /stations
│   ├── Create train form (with station dropdowns)
│   └── Train table with delete
│
├── SchedulesTab  → GET /schedules + GET /trains
│   ├── Create schedule form (with train dropdown)
│   └── Schedule table with delete
│
└── StationsTab   → GET /stations
    ├── Create station form
    └── Station table with delete
```

---

## 11. Design System

All styles live in `src/index.css`. The system uses CSS custom properties (variables) for complete theming consistency.

### Color Palette (Dark Theme)

```css
--bg-base:     #0c0e14   /* page background */
--bg-surface:  #12151f   /* card background */
--bg-elevated: #191d2b   /* inputs, elevated surfaces */
--bg-hover:    #1e2233   /* hover states */

--primary:     #6366f1   /* indigo — brand color */
--primary-gradient: linear-gradient(135deg, #6366f1, #818cf8)

--success:     #10b981   /* green — BOOKED status */
--danger:      #ef4444   /* red — CANCELLED, errors */
--warning:     #f59e0b   /* amber — low seat count */

--text-primary:   #f1f5f9
--text-secondary: #94a3b8
--text-muted:     #475569
```

### Component Classes

| Class | Usage |
|-------|-------|
| `.btn`, `.btn-primary`, `.btn-danger`, `.btn-ghost`, `.btn-success` | Buttons |
| `.btn-sm`, `.btn-lg`, `.btn-full` | Button size modifiers |
| `.card`, `.card-elevated`, `.card-hover` | Card containers |
| `.badge`, `.badge-success`, `.badge-danger`, `.badge-primary` | Status pills |
| `.form-group`, `.form-label`, `.form-input` | Form elements |
| `.table-wrapper`, `.table` | Data tables |
| `.stat-card`, `.stat-icon`, `.stat-value` | Dashboard stats |
| `.tabs`, `.tab-btn`, `.tab-btn.active` | Tab navigation |
| `.modal-overlay`, `.modal` | Modal dialogs |
| `.skeleton` | Loading shimmer animation |
| `.spinner`, `.spinner-lg` | Loading spinner |
| `.empty-state`, `.empty-icon`, `.empty-title` | Empty state displays |
| `.alert-error`, `.alert-success` | Inline alert boxes |
| `.page`, `.page-header`, `.page-title` | Page layout wrapper |
| `.grid-2`, `.grid-3`, `.grid-4` | CSS Grid layouts |
| `.seats-high`, `.seats-medium`, `.seats-low` | Seat count color coding |

### Animations

```css
@keyframes shimmer    /* skeleton loader sweep */
@keyframes spin       /* button/page spinner */
@keyframes toastSlideIn /* toast entry from right */
@keyframes toastFadeOut /* toast exit to right */
@keyframes modalIn    /* modal scale-in */
```

---

## 12. State Management & Notifications

### Toast System

Instead of browser `alert()`, all feedback uses a custom React Context-based toast system:

```
ToastProvider (in App.tsx)
  └── ToastContext
        ├── showToast(message, type)   ← "success" | "error" | "info"
        └── ToastContainer             ← renders at bottom-right corner

useToast() hook  ← consumed in any component
```

Toast auto-dismisses after **3.5 seconds**. Multiple toasts stack vertically.

### Data Fetching Pattern

All pages follow a consistent async pattern:
1. `loading = true` → show skeleton
2. API call via `api.get/post/patch/delete`
3. On success → update state + show success toast
4. On error → show `alert-error` div or error toast
5. `loading = false` → remove skeleton

---

## 13. Environment Variables

### Server (`.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/train_ticket_db"
JWT_SECRET="your-256-bit-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"    ← optional, defaults to localhost:5173
```

### Client

No `.env` needed in development. The API base URL is hardcoded in `src/api/axios.ts`:

```ts
baseURL: "http://localhost:5000/api"
```

For production, create `client/.env`:
```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

---

## 14. Setup & Running

### Prerequisites

- Node.js (LTS)
- PostgreSQL running locally
- A database named `train_ticket_db` (or update `DATABASE_URL`)

### 1. Install dependencies

```powershell
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 2. Setup environment

```powershell
# Copy and edit the env file
cd server
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Run database migrations

```powershell
cd server
npx prisma migrate dev
```

### 4. Seed admin user

```powershell
cd server
npx tsx prisma/seed.ts
# Output: Admin Created
```

### 5. Start both servers

```powershell
# Terminal 1 — Backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client
npm run dev
```

### Available Scripts

| Directory | Command | Description |
|-----------|---------|-------------|
| `server` | `npm run dev` | Start with `tsx watch` (hot reload) |
| `server` | `npm run build` | Compile TypeScript to `dist/` |
| `server` | `npm run start` | Run compiled production build |
| `client` | `npm run dev` | Vite dev server with HMR |
| `client` | `npm run build` | Production Vite build |
| `client` | `npm run preview` | Preview production build locally |

---

## 15. Admin Credentials

> Default credentials created by the seed script.

| Field | Value |
|-------|-------|
| Email | `admin@gmail.com` |
| Password | `admin123` |

After login, admin users are automatically redirected to `/admin` (Admin Panel).

> **Re-seeding:** Running `npx tsx prisma/seed.ts` again is safe — it uses Prisma `upsert` and will **reset** the admin password to `admin123`.

---

## 16. Key Bug Fixes Applied

The following bugs were identified and fixed during the overhaul:

### Bug 1 — Admin role never stored correctly (Login)
**File:** `client/src/pages/Login.tsx`

The login API returns `{ token, role, user: { role } }` but the original code read `res.data.role` which was `undefined` (role was nested under `user`). This caused the admin redirect and navbar admin link to never work.

```ts
// Before (broken)
localStorage.setItem("role", res.data.role);        // undefined

// After (fixed) — backend now returns role at top level
localStorage.setItem("role", res.data.role);        // "ADMIN" or "CUSTOMER"
```

### Bug 2 — Admin cannot cancel bookings
**File:** `server/src/services/booking.service.ts`

The `cancelBooking` function checked `booking.userId !== userId`, which always blocked admins since they're not the booking owner.

```ts
// Before: admins got 403 Forbidden
if (booking.userId !== userId) throw 403;

// After: admins bypass ownership check
if (!isAdmin && booking.userId !== userId) throw 403;
```

### Bug 3 — Anyone could self-register as ADMIN
**File:** `server/src/controllers/auth.controllers.ts`

The old register controller accepted `role` from `req.body` and saved it directly, allowing any user to POST `{ role: "ADMIN" }`.

```ts
// Before (security hole)
await prisma.user.create({ data: { name, email, password, role } });

// After: role field intentionally excluded
await prisma.user.create({ data: { name, email, password } });
// schema default CUSTOMER applies automatically
```

### Bug 4 — Seat booking race condition
**File:** `server/src/services/booking.service.ts`

The original code read seat count and wrote the update in two separate queries. Two simultaneous requests could both read "1 seat available", both pass the check, and both book — resulting in -1 available seats.

```ts
// After: wrapped in atomic transaction
await prisma.$transaction(async (tx) => {
  const schedule = await tx.schedule.findUnique(...); // locked read
  // check seats
  await tx.booking.create(...);
  await tx.schedule.update(...);                      // all-or-nothing
});
```

### Bug 5 — Dead unreachable JSX in SearchTrains
**File:** `client/src/pages/SearchTrains.tsx`

A JSX fragment was written as a standalone statement (not inside `return`), so it never rendered:
```tsx
// Before: dead code — this JSX is never returned
<>
  <Link to="/bookings">My Bookings</Link>
</>;

// After: removed entirely (Navbar handles navigation)
```

### Bug 6 — Wrong error messages in cancel flows
**Files:** `MyBookings.tsx`, `AdminPanel.tsx`

Error handlers in `cancelBooking` showed `"Registration failed"` — a copy-paste error from `Register.tsx`.

```ts
// Before
setError("Registration failed");

// After
showToast("Could not cancel booking.", "error");
```

### Bug 7 — Stations hardcoded in frontend
**File:** `client/src/pages/SearchTrains.tsx`

The original code had stations hardcoded as a static array `[{ code: "MAS", ... }]`, ignoring the actual database.

```ts
// Before: hardcoded, never reflects DB
const stations = [{ code: "MAS", name: "Chennai Central" }, ...];

// After: fetched from API on mount
useEffect(() => {
  api.get("/stations").then((r) => setStations(r.data));
}, []);
```

### Bug 8 — In-memory train search filtering
**File:** `server/src/services/train.service.ts`

Original code fetched **all** schedules and filtered in JavaScript — inefficient and unscalable.

```ts
// Before: fetch everything, filter in JS
const all = await prisma.schedule.findMany({ include: { train: { include: { from, to } } } });
const filtered = all.filter(s => s.train.from.code === from && ...);

// After: filter at DB level using Prisma where
await prisma.schedule.findMany({
  where: {
    journeyDate: new Date(date),
    train: { from: { code: from }, to: { code: to } },
  },
});
```

---

## 17. Known Limitations & Future Improvements

| Area | Current State | Improvement |
|------|--------------|-------------|
| **Logging** | `console.error` only | Add `pino` or `winston` structured logger |
| **Pagination** | All records returned | Add `skip`/`take` Prisma pagination |
| **Seat selection** | Only seat count (not specific seats) | Seat map with individual seat selection |
| **Payment** | Not implemented | Integrate Razorpay / Stripe |
| **Email notifications** | Not implemented | Send booking confirmation via Nodemailer |
| **Refresh tokens** | Not implemented | Short-lived access + long-lived refresh token |
| **Multi-stop routes** | Not supported | Add intermediate stations to Train model |
| **Production CORS** | Hardcoded `localhost` | Use `CLIENT_URL` env var (already wired) |
| **Admin audit log** | Not implemented | Track which admin cancelled what and when |
| **Docker** | Not configured | Add `docker-compose.yml` for one-command setup |
| **Testing** | No tests | Add Vitest unit tests + Supertest API tests |
