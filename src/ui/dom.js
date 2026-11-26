// Small DOM helpers shared by every view.
import { safeUrl } from '../services/resources.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escape text before putting it into an HTML string. Use for ALL data. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Green / amber / coral for a 0–100 score. */
export const scoreColor = (pct) => (pct >= 70 ? 'var(--ok)' : pct >= 40 ? 'var(--amber)' : 'var(--coral)');

export const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/** A clickable resource card (opens in a new tab). */
export const linkCard = (l) =>
  `<a class="res-card" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">
     <span class="res-badge" style="background:${esc(l.color || '#4d615a')}">${esc(l.badge || '↗')}</span>
     <span><b>${esc(l.label)}</b><small>${esc(l.provider)} ↗</small></span>
   </a>`;

/** A small pill link (used inside video slides and study cards). */
export const linkPill = (l) =>
  `<a class="pill-link" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer" title="${esc(l.provider)}">${esc(l.label)} ↗</a>`;

export async function copyText(btn, text) {
  const label = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied ✓'; } catch { btn.textContent = 'Copy blocked'; }
  setTimeout(() => (btn.textContent = label), 1800);
}
