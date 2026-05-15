// public/js/firebase.js
// Firebase CLIENT SDK — runs in the browser.
// Fetches config from the server so credentials never sit in static files.
// Loaded as type="module" in index.html.

import { initializeApp }          from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }                from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }           from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let _app, _auth, _db;

/**
 * initFirebase()
 * Fetches the Firebase client config from our Express server (/api/config/firebase)
 * then initialises the Firebase client SDK.
 * Must be called once before anything else.
 */
export async function initFirebase() {
  if (_app) return { auth: _auth, db: _db };   // already initialised

  const res = await fetch('/api/config/firebase');
  if (!res.ok) throw new Error('Failed to load Firebase config from server');

  const config = await res.json();

  _app  = initializeApp(config);
  _auth = getAuth(_app);
  _db   = getFirestore(_app);

  console.log('[Firebase] Client SDK initialised');
  return { auth: _auth, db: _db };
}

export function getFirebaseAuth() { return _auth; }
export function getFirebaseDb()   { return _db;   }
