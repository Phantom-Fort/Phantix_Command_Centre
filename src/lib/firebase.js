// src/lib/firebase.js
// Firebase Admin SDK — server-side only. Never exposed to the browser.
'use strict';

const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  try {
    // ── Option 1: Local JSON file (local dev) ─────────────────────────────
    // Place your downloaded service account JSON at the project root.
    // It is gitignored and never committed.
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Firebase] Initialised with service account JSON file');
  } catch (jsonErr) {
    // ── Option 2: Environment variable (Vercel production) ─────────────────
    // On Vercel, set FIREBASE_SERVICE_ACCOUNT_JSON to the full JSON string
    // of your service account file (paste it as a single-line JSON string).
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
          credential: admin.credential.cert(sa),
        });
        console.log('[Firebase] Initialised with FIREBASE_SERVICE_ACCOUNT_JSON env var');
      } catch (envErr) {
        console.error('[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', envErr.message);
        process.exit(1);
      }
    } else {
      console.error('[Firebase] No credentials found. Provide firebase-service-account.json or FIREBASE_SERVICE_ACCOUNT_JSON env var.');
      process.exit(1);
    }
  }
}

const db   = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
