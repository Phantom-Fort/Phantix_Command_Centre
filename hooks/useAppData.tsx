"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { UserSession, LogEntry, RiskEntry, MilestoneEntry, InsightEntry, ManifestEntry, NavPage } from "@/lib/types";
import * as api from "@/lib/api-client";

interface AppState {
  session: UserSession | null;
  currentPage: NavPage;
  loading: boolean;
  loaderMsg: string;
  logs: LogEntry[];
  risks: RiskEntry[];
  milestones: MilestoneEntry[];
  insights: InsightEntry[];
  manifest: ManifestEntry[];
  booksRead: Record<string, boolean>;
  archTasks: Record<string, boolean>;
}

type AppAction =
  | { type: "SET_SESSION"; payload: UserSession | null }
  | { type: "SET_PAGE"; payload: NavPage }
  | { type: "SET_LOADING"; payload: { loading: boolean; msg?: string } }
  | { type: "SET_LOGS"; payload: LogEntry[] }
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "DELETE_LOG"; payload: string }
  | { type: "SET_RISKS"; payload: RiskEntry[] }
  | { type: "ADD_RISK"; payload: RiskEntry }
  | { type: "DELETE_RISK"; payload: string }
  | { type: "SET_MILESTONES"; payload: MilestoneEntry[] }
  | { type: "ADD_MILESTONE"; payload: MilestoneEntry }
  | { type: "TOGGLE_MILESTONE"; payload: { id: string; status: string } }
  | { type: "DELETE_MILESTONE"; payload: string }
  | { type: "SET_INSIGHTS"; payload: InsightEntry[] }
  | { type: "ADD_INSIGHT"; payload: InsightEntry }
  | { type: "UPDATE_INSIGHT"; payload: { id: string; updates: Partial<InsightEntry> } }
  | { type: "DELETE_INSIGHT"; payload: string }
  | { type: "SET_MANIFEST"; payload: ManifestEntry[] }
  | { type: "ADD_MANIFEST"; payload: ManifestEntry }
  | { type: "DELETE_MANIFEST"; payload: string }
  | { type: "SET_BOOKS_READ"; payload: Record<string, boolean> }
  | { type: "TOGGLE_BOOK_READ"; payload: string }
  | { type: "SET_ARCH_TASKS"; payload: Record<string, boolean> }
  | { type: "TOGGLE_ARCH_TASK"; payload: string };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SESSION": return { ...state, session: action.payload };
    case "SET_PAGE": return { ...state, currentPage: action.payload };
    case "SET_LOADING": return { ...state, loading: action.payload.loading, loaderMsg: action.payload.msg || "Loading…" };
    case "SET_LOGS": return { ...state, logs: action.payload };
    case "ADD_LOG": return { ...state, logs: [action.payload, ...state.logs] };
    case "DELETE_LOG": return { ...state, logs: state.logs.filter((l) => l.id !== action.payload) };
    case "SET_RISKS": return { ...state, risks: action.payload };
    case "ADD_RISK": return { ...state, risks: [...state.risks, action.payload] };
    case "DELETE_RISK": return { ...state, risks: state.risks.filter((r) => r.id !== action.payload) };
    case "SET_MILESTONES": return { ...state, milestones: action.payload };
    case "ADD_MILESTONE": return { ...state, milestones: [...state.milestones, action.payload].sort((a, b) => (a.date || "").localeCompare(b.date || "")) };
    case "TOGGLE_MILESTONE": return { ...state, milestones: state.milestones.map((m) => m.id === action.payload.id ? { ...m, status: action.payload.status as "done" | "pending" } : m) };
    case "DELETE_MILESTONE": return { ...state, milestones: state.milestones.filter((m) => m.id !== action.payload) };
    case "SET_INSIGHTS": return { ...state, insights: action.payload };
    case "ADD_INSIGHT": return { ...state, insights: [action.payload, ...state.insights] };
    case "UPDATE_INSIGHT": return { ...state, insights: state.insights.map((i) => i.id === action.payload.id ? { ...i, ...action.payload.updates } : i) };
    case "DELETE_INSIGHT": return { ...state, insights: state.insights.filter((i) => i.id !== action.payload) };
    case "SET_MANIFEST": return { ...state, manifest: action.payload };
    case "ADD_MANIFEST": return { ...state, manifest: [...state.manifest, action.payload] };
    case "DELETE_MANIFEST": return { ...state, manifest: state.manifest.filter((m) => m.id !== action.payload) };
    case "SET_BOOKS_READ": return { ...state, booksRead: action.payload };
    case "TOGGLE_BOOK_READ": return { ...state, booksRead: { ...state.booksRead, [action.payload]: !state.booksRead[action.payload] } };
    case "SET_ARCH_TASKS": return { ...state, archTasks: action.payload };
    case "TOGGLE_ARCH_TASK": return { ...state, archTasks: { ...state.archTasks, [action.payload]: !state.archTasks[action.payload] } };
    default: return state;
  }
}

const initialState: AppState = {
  session: null,
  currentPage: "overview",
  loading: false,
  loaderMsg: "Loading…",
  logs: [],
  risks: [],
  milestones: [],
  insights: [],
  manifest: [],
  booksRead: {},
  archTasks: {},
};

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  navigate: (page: NavPage) => void;
  showLoader: (msg?: string) => void;
  hideLoader: () => void;
  bootApp: (session: UserSession) => Promise<void>;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate = useCallback((page: NavPage) => {
    if (page === "manifest" && state.session?.role !== "admin") {
      alert("The Implementation Manifest is restricted to Admin users.");
      return;
    }
    dispatch({ type: "SET_PAGE", payload: page });
  }, [state.session?.role]);

  const showLoader = useCallback((msg = "Loading…") => {
    dispatch({ type: "SET_LOADING", payload: { loading: true, msg } });
  }, []);

  const hideLoader = useCallback(() => {
    dispatch({ type: "SET_LOADING", payload: { loading: false } });
  }, []);

  const bootApp = useCallback(async (session: UserSession) => {
    dispatch({ type: "SET_SESSION", payload: session });
    showLoader("Loading your workspace…");

    try {
      const isAdmin = session.role === "admin";
      const [logsRes, milestonesRes, risksRes, stateRes, insightsRes, manifestRes] = await Promise.all([
        api.getLogs(),
        api.getMilestones(),
        api.getRisks(),
        api.getState(),
        api.getInsights(),
        isAdmin ? api.getManifest() : Promise.resolve({ manifest: [] }),
      ]);

      dispatch({ type: "SET_LOGS", payload: logsRes.logs || [] });
      dispatch({ type: "SET_MILESTONES", payload: milestonesRes.milestones || [] });
      dispatch({ type: "SET_RISKS", payload: risksRes.risks || [] });
      dispatch({ type: "SET_BOOKS_READ", payload: stateRes.state?.booksRead || {} });
      dispatch({ type: "SET_ARCH_TASKS", payload: stateRes.state?.archTasks || {} });
      dispatch({ type: "SET_INSIGHTS", payload: insightsRes.insights || [] });
      if (isAdmin) dispatch({ type: "SET_MANIFEST", payload: manifestRes.manifest || [] });

      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err: any) {
      console.error("[App] Boot data load failed:", err.message);
    }

    hideLoader();
  }, [showLoader, hideLoader]);

  const value: AppContextType = {
    ...state,
    dispatch,
    navigate,
    showLoader,
    hideLoader,
    bootApp,
    isAdmin: state.session?.role === "admin",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { AppContext };
