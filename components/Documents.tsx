"use client";

import { useEffect, useState } from "react";
import { getState } from "@/lib/api-client";
import { DOC_DELIVERABLE_NAMES } from "./Phases";

const DOCUMENTS = [
  { doc: "Executive Summary", tier: "Tier 1 — External", purpose: "Investor/partner cold outreach", audience: "Investors" },
  { doc: "Investor Pitch Document", tier: "Tier 1 — External", purpose: "Full 8-section pitch narrative", audience: "VCs, Investors" },
  { doc: "Partnership & Grant Proposal", tier: "Tier 1 — External", purpose: "Accelerators, cloud credits", audience: "Accelerators" },
  { doc: "Company One-Pager", tier: "Tier 1 — External", purpose: "Conference cold outreach", audience: "General" },
  { doc: "Product Strategy & Roadmap", tier: "Tier 2 — Strategy", purpose: "3-phase roadmap & metrics", audience: "Team, Investors" },
  { doc: "Business Model Document", tier: "Tier 2 — Strategy", purpose: "Pricing, unit economics", audience: "Investors, Team" },
  { doc: "Competitor Analysis", tier: "Tier 2 — Strategy", purpose: "CrowdStrike, Wazuh, Tenable…", audience: "Team" },
  { doc: "Go-to-Market Strategy", tier: "Tier 2 — Strategy", purpose: "Channel, launch, acquisition", audience: "Team, Partners" },
  { doc: "System Architecture Manifest", tier: "Tier 3 — Technical", purpose: "Service architecture, data model", audience: "Engineering" },
  { doc: "Threat Model Document", tier: "Tier 3 — Technical", purpose: "Attacker personas, attack vectors", audience: "Engineering" },
  { doc: "AI Governance Manifest", tier: "Tier 3 — Technical", purpose: "AI safety rules, boundaries", audience: "Engineering" },
  { doc: "Security Philosophy Document", tier: "Tier 3 — Technical", purpose: "Zero Trust, design rules", audience: "All" },
  { doc: "Developer Contributor Guide", tier: "Tier 4 — Ops", purpose: "Stack, contribution, AI standards", audience: "Contributors" },
  { doc: "MVP Definition Document", tier: "Tier 4 — Ops", purpose: "MVP scope & acceptance criteria", audience: "Engineering" },
  { doc: "Research Findings Summary", tier: "Tier 4 — Ops", purpose: "Synthesized research findings", audience: "Team" },
  { doc: "Service Maps & Diagrams", tier: "Tier 4 — Ops", purpose: "Visual architecture diagrams", audience: "Engineering" },
];

const DEFAULT_STATUS: Record<string, "Complete" | "Pending"> = {
  "Executive Summary": "Complete",
  "Investor Pitch Document": "Complete",
  "Product Strategy & Roadmap": "Complete",
  "Business Model Document": "Complete",
  "Developer Contributor Guide": "Complete",
};

export default function Documents() {
  const [statusMap, setStatusMap] = useState<Record<string, "Complete" | "Pending">>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getState();
        const fromDb = res.state?.documentsStatus as Record<string, "Complete" | "Pending"> | undefined;
        if (!cancelled && fromDb && typeof fromDb === "object") {
          setStatusMap({ ...DEFAULT_STATUS, ...fromDb });
        }
      } catch {
        /* defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = DOCUMENTS.map((d) => ({
    ...d,
    status: statusMap[d.doc] || (DOC_DELIVERABLE_NAMES.has(d.doc) ? "Pending" : DEFAULT_STATUS[d.doc] || "Pending"),
  }));

  const complete = rows.filter((d) => d.status === "Complete").length;
  const pending = rows.filter((d) => d.status === "Pending").length;

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Document Registry</div>
          <div className="section-line"></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>
          Status updates from Phases &amp; Delivery only
        </div>
      </div>
      <div className="kpi3 mb20">
        <div className="card">
          <div className="card-label">Completed</div>
          <div className="card-value green">{loading ? "—" : complete}</div>
        </div>
        <div className="card">
          <div className="card-label">In Progress</div>
          <div className="card-value cyan">0</div>
        </div>
        <div className="card">
          <div className="card-label">Pending</div>
          <div className="card-value warn">{loading ? "—" : pending}</div>
        </div>
      </div>
      <div className="card">
        <table className="dtable">
          <thead>
            <tr><th>Document</th><th>Tier</th><th>Purpose</th><th>Status</th><th>Audience</th></tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={i}>
                <td><strong style={{ color: "var(--white)" }}>{d.doc}</strong></td>
                <td style={{ color: "var(--muted)", fontSize: 11 }}>{d.tier}</td>
                <td style={{ color: "var(--muted)" }}>{d.purpose}</td>
                <td>
                  <span className={`chip ${d.status === "Complete" ? "cd" : "cn"}`}>
                    <span className="chip-dot"></span>{d.status}
                  </span>
                </td>
                <td style={{ color: "var(--muted)" }}>{d.audience}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
