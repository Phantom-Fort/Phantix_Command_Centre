// public/js/manifest.js
// Implementation Manifest — admin curates, everyone can read.
// Entries come from approved insights (auto) or manual admin additions.

import { addManifestEntry, deleteManifestEntry } from './api.js';
import { SESSION, showLoader, hideLoader, qs, updateBadges } from './app.js';

let _manifest = [];

// Called at boot with pre-fetched data (admin only)
export function initManifest(manifest) {
  _manifest = manifest;
}

const MF_TYPES  = ['feature', 'procedure', 'architecture', 'security', 'ai'];
const MF_LABELS = {
  feature:      'Application Features',
  procedure:    'Implementation Procedures',
  architecture: 'Architecture Decisions',
  security:     'Security Requirements',
  ai:           'AI / ML Guidelines',
};
const MF_COLORS = {
  feature:      'var(--bright)',
  procedure:    'var(--success)',
  architecture: 'var(--cyan)',
  security:     'var(--danger)',
  ai:           'var(--purple)',
};

// ── Render ────────────────────────────────────────────────────────────────────
export function renderManifest() {
  const emptyEl = document.getElementById('mf-empty');
  if (emptyEl) emptyEl.style.display = _manifest.length ? 'none' : 'block';

  const isAdmin = SESSION?.role === 'admin';

  MF_TYPES.forEach(type => {
    const el    = document.getElementById('mf-' + type);
    if (!el)    return;
    const items = _manifest.filter(m => m.type === type);

    if (!items.length) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = `
      <div class="mf-section">
        <div class="mf-section-title" style="border-left:3px solid ${MF_COLORS[type]}">
          ${MF_LABELS[type]}
          <span style="font-size:12px;color:var(--muted);font-weight:400">(${items.length})</span>
        </div>
        ${items.map(m => `
          <div class="mf-item">
            <div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:5px">
              <div class="mf-item-title" style="flex:1">${m.title}</div>
              <span class="chip cp" style="font-size:9px;white-space:nowrap">${m.priority || 'Phase 2'}</span>
              ${isAdmin
                ? `<button class="btn btn-dd btn-sm" onclick="window._deleteManifestEntry('${m.id}')"
                    style="padding:2px 7px;font-size:10px">×</button>`
                : ''}
            </div>
            <div class="mf-item-body">${(m.body || '').replace(/\n/g, '<br>')}</div>
            ${m.source
              ? `<div class="mf-src">📖 ${m.source}</div>`
              : ''}
            <div class="mf-item-meta">
              Added by ${m.addedBy || '—'} · ${m.date || ''}
              ${m.category ? ' · ' + m.category : ''}
            </div>
          </div>`).join('')}
      </div>`;
  });

  qs('badge-manifest', _manifest.length);
}

// ── Add entry manually (admin form) ──────────────────────────────────────────
export async function submitManifestEntry() {
  if (SESSION?.role !== 'admin') {
    alert('Only admins can add manifest entries.');
    return;
  }

  const title = document.getElementById('mf-title')?.value.trim();
  const body  = document.getElementById('mf-body')?.value.trim();
  if (!title || !body) {
    alert('Title and description are required.');
    return;
  }

  showLoader('Saving manifest entry…');
  try {
    const entry = await addManifestEntry({
      title,
      body,
      type:     document.getElementById('mf-type')?.value     || 'feature',
      source:   document.getElementById('mf-source')?.value.trim() || '',
      priority: document.getElementById('mf-priority')?.value || 'Phase 2',
      category: '',
    });
    _manifest.push(entry);

    // Clear form
    ['mf-title', 'mf-body', 'mf-source'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    renderManifest();
    updateBadges({ manifest: _manifest.length });
  } catch (err) {
    alert('Failed to save manifest entry: ' + err.message);
    console.error('[Manifest] submitManifestEntry error:', err.message);
  }
  hideLoader();
}

// ── Add entry from approved insight (called by insights.js) ──────────────────
export async function addManifestEntryFromInsight(ins) {
  const entry = await addManifestEntry({
    title:    `[Insight] ${ins.chapter} — ${ins.book}`,
    body:     ins.verdict
              + '\n\nKey Implementation Suggestions:\n'
              + (ins.suggestions || []).map(s => '• ' + s).join('\n'),
    type:     'feature',
    source:   `${ins.book}${ins.author ? ' (' + ins.author + ')' : ''}`,
    priority: 'Phase 2',
    category: ins.category || '',
  });
  _manifest.push(entry);
  renderManifest();
  updateBadges({ manifest: _manifest.length });
}

// ── Delete ────────────────────────────────────────────────────────────────────
window._deleteManifestEntry = async function (id) {
  if (SESSION?.role !== 'admin') return;
  if (!confirm('Delete this manifest entry permanently?')) return;

  showLoader('Deleting…');
  try {
    await deleteManifestEntry(id);
    _manifest = _manifest.filter(m => m.id !== id);
    renderManifest();
    updateBadges({ manifest: _manifest.length });
  } catch (err) {
    alert('Failed to delete manifest entry: ' + err.message);
    console.error('[Manifest] deleteManifestEntry error:', err.message);
  }
  hideLoader();
};

window.submitManifestEntry = submitManifestEntry;
