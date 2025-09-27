// page.tsx
// Main Genome Browser page component in React + TypeScript
// Refactors previously monolithic code into modular, typed, reusable pieces:
// - Uses PageNavigation for pagination and download controls,
// - SequenceViewer to render aligned DNA sequences with conservation highlighting,
// - Tooltip for advanced tooltip display with boundary-aware positioning.
//
// Responsibilities:
// - Manage global state (gene list, selected gene, sequences, pagination, loading, errors, tooltip)
// - Fetch gene list and sequences on mount and gene change
// - Pass props and handlers down to child components
//
// Comments included per professional software engineering best practices

"use client";

import React, { useState, useEffect } from "react";
import { fetchGenes } from "../browser/services";
import PageNavigation from "../components/PageNavigation";
import SequenceViewer from "../components/SequenceViewer";
import Tooltip from "../components/Tooltip";

// Species to display and their display strings
const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];
const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

export default function Page() {
  // State: currently selected gene symbol (human gene name)
  const [selectedGene, setSelectedGene] = useState<string | null>(null);

  // Aligned sequences keyed by species for the selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({});

  // List of all human genes for dropdown population
  const [allGenes, setAllGenes] = useState<string[]>([]);

  // Loading and error states for user feedback/UX
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state: current page index and size (nucleotides per page)
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize] = useState<number>(100); // Fixed page size for now

  // Tooltip state to show info on nucleotide hover
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // On initial mount: fetch all human genes for dropdown list
  useEffect(() => {
    async function loadGenes() {
      try {
        setLoading(true);
        const genesRes = (await fetchGenes("Homo sapiens")) as Array<{
          human_gene_name: string;
        }>;

        // Unique, sorted human gene names from API response
        const uniqueGeneNames = Array.from(
          new Set(genesRes.map((g) => g.human_gene_name))
        ).sort();

        setAllGenes(uniqueGeneNames);

        // Default to first gene if available
        if (uniqueGeneNames.length > 0) {
          setSelectedGene(uniqueGeneNames[0]);
        }

        setLoading(false);
      } catch (e) {
        setError("Failed to load gene list");
        setLoading(false);
      }
    }
    loadGenes();
  }, []);

  // When selectedGene changes: fetch aligned sequences for all species
  useEffect(() => {
    async function loadSequences() {
      if (!selectedGene) return;
      setLoading(true);
      setError(null);

      try {
        const seqMap: Record<string, string> = {};
        for (const sp of speciesList) {
          // Fetch all genes for species
          const genes = (await fetchGenes(sp)) as Array<{
            human_gene_name: string;
            aligned_sequence: string;
          }>;

          // Find gene matching the same human gene name
          const gene = genes.find((g) => g.human_gene_name === selectedGene);
          seqMap[sp] = gene?.aligned_sequence ?? "";
        }

        setSequences(seqMap);
        setPageIndex(0); // Reset pagination to first page on gene change
        setLoading(false);
      } catch (e) {
        setError("Failed to load sequences");
        setLoading(false);
      }
    }
    loadSequences();
  }, [selectedGene]);

  // Calculate maximum sequence length across species to determine pages
  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  return (
    <main>
      {/* Page heading */}
      <h1>Genome Browser</h1>

      {/* Gene selection dropdown */}
      <div className="controls">
        <label htmlFor="gene-select">Select Gene:</label>
        <select
          id="gene-select"
          disabled={loading || allGenes.length === 0}
          value={selectedGene ?? ""}
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

      {/* Display loading or error feedback */}
      {loading && <div className="info">Loading sequences...</div>}
      {error && <div className="error">{error}</div>}

      {/* Sequence viewer container */}
      <div className="container-box" aria-live="polite">
        {/* Instruction for empty state */}
        {Object.keys(sequences).length === 0 && !loading && (
          <p>Please select a gene to view aligned DNA sequences.</p>
        )}

        {/* SequenceViewer renders sequences with conservation coloring + tooltips */}
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

      {/* Tooltip displayed when hovering nucleotides */}
      {tooltip && <Tooltip tooltip={tooltip} />}

      {/* Styled components for layout and UI */}
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
        .container-box {
          width: 100%;
          max-width: 900px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
          padding: 20px;
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
