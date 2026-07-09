import { getFirebaseAuth } from "./firebase";

export async function getAuthToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function registerProfile(payload: {
  uid: string;
  email: string;
  name: string;
  username: string;
  role: string;
  adminKey: string;
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export function getMe() { return apiFetch("/api/auth/me"); }
export function listUsers() { return apiFetch("/api/auth/users"); }
export function deleteUser(uid: string) { return apiFetch(`/api/auth/users/${uid}`, { method: "DELETE" }); }

export function getLogs() { return apiFetch("/api/logs"); }
export function addLog(type: string, text: string) { return apiFetch("/api/logs", { method: "POST", body: JSON.stringify({ type, text }) }); }
export function deleteLog(id: string) { return apiFetch(`/api/logs/${id}`, { method: "DELETE" }); }

export function getRisks() { return apiFetch("/api/risks"); }
export function addRisk(data: any) { return apiFetch("/api/risks", { method: "POST", body: JSON.stringify(data) }); }
export function deleteRisk(id: string) { return apiFetch(`/api/risks/${id}`, { method: "DELETE" }); }

export function getMilestones() { return apiFetch("/api/milestones"); }
export function addMilestone(data: any) { return apiFetch("/api/milestones", { method: "POST", body: JSON.stringify(data) }); }
export function toggleMilestone(id: string, status: string) { return apiFetch(`/api/milestones/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); }
export function deleteMilestone(id: string) { return apiFetch(`/api/milestones/${id}`, { method: "DELETE" }); }

export function getState() { return apiFetch("/api/state"); }
export function setState(key: string, value: any) { return apiFetch("/api/state", { method: "PUT", body: JSON.stringify({ key, value }) }); }

export function getInsights() { return apiFetch("/api/insights"); }
export function addInsight(data: any) { return apiFetch("/api/insights", { method: "POST", body: JSON.stringify(data) }); }
export function patchInsight(id: string, data: any) { return apiFetch(`/api/insights/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteInsight(id: string) { return apiFetch(`/api/insights/${id}`, { method: "DELETE" }); }

export function getManifest() { return apiFetch("/api/manifest"); }
export function addManifestEntry(data: any) { return apiFetch("/api/manifest", { method: "POST", body: JSON.stringify(data) }); }
export function deleteManifestEntry(id: string) { return apiFetch(`/api/manifest/${id}`, { method: "DELETE" }); }

export function seedData() { return apiFetch("/api/admin/seed", { method: "POST" }); }

export async function getMvpItems() { return apiFetch("/api/mvp"); }
export async function addMvpItem(data: any) { return apiFetch("/api/mvp", { method: "POST", body: JSON.stringify(data) }); }
export async function updateMvpItem(id: string, data: any) { return apiFetch(`/api/mvp/${id}`, { method: "PATCH", body: JSON.stringify(data) }); }
export async function deleteMvpItem(id: string) { return apiFetch(`/api/mvp/${id}`, { method: "DELETE" }); }
