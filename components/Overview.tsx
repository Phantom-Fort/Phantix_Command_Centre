"use client";

import { useApp } from "@/hooks/useAppData";
import { PROJECT_START, PROJECT_END } from "@/lib/data";
import LogList from "./LogList";
import { useEffect, useState } from "react";

export default function Overview() {
  const { logs, insights } = useApp();
  const [dateState, setDateState] = useState({ elapsed: 0, total: 730, pct: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const elapsed = Math.max(0, Math.floor((now.getTime() - PROJECT_START.getTime()) / 86400000));
      const total = Math.floor((PROJECT_END.getTime() - PROJECT_START.getTime()) / 86400000);
      const pct = Math.min(100, Math.round((elapsed / total) * 100));
      setDateState({ elapsed, total, pct });
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  const { elapsed, total, pct } = dateState;

  const tickLabels = ["May 26", "Aug 26", "Nov 26", "Feb 27", "May 27", "Aug 27", "Nov 27", "May 28"];

  return (
    <div className="page active">
      <div className="kpi4">
        <div className="card">
          <div className="card-label">Overall Progress</div>
          <div className="card-value cyan">{pct}%</div>
          <div className="card-sub">Pre-development phase</div>
          <div style={{ marginTop: 8 }}>
            <div className="bar-track"><div className="bar-fill" style={{ width: pct + "%" }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="card-label">Days Elapsed</div>
          <div className="card-value">{elapsed}</div>
          <div className="card-sub">of {total} total days</div>
        </div>
        <div className="card">
          <div className="card-label">Docs Complete</div>
          <div className="card-value green">5</div>
          <div className="card-sub">of 16 planned</div>
        </div>
        <div className="card">
          <div className="card-label">Book Insights</div>
          <div className="card-value" style={{ color: "var(--purple)" }}>{insights.length}</div>
          <div className="card-sub">logged this session</div>
        </div>
      </div>

      <div className="card mb20">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 700, color: "var(--white)" }}>2-Year Delivery Timeline</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>May 2026 → May 2028</div>
          </div>
          <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--cyan)" }}>{pct}%</div>
        </div>
        <div className="bar-track" style={{ height: 10 }}><div className="bar-fill" style={{ width: pct + "%" }}></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 3, marginTop: 10 }}>
          {Array.from({ length: 8 }).map((_, i) => {
            const f = i / 7;
            const done = f < elapsed / total;
            const active = !done && f < elapsed / total + 0.03;
            const bg = done ? "rgba(16,185,129,0.25)" : active ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.04)";
            const border = done ? "rgba(16,185,129,0.4)" : active ? "var(--bright)" : "rgba(255,255,255,0.05)";
            return <div key={i} style={{ height: 18, borderRadius: 3, background: bg, border: `1px solid ${border}` }}></div>;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 3, marginTop: 3 }}>
          {tickLabels.map((l, i) => (
            <div key={i} style={{ fontSize: 8, color: "var(--muted)", fontFamily: "var(--fm)" }}>{l}</div>
          ))}
        </div>
      </div>

      <div className="section-header">
        <div>
          <div className="section-title">Recent Activity</div>
          <div className="section-line"></div>
        </div>
      </div>
      <LogList limit={5} targetId="recent-log" />
    </div>
  );
}
