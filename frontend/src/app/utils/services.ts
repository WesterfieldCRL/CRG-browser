// src/app/utils/services.ts
// Canonical, client-safe service layer with one set of exports.
// Make sure there are NO duplicate exports in this file.

// Always use /api to go through Next.js proxy (not direct to backend:8000)
const API_BASE = "/api";

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
      cache: "no-store",
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

/** Get assembly for a species */
export async function fetchAssembly(species: string) {
  return fetchJSON(`/species/assemblies?species_name=${encodeURIComponent(species)}`);
}

export async function fetchSequenceNums(geneName: string, speciesName: string) {
  return fetchJSON(`/sequences/sequence_coordinate?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}`);
}

export async function fetchGeneNums(geneName: string, speciesName: string) {
  return fetchJSON(`/sequences/genomic_coordinate?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}`);
}

export async function fetchEnhPromBars(geneName: string, speciesName: string, elementTypes: string[], start: number, end: number) {
  const params = new URLSearchParams({
    gene_name: geneName,
    species_name: speciesName,
    start: start.toString(),
    end: end.toString()
  });
  return fetchJSON(`/elements/mapped_Enh_Prom?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(elementTypes)
  });
}

export async function fetchTFBSBars(geneName: string, speciesName: string, elementTypes: string[], start: number, end: number) {
  const params = new URLSearchParams({
    gene_name: geneName,
    species_name: speciesName,
    start: start.toString(),
    end: end.toString()
  });
  return fetchJSON(`/elements/mapped_TFBS?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(elementTypes)
  });
}

export async function fetchVariantBars(geneName: string, speciesName: string, variantTypes: string[], start: number, end: number) {
  const params = new URLSearchParams({
    gene_name: geneName,
    species_name: speciesName,
    start: start.toString(),
    end: end.toString()
  });
  return fetchJSON(`/elements/mapped_Variants?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variantTypes)
  });
}

export async function fetchNucleotides(geneName: string, speciesName: string, start: number, end: number) {
  return fetchJSON(`/sequences/range?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}&start=${start}&end=${end}`);
}

export async function fetchVariantPositions(geneName: string, speciesName: string, variantTypes: string[], start: number, end: number) {
  const params = new URLSearchParams({
    gene_name: geneName,
    species_name: speciesName,
    start: start.toString(),
    end: end.toString()
  });
  variantTypes.forEach(type => params.append('variant_types', type));
  return fetchJSON(`/elements/filtered_variants?${params}`);
}

export async function fetchTFBS(geneName: string) {
  return fetchJSON(`/elements/all_TFBS?gene_name=${encodeURIComponent(geneName)}`);
}

export async function fetchVariants(geneName: string) {
  return fetchJSON(`/elements/all_variants?gene_name=${encodeURIComponent(geneName)}`);
}

export async function fetchVariantsDict(geneName: string, speciesName: string, variantsList: string[]) {
  const params = new URLSearchParams({
    gene_name: geneName,
    species_name: speciesName
  });
  return fetchJSON(`/elements/variants_dict?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variantsList)
  });
}

export async function fetchAllVariantPositions(geneName: string, speciesName: string) {
  return fetchJSON(`/variants/positions?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}`);
}

export async function fetchNucleotideBar(geneName: string, speciesName: string, start: number, end: number, showLetters: boolean) {
  return fetchJSON(`/sequences/mapped_nucleotides?gene_name=${encodeURIComponent(geneName)}&species_name=${encodeURIComponent(speciesName)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&show_letters=${encodeURIComponent(showLetters)}`);
} 



/**
 * Generates a color mapping for TFBS names
 * @param tfbsNames Array of TFBS names to generate colors for
 * @returns Object mapping TFBS names to hex color codes
 */
export function generateTFBSColorMap(tfbsNames: string[]): { [key: string]: string } {
  const colorMap: { [key: string]: string } = {};
  
  // Predefined color palette - you can modify these colors as needed
  const baseColors = [
    '#fc0303',
    '#fca903',
    '#e7fc03',
    '#2dfc03',
    '#03fcce',
    '#0356fc',
    '#b503fc',
    '#fc0380',
    '#f7b2b2',
    '#f7ecb2',
    '#c8f7b2',
    '#b2f7de',
    '#b2d8f7',
    '#c6b2f7',
    '#f8abff',
    '#869c9b',
  ];

  tfbsNames.forEach((name, index) => {
    // If we have more TFBS than colors, cycle through the colors
    const colorIndex = index % baseColors.length;
    colorMap[name] = baseColors[colorIndex];
  });

  return colorMap;
}
