"use client";

import { useApp } from "@/hooks/useAppData";
import { useState, useCallback, useEffect } from "react";
import { setState, getState, addLog } from "@/lib/api-client";

export const PHASES = [
  {
    id: "p0",
    label: "PRE-DEV",
    title: "Architecture & Research",
    status: "ACTIVE",
    statusClass: "cp",
    deliverables: [
      "Pre-Development Manifest", "Executive Summary", "Investor Pitch Document",
      "Product Strategy & Roadmap", "Business Model Document", "Developer Contributor Guide",
      "Security Philosophy Document", "Threat Model Document", "System Architecture Manifest",
      "AI Governance Manifest", "Competitor Analysis", "Go-to-Market Strategy",
      "Partnership & Grant Proposal", "MVP Definition Document", "Research Findings Summary",
      "Service Maps & Diagrams",
    ],
    color: "rgba(37,99,235,0.2)",
    borderColor: "rgba(37,99,235,0.4)",
  },
  {
    id: "p1",
    label: "PHASE 1",
    title: "MVP Build (Sep–Dec 2026)",
    status: "UPCOMING",
    statusClass: "cn",
    deliverables: [
      "Project scaffold & CI/CD pipeline", "Asset discovery module", "Vulnerability scanning engine",
      "OpenVAS integration", "AI analysis engine (LLM)", "Risk prioritization algorithm",
      "Plain-language report generation", "Security posture scoring", "React dashboard (MVP UI)",
      "Auth system (RBAC + MFA)", "NDPA + NIST compliance mapper", "Email alert notifications",
      "Pilot onboarding (10 SMEs)", "MVP security audit",
    ],
    color: "rgba(37,99,235,0.15)",
    borderColor: "rgba(37,99,235,0.3)",
  },
  {
    id: "p2",
    label: "PHASE 2",
    title: "Growth Platform (2027)",
    status: "UPCOMING",
    statusClass: "cn",
    deliverables: [
      "Endpoint telemetry agent (Windows)", "Endpoint agent (Linux/macOS)", "Log ingestion pipeline",
      "SIEM-lite dashboard", "AI alert triage & deduplication", "Phishing simulation module",
      "ISO 27001 + OWASP compliance engine", "Threat intel feed integration", "Remediation workflow engine",
      "REST API (beta)", "500 customer scale target", "MSSP pilot onboarding",
    ],
    color: "rgba(14,165,233,0.15)",
    borderColor: "rgba(14,165,233,0.3)",
  },
  {
    id: "p3",
    label: "PHASE 3",
    title: "Full AI SOC (2028)",
    status: "UPCOMING",
    statusClass: "cn",
    deliverables: [
      "AI SOC assistant (autonomous triage)", "Incident response playbook engine", "Autonomous remediation",
      "Security awareness training", "Multi-tenant MSSP console", "White-label infrastructure",
      "Offensive security module", "Plugin marketplace", "Advanced threat hunting",
      "Full compliance certification", "2,000+ customer target", "Series A readiness",
    ],
    color: "rgba(16,185,129,0.15)",
    borderColor: "rgba(16,185,129,0.3)",
  },
];

/** Document titles that appear as PRE-DEV deliverables (exact name match) */
export const DOC_DELIVERABLE_NAMES = new Set([
  "Executive Summary",
  "Investor Pitch Document",
  "Partnership & Grant Proposal",
  "Product Strategy & Roadmap",
  "Business Model Document",
  "Competitor Analysis",
  "Go-to-Market Strategy",
  "System Architecture Manifest",
  "Threat Model Document",
  "AI Governance Manifest",
  "Security Philosophy Document",
  "Developer Contributor Guide",
  "MVP Definition Document",
  "Research Findings Summary",
  "Service Maps & Diagrams",
]);

const DEFAULT_CHECKED: Record<string, number[]> = {
  p0: [0, 1, 2, 3, 4, 5],
  p1: [],
  p2: [],
  p3: [],
};

function toSets(plain: Record<string, number[]>): Record<string, Set<number>> {
  const out: Record<string, Set<number>> = {};
  for (const p of PHASES) {
    out[p.id] = new Set(plain[p.id] || DEFAULT_CHECKED[p.id] || []);
  }
  return out;
}

function toPlain(sets: Record<string, Set<number>>): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const [k, s] of Object.entries(sets)) out[k] = Array.from(s);
  return out;
}

function docsFromPhases(sets: Record<string, Set<number>>): Record<string, "Complete" | "Pending"> {
  const status: Record<string, "Complete" | "Pending"> = {};
  for (const phase of PHASES) {
    const checked = sets[phase.id] || new Set();
    phase.deliverables.forEach((name, i) => {
      if (DOC_DELIVERABLE_NAMES.has(name)) {
        status[name] = checked.has(i) ? "Complete" : "Pending";
      }
    });
  }
  return status;
}

export default function Phases() {
  const { dispatch } = useApp();
  const [checkedSets, setCheckedSets] = useState<Record<string, Set<number>>>(() => toSets(DEFAULT_CHECKED));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getState();
        const plain = res.state?.phasesChecked as Record<string, number[]> | undefined;
        if (!cancelled && plain) setCheckedSets(toSets(plain));
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleDel = useCallback(async (phaseId: string, index: number) => {
    const phase = PHASES.find((p) => p.id === phaseId);
    if (!phase) return;
    const label = phase.deliverables[index];

    const prevSet = checkedSets[phaseId] || new Set<number>();
    const becameChecked = !prevSet.has(index);
    const newSet = new Set(prevSet);
    if (becameChecked) newSet.add(index);
    else newSet.delete(index);

    const nextSets = { ...checkedSets, [phaseId]: newSet };
    setCheckedSets(nextSets);

    const plain = toPlain(nextSets);
    const documentsStatus = docsFromPhases(nextSets);

    try {
      await setState("phasesChecked", plain);
      await setState("documentsStatus", documentsStatus);
      const entry = await addLog(
        "doc",
        becameChecked
          ? `Marked complete (Phases): ${label}`
          : `Marked pending (Phases): ${label}`
      );
      dispatch({ type: "ADD_LOG", payload: entry });
    } catch (err: any) {
      console.error("[Phases] persist failed:", err.message);
      setCheckedSets(checkedSets);
    }
  }, [checkedSets, dispatch]);

  if (!ready) {
    return (
      <div className="page active">
        <div className="section-header">
          <div>
            <div className="section-title">Phases & Deliverables</div>
            <div className="section-line"></div>
          </div>
        </div>
        <div style={{ padding: 24, color: "var(--muted)", fontSize: 12 }}>Loading phase progress…</div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Phases & Deliverables</div>
          <div className="section-line"></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          Click to mark complete · syncs to Documents
        </div>
      </div>
      <div className="grid2" style={{ gap: 16 }}>
        {PHASES.map((phase) => {
          const checked = checkedSets[phase.id] || new Set();
          const done = checked.size;
          const total = phase.deliverables.length;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div className="card" key={phase.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                <span style={{ background: phase.color, color: "var(--bright)", border: `1px solid ${phase.borderColor}`, borderRadius: 5, padding: "2px 9px", fontFamily: "var(--fm)", fontSize: 10, fontWeight: 600 }}>
                  {phase.label}
                </span>
                <span style={{ fontFamily: "var(--fd)", fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{phase.title}</span>
                <span className={`chip ${phase.statusClass}`} style={{ marginLeft: "auto", fontSize: 9 }}>
                  <span className="chip-dot"></span>{phase.status}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <div className="bar-track" style={{ flex: 1 }}><div className="bar-fill" style={{ width: pct + "%" }}></div></div>
                <span style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--cyan)" }}>{pct}%</span>
              </div>
              {phase.deliverables.map((d, i) => {
                const isChecked = checked.has(i);
                return (
                  <div key={i} className={`del-item ${isChecked ? "chk" : ""}`} onClick={() => toggleDel(phase.id, i)}>
                    <div className="dck"></div>{d}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
