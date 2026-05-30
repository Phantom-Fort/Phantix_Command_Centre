# Phantix Command Centre

**Phantix Security Solutions — Product Delivery Command Centre**

A full-stack Next.js application for managing the 2-year delivery roadmap of Phantix Security Solutions, an AI-powered security platform for SMEs in emerging markets.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS + custom CSS (dark navy theme) |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Database | Firestore (via Firebase Admin SDK) |
| Deployment | Vercel |

## Features

- **Authentication** — Email/password login with username lookup, Google OAuth, admin registration key
- **Overview Dashboard** — KPI cards, 2-year timeline bar, recent activity feed
- **Phases & Deliverables** — 4-phase delivery tracker with 56 clickable deliverables
- **Document Registry** — 16 planned documents with tier/purpose/status/audience
- **Research Tracker** — 27-book reading list across 6 domains with per-user check-off
- **Book Insights** — Log chapter notes, auto-generate implementation suggestions, deliberate, approve for manifest
- **Implementation Manifest** — Admin-curated features, procedures & architecture decisions
- **Architecture Tracker** — 8 services with 41 per-user task checklists
- **Milestones** — Timeline with add/toggle functionality
- **Risk Register** — Risk management table with severity levels
- **Activity Log** — Full audit trail with type categorization
- **6-Month Edit Lock** — Hard deadline (Nov 9, 2026) on insight submissions with live countdown

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Firebase project with Authentication (email/password + Google) and Firestore enabled
- Firebase Admin SDK service account JSON

### Environment Variables

Create `.env.local` in the project root:

```env
# Firebase Admin SDK (server-side)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# Firebase Client SDK (browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin registration key (controls who can register as admin)
ADMIN_REGISTRATION_KEY=your-secret-key
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed Default Data

After creating your first admin account, seed the database:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer <your-firebase-id-token>"
```

This populates 4 default risks, 12 milestones, and 3 log entries.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Entry point (client boundary)
│   ├── globals.css             # All styles (CSS variables, components)
│   └── api/                    # 20 API routes
│       ├── config/firebase/    # Public Firebase config endpoint
│       ├── auth/               # lookup, register, me, users
│       ├── logs/               # CRUD for activity log
│       ├── risks/              # CRUD for risk register
│       ├── milestones/         # CRUD + toggle for milestones
│       ├── state/              # Per-user state (books, arch tasks)
│       ├── insights/           # CRUD + patch for book insights
│       ├── manifest/           # CRUD for implementation manifest
│       └── admin/seed/         # Seed default data
├── components/
│   ├── AuthProvider.tsx        # Firebase Auth context + Google OAuth
│   ├── AuthScreen.tsx          # Login / register forms
│   ├── AppShell.tsx            # Sidebar + topbar + page router
│   ├── RootContent.tsx         # Auth gate + boot sequence
│   ├── Sidebar.tsx             # Navigation with badges
│   ├── TopBar.tsx              # Page title + status pills
│   ├── Loader.tsx              # Fullscreen loading overlay
│   ├── Overview.tsx            # KPIs, timeline, recent activity
│   ├── Phases.tsx              # 4-phase deliverable tracker
│   ├── Documents.tsx           # 16-document registry table
│   ├── Research.tsx            # 27-book reading tracker
│   ├── Insights.tsx            # Book insights + deliberation
│   ├── Manifest.tsx            # Implementation manifest (admin)
│   ├── Architecture.tsx        # 8-service task tracker
│   ├── Milestones.tsx          # Timeline with add/toggle
│   ├── Risks.tsx               # Risk table with add/delete
│   ├── ActivityLog.tsx         # Log entry form + list
│   └── LogList.tsx             # Reusable log entry list
├── hooks/
│   └── useAppData.tsx          # App state (context + reducer)
├── lib/
│   ├── firebase.ts             # Firebase client SDK (lazy init)
│   ├── firebase-admin.ts       # Firebase Admin SDK (lazy init)
│   ├── auth-utils.ts           # Token verification middleware
│   ├── api-client.ts           # Typed API functions (18 endpoints)
│   ├── data.ts                 # Books, suggestions engine, arch services
│   └── types.ts                # TypeScript type definitions
└── public/
    └── logo.png
```

## Database Schema (Firestore)

| Collection | Path | Fields |
|-----------|------|--------|
| `users` | `/users/{uid}` | name, username, email, role, createdAt |
| `users/{uid}/state/main` | sub-collection | booksRead, archTasks |
| `logs` | `/logs/{id}` | type, text, date, author, createdAt |
| `risks` | `/risks/{id}` | title, level, category, mitigation, owner, addedBy, createdAt |
| `milestones` | `/milestones/{id}` | title, date, desc, status, addedBy, createdAt |
| `insights` | `/insights/{id}` | book, author, phase, chapter, notes, category, suggestions, status, verdict, verdictNotes, addedBy, addedByUid, deliberatedBy, deliberatedDate, date, createdAt |
| `manifest` | `/manifest/{id}` | title, body, type, source, priority, category, addedBy, date, createdAt |

## Authentication Flow

1. User enters username or email → server resolves username to email via Firestore Admin SDK
2. Login with email + password via Firebase Auth
3. Server verifies Firebase ID token on every authenticated API call
4. User profile stored in Firestore with role (`admin` or `contributor`)
5. Admin registration gated behind `ADMIN_REGISTRATION_KEY`

## Role-Based Access

| Action | Contributor | Admin |
|--------|------------|-------|
| View pages | All | All |
| Add/edit own insights | Yes | Yes |
| Deliberate on own insights | Yes | Yes |
| View manifest | No | Yes |
| Add/delete manifest entries | No | Yes |
| Approve insights → manifest | No | Yes |
| Manage users | No | Yes |
| Delete any entry | No | Yes |
| Seed data | No | Yes |

## License

ISC
