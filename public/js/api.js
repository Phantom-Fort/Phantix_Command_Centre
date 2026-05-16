// public/js/api.js
// Central API client. Every fetch() to /api/* goes through here.
// Automatically attaches the Firebase ID token to every request.
// Import individual functions where needed.

import { getFirebaseAuth } from './firebase.js';

// ── Token helper ──────────────────────────────────────────────────────────────
async function getToken() {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();  // Firebase refreshes the token automatically if needed
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res   = await fetch(path, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error || `HTTP ${res.status}`;
    console.error(`[API] ${options.method || 'GET'} ${path} → ${res.status}: ${msg}`);
    throw new Error(msg);
  }

  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

/** Called after Firebase createUserWithEmailAndPassword — saves profile to Firestore via server */
export async function registerProfile({
  uid,
  email,
  name,
  username,
  role,
  adminKey
}) {

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uid,
      email,
      name,
      username,
      role,
      adminKey: adminKey || ''
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export async function getMe()        { return apiFetch('/api/auth/me'); }
export async function listUsers()    { return apiFetch('/api/auth/users'); }
export async function deleteUser(uid){ return apiFetch(`/api/auth/users/${uid}`, { method: 'DELETE' }); }

// ── LOGS ──────────────────────────────────────────────────────────────────────

export async function getLogs()           { return apiFetch('/api/logs'); }
export async function addLog(type, text)  { return apiFetch('/api/logs', { method: 'POST', body: { type, text } }); }
export async function deleteLog(id)       { return apiFetch(`/api/logs/${id}`, { method: 'DELETE' }); }

// ── RISKS ─────────────────────────────────────────────────────────────────────

export async function getRisks()    { return apiFetch('/api/risks'); }
export async function addRisk(data) { return apiFetch('/api/risks', { method: 'POST', body: data }); }
export async function deleteRisk(id){ return apiFetch(`/api/risks/${id}`, { method: 'DELETE' }); }

// ── MILESTONES ────────────────────────────────────────────────────────────────

export async function getMilestones()          { return apiFetch('/api/milestones'); }
export async function addMilestone(data)       { return apiFetch('/api/milestones', { method: 'POST', body: data }); }
export async function toggleMilestone(id, status){ return apiFetch(`/api/milestones/${id}`, { method: 'PATCH', body: { status } }); }
export async function deleteMilestone(id)      { return apiFetch(`/api/milestones/${id}`, { method: 'DELETE' }); }

// ── USER STATE (reading list, arch tasks) ─────────────────────────────────────

export async function getState()           { return apiFetch('/api/state'); }
export async function setState(key, value) { return apiFetch('/api/state', { method: 'PUT', body: { key, value } }); }

// ── INSIGHTS ──────────────────────────────────────────────────────────────────

export async function getInsights()        { return apiFetch('/api/insights'); }
export async function addInsight(data)     { return apiFetch('/api/insights', { method: 'POST', body: data }); }
export async function patchInsight(id, data){ return apiFetch(`/api/insights/${id}`, { method: 'PATCH', body: data }); }
export async function deleteInsight(id)    { return apiFetch(`/api/insights/${id}`, { method: 'DELETE' }); }

// ── MANIFEST ──────────────────────────────────────────────────────────────────

export async function getManifest()        { return apiFetch('/api/manifest'); }
export async function addManifestEntry(data){ return apiFetch('/api/manifest', { method: 'POST', body: data }); }
export async function deleteManifestEntry(id){ return apiFetch(`/api/manifest/${id}`, { method: 'DELETE' }); }

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export async function seedData() { return apiFetch('/api/admin/seed', { method: 'POST' }); }
