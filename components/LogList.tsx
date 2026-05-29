"use client";

import { useApp } from "@/hooks/useAppData";
import { deleteLog } from "@/lib/api-client";

const LOG_COLORS: Record<string, string> = {
  update: "var(--bright)",
  doc: "var(--cyan)",
  research: "var(--success)",
  blocker: "var(--danger)",
  milestone: "var(--warn)",
};
const LOG_LABELS: Record<string, string> = {
  update: "UPDATE",
  doc: "DOCUMENT",
  research: "RESEARCH",
  blocker: "BLOCKER",
  milestone: "MILESTONE",
};

export default function LogList({ limit, targetId }: { limit?: number; targetId?: string }) {
  const { logs, isAdmin, dispatch } = useApp();

  const displayLogs = limit ? logs.slice(0, limit) : logs;

  const delLog = async (id: string) => {
    try {
      await deleteLog(id);
      dispatch({ type: "DELETE_LOG", payload: id });
    } catch (err: any) {
      alert("Failed to delete log entry: " + err.message);
    }
  };

  if (!displayLogs.length) {
    return <div style={{ textAlign: "center", padding: 30, color: "var(--muted)", fontSize: 12 }}>No activity logged yet</div>;
  }

  return (
    <div id={targetId}>
      {displayLogs.map((l) => {
        const color = LOG_COLORS[l.type] || "var(--bright)";
        const label = LOG_LABELS[l.type] || "UPDATE";
        const date = l.date || (l.createdAt?.seconds
          ? new Date(l.createdAt.seconds * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "—");
        return (
          <div key={l.id} className="log-entry">
            <div className="ldot" style={{ background: color }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="log-type">{label}</div>
              <div className="log-text">{l.text}</div>
              <div className="log-meta">{date}{l.author ? " · " + l.author : ""}</div>
            </div>
            {isAdmin && <div className="log-del" onClick={() => delLog(l.id)}>×</div>}
          </div>
        );
      })}
    </div>
  );
}
