// page.tsx
// Main page component for Genome Browser implemented with React + TypeScript.
// Handles dynamic pagination based on container width and nucleotide width,
// ensures responsive design with no horizontal scrollbars,
// and dynamically adjusts nucleotide letter width with a minimum bound for readability.
// Well-typed, cleanly structured, and thoroughly commented for maintainability.

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactElement,
} from "react";
import { fetchGenes } from "../browser/services";
import PageNavigation from "../components/PageNavigation";
import SequenceViewer from "../components/SequenceViewer";
import Tooltip from "../components/Tooltip";

// Species keys and their user-friendly names for display order control
const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];
const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

// Minimum nucleotide letter width in pixels for readability per requirements
const MIN_NUCLEOTIDE_WIDTH_PX = 30;
// Maximum width to avoid overly large letters on wide viewports (adjustable)
const MAX_NUCLEOTIDE_WIDTH_PX = 50;

/**
 * Main page component rendering genome browser interface.
 * Includes gene selection, sequence display with pagination,
 * and dynamic nucleotide width sizing based on container width.
 */
export default function Page(): ReactElement {
  // State for currently selected gene symbol; null means none selected yet
  const [selectedGene, setSelectedGene] = useState<string | null>(null);

  // Mapping of each species to its aligned DNA sequence for the selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({});

  // List of all available genes fetched initially for dropdown
  const [allGenes, setAllGenes] = useState<string[]>([]);

  // Loading and error states to provide user feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination: zero-based current page index
  const [pageIndex, setPageIndex] = useState<number>(0);

  // Number of nucleotides shown per page; dynamically calculated
  // Start with a default to avoid flicker before measurement
  const [pageSize, setPageSize] = useState<number>(100);

  // Current nucleotide letter width in pixels, starting with minimum bound
  const [nucleotideWidth, setNucleotideWidth] = useState<number>(
    MIN_NUCLEOTIDE_WIDTH_PX
  );

  // Tooltip info for nucleotide hover; null if none shown
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(
    null
  );

  // Reference to the container DOM element to measure width for responsive layout
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to load available human genes once on component mount.
   * Fetches genes asynchronously, populates allGenes, and sets default selected gene.
   */
  useEffect(() => {
    async function loadGenes(): Promise<void> {
      try {
        setLoading(true);
        const genes = (await fetchGenes("Homo sapiens")) as Array<{
          human_gene_name: string;
        }>;

        // Create sorted unique list of gene names
        const geneNames = Array.from(
          new Set(genes.map((g) => g.human_gene_name))
        ).sort();

        setAllGenes(geneNames);

        // Default select the first gene if available
        if (geneNames.length > 0) {
          setSelectedGene(geneNames[0]);
        }
        setLoading(false);
      } catch {
        setError("Failed to load gene list");
        setLoading(false);
      }
    }
    loadGenes();
  }, []);

  /**
   * Effect to load aligned sequences for all species whenever selectedGene changes.
   * Resets pagination to first page.
   */
  useEffect(() => {
    async function loadSequences(): Promise<void> {
      if (!selectedGene) return;
      setLoading(true);
      setError(null);

      try {
        const seqMap: Record<string, string> = {};
        // Fetch aligned sequences per species
        for (const sp of speciesList) {
          const genes = (await fetchGenes(sp)) as Array<{
            human_gene_name: string;
            aligned_sequence: string;
          }>;
          const gene = genes.find((g) => g.human_gene_name === selectedGene);
          seqMap[sp] = gene?.aligned_sequence ?? "";
        }
        setSequences(seqMap);
        setPageIndex(0); // Reset pagination on gene change
        setLoading(false);
      } catch {
        setError("Failed to load sequences");
        setLoading(false);
      }
    }
    loadSequences();
  }, [selectedGene]);

  /**
   * Callback to update nucleotide width and page size dynamically
   * based on the container's client width.
   * Ensures nucleotide width never goes below minimum for readability.
   */
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;

      // Strategy: try to show ~25 nucleotides per row for balanced readability
      let calculatedWidth = Math.floor(containerWidth / 25);

      // Clamp width between minimum and maximum allowed
      if (calculatedWidth < MIN_NUCLEOTIDE_WIDTH_PX)
        calculatedWidth = MIN_NUCLEOTIDE_WIDTH_PX;
      else if (calculatedWidth > MAX_NUCLEOTIDE_WIDTH_PX)
        calculatedWidth = MAX_NUCLEOTIDE_WIDTH_PX;

      setNucleotideWidth(calculatedWidth);

      // Calculate max number of nucleotides fitting horizontally using calculated width
      const maxBases = Math.floor(containerWidth / calculatedWidth);
      const newPageSize = Math.max(1, maxBases);
      setPageSize(newPageSize);
    }
  }, []);

  /**
   * Effect to run dimension update logic on mount and
   * whenever window resizes to maintain responsive layout.
   */
  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Maximum sequence length across all species, or zero if no sequences loaded
  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;

  // Total number of pagination pages based on dynamic page size
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  /**
   * Ensure current pageIndex is clamped when total pages decrease,
   * e.g. when gene changes resulting in shorter sequences.
   */
  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  return (
    <main>
      {/* Main page heading */}
      <h1>Genome Browser</h1>

      {/* Gene selection dropdown */}
      <div className="controls">
        <label htmlFor="gene-select">Select Gene:</label>
        <select
          id="gene-select"
          value={selectedGene ?? ""}
          disabled={loading || allGenes.length === 0}
          onChange={(e) => setSelectedGene(e.target.value)}
          aria-label="Select gene"
        >
          {allGenes.map((gene) => (
            <option key={gene} value={gene}>
              {gene}
            </option>
          ))}
        </select>
      </div>

      {/* Loading and error messages */}
      {loading && <div className="info">Loading sequences...</div>}
      {error && <div className="error">{error}</div>}

      {/* Container box for sequence viewer and pagination */}
      <div
        className="container-box"
        ref={containerRef}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Instruction if no sequences loaded */}
        {Object.keys(sequences).length === 0 && !loading && (
          <p>Select a gene to view aligned DNA sequences.</p>
        )}

        {/* Sequence viewer displays aligned sequences with pagination */}
        <SequenceViewer
          sequences={sequences}
          speciesList={speciesList}
          speciesDisplay={speciesDisplay}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setTooltip={setTooltip}
        />

        {/* Pagination and additional controls */}
        <PageNavigation
          pageIndex={pageIndex}
          totalPages={totalPages}
          setPageIndex={setPageIndex}
          sequences={sequences}
          selectedGene={selectedGene ?? ""}
        />
      </div>

      {/* Tooltip component showing nucleotide info on hover */}
      {tooltip && <Tooltip tooltip={tooltip} />}

      {/* Inline styles for alignment, responsiveness, and accessibility */}
      <style>{`
        main {
          margin: 0;
          padding: 20px;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: #f6f9fc;
          color: #1c1c1c;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
        }
        h1 {
          font-weight: 700;
          font-size: 2rem;
          color: #123c7c;
          margin-bottom: 20px;
        }
        .controls {
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        label {
          font-weight: 600;
          color: #123c7c;
        }
        select {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          font-size: 16px;
          cursor: pointer;
          min-width: 220px;
        }
        select:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        /* Container width fills 90% of viewport width for responsive bases count */
        .container-box {
          width: 90vw;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
          padding: 20px;
          box-sizing: border-box;
        }
        .info {
          font-style: italic;
          color: #555;
          margin-bottom: 20px;
        }
        .error {
          color: red;
          font-weight: 600;
          margin-bottom: 20px;
        }
      `}</style>
    </main>
  );
}
