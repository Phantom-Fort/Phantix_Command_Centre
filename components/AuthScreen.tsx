"use client";

import { useState, useRef } from "react";
import { useAuth, friendlyFirebaseError } from "./AuthProvider";
import { useApp } from "@/hooks/useAppData";

export default function AuthScreen() {
  const { login, loginWithGoogle, register, logout } = useAuth();
  const { bootApp, showLoader, hideLoader } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginUserRef = useRef<HTMLInputElement>(null);
  const loginPassRef = useRef<HTMLInputElement>(null);
  const regNameRef = useRef<HTMLInputElement>(null);
  const regUserRef = useRef<HTMLInputElement>(null);
  const regEmailRef = useRef<HTMLInputElement>(null);
  const regPassRef = useRef<HTMLInputElement>(null);
  const regPass2Ref = useRef<HTMLInputElement>(null);
  const [regRole, setRegRole] = useState("contributor");
  const [regAdminKey, setRegAdminKey] = useState("");

  const clearErrors = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async () => {
    clearErrors();
    const input = loginUserRef.current?.value.trim() || "";
    const password = loginPassRef.current?.value || "";
    if (!input || !password) {
      setError("Please enter your username/email and password.");
      return;
    }
    showLoader("Signing in…");
    try {
      await login(input, password);
    } catch (err: any) {
      hideLoader();
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.message?.includes("INVALID_LOGIN_CREDENTIALS")) {
        setError('Incorrect password or this account was created with Google. Please use the "Continue with Google" button.');
      } else if (err.code === "auth/user-not-found") {
        setError("Account not found.");
      } else {
        setError(friendlyFirebaseError(err));
      }
    }
  };

  const handleGoogleSignIn = async () => {
    clearErrors();
    setGoogleLoading(true);
    showLoader("Signing in with Google…");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      hideLoader();
      setGoogleLoading(false);
      const msg = friendlyFirebaseError(err);
      if (msg) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    clearErrors();
    const name = regNameRef.current?.value.trim() || "";
    const username = regUserRef.current?.value.trim().toLowerCase();
    const email = regEmailRef.current?.value.trim().toLowerCase();
    const password = regPassRef.current?.value || "";
    const pass2 = regPass2Ref.current?.value || "";

    if (!name || !username || !email || !password) { setError("All fields are required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== pass2) { setError("Passwords do not match."); return; }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) { setError("Username: 3–20 chars, letters/numbers/underscores only."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }

    showLoader("Creating your account…");
    try {
      await register({ name, username, email, role: regRole, adminKey: regAdminKey, password });
      setTab("login");
      setSuccess("Account created successfully! You can now sign in with your username or email.");
      if (regNameRef.current) regNameRef.current.value = "";
      if (regUserRef.current) regUserRef.current.value = "";
      if (regEmailRef.current) regEmailRef.current.value = "";
      if (regPassRef.current) regPassRef.current.value = "";
      if (regPass2Ref.current) regPass2Ref.current.value = "";
      setRegAdminKey("");
      setTimeout(() => setSuccess(""), 6000);
    } catch (err: any) {
      let msg = friendlyFirebaseError(err);
      if (err.message?.includes("Username already taken")) msg = "That username is already taken.";
      if (err.message?.includes("Invalid admin key")) msg = "Invalid admin key.";
      setError(msg);
    }
    hideLoader();
  };

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">
          <img src="/logo.png" alt="Phantix Logo" className="auth-logo-img" />
          <div>
            <div className="auth-brand">PHANTIX</div>
            <div className="auth-brand-sub">Security Solutions</div>
          </div>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); clearErrors(); }}>
            Sign In
          </div>
          <div className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); clearErrors(); }}>
            Create Account
          </div>
        </div>

        {tab === "login" && (
          <div>
            <button className={`auth-btn-google ${googleLoading ? "loading" : ""}`} onClick={handleGoogleSignIn} type="button">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span className="auth-divider-line"></span>
              <span className="auth-divider-text">or sign in with username</span>
              <span className="auth-divider-line"></span>
            </div>

            <div className="auth-label">Username</div>
            <input className="auth-input" ref={loginUserRef} placeholder="Username or Email" autoComplete="username" />
            <div className="auth-label">Password</div>
            <input className="auth-input" ref={loginPassRef} type="password" placeholder="Password" autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            {error && <div className="auth-err text-red-400 text-xs min-h-[18px] mb-2" dangerouslySetInnerHTML={{ __html: error }}></div>}
            {success && <div className="auth-err text-green-400 text-xs min-h-[18px] mb-2">{success}</div>}
            {!error && !success && <div className="auth-err min-h-[18px] mb-2"></div>}
            <button className="auth-btn" onClick={handleLogin}>Sign In →</button>
          </div>
        )}

        {tab === "register" && (
          <div>
            <div className="auth-label">Full Name</div>
            <input className="auth-input" ref={regNameRef} placeholder="Your full name" />
            <div className="auth-label">Username</div>
            <input className="auth-input" ref={regUserRef} placeholder="Choose a username" />
            <div className="auth-label">Email Address</div>
            <input className="auth-input" ref={regEmailRef} placeholder="your@email.com" type="email" />
            <div className="auth-label">Role</div>
            <select className="auth-input" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
              <option value="contributor">Contributor</option>
              <option value="admin">Admin (requires key)</option>
            </select>
            {regRole === "admin" && (
              <div>
                <div className="auth-label">Admin Registration Key</div>
                <input className="auth-input" value={regAdminKey} onChange={(e) => setRegAdminKey(e.target.value)} placeholder="Admin key" />
              </div>
            )}
            <div className="auth-label">Password</div>
            <input className="auth-input" ref={regPassRef} type="password" placeholder="Password (min 8 chars)" />
            <div className="auth-label">Confirm Password</div>
            <input className="auth-input" ref={regPass2Ref} type="password" placeholder="Confirm password"
              onKeyDown={(e) => e.key === "Enter" && handleRegister()} />
            {error && <div className="auth-err text-red-400 text-xs min-h-[18px] mb-2">{error}</div>}
            {!error && <div className="auth-err min-h-[18px] mb-2"></div>}
            <button className="auth-btn" onClick={handleRegister}>Create Account →</button>

            <div className="auth-divider" style={{ marginTop: 16 }}>
              <span className="auth-divider-line"></span>
              <span className="auth-divider-text">or</span>
              <span className="auth-divider-line"></span>
            </div>
            <button className={`auth-btn-google ${googleLoading ? "loading" : ""}`} onClick={handleGoogleSignIn} type="button" style={{ marginTop: 10 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        <div className="auth-note">Phantix Command Centre · v0.2 · Pre-Development Phase</div>
      </div>
    </div>
  );
}
