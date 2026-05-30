# Phantix System Architecture

## Overview

Phantix Command Centre is a single-page web application built on Next.js 14 App Router, serving as the project management hub for the Phantix Security Solutions platform — an AI-powered security suite targeting SMEs in emerging markets (Nigeria first).

The application tracks a 2-year delivery roadmap (May 2026 → May 2028) with 10 functional modules covering research, documentation, architecture planning, risk management, and knowledge curation.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Firebase │  │  Next.js │  │   React Components   │  │
│  │ Client   │  │  Router  │  │   (AppShell + Pages) │  │
│  │ SDK      │  │          │  │                      │  │
│  │ (Auth +  │  │ / → page │  │  AuthProvider        │  │
│  │  FS)     │  │          │  │  AppProvider         │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │             │                    │              │
└───────┼─────────────┼────────────────────┼──────────────┘
        │             │                    │
        │   Firebase  │  HTTP (REST)       │  React State
        │   Auth API  │  /api/*            │  (Context + Reducer)
        │             │                    │
        ▼             ▼                    ▼
┌─────────────────────────────────────────────────────────┐
│                  VERCEL (Serverless)                     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                   │  │
│  │                                                  │  │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │  │
│  │  │ /config │  │  /auth   │  │  /logs        │  │  │
│  │  │         │  │          │  │  /risks        │  │  │
│  │  │ GET     │  │ POST     │  │  /milestones   │  │  │
│  │  │ public  │  │ lookup   │  │  /state        │  │  │
│  │  │         │  │ register │  │  /insights     │  │  │
│  │  │         │  │ me       │  │  /manifest     │  │  │
│  │  │         │  │ users    │  │  /admin/seed   │  │  │
│  │  └─────────┘  └──────────┘  └───────────────┘  │  │
│  │                                                  │  │
│  │         ┌──────────────────────┐                 │  │
│  │         │  Auth Middleware     │                 │  │
│  │         │  - Token verification│                 │  │
│  │         │  - Role check (admin)│                 │  │
│  │         └──────────┬───────────┘                 │  │
│  └────────────────────┼─────────────────────────────┘  │
│                       │                                │
│              ┌────────▼────────┐                       │
│              │  Firebase Admin │                       │
│              │  SDK            │                       │
│              │  (server-side)  │                       │
│              └────────┬────────┘                       │
└───────────────────────┼────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  GOOGLE CLOUD                            │
│                                                         │
│  ┌──────────────┐          ┌────────────────────────┐  │
│  │ Firebase     │          │       Firestore        │  │
│  │ Auth         │          │                        │  │
│  │              │          │  users/                │  │
│  │ - Email/Pass │          │  logs/                 │  │
│  │ - Google     │          │  risks/                │  │
│  │ - Token      │          │  milestones/           │  │
│  │   Verification│         │  insights/             │  │
│  └──────────────┘          │  manifest/             │  │
│                            │  users/{uid}/state/    │  │
│                            └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
RootLayout (layout.tsx) [Server Component]
└── HomePage (page.tsx) ["use client" boundary]
    └── RootContent
        ├── AuthProvider (Firebase auth context)
        │   └── AppProvider (App state context + reducer)
        │       └── AppContent (auth gate + boot logic)
        │           ├── [AuthLoading] → Spinner
        │           ├── [Not Auth] → AuthScreen
        │           │   ├── Login tab (email/password + Google)
        │           │   └── Register tab (profile form)
        │           └── [Authenticated] → AppShell
        │               ├── Sidebar (nav + badges + user info)
        │               ├── TopBar (title + status pills)
        │               ├── Loader (overlay during data fetch)
        │               └── Page Router (switch on currentPage)
        │                   ├── Overview
        │                   │   └── LogList (recent 5)
        │                   ├── Phases
        │                   ├── Documents
        │                   ├── Research
        │                   ├── Insights
        │                   ├── Manifest
        │                   ├── Architecture
        │                   ├── Milestones
        │                   ├── Risks
        │                   └── ActivityLog
        │                       └── LogList (full)
```

---

## Data Flow

### Authentication Flow

```
1. User enters username → POST /api/auth/lookup
2. Server queries Firestore users collection by username
3. Returns email → Client calls signInWithEmailAndPassword()
4. Firebase Auth returns ID token + refresh token
5. onAuthStateChanged fires → client reads Firestore profile
6. API calls attach token as Authorization: Bearer <token>
7. Server middleware verifies token via Firebase Admin SDK
```

### Boot Sequence

```
1. AuthProvider confirms user + loads Firestore profile
2. AppContent detects authenticated session
3. bootApp(session) called:
   a. dispatch SET_SESSION
   b. showLoader("Loading your workspace…")
   c. Parallel fetch: getLogs, getMilestones, getRisks,
      getState, getInsights, getManifest (admin only)
   d. Dispatch all data to reducer
   e. Artificial 800ms delay (smooth UX)
   f. hideLoader()
4. AppShell renders with populated data
```

### State Management

```
AppProvider (React Context + useReducer)
├── session, currentPage, loading
├── logs[], risks[], milestones[]
├── insights[], manifest[]
├── booksRead{}, archTasks{}
├── navigate(page) → dispatch SET_PAGE
├── bootApp(session) → parallel fetch + dispatch
├── showLoader/hideLoader → dispatch SET_LOADING
└── per-module mutations → API call → dispatch local update
```

---

## API Route Design

All routes are dynamic (`ƒ`) serverless functions. The `/api/config/firebase` route is the only public endpoint; all others require authentication.

### Auth Layer

```
Middleware: verifyAuthToken(req)
├── Extract token from Authorization header or phantix_token cookie
├── Verify via adminAuth.verifyIdToken(token)
├── Fetch Firestore user profile
└── Return { uid, email, name, role } or 401

Middleware: requireAdmin(session)
└── Check session.role === "admin" or 403
```

### Route Map

| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/config/firebase` | GET | Public | Firebase client config |
| `/api/auth/lookup` | POST | Public | Username → email |
| `/api/auth/register` | POST | Public | Save profile after Firebase Auth |
| `/api/auth/me` | GET | Auth | Current user profile |
| `/api/auth/users` | GET | Admin | List all users |
| `/api/auth/users/[uid]` | DELETE | Admin | Delete user |
| `/api/logs` | GET, POST | Auth | List / create log entries |
| `/api/logs/[id]` | DELETE | Admin | Delete log entry |
| `/api/risks` | GET, POST | Auth | List / create risks |
| `/api/risks/[id]` | DELETE | Admin | Delete risk |
| `/api/milestones` | GET, POST | Auth | List / create milestones |
| `/api/milestones/[id]` | PATCH, DELETE | Auth/Admin | Toggle status / delete |
| `/api/state` | GET, PUT | Auth | Per-user state persistence |
| `/api/insights` | GET, POST | Auth | List / create insights |
| `/api/insights/[id]` | PATCH, DELETE | Auth/Admin | Update status / delete |
| `/api/manifest` | GET, POST | Auth/Admin | List / create manifest entries |
| `/api/manifest/[id]` | DELETE | Admin | Delete manifest entry |
| `/api/admin/seed` | POST | Admin | Seed default data |

---

## Key Design Decisions

### Lazy Firebase Initialization
Both client and admin Firebase SDKs use lazy initialization to prevent crashes during Next.js SSR/build. The client SDK guards with `typeof window !== "undefined"`, while the admin SDK uses Proxy objects that defer initialization to first method call.

### Per-User State
Reading progress (`booksRead`) and architecture task completion (`archTasks`) are stored per-user at `users/{uid}/state/main` with merge semantics. This avoids collection-level queries and keeps data scoped.

### 6-Month Lock Window
The insights submission form has a hard deadline (Nov 9, 2026). Both client (UI hide + alert) and server (403 response) enforce this. A live countdown timer shows days/hours/minutes/seconds remaining.

### Implementation Suggestions Engine
When an insight is logged, the system:
1. Looks up the book in a pre-defined suggestion table (27 books × 4-6 suggestions each)
2. Scans reading notes for keywords (trust, monitor, agent, log, api, scale, customer, attack, compliance, prompt/llm)
3. Returns 4-7 targeted suggestions specific to Phantix implementation

### Insight → Manifest Pipeline
Admin-approved insights automatically generate manifest entries combining the deliberation verdict with all implementation suggestions. This creates a traceable path from research → insight → deliberation → implementation plan.

---

## Security Model

| Concern | Implementation |
|---------|---------------|
| Passwords | Never touch our server — handled entirely by Firebase Auth |
| API Authentication | Firebase ID token verification on every request |
| Authorization | Role-based (contributor / admin) enforced server-side |
| Admin Registration | Gated behind environment variable secret key |
| Client Config | Firebase API key served from server, not baked into static files |
| Content Deletion | Admin-only for risks, milestones, logs, insights, manifest entries |
| Username Uniqueness | Enforced server-side with rollback on collision |

---

## Deliverable Phases (56 items)

| Phase | Timeline | Deliverables | Status |
|-------|----------|-------------|--------|
| PRE-DEV | May–Aug 2026 | 16 documents + manifest | Active |
| Phase 1 | Sep–Dec 2026 | 14 MVP build items | Upcoming |
| Phase 2 | 2027 | 12 growth platform items | Upcoming |
| Phase 3 | 2028 | 12 AI SOC items | Upcoming |

## Research Domains (27 books)

| Domain | Books |
|--------|-------|
| Security Foundations | 6 |
| Offensive Security | 6 |
| AI & ML Engineering | 5 |
| Systems Architecture | 5 |
| Cloud & Infrastructure | 3 |
| Product & Business | 6 |

## Architecture Services (41 tasks)

| Service | Tasks |
|---------|-------|
| Scan Orchestrator | 6 |
| AI Analysis Engine | 6 |
| Asset Manager | 5 |
| Alert Engine | 5 |
| Compliance Engine | 5 |
| API Gateway | 5 |
| Dashboard Frontend | 5 |
| Notification Service | 4 |
