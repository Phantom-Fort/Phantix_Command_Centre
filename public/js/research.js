// public/js/research.js
// Research tracker — reading list with per-user read/unread state.
// State persisted server-side under each user's Firestore sub-document.

import { getState, setState } from './api.js';
import { BOOKS }              from './data.js';
import { qs, setW, showLoader, hideLoader } from './app.js';

let _booksRead = {};   // key: "sectionIndex-bookIndex" → true/false

// Load reading state (called at boot via getState)
export function initResearch(stateObj) {
  _booksRead = stateObj?.booksRead || {};
}

export function renderResearch() {
  const grid = document.getElementById('reading-grid');
  if (!grid) return;

  let total = 0;
  let read  = 0;

  grid.innerHTML = BOOKS.map((section, si) => {
    total += section.books.length;

    const rows = section.books.map((book, bi) => {
      const key    = `${si}-${bi}`;
      const isRead = !!_booksRead[key];
      if (isRead) read++;

      return `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;
          border-bottom:1px solid var(--border2);cursor:pointer"
          onclick="window._toggleBook('${key}')">
          <div style="width:14px;height:14px;border-radius:3px;flex-shrink:0;margin-top:1px;
            display:flex;align-items:center;justify-content:center;
            border:1.5px solid ${isRead ? 'var(--success)' : 'var(--muted)'};
            background:${isRead ? 'var(--success)' : 'transparent'};transition:all 0.15s">
            ${isRead ? '<span style="color:white;font-size:8px;font-weight:700">✓</span>' : ''}
          </div>
          <div>
            <div style="font-size:12px;color:${isRead ? 'var(--muted)' : 'var(--silver)'};
              ${isRead ? 'text-decoration:line-through' : ''};line-height:1.4">${book.t}</div>
            <div style="font-size:10px;color:var(--muted);margin-top:1px">${book.a}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:13px">
        <div style="font-size:9px;letter-spacing:0.15em;color:var(--cyan);
          font-family:var(--fm);text-transform:uppercase;margin-bottom:9px">
          ${section.phase}
        </div>
        ${rows}
      </div>`;
  }).join('');

  // Update summary KPIs
  qs('books-read',  read);
  qs('books-total', total);
  const pct = total ? Math.round((read / total) * 100) : 0;
  qs('books-pct', pct + '%');
  setW('books-bar', pct);
}

window._toggleBook = async function (key) {
  _booksRead[key] = !_booksRead[key];
  renderResearch();   // optimistic update
  try {
    await setState('booksRead', _booksRead);
  } catch (err) {
    // Revert on failure
    _booksRead[key] = !_booksRead[key];
    renderResearch();
    console.error('[Research] toggleBook save failed:', err.message);
  }
};
