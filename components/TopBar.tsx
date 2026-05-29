"use client";

import { useApp } from "@/hooks/useAppData";
import { PAGE_TITLES, LOCK_END } from "@/lib/data";

export default function TopBar() {
  const { currentPage } = useApp();
  const locked = new Date() > LOCK_END;

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{PAGE_TITLES[currentPage] || "Command Centre"}</div>
        <div className="topbar-sub">2-Year Delivery Tracker · May 2026 → May 2028</div>
      </div>
      <div className="topbar-right">
        <div className="lock-pill">
          {locked ? "🔒" : "🔓"} <span>{locked ? "Edit window closed" : "Edit window open"}</span>
        </div>
        <div className="status-pill">
          <div className="status-dot"></div> PRE-DEV ACTIVE
        </div>
      </div>
    </div>
  );
}
