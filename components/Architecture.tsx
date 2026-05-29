"use client";

import { useApp } from "@/hooks/useAppData";
import { ARCH_SERVICES } from "@/lib/data";
import { setState } from "@/lib/api-client";

export default function Architecture() {
  const { archTasks, dispatch } = useApp();

  const toggleArch = async (key: string) => {
    dispatch({ type: "TOGGLE_ARCH_TASK", payload: key });
    try {
      await setState("archTasks", { ...archTasks, [key]: !archTasks[key] });
    } catch (err: any) {
      dispatch({ type: "TOGGLE_ARCH_TASK", payload: key });
      console.error("[Arch] toggleArch save failed:", err.message);
    }
  };

  return (
    <div className="page active">
      <div className="section-header">
        <div>
          <div className="section-title">Architecture Tracker</div>
          <div className="section-line"></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        {ARCH_SERVICES.map((svc, si) => (
          <div key={si} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, color: "var(--white)", marginBottom: 3 }}>{svc.ic} {svc.n}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.4 }}>{svc.d}</div>
            {svc.tasks.map((task, ti) => {
              const key = `a-${si}-${ti}`;
              const done = !!archTasks[key];
              return (
                <div key={ti} onClick={() => toggleArch(key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, padding: "5px 6px", borderRadius: 5, cursor: "pointer", marginBottom: 3,
                    color: done ? "var(--muted)" : "var(--silver)", textDecoration: done ? "line-through" : "none" }}>
                  <div style={{ width: 13, height: 13, borderRadius: 3, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1.5px solid ${done ? "var(--success)" : "var(--muted)"}`, background: done ? "var(--success)" : "transparent" }}>
                    {done && <span style={{ color: "white", fontSize: 7, fontWeight: 700 }}>✓</span>}
                  </div>
                  {task}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
