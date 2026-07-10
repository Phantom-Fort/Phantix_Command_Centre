"use client";

import { useApp } from "@/hooks/useAppData";
import { useRef } from "react";
import { addMilestone, toggleMilestone, deleteMilestone, addLog } from "@/lib/api-client";

export default function Milestones() {
  const { milestones, isAdmin, dispatch, showLoader, hideLoader } = useApp();
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  const done = milestones.filter((m) => m.status === "done").length;
  const total = milestones.length;

  const submitMilestone = async () => {
    const title = titleRef.current?.value.trim();
    if (!title) return;
    showLoader("Saving milestone…");
    try {
      const m = await addMilestone({
        title,
        date: dateRef.current?.value || "2027-01",
        desc: descRef.current?.value.trim() || "",
      });
      dispatch({ type: "ADD_MILESTONE", payload: m });
      const entry = await addLog("milestone", `Added milestone: ${title}`);
      dispatch({ type: "ADD_LOG", payload: entry });
      if (titleRef.current) titleRef.current.value = "";
      if (dateRef.current) dateRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
    } catch (err: any) {
      alert("Failed to save milestone: " + err.message);
    }
    hideLoader();
  };

  const toggleMilestoneStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    const m = milestones.find((x) => x.id === id);
    try {
      await toggleMilestone(id, newStatus);
      dispatch({ type: "TOGGLE_MILESTONE", payload: { id, status: newStatus } });
      const entry = await addLog(
        "milestone",
        `${newStatus === "done" ? "Completed" : "Reopened"} milestone: ${m?.title || id}`
      );
      dispatch({ type: "ADD_LOG", payload: entry });
    } catch (err: any) {
      alert("Failed to update milestone: " + err.message);
    }
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Key Milestones</div>
          <div className="section-line"></div>
        </div>
      </div>
      <div className="grid2" style={{ gap: 18 }}>
        <div className="card">
          <div className="card-label" style={{ marginBottom: 14 }}>Delivery Timeline</div>
          <div style={{ paddingLeft: 18, borderLeft: "1px solid var(--border)" }}>
            {milestones.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 12, padding: 8 }}>No milestones yet</div>
            ) : (
              milestones.map((m) => (
                <div key={m.id} style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
                  <div
                    onClick={() => toggleMilestoneStatus(m.id, m.status)}
                    style={{
                      width: 11, height: 11, borderRadius: "50%", flexShrink: 0, marginTop: 4, cursor: "pointer",
                      position: "relative", left: -23,
                      border: `2px solid ${m.status === "done" ? "var(--success)" : "var(--muted)"}`,
                      background: m.status === "done" ? "var(--success)" : "var(--surface)",
                      boxShadow: m.status === "done" ? "0 0 7px rgba(16,185,129,0.6)" : "none",
                    }}
                  ></div>
                  <div style={{ marginLeft: -10 }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--fm)" }}>{m.date || ""}</div>
                    <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, color: m.status === "done" ? "var(--success)" : "var(--white)", marginTop: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{m.desc || ""}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="card mb20">
            <div className="card-label" style={{ marginBottom: 11 }}>Add Milestone</div>
            <input className="ifield" ref={titleRef} placeholder="Milestone title" style={{ marginBottom: 8 }} />
            <input className="ifield" ref={dateRef} type="month" style={{ marginBottom: 8 }} />
            <input className="ifield" ref={descRef} placeholder="Description" style={{ marginBottom: 9 }} />
            <button className="btn btn-pr" style={{ width: "100%" }} onClick={submitMilestone}>Add Milestone</button>
          </div>
          <div className="card">
            <div className="card-label">Summary</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "var(--muted)" }}>Total</span><span className="mono" style={{ color: "var(--white)" }}>{total}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "var(--muted)" }}>Done</span><span className="mono" style={{ color: "var(--success)" }}>{done}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ color: "var(--muted)" }}>Upcoming</span><span className="mono" style={{ color: "var(--bright)" }}>{total - done}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
