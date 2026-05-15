// public/js/app.js
// Entry point. Imported by index.html as type="module".
// Handles: boot, nav, timeline, lock window, arch tracker, shared utils.

import { initFirebase }    from './firebase.js';
import { watchAuthState, doLogin, doRegister, doLogout, doGoogleSignIn, switchTab, toggleAdminKey } from './auth.js';
import { getLogs, getMilestones, getRisks, getState, setState, getInsights, getManifest } from './api.js';
import { renderResearch, initResearch } from './research.js';
import { renderInsights, initInsights } from './insights.js';
import { renderManifest, initManifest } from './manifest.js';
import { renderLog, initLog }           from './log.js';
import { renderRisks, renderMilestones, initState } from './state.js';
import { ARCH_SERVICES }                from './data.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const PROJECT_START = new Date('2026-05-09');
const PROJECT_END   = new Date('2028-05-09');
export const LOCK_END = new Date('2026-11-09');

// ── Session (exported so other modules can read role/name) ─────────────────────
export let SESSION = null;

// ── Arch state (per-user, persisted via /api/state) ───────────────────────────
let _archState = {};

// ══════════════════════════════════════════════════════════════════════════════
//  LOADER
// ══════════════════════════════════════════════════════════════════════════════
export function showLoader(msg = 'Loading…') {
  const el = document.getElementById('loader-msg');
  if (el) el.textContent = msg;
  document.getElementById('loader').style.display = 'flex';
}
export function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════════════════
//  DOM HELPERS  (exported for use in other modules)
// ══════════════════════════════════════════════════════════════════════════════
export function qs(id, val)   { const e = document.getElementById(id); if (e) e.textContent = val; }
export function setW(id, pct) { const e = document.getElementById(id); if (e) e.style.width = pct + '%'; }

// ══════════════════════════════════════════════════════════════════════════════
//  BADGES
// ══════════════════════════════════════════════════════════════════════════════
export function updateBadges(counts = {}) {
  if (counts.insights != null) { qs('badge-insights', counts.insights); qs('kpi-insights', counts.insights); }
  if (counts.manifest != null)   qs('badge-manifest', counts.manifest);
  if (counts.risks    != null)   qs('badge-risks',    counts.risks);
}

// ══════════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════════════════════════
const PAGE_TITLES = {
  overview:     'Command Centre — Overview',
  phases:       'Phases & Deliverables',
  documents:    'Document Registry',
  research:     'Research Tracker',
  insights:     'Book Insights & Deliberation',
  manifest:     'Implementation Manifest',
  architecture: 'Architecture Tracker',
  milestones:   'Key Milestones',
  risks:        'Risk Register',
  log:          'Activity Log',
};

export function showPage(pageId) {
  if (pageId === 'manifest' && SESSION?.role !== 'admin') {
    alert('The Implementation Manifest is restricted to Admin users.');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + pageId)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') === `showPage('${pageId}')`) n.classList.add('active');
  });

  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[pageId] || pageId;

  // Render page content on demand
  if (pageId === 'research')     renderResearch();
  if (pageId === 'insights')     { updateCountdown(); updateLockUI(); renderInsights(); }
  if (pageId === 'manifest')     renderManifest();
  if (pageId === 'architecture') renderArch();
  if (pageId === 'milestones')   renderMilestones();
  if (pageId === 'risks')        renderRisks();
  if (pageId === 'log')          renderLog('log-full');
}

// ══════════════════════════════════════════════════════════════════════════════
//  TIMELINE & DATE
// ══════════════════════════════════════════════════════════════════════════════
export function updateDate() {
  const now     = new Date();
  const elapsed = Math.max(0, Math.floor((now - PROJECT_START) / 86400000));
  const total   = Math.floor((PROJECT_END - PROJECT_START) / 86400000);
  const pct     = Math.min(100, Math.round((elapsed / total) * 100));

  const sd = document.getElementById('sidebar-date');
  if (sd) sd.textContent = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  qs('kpi-elapsed', elapsed);
  qs('kpi-overall', pct + '%');
  qs('overall-pct', pct + '% complete');
  setW('kpi-bar', pct);
  setW('master-bar', pct);

  const ticks = document.getElementById('phase-ticks');
  if (!ticks) return;
  ticks.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const f      = i / 7;
    const done   = f < elapsed / total;
    const active = !done && f < (elapsed / total) + 0.03;
    const bg     = done   ? 'rgba(16,185,129,0.25)' : active ? 'rgba(37,99,235,0.4)'   : 'rgba(255,255,255,0.04)';
    const border = done   ? 'rgba(16,185,129,0.4)'  : active ? 'var(--bright)'          : 'rgba(255,255,255,0.05)';
    ticks.innerHTML += `<div style="height:18px;border-radius:3px;background:${bg};border:1px solid ${border}"></div>`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  LOCK WINDOW (6-month insights edit window)
// ══════════════════════════════════════════════════════════════════════════════
export function isLocked() { return new Date() > LOCK_END; }

export function updateLockUI() {
  const locked = isLocked();
  const banner = document.getElementById('lock-banner');
  const form   = document.getElementById('add-ins-form');
  const pill   = document.getElementById('lock-pill');
  if (banner) banner.style.display = locked ? 'flex' : 'none';
  if (form)   form.style.display   = locked ? 'none' : 'block';
  if (pill)   pill.innerHTML       = locked ? '🔒 Edit window closed' : '🔓 Edit window open';
}

export function updateCountdown() {
  const el = document.getElementById('ins-countdown');
  if (!el) return;
  const diff = Math.max(0, LOCK_END - new Date());
  if (!diff) {
    el.innerHTML = '<div style="grid-column:1/-1;text-align:center;font-size:13px;color:var(--danger);font-family:var(--fm);padding:14px">Edit window has closed</div>';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);
  el.innerHTML = [['Days',d],['Hours',h],['Minutes',m],['Seconds',s]].map(([l,v]) =>
    `<div class="cd-unit"><div class="cd-val">${String(v).padStart(2,'0')}</div><div class="cd-lbl">${l} remaining</div></div>`
  ).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
//  DELIVERABLE PHASES  (UI only — not persisted)
// ══════════════════════════════════════════════════════════════════════════════
export function toggleDel(el, phase) {
  el.classList.toggle('chk');
  _updatePhase(phase);
}

function _updatePhase(phase) {
  const list  = document.getElementById(phase + '-list');
  if (!list)  return;
  const items = list.querySelectorAll('.del-item');
  const done  = list.querySelectorAll('.del-item.chk').length;
  const pct   = items.length ? Math.round((done / items.length) * 100) : 0;
  setW(phase + '-bar', pct);
  qs(phase + '-pct', pct + '%');
}

function _updateAllPhases() { ['p0','p1','p2','p3'].forEach(_updatePhase); }

// ══════════════════════════════════════════════════════════════════════════════
//  ARCHITECTURE TRACKER
// ══════════════════════════════════════════════════════════════════════════════
export function renderArch() {
  const grid = document.getElementById('arch-grid');
  if (!grid) return;

  grid.innerHTML = ARCH_SERVICES.map((svc, si) => `
    <div style="background:var(--surface2);border:1px solid var(--border);
      border-radius:10px;padding:14px">
      <div style="font-family:var(--fd);font-size:13px;font-weight:700;
        color:var(--white);margin-bottom:3px">${svc.ic} ${svc.n}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px;
        line-height:1.4">${svc.d}</div>
      ${svc.tasks.map((task, ti) => {
        const key  = `a-${si}-${ti}`;
        const done = !!_archState[key];
        return `
          <div onclick="window._toggleArch('${key}')"
            style="display:flex;align-items:center;gap:8px;font-size:11px;
              padding:5px 6px;border-radius:5px;cursor:pointer;margin-bottom:3px;
              color:${done ? 'var(--muted)' : 'var(--silver)'};
              ${done ? 'text-decoration:line-through' : ''}">
            <div style="width:13px;height:13px;border-radius:3px;flex-shrink:0;
              display:flex;align-items:center;justify-content:center;
              border:1.5px solid ${done ? 'var(--success)' : 'var(--muted)'};
              background:${done ? 'var(--success)' : 'transparent'}">
              ${done ? '<span style="color:white;font-size:7px;font-weight:700">✓</span>' : ''}
            </div>
            ${task}
          </div>`;
      }).join('')}
    </div>`
  ).join('');
}

window._toggleArch = async function(key) {
  _archState[key] = !_archState[key];
  renderArch();   // optimistic
  try {
    await setState('archTasks', _archState);
  } catch (err) {
    _archState[key] = !_archState[key];  // revert
    renderArch();
    console.error('[App] _toggleArch save failed:', err.message);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════════════════════
async function bootApp(session) {
  SESSION = session;

  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display         = 'flex';

  // Sidebar user info
  qs('user-av', session.name.charAt(0).toUpperCase());
  qs('user-nm', session.name);
  qs('user-rl', session.role.toUpperCase());

  // Admin-only nav + form visibility
  const manifestNav = document.getElementById('manifest-nav');
  if (manifestNav) {
    const isAdmin              = session.role === 'admin';
    manifestNav.style.opacity       = isAdmin ? '1'    : '0.35';
    manifestNav.style.pointerEvents = isAdmin ? 'auto' : 'none';
  }
  document.querySelectorAll('.admin-only').forEach(el => {
    if (session.role === 'admin') el.classList.add('show');
  });

  // Fetch all data in parallel
  showLoader('Loading workspace…');
  try {
    const [
      logsRes, milestonesRes, risksRes,
      stateRes, insightsRes, manifestRes
    ] = await Promise.all([
      getLogs(), getMilestones(), getRisks(),
      getState(), getInsights(),
      session.role === 'admin' ? getManifest() : Promise.resolve({ manifest: [] }),
    ]);

    // Initialise each module with its data
    initLog(logsRes.logs || []);
    initState(milestonesRes.milestones || [], risksRes.risks || []);
    initResearch(stateRes.state || {});
    initInsights(insightsRes.insights || []);
    if (session.role === 'admin') initManifest(manifestRes.manifest || []);

    // Restore arch task state from user's server state
    _archState = stateRes.state?.archTasks || {};

    // Update badge counts
    updateBadges({
      insights: (insightsRes.insights || []).length,
      manifest: (manifestRes.manifest || []).length,
      risks:    (risksRes.risks || []).filter(r => r.level === 'HIGH').length,
    });

  } catch (err) {
    console.error('[App] Boot data load failed:', err.message);
  }

  hideLoader();

  // Initial renders
  updateDate();
  updateCountdown();
  updateLockUI();
  _updateAllPhases();
  renderLog('recent-log', 5);
  renderRisks();
  renderMilestones();

  // Timers
  setInterval(updateDate,      60000);
  setInterval(updateCountdown,  1000);
}

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL ONCLICK BINDINGS
//  (HTML uses onclick="..." so these must be on window)
// ══════════════════════════════════════════════════════════════════════════════
window.showPage        = showPage;
window.switchTab       = switchTab;
window.toggleAdminKey  = toggleAdminKey;
window.doLogin         = doLogin;
window.doRegister      = doRegister;
window.doLogout        = doLogout;
window.doGoogleSignIn  = doGoogleSignIn;
window.toggleDel       = toggleDel;

// ══════════════════════════════════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════════════════════════════════
(async () => {
  try {
    await initFirebase();
    watchAuthState(bootApp);
  } catch (err) {
    console.error('[App] Firebase init failed:', err.message);
    document.body.innerHTML = `
      <div style="color:#EF4444;padding:40px;font-family:monospace;background:#0D1B3D;min-height:100vh">
        <h2 style="margin-bottom:16px">⚠ Firebase Initialisation Failed</h2>
        <p style="margin-bottom:8px">Error: ${err.message}</p>
        <p style="color:#64748B;font-size:13px">
          Check the browser console and ensure the Express server is running
          at the correct URL. The <code>/api/config/firebase</code> endpoint
          must be reachable.
        </p>
      </div>`;
  }
})();
