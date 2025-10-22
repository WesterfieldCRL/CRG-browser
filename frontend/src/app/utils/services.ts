const API_BASE_URL = "http://localhost:8000";

/**
 * Fetch all genes
 * @returns Promise resolving to array of gene objects
 */
export async function fetchGenes() {
  let url = `${API_BASE_URL}/genes/names`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch genes: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch all species
 */
export async function fetchSpecies() {
  let url = `${API_BASE_URL}/species/names`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch genes: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch a sequence for a given gene and species
 */

export async function fetchSequence(geneName: string, speciesName: string) {
  const res = await fetch(`${API_BASE_URL}/sequences/sequence/?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}`);
  if (!res.ok) throw new Error(`Failed to fetch sequences: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch a condensed array of sequences keyed by species for a given gene name
 */
export async function fetchCondensedSequences(geneName: string) {
  const res = await fetch(`${API_BASE_URL}/sequences/condensed_sequences/?gene_name=${encodeURIComponent(geneName)}`);
  if (!res.ok) throw new Error(`Failed to fetch sequences: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch condensed sequences for a specific range
 */
export async function fetchCondensedSequencesInRange(geneName: string, start: number, end: number) {
  const res = await fetch(`${API_BASE_URL}/sequences/condensed_sequences_range?gene_name=${encodeURIComponent(geneName)}&start=${start}&end=${end}`);
  if (!res.ok) throw new Error(`Failed to fetch sequences in range: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch lines for selected gene
 */
export async function fetchRegulatoryELementLines(geneName: string) {
  const res = await fetch(`${API_BASE_URL}/elements/regulatory_line_elements/?gene_name=${encodeURIComponent(geneName)}`);
  if (!res.ok) throw new Error(`Failed to fetch regulatory element lines: ${res.statusText}`);
  return res.json();
}