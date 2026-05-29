"use client";

import { useApp } from "@/hooks/useAppData";
import { addManifestEntry, deleteManifestEntry } from "@/lib/api-client";
import { useRef } from "react";

const MF_TYPES = ["feature", "procedure", "architecture", "security", "ai"] as const;
const MF_LABELS: Record<string, string> = {
  feature: "Application Features",
  procedure: "Implementation Procedures",
  architecture: "Architecture Decisions",
  security: "Security Requirements",
  ai: "AI / ML Guidelines",
};
const MF_COLORS: Record<string, string> = {
  feature: "var(--bright)",
  procedure: "var(--success)",
  architecture: "var(--cyan)",
  security: "var(--danger)",
  ai: "var(--purple)",
};

export default function Manifest() {
  const { manifest, isAdmin, dispatch, showLoader, hideLoader } = useApp();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);

  const submitEntry = async () => {
    if (!isAdmin) { alert("Only admins can add manifest entries."); return; }
    const title = titleRef.current?.value.trim() || "";
    const body = bodyRef.current?.value.trim() || "";
    if (!title || !body) { alert("Title and description are required."); return; }
    showLoader("Saving manifest entry…");
    try {
      const entry = await addManifestEntry({
        title, body,
        type: typeRef.current?.value || "feature",
        source: sourceRef.current?.value.trim() || "",
        priority: priorityRef.current?.value || "Phase 2",
        category: "",
      });
      dispatch({ type: "ADD_MANIFEST", payload: entry });
      if (titleRef.current) titleRef.current.value = "";
      if (bodyRef.current) bodyRef.current.value = "";
      if (sourceRef.current) sourceRef.current.value = "";
    } catch (err: any) {
      alert("Failed to save manifest entry: " + err.message);
    }
    hideLoader();
  };

  const delEntry = async (id: string) => {
    if (!confirm("Delete this manifest entry permanently?")) return;
    showLoader("Deleting…");
    try {
      await deleteManifestEntry(id);
      dispatch({ type: "DELETE_MANIFEST", payload: id });
    } catch (err: any) {
      alert("Failed to delete manifest entry: " + err.message);
    }
    hideLoader();
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Implementation Manifest</div>
          <div className="section-line"></div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Admin-curated features, procedures & architecture decisions derived from deliberated insights
          </div>
        </div>
        <span className="chip cpur" style={{ fontSize: 11 }}>🔐 Admin Only</span>
      </div>

      {isAdmin && (
        <div className="mb20">
          <div className="card">
            <div className="card-label" style={{ marginBottom: 12 }}>Add Manifest Entry Directly</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 11, marginBottom: 9 }}>
              <input className="ifield" ref={titleRef} placeholder="Feature, procedure, or decision title" />
              <select className="ifield" ref={typeRef} style={{ width: 190 }}>
                <option value="feature">Application Feature</option>
                <option value="procedure">Implementation Procedure</option>
                <option value="architecture">Architecture Decision</option>
                <option value="security">Security Requirement</option>
                <option value="ai">AI/ML Guideline</option>
              </select>
            </div>
            <textarea className="ifield" ref={bodyRef} style={{ minHeight: 80, marginBottom: 9 }} placeholder="Describe in detail."></textarea>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 9 }}>
              <input className="ifield" ref={sourceRef} placeholder="Source book / insight (optional)" />
              <select className="ifield" ref={priorityRef}>
                <option value="MVP">MVP Priority</option><option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option><option value="Future">Future</option>
              </select>
              <button className="btn btn-pu" onClick={submitEntry}>Add Entry</button>
            </div>
          </div>
        </div>
      )}

      {manifest.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>📜</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "var(--silver)", marginBottom: 6 }}>Manifest is empty</div>
          <div style={{ fontSize: 13 }}>Deliberate on Book Insights and approve them, or add entries directly above.</div>
        </div>
      ) : (
        MF_TYPES.map((type) => {
          const items = manifest.filter((m) => m.type === type);
          if (!items.length) return null;
          return (
            <div key={type} className="mf-section">
              <div className="mf-section-title" style={{ borderLeft: `3px solid ${MF_COLORS[type]}` }}>
                {MF_LABELS[type]}
                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 400 }}>({items.length})</span>
              </div>
              {items.map((m) => (
                <div key={m.id} className="mf-item">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 5 }}>
                    <div className="mf-item-title" style={{ flex: 1 }}>{m.title}</div>
                    <span className="chip cp" style={{ fontSize: 9, whiteSpace: "nowrap" }}>{m.priority || "Phase 2"}</span>
                    {isAdmin && <button className="btn btn-dd btn-sm" onClick={() => delEntry(m.id)} style={{ padding: "2px 7px", fontSize: 10 }}>×</button>}
                  </div>
                  <div className="mf-item-body" dangerouslySetInnerHTML={{ __html: (m.body || "").replace(/\n/g, "<br>") }}></div>
                  {m.source && <div className="mf-src">📖 {m.source}</div>}
                  <div className="mf-item-meta">Added by {m.addedBy || "—"} · {m.date || ""}{m.category ? " · " + m.category : ""}</div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
