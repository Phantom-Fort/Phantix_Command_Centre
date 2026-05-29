"use client";

const DOCUMENTS = [
  { doc: "Executive Summary", tier: "Tier 1 — External", purpose: "Investor/partner cold outreach", status: "Complete", audience: "Investors" },
  { doc: "Investor Pitch Document", tier: "Tier 1 — External", purpose: "Full 8-section pitch narrative", status: "Complete", audience: "VCs, Investors" },
  { doc: "Partnership & Grant Proposal", tier: "Tier 1 — External", purpose: "Accelerators, cloud credits", status: "Pending", audience: "Accelerators" },
  { doc: "Company One-Pager", tier: "Tier 1 — External", purpose: "Conference cold outreach", status: "Pending", audience: "General" },
  { doc: "Product Strategy & Roadmap", tier: "Tier 2 — Strategy", purpose: "3-phase roadmap & metrics", status: "Complete", audience: "Team, Investors" },
  { doc: "Business Model Document", tier: "Tier 2 — Strategy", purpose: "Pricing, unit economics", status: "Complete", audience: "Investors, Team" },
  { doc: "Competitor Analysis", tier: "Tier 2 — Strategy", purpose: "CrowdStrike, Wazuh, Tenable…", status: "Pending", audience: "Team" },
  { doc: "Go-to-Market Strategy", tier: "Tier 2 — Strategy", purpose: "Channel, launch, acquisition", status: "Pending", audience: "Team, Partners" },
  { doc: "System Architecture Manifest", tier: "Tier 3 — Technical", purpose: "Service architecture, data model", status: "Pending", audience: "Engineering" },
  { doc: "Threat Model Document", tier: "Tier 3 — Technical", purpose: "Attacker personas, attack vectors", status: "Pending", audience: "Engineering" },
  { doc: "AI Governance Manifest", tier: "Tier 3 — Technical", purpose: "AI safety rules, boundaries", status: "Pending", audience: "Engineering" },
  { doc: "Security Philosophy Document", tier: "Tier 3 — Technical", purpose: "Zero Trust, design rules", status: "Pending", audience: "All" },
  { doc: "Developer Contributor Guide", tier: "Tier 4 — Ops", purpose: "Stack, contribution, AI standards", status: "Complete", audience: "Contributors" },
  { doc: "MVP Definition Document", tier: "Tier 4 — Ops", purpose: "MVP scope & acceptance criteria", status: "Pending", audience: "Engineering" },
  { doc: "Research Findings Summary", tier: "Tier 4 — Ops", purpose: "Synthesized research findings", status: "Pending", audience: "Team" },
  { doc: "Service Maps & Diagrams", tier: "Tier 4 — Ops", purpose: "Visual architecture diagrams", status: "Pending", audience: "Engineering" },
];

export default function Documents() {
  const complete = DOCUMENTS.filter((d) => d.status === "Complete").length;
  const pending = DOCUMENTS.filter((d) => d.status === "Pending").length;

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Document Registry</div>
          <div className="section-line"></div>
        </div>
      </div>
      <div className="kpi3 mb20">
        <div className="card">
          <div className="card-label">Completed</div>
          <div className="card-value green">{complete}</div>
        </div>
        <div className="card">
          <div className="card-label">In Progress</div>
          <div className="card-value cyan">0</div>
        </div>
        <div className="card">
          <div className="card-label">Pending</div>
          <div className="card-value warn">{pending}</div>
        </div>
      </div>
      <div className="card">
        <table className="dtable">
          <thead>
            <tr><th>Document</th><th>Tier</th><th>Purpose</th><th>Status</th><th>Audience</th></tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((d, i) => (
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
