// public/js/log.js
// Activity log — renders to both the overview recent feed and full log page.

import { addLog, deleteLog } from './api.js';
import { SESSION, showLoader, hideLoader, qs } from './app.js';

let _logs = [];

const LOG_COLORS = {
  update:    'var(--bright)',
  doc:       'var(--cyan)',
  research:  'var(--success)',
  blocker:   'var(--danger)',
  milestone: 'var(--warn)',
};
const LOG_LABELS = {
  update:    'UPDATE',
  doc:       'DOCUMENT',
  research:  'RESEARCH',
  blocker:   'BLOCKER',
  milestone: 'MILESTONE',
};

// Called once at boot with pre-fetched data
export function initLog(logs) {
  _logs = logs;
}

/**
 * renderLog(targetId, limit)
 * targetId — DOM element id to render into
 * limit    — max entries to show (undefined = all)
 */
export function renderLog(targetId = 'log-full', limit) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const logs = limit ? _logs.slice(0, limit) : _logs;
  const countEl = document.getElementById('log-count');
  if (countEl) countEl.textContent = _logs.length + ' entries';

  if (!logs.length) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-size:12px">No activity logged yet</div>';
    return;
  }

  const isAdmin = SESSION?.role === 'admin';

  el.innerHTML = logs.map(l => {
    const color = LOG_COLORS[l.type]  || 'var(--bright)';
    const label = LOG_LABELS[l.type]  || 'UPDATE';
    const date  = l.date || (l.createdAt?.seconds
      ? new Date(l.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—');
    return `
      <div class="log-entry">
        <div class="ldot" style="background:${color}"></div>
        <div style="flex:1;min-width:0">
          <div class="log-type">${label}</div>
          <div class="log-text">${l.text}</div>
          <div class="log-meta">${date}${l.author ? ' · ' + l.author : ''}</div>
        </div>
        ${isAdmin
          ? `<div class="log-del" onclick="window._deleteLog('${l.id}')">×</div>`
          : ''}
      </div>`;
  }).join('');
}

export async function submitLog() {
  const text = document.getElementById('log-txt').value.trim();
  if (!text) return;

  const type = document.getElementById('log-type').value;
  showLoader('Saving…');
  try {
    const entry = await addLog(type, text);
    _logs.unshift(entry);   // newest first
    document.getElementById('log-txt').value = '';
    renderLog('log-full');
    renderLog('recent-log', 5);
  } catch (err) {
    alert('Failed to save log entry: ' + err.message);
    console.error('[Log] addLog error:', err.message);
  }
  hideLoader();
}

window._deleteLog = async function (id) {
  if (SESSION?.role !== 'admin') return;
  try {
    await deleteLog(id);
    _logs = _logs.filter(l => l.id !== id);
    renderLog('log-full');
    renderLog('recent-log', 5);
    qs('log-count', _logs.length + ' entries');
  } catch (err) {
    alert('Failed to delete log entry: ' + err.message);
    console.error('[Log] deleteLog error:', err.message);
  }
};

window.submitLog = submitLog;
