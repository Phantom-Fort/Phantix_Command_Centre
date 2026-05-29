"use client";

import { useApp } from "@/hooks/useAppData";
import { useRef } from "react";
import { addLog, deleteLog } from "@/lib/api-client";
import LogList from "./LogList";

export default function ActivityLog() {
  const { logs, isAdmin, dispatch, showLoader, hideLoader } = useApp();
  const typeRef = useRef<HTMLSelectElement>(null);
  const textRef = useRef<HTMLInputElement>(null);

  const submitLog = async () => {
    const text = textRef.current?.value.trim();
    if (!text) return;
    const type = typeRef.current?.value || "update";
    showLoader("Saving…");
    try {
      const entry = await addLog(type, text);
      dispatch({ type: "ADD_LOG", payload: entry });
      if (textRef.current) textRef.current.value = "";
    } catch (err: any) {
      alert("Failed to save log entry: " + err.message);
    }
    hideLoader();
  };

  const delLog = async (id: string) => {
    try {
      await deleteLog(id);
      dispatch({ type: "DELETE_LOG", payload: id });
    } catch (err: any) {
      alert("Failed to delete log entry: " + err.message);
    }
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Activity Log</div>
          <div className="section-line"></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>{logs.length} entries</div>
      </div>
      <div className="card mb20">
        <div className="card-label" style={{ marginBottom: 11 }}>New Entry</div>
        <div style={{ display: "flex", gap: 9, marginBottom: 9 }}>
          <select className="ifield" ref={typeRef} style={{ flex: "0 0 140px" }}>
            <option value="update">Update</option><option value="doc">Document</option>
            <option value="research">Research</option><option value="milestone">Milestone</option><option value="blocker">Blocker</option>
          </select>
          <input className="ifield" ref={textRef} placeholder="What happened, was completed, or is blocked..." />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}><button className="btn btn-pr" onClick={submitLog}>Log Entry</button></div>
      </div>
      <LogList />
    </div>
  );
}
