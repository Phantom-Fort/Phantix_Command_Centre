"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  User,
  Auth,
} from "firebase/auth";
import { doc, getDoc, Firestore } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { UserSession } from "@/lib/types";
import { registerProfile } from "@/lib/api-client";

let _authCache: Auth | null = null;
let _dbCache: Firestore | null = null;

function getAuthInstance(): Auth {
  if (!_authCache) {
    _authCache = getFirebaseAuth()!;
  }
  return _authCache;
}

function getDbInstance(): Firestore {
  if (!_dbCache) {
    _dbCache = getFirebaseDb()!;
  }
  return _dbCache;
}

let _googleProvider: GoogleAuthProvider | null = null;
function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.addScope("email");
    _googleProvider.addScope("profile");
  }
  return _googleProvider;
}

interface AuthContextType {
  firebaseUser: User | null;
  session: UserSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (payload: {
    name: string;
    username: string;
    email: string;
    role: string;
    adminKey: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const buildSession = useCallback(async (fbUser: User): Promise<UserSession> => {
    const db = getDbInstance();
    let snap = await getDoc(doc(db, "users", fbUser.uid));
    if (!snap.exists()) {
      await new Promise((r) => setTimeout(r, 1500));
      snap = await getDoc(doc(db, "users", fbUser.uid));
    }
    if (!snap.exists()) {
      throw new Error("Account setup incomplete — please try signing in again.");
    }
    const profile = snap.data();
    return {
      uid: fbUser.uid,
      email: fbUser.email || "",
      name: profile.name || fbUser.displayName || fbUser.email || "",
      username: profile.username || "",
      role: profile.role || "contributor",
    };
  }, []);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const sess = await buildSession(fbUser);
          setSession(sess);
        } catch (err: any) {
          console.error("[Auth] Failed to build session:", err.message);
          await signOut(auth);
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [buildSession]);

  const login = async (username: string, password: string) => {
    const auth = getAuthInstance();
    const res = await fetch("/api/auth/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim().toLowerCase() }),
    });
    if (res.status === 404) throw new Error("No account found with that username or email.");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login failed.");
    }
    const { email } = await res.json();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const auth = getAuthInstance();
    const db = getDbInstance();
    const result = await signInWithPopup(auth, getGoogleProvider());
    const user = result.user;
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    if (!profileSnap.exists()) {
      const rawName = user.displayName || user.email?.split("@")[0] || "";
      const autoUsername = rawName.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 20);
      try {
        await registerProfile({
          uid: user.uid,
          name: rawName,
          username: autoUsername,
          email: user.email || "",
          role: user.email === "posiayoola102@gmail.com" ? "admin" : "contributor",
          adminKey: "",
        });
      } catch (regErr: any) {
        if (regErr.message?.includes("Username already taken")) {
          const suffix = Math.random().toString(36).slice(2, 6);
          await registerProfile({
            uid: user.uid,
            name: rawName,
            username: autoUsername.slice(0, 16) + "_" + suffix,
            email: user.email || "",
            role: user.email === "posiayoola102@gmail.com" ? "admin" : "contributor",
            adminKey: "",
          });
        } else {
          throw regErr;
        }
      }
    }
  };

  const registerFunc = async (payload: {
    name: string;
    username: string;
    email: string;
    role: string;
    adminKey: string;
    password: string;
  }) => {
    const auth = getAuthInstance();
    const { name, username, email, role, adminKey, password } = payload;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    try {
      await registerProfile({ uid, email, name, username, role, adminKey });
    } catch (err) {
      try {
        const u = auth.currentUser;
        if (u?.uid === uid) await u.delete();
      } catch (_) {}
      throw err;
    }
  };

  const logout = async () => {
    const auth = getAuthInstance();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, session, loading, login, loginWithGoogle, register: registerFunc, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function friendlyFirebaseError(err: any): string {
  const code = err.code || "";
  const map: Record<string, string> = {
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect username or password.",
    "auth/user-not-found": "No account found.",
    "auth/too-many-requests": "Too many attempts — please try again later.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/network-request-failed": "Network error — check your connection.",
    "auth/email-already-in-use": "That email address is already registered.",
    "auth/invalid-email": "Invalid email address format.",
    "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
    "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups.",
    "auth/cancelled-popup-request": "",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  };
  return map[code] || err.message || "Authentication failed.";
}
