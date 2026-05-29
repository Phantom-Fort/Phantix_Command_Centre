"use client";

import { useState, useCallback } from "react";

const PHASES = [
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
    checked: [0, 1, 2, 3, 4, 5],
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
    checked: [],
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
    checked: [],
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
    checked: [],
    color: "rgba(16,185,129,0.15)",
    borderColor: "rgba(16,185,129,0.3)",
  },
];

export default function Phases() {
  const [checkedSets, setCheckedSets] = useState<Record<string, Set<number>>>({
    p0: new Set([0, 1, 2, 3, 4, 5]),
    p1: new Set(),
    p2: new Set(),
    p3: new Set(),
  });

  const toggleDel = useCallback((phaseId: string, index: number) => {
    setCheckedSets((prev) => {
      const newSet = new Set(prev[phaseId]);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return { ...prev, [phaseId]: newSet };
    });
  }, []);

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Phases & Deliverables</div>
          <div className="section-line"></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>Click to mark complete</div>
      </div>
      <div className="grid2" style={{ gap: 16 }}>
        {PHASES.map((phase) => {
          const checked = checkedSets[phase.id];
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
