export interface UserSession {
  uid: string;
  email: string;
  name: string;
  username: string;
  role: "admin" | "contributor";
}

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  type: "update" | "doc" | "research" | "blocker" | "milestone";
  text: string;
  date: string;
  author: string;
  createdAt: any;
}

export interface RiskEntry {
  id: string;
  title: string;
  level: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  mitigation: string;
  owner: string;
  addedBy: string;
  createdAt: any;
}

export interface MilestoneEntry {
  id: string;
  title: string;
  date: string;
  desc: string;
  status: "done" | "pending";
  addedBy: string;
  createdAt: any;
}

export interface InsightEntry {
  id: string;
  book: string;
  author: string;
  phase: string;
  chapter: string;
  notes: string;
  category: string;
  suggestions: string[];
  status: "pending" | "deliberated" | "approved" | "rejected";
  verdict: string;
  verdictNotes: string;
  addedBy: string;
  addedByUid: string;
  deliberatedBy: string;
  deliberatedDate: string;
  date: string;
  createdAt: any;
}

export interface ManifestEntry {
  id: string;
  title: string;
  body: string;
  type: "feature" | "procedure" | "architecture" | "security" | "ai";
  source: string;
  priority: string;
  category: string;
  addedBy: string;
  date: string;
  createdAt: any;
}

export type ManifestType = "feature" | "procedure" | "architecture" | "security" | "ai";

export type NavPage =
  | "overview"
  | "phases"
  | "documents"
  | "research"
  | "insights"
  | "manifest"
  | "architecture"
  | "milestones"
  | "risks"
  | "log"
  | "mvp"
  | "brand";

export interface UserState {
  booksRead?: Record<string, boolean>;
  archTasks?: Record<string, boolean>;
}

export interface MvpItem {
  id: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "pending";
  priority: string;
  category: string;
  addedBy?: string;
  createdAt?: any;
}
