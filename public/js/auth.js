// public/js/auth.js
// Firebase Auth: email/password login, Google OAuth, registration, logout.
// Username→email lookup goes through the Express server (/api/auth/lookup)
// so it works BEFORE the user is authenticated (bypasses Firestore rules).

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  doc, getDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { getFirebaseAuth, getFirebaseDb } from './firebase.js';
import { registerProfile }                from './api.js';
import { showLoader, hideLoader }          from './app.js';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// ── Tab switcher ──────────────────────────────────────────────────────────────
export function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((el, i) =>
    el.classList.toggle('active',
      (tab === 'login' && i === 0) || (tab === 'register' && i === 1)
    )
  );
  document.getElementById('tab-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('tab-register').style.display = tab === 'register' ? 'block' : 'none';
}

export function toggleAdminKey() {
  const row = document.getElementById('admin-key-row');
  if (row) row.style.display =
    document.getElementById('r-role')?.value === 'admin' ? 'block' : 'none';
}

// ── Shared error display ──────────────────────────────────────────────────────
function showAuthError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}

function clearErrors() {
  ['l-err', 'r-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function friendlyFirebaseError(err) {
  const code = err.code || '';
  const map  = {
    'auth/wrong-password':          'Incorrect password.',
    'auth/invalid-credential':      'Incorrect username or password.',
    'auth/user-not-found':          'No account found.',
    'auth/too-many-requests':       'Too many attempts — please try again later.',
    'auth/user-disabled':           'This account has been disabled.',
    'auth/network-request-failed':  'Network error — check your connection.',
    'auth/email-already-in-use':    'That email address is already registered.',
    'auth/invalid-email':           'Invalid email address format.',
    'auth/popup-closed-by-user':    'Sign-in popup was closed before completing.',
    'auth/popup-blocked':           'Popup was blocked by your browser. Please allow popups.',
    'auth/cancelled-popup-request': '',   // silent — user opened another popup
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
  };
  return map[code] || err.message || 'Authentication failed.';
}

// ── Google Sign-In ─────────────────────────────────────────────────────────────
export async function doGoogleSignIn() {
  clearErrors();

  // Set loading state on both Google buttons
  document.querySelectorAll('.auth-btn-google').forEach(b => b.classList.add('loading'));

  showLoader('Signing in with Google…');
  try {
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    const user   = result.user;

    // Check if this Google account already has a Firestore profile
    const db          = getFirebaseDb();
    const profileSnap = await getDoc(doc(db, 'users', user.uid));

    if (!profileSnap.exists()) {
      // First Google sign-in — create a profile automatically
      // Username is derived from the Google display name (lowercased, spaces → underscores)
      const rawName     = user.displayName || user.email.split('@')[0];
      const autoUsername = rawName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 20);

      try {
        await registerProfile({
          uid:      user.uid,
          name:     rawName,
          username: autoUsername,
          email:    user.email,
          role:     'contributor',   // Google sign-in always creates a contributor
          adminKey: '',
        });
      } catch (regErr) {
        // Username collision — append random suffix and retry
        if (regErr.message?.includes('Username already taken')) {
          const suffix   = Math.random().toString(36).slice(2, 6);
          await registerProfile({
            uid:      user.uid,
            name:     rawName,
            username: autoUsername.slice(0, 16) + '_' + suffix,
            email:    user.email,
            role:     'contributor',
            adminKey: '',
          });
        } else {
          throw regErr;
        }
      }
    }

    // onAuthStateChanged → bootApp handles the rest

  } catch (err) {
    hideLoader();
    document.querySelectorAll('.auth-btn-google').forEach(b => b.classList.remove('loading'));

    const msg = friendlyFirebaseError(err);
    if (msg) {
      // Show error under the currently active tab
      const activeTab = document.getElementById('tab-register').style.display === 'block'
        ? 'r-err' : 'l-err';
      showAuthError(activeTab, msg);
    }
    console.error('[Auth] Google sign-in error:', err.code, err.message);
  }
}

// ── Email/Password Login ──────────────────────────────────────────────────────
export async function doLogin() {
  clearErrors();
  const username = document.getElementById('l-user').value.trim().toLowerCase();
  const password = document.getElementById('l-pass').value;

  if (!username || !password) {
    showAuthError('l-err', 'Please enter your username and password.');
    return;
  }

  showLoader('Signing in…');
  try {
    // Resolve username → email via Express server (Admin SDK, bypasses Firestore rules)
    const lookupRes = await fetch('/api/auth/lookup', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username }),
    });

    if (lookupRes.status === 404) {
      showAuthError('l-err', 'Username not found.');
      hideLoader();
      return;
    }
    if (!lookupRes.ok) {
      const data = await lookupRes.json().catch(() => ({}));
      showAuthError('l-err', data.error || 'Login failed — please try again.');
      hideLoader();
      return;
    }

    const { email } = await lookupRes.json();
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // onAuthStateChanged → bootApp

  } catch (err) {
    hideLoader();
    showAuthError('l-err', friendlyFirebaseError(err));
    console.error('[Auth] Login error:', err.code, err.message);
  }
}

// ── Registration ──────────────────────────────────────────────────────────────
export async function doRegister() {
  clearErrors();
  const name     = document.getElementById('r-name').value.trim();
  const username = document.getElementById('r-user').value.trim().toLowerCase();
  const email    = document.getElementById('r-email').value.trim().toLowerCase();
  const role     = document.getElementById('r-role').value;
  const adminKey = document.getElementById('r-akey')?.value.trim() || '';
  const password = document.getElementById('r-pass').value;
  const pass2    = document.getElementById('r-pass2').value;

  // Client-side validation
  if (!name || !username || !email || !password) {
    showAuthError('r-err', 'All fields are required.'); return;
  }
  if (password.length < 6) {
    showAuthError('r-err', 'Password must be at least 6 characters.'); return;
  }
  if (password !== pass2) {
    showAuthError('r-err', 'Passwords do not match.'); return;
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    showAuthError('r-err', 'Username: 3–20 chars, letters/numbers/underscores only.'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthError('r-err', 'Please enter a valid email address.'); return;
  }

  showLoader('Creating account…');
  let uid = null;

  try {
    // Firebase Auth creates the account (password hashed by Firebase)
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    uid = cred.user.uid;

    // Server saves Firestore profile + validates admin key + checks username uniqueness
    await registerProfile({ uid, name, username, email, role, adminKey });
    // onAuthStateChanged → bootApp

  } catch (err) {
    hideLoader();

    // Clean up orphaned Firebase Auth account if server rejected the profile
    if (uid) {
      try {
        const u = getFirebaseAuth().currentUser;
        if (u?.uid === uid) await u.delete();
      } catch (_) {}
    }

    let msg = friendlyFirebaseError(err);
    if (err.message?.includes('Username already taken')) msg = 'That username is already taken.';
    if (err.message?.includes('Invalid admin key'))      msg = 'Invalid admin key.';

    showAuthError('r-err', msg);
    console.error('[Auth] Register error:', err.code, err.message);
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function doLogout() {
  try {
    await signOut(getFirebaseAuth());
  } catch (err) {
    console.error('[Auth] Logout error:', err.message);
  }
}

// ── Auth state watcher ─────────────────────────────────────────────────────────
// Calls bootCallback(session) on any successful sign-in (email or Google).
// Shows auth screen on sign-out.
export function watchAuthState(bootCallback) {
  onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
    if (!firebaseUser) {
      hideLoader();
      // Reset Google button states
      document.querySelectorAll('.auth-btn-google').forEach(b => b.classList.remove('loading'));
      document.getElementById('auth-screen').style.display = 'flex';
      document.getElementById('app').style.display         = 'none';
      return;
    }

    showLoader('Loading your workspace…');
    try {
      const db          = getFirebaseDb();
      let   profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

      // Registration race: Firestore write may not be visible immediately — retry once
      if (!profileSnap.exists()) {
        await new Promise(r => setTimeout(r, 1500));
        profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      }

      if (!profileSnap.exists()) {
        console.error('[Auth] Firestore profile not found for uid:', firebaseUser.uid);
        await signOut(getFirebaseAuth());
        hideLoader();
        showAuthError('l-err', 'Account setup incomplete — please try signing in again.');
        return;
      }

      const profile = profileSnap.data();
      await bootCallback({
        uid:      firebaseUser.uid,
        email:    firebaseUser.email,
        name:     profile.name     || firebaseUser.displayName || firebaseUser.email,
        username: profile.username || '',
        role:     profile.role     || 'contributor',
      });

    } catch (err) {
      console.error('[Auth] watchAuthState error:', err.message);
      hideLoader();
    }
  });
}
