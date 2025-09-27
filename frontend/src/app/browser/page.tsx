// page.tsx
// Fully updated React functional component for Genome Browser
// Uses TypeScript, hooks, and calls backend via services.tsx
// Displays selectable genes and paginated aligned DNA sequences
// Includes tooltips to show conservation info on nucleotide hover

"use client";

import React, { useState, useEffect } from "react";
import { fetchGenes } from "../browser/services"; // API calls centrally managed here

// Species list and display mapping (could eventually come from backend)
const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];
const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

export default function Page() {
  // State for the currently selected gene symbol
  const [selectedGene, setSelectedGene] = useState<string | null>(null);

  // Map species → aligned DNA sequence string for selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({});

  // List of all human gene names (for dropdown)
  const [allGenes, setAllGenes] = useState<string[]>([]);

  // Loading and error states for feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination: current page and nucleotides shown per page
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);

  // Tooltip info to show on nucleotide hover
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Fetch all genes (human species) once on component mount
  useEffect(() => {
    async function loadGenes() {
      try {
        setLoading(true);
        const genes = (await fetchGenes("Homo sapiens")) as Array<{
          human_gene_name: string;
        }>;

        // Extract unique human gene names and sort alphabetically
        const geneNames = Array.from(
          new Set(genes.map((g) => g.human_gene_name))
        ).sort();

        setAllGenes(geneNames);

        // Default to first gene if available
        if (geneNames.length > 0) setSelectedGene(geneNames[0]);

        setLoading(false);
      } catch {
        setError("Failed to load gene list");
        setLoading(false);
      }
    }
    loadGenes();
  }, []);

  // Fetch sequences for all species whenever selectedGene changes
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
          // Find gene matching selected human gene name in this species
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

  // Calculate max sequence length to determine number of pages
  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  // Render nucleotide spans with conservation/difference highlights & tooltip
  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, i) => {
      const absIndex = start + i + 1;

      // Get bases at this position across species, filtering non-empty
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + i])
        .filter(Boolean);

      // Check if base is conserved (all same)
      const conserved =
        basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);

      const className = "nucleotide " + (conserved ? "conserved" : "divergent");
      const tooltipText = conserved
        ? `Conserved | Position ${absIndex} | Base: ${base}`
        : `Divergent | Position ${absIndex} | Base: ${base}`;

      return (
        <span
          key={absIndex}
          className={className}
          onMouseMove={(e) =>
            setTooltip({ text: tooltipText, x: e.pageX + 12, y: e.pageY + 12 })
          }
          onMouseLeave={() => setTooltip(null)}
        >
          {base}
        </span>
      );
    });
  }

  return (
    <main>
      {/* Global styles */}
      <style>{`
        body, main {
          margin: 0; padding: 0;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background: #f6f9fc; color: #1c1c1c;
          display: flex; flex-direction: column; align-items: center;
          min-height: 100vh; padding: 20px;
        }
        h1 {
          margin-bottom: 20px;
          font-weight: 700;
          font-size: 2rem;
          color: #123c7c;
        }
        .controls {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        select, button {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          font-size: 16px;
        }
        button {
          background: #123c7c;
          color: white;
          cursor: pointer;
          transition: 0.2s;
          font-weight: 600;
        }
        button:hover:not(:disabled) {
          background: #0d2a55;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .container-box {
          width: 100%;
          max-width: 900px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
          padding: 20px;
        }
        .species-row {
          margin-bottom: 22px;
        }
        .species-label {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 1rem;
          color: #123c7c;
        }
        .sequence-row {
          display: flex;
          flex-direction: row;
          white-space: nowrap;
          font-family: monospace;
          font-size: 1.1rem;
        }
        .nucleotide {
          display: inline-block;
          width: 16px;
          text-align: center;
          padding: 2px 0;
          border-radius: 3px;
          user-select: none;
        }
        .conserved {
          background: #d9ebff;
          color: #003f87;
        }
        .divergent {
          background: #ffdad9;
          color: #a10000;
        }
        .tooltip {
          position: fixed;
          background: #123c7c;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          pointer-events: none;
          font-size: 0.9rem;
          white-space: nowrap;
          z-index: 1000;
        }
      `}</style>

      {/* Page Title */}
      <h1>Genome Browser</h1>

      {/* Gene Selection */}
      <div className="controls">
        <label htmlFor="geneSelect">Select Gene:</label>
        <select
          id="geneSelect"
          disabled={loading || allGenes.length === 0}
          value={selectedGene ?? ""}
          onChange={(e) => setSelectedGene(e.target.value)}
        >
          {allGenes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Loading and error indicators */}
      {loading && <div>Loading sequences...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Sequence display */}
      <div className="container-box">
        {Object.keys(sequences).length === 0 && !loading && (
          <p>Select a gene to view sequences.</p>
        )}

        {Object.entries(sequences).map(([species, seq]) => {
          const start = pageIndex * pageSize;
          const end = Math.min(seq.length, (pageIndex + 1) * pageSize);
          const segment = Array.from(seq.slice(start, end));

          return (
            <div className="species-row" key={species}>
              <div className="species-label">
                {speciesDisplay[species] ?? species} (Gene length: {seq.length} nucleotides)
              </div>
              <div className="sequence-row">{renderNucleotides(segment, start)}</div>
            </div>
          );
        })}

        {/* Pagination controls */}
        <div className="controls">
          <button
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((idx) => Math.max(0, idx - 1))}
          >
            Previous
          </button>
          <span>
            Page {pageIndex + 1} of {totalPages}
          </span>
          <button
            disabled={pageIndex + 1 >= totalPages}
            onClick={() => setPageIndex((idx) => Math.min(totalPages - 1, idx + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="tooltip" style={{ top: tooltip.y, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}
    </main>
  );
}
