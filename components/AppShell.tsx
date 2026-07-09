"use client";

import { useApp } from "@/hooks/useAppData";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Loader from "./Loader";
import Overview from "./Overview";
import Phases from "./Phases";
import Documents from "./Documents";
import Research from "./Research";
import Insights from "./Insights";
import Manifest from "./Manifest";
import Architecture from "./Architecture";
import Milestones from "./Milestones";
import Risks from "./Risks";
import ActivityLog from "./ActivityLog";
import Mvp from "./Mvp";

export default function AppShell() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case "overview": return <Overview />;
      case "phases": return <Phases />;
      case "documents": return <Documents />;
      case "research": return <Research />;
      case "insights": return <Insights />;
      case "manifest": return <Manifest />;
      case "architecture": return <Architecture />;
      case "milestones": return <Milestones />;
      case "risks": return <Risks />;
      case "log": return <ActivityLog />;
      case "mvp": return <Mvp />;
      default: return <Overview />;
    }
  };

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <TopBar />
        <div key={currentPage}>
          {renderPage()}
        </div>
      </div>
      <Loader />
    </div>
  );
}
