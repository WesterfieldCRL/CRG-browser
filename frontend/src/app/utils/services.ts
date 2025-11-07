// src/app/utils/services.ts
// Canonical, client-safe service layer with one set of exports.
// Make sure there are NO duplicate exports in this file.

// Always use /api to go through Next.js proxy (not direct to backend:8000)
const API_BASE = '/api';

// Small JSON fetch with timeout + retry
async function fetchJSON(
  path: string,
  init: RequestInit = {},
  tries = 2,
  timeoutMs = 10000
) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (tries > 0) return fetchJSON(path, init, tries - 1, timeoutMs);
    throw err;
  }
}

/** Fetch all gene names */
export async function fetchGenes() {
  return fetchJSON(`/genes/names`);
}

/** Fetch all species names */
export async function fetchSpecies() {
  return fetchJSON(`/species/names`);
}
