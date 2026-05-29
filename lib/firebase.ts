import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function ensureInit() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!_app) {
    if (getApps().length > 0) {
      _app = getApps()[0];
    } else {
      _app = initializeApp(getFirebaseConfig());
    }
  }
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  if (!_auth && ensureInit()) {
    _auth = getAuth(_app!);
  }
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!_db && ensureInit()) {
    _db = getFirestore(_app!);
  }
  return _db;
}

export { _app as app };
