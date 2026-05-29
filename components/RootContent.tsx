"use client";

import { useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { AppProvider, useApp } from "@/hooks/useAppData";
import AuthScreen from "@/components/AuthScreen";
import AppShell from "@/components/AppShell";

function AppContent() {
  const { firebaseUser, session, loading: authLoading } = useAuth();
  const { bootApp, session: appSession } = useApp();
  const booted = useRef(false);

  useEffect(() => {
    if (session && firebaseUser && !booted.current) {
      booted.current = true;
      bootApp(session);
    }
  }, [session, firebaseUser, bootApp]);

  if (authLoading) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0D1B3D", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 10000,
      }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(56,189,248,0.15)", borderTopColor: "#38BDF8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
      </div>
    );
  }

  if (!firebaseUser || !session) {
    return <AuthScreen />;
  }

  return <AppShell />;
}

export default function RootContent() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
