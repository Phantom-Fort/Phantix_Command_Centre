// public/js/insights.js
// Book Insights page — log chapters read, generate implementation suggestions,
// mark as deliberated, approve for manifest (admin only).

import { addInsight, patchInsight, deleteInsight } from './api.js';
import { getSuggestions, ALL_BOOKS, BOOKS }        from './data.js';
import { SESSION, isLocked, showLoader, hideLoader, qs, updateBadges } from './app.js';

let _insights   = [];
let _filter     = 'all';

// Called at boot with pre-fetched data
export function initInsights(insights) {
  _insights = insights;
}

// ── Book selector ─────────────────────────────────────────────────────────────
export function populateBookSelect() {
  const sel = document.getElementById('ins-book');
  if (!sel) return;
  sel.innerHTML = BOOKS.map(s =>
    `<optgroup label="${s.phase}">
      ${s.books.map(b => `<option value="${b.t}">${b.t}</option>`).join('')}
    </optgroup>`
  ).join('');
}

// ── Filter ────────────────────────────────────────────────────────────────────
export function filterInsights(f) {
  _filter = f;
  ['all', 'pending', 'deliberated', 'approved', 'rejected'].forEach(id => {
    const btn = document.getElementById('f-' + id);
    if (!btn) return;
    btn.style.borderColor = f === id ? 'var(--bright)' : 'var(--border)';
    btn.style.color       = f === id ? 'var(--white)'  : 'var(--muted)';
  });
  renderInsights();
}

// ── Submit new insight ────────────────────────────────────────────────────────
export async function submitInsight() {
  if (isLocked()) {
    alert('The 6-month edit window has closed. No new insights can be added.');
    return;
  }

  const book    = document.getElementById('ins-book').value;
  const chapter = document.getElementById('ins-chapter').value.trim();
  const notes   = document.getElementById('ins-notes').value.trim();
  const cat     = document.getElementById('ins-cat').value;

  if (!book || !chapter || !notes) {
    alert('Please fill in the book, chapter(s), and reading notes.');
    return;
  }

  const bk          = ALL_BOOKS.find(b => b.t === book) || { t: book, a: '', phase: '' };
  const suggestions = getSuggestions(book, notes);

  showLoader('Saving insight…');
  try {
    const newInsight = await addInsight({
      book,
      author:      bk.a,
      phase:       bk.phase,
      chapter,
      notes,
      category:    cat,
      suggestions,
    });
    _insights.unshift(newInsight);
    document.getElementById('ins-chapter').value = '';
    document.getElementById('ins-notes').value   = '';
    renderInsights();
    updateBadges({ insights: _insights.length });
  } catch (err) {
    alert('Failed to save insight: ' + err.message);
    console.error('[Insights] submitInsight error:', err.message);
  }
  hideLoader();
}

// ── Render ────────────────────────────────────────────────────────────────────
export function renderInsights() {
  const el = document.getElementById('ins-list');
  if (!el) return;

  let data = [..._insights];
  if (_filter === 'pending')     data = data.filter(i => i.status === 'pending');
  if (_filter === 'deliberated') data = data.filter(i => i.status === 'deliberated');
  if (_filter === 'approved')    data = data.filter(i => i.status === 'approved');
  if (_filter === 'rejected')    data = data.filter(i => i.status === 'rejected');

  qs('ins-count-lbl', data.length + ' insight' + (data.length !== 1 ? 's' : ''));
  qs('kpi-insights', _insights.length);

  if (!data.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:50px;color:var(--muted)">
        <div style="font-size:36px;margin-bottom:12px">💡</div>
        <div style="font-family:var(--fd);font-size:14px;color:var(--silver);margin-bottom:6px">
          ${_filter === 'all' ? 'No insights logged yet' : 'No insights matching this filter'}
        </div>
        <div style="font-size:12px">
          ${_filter === 'all'
            ? 'Select a book, enter the chapters you read, and write your notes above.'
            : 'Try selecting a different filter above.'}
        </div>
      </div>`;
    return;
  }

  const isAdmin  = SESSION?.role === 'admin';
  const locked   = isLocked();

  const statusChip = {
    pending:     `<span class="chip cw"><span class="chip-dot"></span>NOT DELIBERATED</span>`,
    deliberated: `<span class="chip cp"><span class="chip-dot"></span>DELIBERATED</span>`,
    approved:    `<span class="chip cd"><span class="chip-dot"></span>IN MANIFEST</span>`,
    rejected:    `<span class="chip cn"><span class="chip-dot"></span>NOT PROCEEDING</span>`,
  };

  el.innerHTML = data.map(ins => {
    const sugs = (ins.suggestions || []).map(s =>
      `<div class="sug-item"><span class="sug-bull">→</span><span>${s}</span></div>`
    ).join('');

    const verdictHtml = ins.verdict
      ? `<div class="verdict-box">
          <div class="verdict-lbl">Final Verdict / Deliberation Notes</div>
          <div class="verdict-txt">${ins.verdict}</div>
          ${ins.deliberatedBy
            ? `<div style="font-size:10px;color:var(--muted);font-family:var(--fm);margin-top:5px">
                By ${ins.deliberatedBy} · ${ins.deliberatedDate || ''}
              </div>`
            : ''}
        </div>`
      : '';

    // Who can do what
    const isAuthor   = ins.addedByUid === SESSION?.uid;
    const canDelib   = !locked && ins.status === 'pending' && (isAdmin || isAuthor);
    const canApprove = isAdmin && ins.status === 'deliberated';
    const canReject  = isAdmin && ins.status === 'deliberated';
    const canDelete  = isAdmin && ins.status !== 'approved';

    return `
      <div class="ins-card" id="ic-${ins.id}">
        <div class="ins-head">
          <div class="ins-phase-tag">${ins.phase || 'General'}</div>
          <div style="flex:1;min-width:0">
            <div class="ins-title">
              ${ins.book}
              <span style="font-size:11px;color:var(--muted);font-weight:400">— ${ins.author || ''}</span>
            </div>
            <div class="ins-chapter">${ins.chapter} · ${ins.category || ''}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0">
            ${statusChip[ins.status] || ''}
            <span style="font-size:10px;color:var(--muted);font-family:var(--fm)">
              ${ins.addedBy || ''} · ${ins.date || ''}
            </span>
          </div>
        </div>

        <div class="ins-body">
          <div class="ins-notes">
            <strong style="color:var(--silver);font-size:12px">Reading Notes:</strong><br>
            ${ins.notes}
          </div>

          <div class="sug-box">
            <div class="sug-label">Implementation Suggestions for Phantix</div>
            ${sugs}
          </div>

          ${verdictHtml}

          <div class="ins-actions" style="margin-top:10px">
            ${canDelib
              ? `<button class="btn btn-wn btn-sm" onclick="window._openDelib('${ins.id}')">
                  ⚑ Mark as Deliberated
                </button>`
              : ''}
            ${canApprove
              ? `<button class="btn btn-pu btn-sm" onclick="window._approveInsight('${ins.id}')">
                  ★ Add to Manifest
                </button>`
              : ''}
            ${canReject
              ? `<button class="btn btn-dd btn-sm" onclick="window._rejectInsight('${ins.id}')">
                  ✗ Not Proceeding
                </button>`
              : ''}
            ${canDelete
              ? `<button class="btn btn-dd btn-sm" onclick="window._deleteInsight('${ins.id}')"
                  style="margin-left:auto">Delete</button>`
              : ''}
          </div>

          ${canDelib
            ? `<div class="delib-form" id="df-${ins.id}" style="display:none">
                <div style="font-size:9px;color:var(--muted);font-family:var(--fm);
                  letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px">
                  Deliberation Notes / Final Verdict
                </div>
                <textarea class="ifield" id="dn-${ins.id}" style="min-height:70px"
                  placeholder="Record what was discussed and agreed. What will be implemented, modified, or discarded from these suggestions?"></textarea>
                <div style="display:flex;gap:8px;margin-top:8px">
                  <button class="btn btn-ok btn-sm" onclick="window._confirmDelib('${ins.id}')">
                    Confirm Deliberation
                  </button>
                  <button class="btn btn-gh btn-sm" onclick="window._closeDelib('${ins.id}')">
                    Cancel
                  </button>
                </div>
              </div>`
            : ''}
        </div>
      </div>`;
  }).join('');
}

// ── Deliberation ──────────────────────────────────────────────────────────────
window._openDelib = function (id) {
  const df = document.getElementById(`df-${id}`);
  if (df) df.style.display = df.style.display !== 'block' ? 'block' : 'none';
};

window._closeDelib = function (id) {
  const df = document.getElementById(`df-${id}`);
  if (df) df.style.display = 'none';
};

window._confirmDelib = async function (id) {
  const notes = document.getElementById(`dn-${id}`)?.value.trim() || 'Deliberated — no additional notes.';
  showLoader('Saving deliberation…');
  try {
    const today = new Date().toISOString().split('T')[0];
    await patchInsight(id, {
      status:          'deliberated',
      verdict:         notes,
      deliberatedBy:   SESSION.name,
      deliberatedDate: today,
    });
    const ins = _insights.find(i => i.id === id);
    if (ins) {
      ins.status          = 'deliberated';
      ins.verdict         = notes;
      ins.deliberatedBy   = SESSION.name;
      ins.deliberatedDate = today;
    }
    renderInsights();
  } catch (err) {
    alert('Failed to save deliberation: ' + err.message);
    console.error('[Insights] confirmDelib error:', err.message);
  }
  hideLoader();
};

// ── Admin actions ─────────────────────────────────────────────────────────────
window._approveInsight = async function (id) {
  if (SESSION?.role !== 'admin') return;

  const ins = _insights.find(i => i.id === id);
  if (!ins) return;

  showLoader('Adding to manifest…');
  try {
    // 1. Update insight status
    await patchInsight(id, { status: 'approved' });
    ins.status = 'approved';

    // 2. Create manifest entry via manifest.js
    const { addManifestEntryFromInsight } = await import('./manifest.js');
    await addManifestEntryFromInsight(ins);

    renderInsights();
    updateBadges({ insights: _insights.length });
  } catch (err) {
    alert('Failed to approve insight: ' + err.message);
    console.error('[Insights] approveInsight error:', err.message);
  }
  hideLoader();
};

window._rejectInsight = async function (id) {
  if (SESSION?.role !== 'admin') return;
  try {
    await patchInsight(id, { status: 'rejected' });
    const ins = _insights.find(i => i.id === id);
    if (ins) ins.status = 'rejected';
    renderInsights();
  } catch (err) {
    alert('Failed to reject insight: ' + err.message);
    console.error('[Insights] rejectInsight error:', err.message);
  }
};

window._deleteInsight = async function (id) {
  if (SESSION?.role !== 'admin') return;
  if (!confirm('Delete this insight permanently? This cannot be undone.')) return;
  showLoader('Deleting…');
  try {
    await deleteInsight(id);
    _insights = _insights.filter(i => i.id !== id);
    renderInsights();
    updateBadges({ insights: _insights.length });
  } catch (err) {
    alert('Failed to delete insight: ' + err.message);
    console.error('[Insights] deleteInsight error:', err.message);
  }
  hideLoader();
};

// Wire global handlers
window.submitInsight  = submitInsight;
window.filterInsights = filterInsights;
