"use client";

import { useApp } from "@/hooks/useAppData";
import { useRef } from "react";
import { addRisk, deleteRisk } from "@/lib/api-client";

export default function Risks() {
  const { risks, isAdmin, dispatch, showLoader, hideLoader } = useApp();
  const titleRef = useRef<HTMLInputElement>(null);
  const mitRef = useRef<HTMLInputElement>(null);
  const lvlRef = useRef<HTMLSelectElement>(null);
  const catRef = useRef<HTMLInputElement>(null);
  const ownRef = useRef<HTMLInputElement>(null);

  const submitRisk = async () => {
    const title = titleRef.current?.value.trim();
    if (!title) return;
    showLoader("Saving risk…");
    try {
      const newRisk = await addRisk({
        title,
        level: lvlRef.current?.value || "MEDIUM",
        category: catRef.current?.value || "General",
        mitigation: mitRef.current?.value || "—",
        owner: ownRef.current?.value || "—",
      });
      dispatch({ type: "ADD_RISK", payload: newRisk });
      if (titleRef.current) titleRef.current.value = "";
      if (mitRef.current) mitRef.current.value = "";
      if (catRef.current) catRef.current.value = "";
      if (ownRef.current) ownRef.current.value = "";
    } catch (err: any) {
      alert("Failed to save risk: " + err.message);
    }
    hideLoader();
  };

  const delRisk = async (id: string) => {
    try {
      await deleteRisk(id);
      dispatch({ type: "DELETE_RISK", payload: id });
    } catch (err: any) {
      alert("Failed to delete risk: " + err.message);
    }
  };

  const levelClass: Record<string, string> = { HIGH: "rh", MEDIUM: "rm", LOW: "rl" };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Risk Register</div>
          <div className="section-line"></div>
        </div>
      </div>
      <div className="card mb20">
        <div className="card-label" style={{ marginBottom: 11 }}>Add Risk</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 110px", gap: 9, marginBottom: 9 }}>
          <input className="ifield" ref={titleRef} placeholder="Risk description" />
          <input className="ifield" ref={mitRef} placeholder="Mitigation strategy" />
          <select className="ifield" ref={lvlRef}><option value="HIGH">HIGH</option><option value="MEDIUM" selected>MEDIUM</option><option value="LOW">LOW</option></select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 9 }}>
          <input className="ifield" ref={catRef} placeholder="Category" />
          <input className="ifield" ref={ownRef} placeholder="Owner" />
          <button className="btn btn-pr" onClick={submitRisk}>Add Risk</button>
        </div>
      </div>
      <div className="card">
        <table className="dtable">
          <thead><tr><th>#</th><th>Risk</th><th>Category</th><th>Level</th><th>Mitigation</th><th>Owner</th><th></th></tr></thead>
          <tbody>
            {risks.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 24, fontSize: 12 }}>No risks logged yet</td></tr>
            ) : (
              risks.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--muted)" }}>{i + 1}</td>
                  <td style={{ color: "var(--white)", fontSize: 12 }}>{r.title}</td>
                  <td style={{ color: "var(--muted)", fontSize: 11 }}>{r.category || "—"}</td>
                  <td><span className={`chip ${levelClass[r.level] || "rm"}`}>{r.level}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 11, maxWidth: 200 }}>{r.mitigation || "—"}</td>
                  <td style={{ color: "var(--silver)", fontSize: 11 }}>{r.owner || "—"}</td>
                  <td>
                    <span onClick={() => delRisk(r.id)}
                      style={{ cursor: "pointer", color: "var(--muted)", padding: "2px 6px", borderRadius: 3, fontSize: 15, transition: "all 0.15s" }}
                      onMouseEnter={(e) => (e.target as HTMLSpanElement).style.color = "var(--danger)"}
                      onMouseLeave={(e) => (e.target as HTMLSpanElement).style.color = "var(--muted)"}
                    >×</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
