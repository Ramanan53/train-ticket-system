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

---

## 5. API Reference

Base URL: `http://localhost:5000/api`

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| `POST` | `/auth/register` | None | `{ name, email, password }` | `{ message, user: { id, name, email, role } }` |
| `POST` | `/auth/login` | None | `{ email, password }` | `{ token, role, user: { id, name, email, role } }` |

---

## 6. Setup & Running

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
# Copy the template to .env
cd server
cp .env.example .env
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

---

## 7. Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@gmail.com` |
| Password | `admin123` |
