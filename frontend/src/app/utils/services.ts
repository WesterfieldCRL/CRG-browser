// src/app/utils/services.ts
// Canonical, client-safe service layer with one set of exports.
// Make sure there are NO duplicate exports in this file.

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/$/, '');

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

/** ===== Project A–style helpers (names used throughout your code) ===== **/

/** Fetch all gene names */
export async function fetchGenes() {
  // Adjust this path if your backend route differs
  return fetchJSON(`/genes/names`);
}

/** Fetch all species names */
export async function fetchSpecies() {
  // Adjust this path if your backend route differs
  return fetchJSON(`/species/names`);
}

/** Fetch one sequence by gene/species */
export async function fetchSequence(geneName: string, speciesName: string) {
  const qs = `gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}`;
  // Adjust endpoint if your backend differs
  return fetchJSON(`/sequences/sequence/?${qs}`);
}

/** Fetch condensed sequences by gene (used by IterativeZoom) */
export async function fetchCondensedSequences(geneName: string) {
  // GET /sequences/condensed_sequences/?gene_name=...
  const qs = `gene_name=${encodeURIComponent(geneName)}`;
  return fetchJSON(`/sequences/condensed_sequences/?${qs}`);
}

/** Fetch condensed sequences for a specific range (used by IterativeZoom) */
export async function fetchCondensedSequencesInRange(
  geneName: string,
  start: number,
  end: number
) {
  // GET /sequences/condensed_sequences_range?gene_name=...&start=...&end=...
  const qs = `gene_name=${encodeURIComponent(geneName)}&start=${start}&end=${end}`;
  return fetchJSON(`/sequences/condensed_sequences_range?${qs}`);
}

/** Fetch regulatory element lines for a gene (used by reg_comparison) */
export async function fetchRegulatoryElementLines(geneName: string) {
  const qs = `gene_name=${encodeURIComponent(geneName)}`;
  // Adjust endpoint if needed
  return fetchJSON(`/elements/regulatory_line_elements/?${qs}`);
}

/** ===== Optional newer wrappers (keep names different to avoid conflicts) ===== **/

export async function fetchSpeciesList() {
  return fetchJSON(`/species`);
}

export async function fetchGeneSequence(params: { species: string; gene: string }) {
  const { species, gene } = params;
  const qs = `species=${encodeURIComponent(species)}&gene=${encodeURIComponent(gene)}`;
  return fetchJSON(`/sequence?${qs}`);
}
