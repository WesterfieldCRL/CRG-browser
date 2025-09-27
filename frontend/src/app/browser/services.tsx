// services.tsx
// This module centralizes all API calls to the FastAPI backend
// It makes frontend code cleaner by keeping fetch logic in one place

// Base URL for your backend API - update if running on different hostname or port
const API_BASE_URL = "http://localhost:8000";

/**
 * Fetch all genes optionally filtered by species
 * @param species Optional species string (e.g. "Homo sapiens")
 * @returns Promise resolving to array of gene objects
 */
export async function fetchGenes(species?: string) {
  let url = `${API_BASE_URL}/genes/`;
  if (species) {
    url += `?species=${encodeURIComponent(species)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch genes: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch a single gene by gene ID
 * @param geneId Unique gene identifier
 * @returns Promise resolving to gene object
 */
export async function fetchGeneById(geneId: string) {
  const url = `${API_BASE_URL}/genes/${encodeURIComponent(geneId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gene not found: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch regulatory elements optionally filtered by species or element type
 * @param species Optional species name
 * @param elementType Optional regulatory element type (e.g., "enhancer")
 * @returns Promise resolving to array of regulatory elements
 */
export async function fetchRegulatoryElements(species?: string, elementType?: string) {
  let url = `${API_BASE_URL}/regulatory_elements/`;
  const params = new URLSearchParams();
  if (species) params.append("species", species);
  if (elementType) params.append("element_type", elementType);
  if ([...params].length > 0) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch regulatory elements: ${res.statusText}`);
  return res.json();
}

/**
 * Fetch SNPs optionally filtered by species or gene ID
 * @param species Optional species name
 * @param geneId Optional gene ID to filter SNPs within a gene
 * @returns Promise resolving to array of SNPs
 */
export async function fetchSNPs(species?: string, geneId?: string) {
  let url = `${API_BASE_URL}/snps/`;
  const params = new URLSearchParams();
  if (species) params.append("species", species);
  if (geneId) params.append("gene_id", geneId);
  if ([...params].length > 0) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch SNPs: ${res.statusText}`);
  return res.json();
}

/**
 * Insert a new gene record into the backend database
 * @param gene Gene object matching backend expected schema
 * @returns Result status from backend
 */
export async function insertGene(gene: {
  gene_id: string;
  species: string;
  human_gene_name: string;
  chromosome: number;
  start_position: number;
  end_position: number;
  aligned_sequence?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/genes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gene),
  });
  if (!res.ok) throw new Error(`Failed to insert gene: ${res.statusText}`);
  return res.json();
}

/**
 * Insert a new SNP record
 * @param snp SNP object matching backend schema
 * @returns Result status from backend
 */
export async function insertSNP(snp: {
  snp_id: string;
  species: string;
  chromosome: number;
  position: number;
  reference_allele: string;
  alternate_allele: string;
  consequence?: string;
  gene_id?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/snps/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snp),
  });
  if (!res.ok) throw new Error(`Failed to insert SNP: ${res.statusText}`);
  return res.json();
}

/**
 * Insert a new regulatory element record
 * @param element Regulatory element matching backend schema
 * @returns Result status from backend
 */
export async function insertRegulatoryElement(element: {
  species: string;
  chromosome: number;
  start_position: number;
  end_position: number;
  element_type: string;
  description?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/regulatory_elements/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(element),
  });
  if (!res.ok) throw new Error(`Failed to insert regulatory element: ${res.statusText}`);
  return res.json();
}
