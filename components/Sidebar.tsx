"use client";

import { useApp } from "@/hooks/useAppData";
import { useAuth } from "@/components/AuthProvider";
import { NavPage } from "@/lib/types";

export default function Sidebar() {
  const { session, currentPage, navigate, insights, manifest, risks, isAdmin } = useApp();
  const { logout: authLogout } = useAuth();

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const highRisks = risks.filter((r) => r.level === "HIGH").length;
  const initials = session?.name?.charAt(0).toUpperCase() || "?";

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <img className="brand-img" src="/logo.png" alt="Phantix" />
          <div>
            <div className="brand-name">PHANTIX</div>
            <div className="brand-sub">PROTECT. PREVENT. PERFORM.</div>
          </div>
        </div>
      </div>

      <div className="sidebar-label">Dashboard</div>
      <NavItem icon="◉" label="Overview" page="overview" current={currentPage} navigate={navigate} />
      <NavItem icon="◈" label="Phases & Delivery" page="phases" current={currentPage} navigate={navigate} />
      <NavItem icon="◻" label="Documents" page="documents" current={currentPage} navigate={navigate} badge="16" />
      <NavItem icon="◧" label="Research Tracker" page="research" current={currentPage} navigate={navigate} />
      <NavItem icon="✓" label="MVP Definition" page="mvp" current={currentPage} navigate={navigate} />

      <div className="sidebar-label">Knowledge</div>
      <NavItem icon="💡" label="Book Insights" page="insights" current={currentPage} navigate={navigate} badge={String(insights.length)} badgeClass="purple" />
      <NavItem icon="📜" label="Impl. Manifest" page="manifest" current={currentPage} navigate={navigate} badge={String(manifest.length)} badgeClass="purple" disabled={!isAdmin} />

      <div className="sidebar-label">Planning</div>
      <NavItem icon="⬡" label="Architecture" page="architecture" current={currentPage} navigate={navigate} />
      <NavItem icon="◆" label="Milestones" page="milestones" current={currentPage} navigate={navigate} />
      <NavItem icon="▲" label="Risk Register" page="risks" current={currentPage} navigate={navigate} badge={String(highRisks)} badgeClass="warn" />
      <NavItem icon="≡" label="Activity Log" page="log" current={currentPage} navigate={navigate} />

      <div className="sidebar-label">Branding</div>
      <NavItem icon="◆" label="Brand Kit" page="brand" current={currentPage} navigate={navigate} />

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-av">{initials}</div>
          <div>
            <div className="user-nm">{session?.name || "—"}</div>
            <div className="user-rl">{(session?.role || "").toUpperCase()}</div>
          </div>
        </div>
        <div className="text-[10px] text-muted font-mono mb-2">{today}</div>
        <button className="logout-btn" onClick={authLogout}>Sign Out</button>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, page, current, navigate, badge, badgeClass, disabled }: {
  icon: string; label: string; page: NavPage; current: NavPage;
  navigate: (p: NavPage) => void; badge?: string; badgeClass?: string; disabled?: boolean;
}) {
  const isActive = current === page;
  return (
    <div
      className={`nav-item ${isActive ? "active" : ""}`}
      style={disabled ? { opacity: 0.35, pointerEvents: "none" } : {}}
      onClick={() => navigate(page)}
    >
      <span className="nav-icon">{icon}</span>
      {label}
      {badge && <span className={`nav-badge ${badgeClass || ""}`}>{badge}</span>}
    </div>
  );
}
