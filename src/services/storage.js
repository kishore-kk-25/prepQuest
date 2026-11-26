// Saves test sessions ("plans") in the browser so people can come back
// to their results and roadmap progress. Everything is wrapped in try/catch
// because browser storage can be missing or blocked.
import { CONFIG } from '../config.js';

const KEY = `${CONFIG.storageKey}-plans`;

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeAll(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, CONFIG.maxSavedPlans))); } catch { /* storage full or blocked */ }
}

export const listPlans = () => readAll();
export const getPlan = (id) => readAll().find((p) => p.id === id) || null;

export function savePlan(plan) {
  const list = readAll().filter((p) => p.id !== plan.id);
  list.unshift({ ...plan, updatedAt: Date.now() });
  writeAll(list);
}

export function deletePlan(id) {
  writeAll(readAll().filter((p) => p.id !== id));
}
