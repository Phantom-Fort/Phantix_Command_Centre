"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppData";
import { addMvpItem, updateMvpItem, deleteMvpItem } from "@/lib/api-client";

const STATUS_LABEL: Record<string, string> = {
  done: "✓ Done",
  in_progress: "⟳ In Progress",
  pending: "○ Pending",
};

const STATUS_CLASS: Record<string, string> = {
  done: "cd",
  in_progress: "cp",
  pending: "cn",
};

export default function Mvp() {
  const { mvpItems: items, isAdmin, dispatch, showLoader, hideLoader } = useApp();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("P1");
  const [category, setCategory] = useState("Core");

  async function add() {
    if (!title.trim() || !isAdmin) return;
    showLoader("Adding MVP item…");
    try {
      const newItem = await addMvpItem({
        title: title.trim(),
        description: desc.trim(),
        status: "pending",
        priority,
        category,
      });
      dispatch({ type: "ADD_MVP_ITEM", payload: newItem });
      setTitle("");
      setDesc("");
    } catch (err: any) {
      alert("Failed to add: " + err.message);
    }
    hideLoader();
  }

  async function changeStatus(item: { id: string; status: "pending" | "in_progress" | "done" }) {
    if (!isAdmin) return;
    const order: ("pending" | "in_progress" | "done")[] = ["pending", "in_progress", "done"];
    const next = order[(order.indexOf(item.status) + 1) % 3];
    try {
      await updateMvpItem(item.id, { status: next });
      dispatch({ type: "UPDATE_MVP_ITEM", payload: { id: item.id, updates: { status: next } } });
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  }

  async function remove(id: string) {
    if (!isAdmin || !confirm("Remove this item?")) return;
    try {
      await deleteMvpItem(id);
      dispatch({ type: "DELETE_MVP_ITEM", payload: id });
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">MVP Definition (v0.2)</div>
          <div className="section-line"></div>
        </div>
      </div>

      {/* KEY Philosophy */}
      <div className="card mb20">
        <div className="card-label" style={{ marginBottom: 12 }}>KEY Philosophy</div>
        <ul style={{ fontSize: 12, color: "var(--silver)", paddingLeft: 18, lineHeight: 1.75, margin: 0 }}>
          <li style={{ marginBottom: 8 }}>Minimal Data + No Exfiltration — Phantix never takes possession of customer security data.</li>
          <li style={{ marginBottom: 8 }}>Tooling from Phantix Cloud — All scanners, AI, Burp orchestration run from Phantix infrastructure.</li>
          <li style={{ marginBottom: 8 }}>Hybrid Architecture — Cloud orchestration + AI + tooling. Customer owns dedicated database.</li>
          <li style={{ marginBottom: 8 }}>Human-in-the-Loop — Critical actions require explicit Initiator + Authorizer approval.</li>
          <li>Regulatory Gate — NDPA/NDPR + NITDA partnership required before go-live.</li>
        </ul>
      </div>

      {isAdmin && (
        <div className="card mb20">
          <div className="card-label" style={{ marginBottom: 11 }}>Add MVP Item</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 140px", gap: 9, marginBottom: 9 }}>
            <input className="ifield" placeholder="MVP Item title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <select className="ifield" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>P1</option><option>P2</option><option>P3</option><option>Future</option>
            </select>
            <select className="ifield" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Core</option><option>Onboarding</option><option>Security</option><option>Compliance</option><option>UX</option><option>Infra</option><option>Regulatory</option><option>Tooling</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 9 }}>
            <textarea className="ifield" placeholder="Description / acceptance criteria (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ minHeight: 48 }} />
            <button className="btn btn-pr" style={{ alignSelf: "start" }} onClick={add}>Add MVP</button>
          </div>
        </div>
      )}

      <div className="card">
        <table className="dtable">
          <thead>
            <tr>
              <th>#</th>
              <th>MVP Item</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 24, fontSize: 12 }}>
                  No MVP items defined yet.
                  {isAdmin ? " Use the form above to add items." : ""}
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--muted)" }}>{i + 1}</td>
                  <td style={{ color: "var(--white)", fontSize: 12 }}>
                    {item.title}
                    {item.description && <div style={{ fontSize: 11, color: "var(--silver)", marginTop: 2 }}>{item.description}</div>}
                  </td>
                  <td><span className="chip" style={{ fontSize: 11 }}>{item.priority}</span></td>
                  <td style={{ color: "var(--muted)", fontSize: 11 }}>{item.category}</td>
                  <td>
                    <span
                      className={`chip ${STATUS_CLASS[item.status]}`}
                      style={{ cursor: isAdmin ? "pointer" : "default", userSelect: "none" }}
                      onClick={() => changeStatus(item)}
                    >
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td>
                    {isAdmin && (
                      <span
                        onClick={() => remove(item.id)}
                        style={{ cursor: "pointer", color: "var(--muted)", padding: "2px 6px", borderRadius: 3, fontSize: 15, transition: "all 0.15s" }}
                        onMouseEnter={(e) => ((e.target as HTMLSpanElement).style.color = "var(--danger)")}
                        onMouseLeave={(e) => ((e.target as HTMLSpanElement).style.color = "var(--muted)")}
                      >
                        ×
                      </span>
                    )}
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
