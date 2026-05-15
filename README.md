# Phantix Command Centre

Product delivery dashboard with Firebase Admin auth, Firestore, and Vercel deployment.

---

## Project Structure

```
phantix-command-centre/
├── server.js                        ← Express app (Vercel entry point)
├── package.json
├── vercel.json
├── example.env                      ← Copy to .env
├── firebase-service-account.json    ← Your service account (gitignored)
│
├── src/lib/
│   ├── firebase.js                  ← Firebase Admin SDK init
│   ├── authMiddleware.js            ← Token verification + role check
│   └── routes.js                   ← All API routes
│
└── public/
    ├── index.html                   ← App shell (auth + all page markup)
    ├── logo.png                     ← Phantix logo
    ├── css/
    │   └── styles.css               ← All styles
    └── js/
        ├── firebase.js              ← Firebase CLIENT SDK init (fetches config from server)
        ├── api.js                   ← All fetch() calls to /api/* (attaches auth token)
        ├── auth.js                  ← Login, register, logout, session watcher
        ├── app.js                   ← Entry point: boot, nav, timeline, shared utils
        ├── data.js                  ← Books data + suggestions engine (no API calls)
        ├── state.js                 ← Risks and milestones
        ├── research.js              ← Reading list tracker
        ├── insights.js              ← Book insights: submit, deliberate, approve
        ├── manifest.js              ← Implementation manifest (admin write)
        └── log.js                   ← Activity log
```

---

## How Auth Works

```
Browser                         Express Server              Firebase
  │                                   │                        │
  │  createUserWithEmailAndPassword()  │                        │
  │ ─────────────────────────────────────────────────────────► │
  │ ◄───────────────────────────────────────────────────────── │
  │  Firebase Auth account created (password hashed by Firebase)│
  │                                   │                        │
  │  POST /api/auth/register           │                        │
  │  {uid, name, username, role, key} │                        │
  │ ──────────────────────────────►   │                        │
  │                                   │  validateAdminKey()    │
  │                                   │  checkUsernameUnique() │
  │                                   │  setCustomClaims()  ──►│
  │                                   │  Firestore: save profile│
  │ ◄──────────────────────────────   │                        │
  │  {ok: true, role}                 │                        │
  │                                   │                        │
  │  Every subsequent API call:       │                        │
  │  Authorization: Bearer <idToken>  │                        │
  │ ──────────────────────────────►   │                        │
  │                                   │  verifyIdToken() ──►   │
  │                                   │  fetch Firestore role  │
  │                                   │  req.user = {uid, role}│
```

**Passwords are never stored anywhere in this codebase.** Firebase Auth handles all
password hashing (bcrypt) internally.

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add Firebase credentials

Place your service account JSON at the project root:
```
firebase-service-account.json
```
This file is gitignored and will never be committed.

### 3. Configure environment
```bash
cp example.env .env
```
Fill in all values in `.env`.

### 4. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 5. Seed default data (first run only)
After your first admin login, call the seed endpoint once:
```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```
Or use the browser DevTools console after signing in:
```javascript
fetch('/api/admin/seed', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + await firebase.auth().currentUser.getIdToken() }
})
```

---

## Vercel Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/phantix-command-centre.git
git push -u origin main
```

### 2. Import to Vercel
- Go to https://vercel.com → New Project → Import from GitHub
- Framework preset: **Other**
- Leave all other settings as default

### 3. Add environment variables
In Vercel → Project Settings → Environment Variables, add all variables from `example.env`.

For `FIREBASE_SERVICE_ACCOUNT_JSON`: open your service account JSON file, copy the entire
contents, and paste it as a single line (Vercel handles the escaping).

### 4. Deploy
Vercel deploys automatically on every push to `main`.

---

## API Routes Reference

```
PUBLIC
  GET  /api/config/firebase       Firebase client config (no auth)

AUTH
  POST /api/auth/register         Save user profile after Firebase Auth signup
  GET  /api/auth/me               Current user profile
  GET  /api/auth/users            List all users (admin only)
  DEL  /api/auth/users/:uid       Delete user (admin only)

LOGS
  GET  /api/logs                  Get activity log
  POST /api/logs                  Add log entry
  DEL  /api/logs/:id              Delete log entry (admin only)

RISKS
  GET  /api/risks                 Get all risks
  POST /api/risks                 Add risk
  DEL  /api/risks/:id             Delete risk

MILESTONES
  GET  /api/milestones            Get all milestones
  POST /api/milestones            Add milestone
  PAT  /api/milestones/:id        Update milestone status
  DEL  /api/milestones/:id        Delete milestone (admin only)

STATE (per-user)
  GET  /api/state                 Get user's reading/arch task state
  PUT  /api/state                 Update a key in user state

INSIGHTS
  GET  /api/insights              Get all insights
  POST /api/insights              Add insight (lock window enforced server-side)
  PAT  /api/insights/:id          Update insight (deliberation, status)
  DEL  /api/insights/:id          Delete insight (admin only)

MANIFEST
  GET  /api/manifest              Get manifest (all authenticated users)
  POST /api/manifest              Add entry (admin only)
  DEL  /api/manifest/:id          Delete entry (admin only)

ADMIN
  POST /api/admin/seed            Seed default data (admin only, run once)
```

---

## Troubleshooting

**"Firebase initialisation failed"**
→ Check that `firebase-service-account.json` exists at the project root (local) or
  `FIREBASE_SERVICE_ACCOUNT_JSON` is set in Vercel env vars.

**"Invalid or expired token"**
→ Firebase ID tokens expire after 1 hour. The client SDK auto-refreshes them.
  If this persists, sign out and sign back in.

**"Username not found" on login**
→ Login uses username → email lookup from Firestore. Ensure the user registered
  successfully (profile appears in Firestore `users` collection).

**Pages not loading / JS errors**
→ Open browser DevTools → Console. All modules log their errors with a `[ModuleName]` prefix.
→ Check Network tab for failed `/api/*` requests.

**Vercel build failing**
→ Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is set as a single-line JSON string in Vercel env vars.
→ Check build logs for the specific error.
