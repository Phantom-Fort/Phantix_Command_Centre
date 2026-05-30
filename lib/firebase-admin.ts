import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore as _getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth as _getAuth, Auth } from "firebase-admin/auth";

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function ensureInit() {
  if (getApps().length > 0) {
    _app = getApps()[0];
    return;
  }

  const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (saEnv && saEnv.length > 20) {
    try {
      const sa = JSON.parse(saEnv);
      _app = initializeApp({ credential: cert(sa) });
      console.log("[Firebase Admin] Initialised via FIREBASE_SERVICE_ACCOUNT_JSON");
      return;
    } catch (err: any) {
      console.error("[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
    }
  }

  throw new Error("[Firebase Admin] No credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON env var or provide firebase-service-account.json");
}

export function getAdminDb() {
  ensureInit();
  if (!_db) _db = _getFirestore();
  return _db;
}

export function getAdminAuth() {
  ensureInit();
  if (!_auth) _auth = _getAuth(_app!);
  return _auth;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop: string) { return Reflect.get(getAdminDb(), prop); },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_, prop: string) { return Reflect.get(getAdminAuth(), prop); },
});
