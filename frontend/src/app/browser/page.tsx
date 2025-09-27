// page.tsx
// Main page component for Genome Browser in React + TypeScript,
// implementing dynamic pagination based on container width and nucleotide width,
// avoiding horizontal scrollbars via responsive design.

// Imports
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchGenes } from "../browser/services";
import PageNavigation from "../components/PageNavigation";
import SequenceViewer from "../components/SequenceViewer";
import Tooltip from "../components/Tooltip";

// Species to display and their display names
const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];
const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

// Fixed width (in pixels) of a single nucleotide block rendered in SequenceViewer
const NUCLEOTIDE_WIDTH_PX = 18;

export default function Page() {
  // --------------------
  // State Declarations
  // --------------------

  // Selected gene symbol (human gene)
  const [selectedGene, setSelectedGene] = useState<string | null>(null);

  // Aligned sequences per species for selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({});

  // Available human genes for dropdown selection
  const [allGenes, setAllGenes] = useState<string[]>([]);

  // Loading and error states for user feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination: current page index (zero-based)
  const [pageIndex, setPageIndex] = useState<number>(0);

  // Pagination: number of nucleotides per page, dynamically calculated
  const [pageSize, setPageSize] = useState<number>(100); // default before measurement

  // Tooltip info shown on nucleotide hover
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Ref for container DOM element to measure available width
  const containerRef = useRef<HTMLDivElement>(null);

  // --------------------
  // Effects and Callbacks
  // --------------------

  // Fetch all human genes once on mount for gene selection
  useEffect(() => {
    async function loadGenes() {
      try {
        setLoading(true);
        const genes = (await fetchGenes("Homo sapiens")) as Array<{
          human_gene_name: string;
        }>;

        // Extract unique, sorted gene names
        const geneNames = Array.from(
          new Set(genes.map((g) => g.human_gene_name))
        ).sort();

        setAllGenes(geneNames);

        // Default select first gene if available
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

  // Fetch aligned sequences for all species whenever selectedGene changes
  useEffect(() => {
    async function loadSequences() {
      if (!selectedGene) return;
      setLoading(true);
      setError(null);

      try {
        const seqMap: Record<string, string> = {};
        for (const sp of speciesList) {
          const genes = (await fetchGenes(sp)) as Array<{
            human_gene_name: string;
            aligned_sequence: string;
          }>;
          const gene = genes.find((g) => g.human_gene_name === selectedGene);
          seqMap[sp] = gene?.aligned_sequence ?? "";
        }
        setSequences(seqMap);
        setPageIndex(0); // Reset page on gene change
        setLoading(false);
      } catch {
        setError("Failed to load sequences");
        setLoading(false);
      }
    }
    loadSequences();
  }, [selectedGene]);

  // Handler to update pageSize based on container width and nucleotide width
  const updatePageSize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;

      // Number of nucleotides that fit horizontally without overflow;
      // floor to avoid clipping partially visible bases.
      const maxBases = Math.floor(containerWidth / NUCLEOTIDE_WIDTH_PX);

      // Ensure at least one base per page
      const newPageSize = Math.max(1, maxBases);

      setPageSize(newPageSize);
    }
  }, []);

  // Update pageSize on mount and whenever window size changes
  useEffect(() => {
    updatePageSize(); // Initial call on mount

    window.addEventListener("resize", updatePageSize);
    return () => window.removeEventListener("resize", updatePageSize);
  }, [updatePageSize]);

  // Calculate max sequence length for pagination bounds
  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;

  // Calculate total pages based on dynamic pageSize
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  // Clamp 'pageIndex' if totalPages decreases
  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  // --------------------
  // JSX Render
  // --------------------
  return (
    <main>
      {/* Page Title */}
      <h1>Genome Browser</h1>

      {/* Gene Selection Controls */}
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

      {/* Status Messages */}
      {loading && <div className="info">Loading sequences...</div>}
      {error && <div className="error">{error}</div>}

      {/* Container box fills 90% viewport width for responsive layout */}
      <div
        className="container-box"
        ref={containerRef}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Instructions when no sequences available */}
        {Object.keys(sequences).length === 0 && !loading && (
          <p>Select a gene to view aligned DNA sequences.</p>
        )}

        {/* Sequence display */}
        <SequenceViewer
          sequences={sequences}
          speciesList={speciesList}
          speciesDisplay={speciesDisplay}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setTooltip={setTooltip}
        />

        {/* Pagination and download controls */}
        <PageNavigation
          pageIndex={pageIndex}
          totalPages={totalPages}
          setPageIndex={setPageIndex}
          sequences={sequences}
          selectedGene={selectedGene ?? ""}
        />
      </div>

      {/* Tooltip displayed on nucleotide hover */}
      {tooltip && <Tooltip tooltip={tooltip} />}

      {/* Inline styles and layout */}
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
