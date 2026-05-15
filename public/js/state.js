// public/js/state.js
// Manages risks and milestones — fetched from the server, rendered here.

import { getRisks, addRisk, deleteRisk, getMilestones, addMilestone, toggleMilestone, deleteMilestone } from './api.js';
import { SESSION, showLoader, hideLoader, qs, updateBadges } from './app.js';
import { addLog } from './api.js';

let _risks      = [];
let _milestones = [];

// Called once at boot with pre-fetched data
export function initState(milestones, risks) {
  _milestones = milestones;
  _risks      = risks;
}

// ── RISKS ─────────────────────────────────────────────────────────────────────

export function renderRisks() {
  const tbody = document.getElementById('risk-tbody');
  if (!tbody) return;

  if (!_risks.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px;font-size:12px">No risks logged yet</td></tr>`;
    updateBadges({ risks: 0 });
    return;
  }

  tbody.innerHTML = _risks.map((r, i) => `
    <tr>
      <td style="font-family:var(--fm);font-size:10px;color:var(--muted)">${i + 1}</td>
      <td style="color:var(--white);font-size:12px">${r.title}</td>
      <td style="color:var(--muted);font-size:11px">${r.category || '—'}</td>
      <td><span class="chip ${r.level === 'HIGH' ? 'rh' : r.level === 'MEDIUM' ? 'rm' : 'rl'}">${r.level}</span></td>
      <td style="color:var(--muted);font-size:11px;max-width:200px">${r.mitigation || '—'}</td>
      <td style="color:var(--silver);font-size:11px">${r.owner || '—'}</td>
      <td>
        <span style="cursor:pointer;color:var(--muted);padding:2px 6px;border-radius:3px;font-size:15px;transition:all 0.15s"
          onmouseover="this.style.color='var(--danger)'"
          onmouseout="this.style.color='var(--muted)'"
          onclick="window._deleteRisk('${r.id}')">×</span>
      </td>
    </tr>`).join('');

  updateBadges({ risks: _risks.filter(r => r.level === 'HIGH').length });
}

export async function submitRisk() {
  const title = document.getElementById('r-title').value.trim();
  if (!title) return;

  showLoader('Saving risk…');
  try {
    const newRisk = await addRisk({
      title,
      level:      document.getElementById('r-lvl').value,
      category:   document.getElementById('r-cat').value  || 'General',
      mitigation: document.getElementById('r-mit').value  || '—',
      owner:      document.getElementById('r-own').value  || '—',
    });
    _risks.push(newRisk);
    ['r-title', 'r-mit', 'r-cat', 'r-own'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderRisks();
  } catch (err) {
    alert('Failed to save risk: ' + err.message);
    console.error('[Risks] addRisk error:', err.message);
  }
  hideLoader();
}

window._deleteRisk = async function (id) {
  try {
    await deleteRisk(id);
    _risks = _risks.filter(r => r.id !== id);
    renderRisks();
  } catch (err) {
    alert('Failed to delete risk: ' + err.message);
    console.error('[Risks] deleteRisk error:', err.message);
  }
};

// ── MILESTONES ────────────────────────────────────────────────────────────────

export function renderMilestones() {
  const list = document.getElementById('milestone-list');
  if (!list) return;

  if (!_milestones.length) {
    list.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:8px">No milestones yet</div>';
    updateMilestoneSummary();
    return;
  }

  list.innerHTML = _milestones.map(m => `
    <div style="display:flex;gap:12px;padding-bottom:16px">
      <div style="width:11px;height:11px;border-radius:50%;flex-shrink:0;margin-top:4px;
        position:relative;left:-23px;cursor:pointer;
        border:2px solid ${m.status === 'done' ? 'var(--success)' : 'var(--muted)'};
        background:${m.status === 'done' ? 'var(--success)' : 'var(--surface)'};
        ${m.status === 'done' ? 'box-shadow:0 0 7px rgba(16,185,129,0.6)' : ''}"
        onclick="window._toggleMilestone('${m.id}','${m.status}')">
      </div>
      <div style="margin-left:-10px">
        <div style="font-size:10px;color:var(--muted);font-family:var(--fm)">${m.date || ''}</div>
        <div style="font-family:var(--fd);font-size:13px;font-weight:700;
          color:${m.status === 'done' ? 'var(--success)' : 'var(--white)'};margin-top:2px">${m.title}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4">${m.desc || ''}</div>
      </div>
    </div>`).join('');

  updateMilestoneSummary();
}

function updateMilestoneSummary() {
  const done  = _milestones.filter(m => m.status === 'done').length;
  const total = _milestones.length;
  qs('m-total', total);
  qs('m-done',  done);
  qs('m-up',    total - done);
}

export async function submitMilestone() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) return;

  showLoader('Saving milestone…');
  try {
    const m = await addMilestone({
      title,
      date: document.getElementById('m-date').value || '2027-01',
      desc: document.getElementById('m-desc').value.trim(),
    });
    _milestones.push(m);
    _milestones.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    ['m-title', 'm-date', 'm-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderMilestones();
  } catch (err) {
    alert('Failed to save milestone: ' + err.message);
    console.error('[Milestones] addMilestone error:', err.message);
  }
  hideLoader();
}

window._toggleMilestone = async function (id, currentStatus) {
  const newStatus = currentStatus === 'done' ? 'pending' : 'done';
  try {
    await toggleMilestone(id, newStatus);
    const m = _milestones.find(m => m.id === id);
    if (m) m.status = newStatus;
    renderMilestones();
  } catch (err) {
    alert('Failed to update milestone: ' + err.message);
    console.error('[Milestones] toggleMilestone error:', err.message);
  }
};

// Wire global handlers
window.submitRisk      = submitRisk;
window.submitMilestone = submitMilestone;
