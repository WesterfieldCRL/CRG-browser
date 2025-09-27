"use client"; // Next.js directive: ensures this component is rendered on the client side.

import React, { useState, useEffect, useRef, useCallback, ReactElement } from "react";
import { fetchGenes } from "../browser/services"; // Service call for fetching gene data
import PageNavigation from "../components/PageNavigation"; // Component to handle pagination UI & logic
import SequenceViewer from "../components/SequenceViewer"; // Component for rendering DNA sequence alignments
import Tooltip from "../components/Tooltip"; // Component for showing contextual tooltips

// Supported species for alignment view.
// This could easily be extended for new organisms if data became available.
const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];

// Mapping species names for display in the UI.
// Explicit mapping allows for customization beyond raw names if needed.
const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

// Constants controlling how wide each nucleotide character should appear (in pixels).
// Constrains scaling when the viewport is resized.
const MIN_NUCLEOTIDE_WIDTH_PX = 30;
const MAX_NUCLEOTIDE_WIDTH_PX = 50;
const NUCLEOTIDE_GAP_PX = 1; // Gap (spacing) between bases

// Type for gene list API response.
interface GeneListItem {
  human_gene_name: string;
}

// Type for sequence list API response.
interface SequenceItem {
  human_gene_name: string;
  aligned_sequence: string; // The actual DNA string aligned against human
}

// State shape for tooltip data (dynamic text & coordinates).
interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function Page(): ReactElement {
  // Core state
  const [selectedGene, setSelectedGene] = useState<string | null>(null); // Currently selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({}); // Mapping of species -> DNA sequence
  const [allGenes, setAllGenes] = useState<string[]>([]); // Global list of genes available
  const [loading, setLoading] = useState<boolean>(false); // API activity flag
  const [error, setError] = useState<string | null>(null); // Used for showing API error states
  const [pageIndex, setPageIndex] = useState<number>(0); // Pagination index (what chunk of sequence user is on)
  const [pageSize, setPageSize] = useState<number>(100); // Number of bases shown per page
  const [nucleotideWidth, setNucleotideWidth] = useState<number>(MIN_NUCLEOTIDE_WIDTH_PX); // Current calculated nucleotide width
  const [tooltip, setTooltip] = useState<TooltipState | null>(null); // Tooltip state container
  const containerRef = useRef<HTMLDivElement>(null); // Ref to main container (used for responsive calculations)

  // On mount: load available "Homo sapiens" gene list.
  useEffect(() => {
    async function loadGenes(): Promise<void> {
      try {
        setLoading(true);
        const geneList = (await fetchGenes("Homo sapiens")) as GeneListItem[];
        
        // Deduplicate and sort gene names alphabetically
        const geneNames = Array.from(new Set(geneList.map((g) => g.human_gene_name))).sort();
        
        setAllGenes(geneNames);
        // Default selection = first gene in sorted list
        if (geneNames.length > 0) setSelectedGene(geneNames[0]);
        setLoading(false);
      } catch {
        // Handle error at UI level
        setError("Failed to load gene list");
        setLoading(false);
      }
    }
    loadGenes();
  }, []);

  // Whenever selectedGene changes: reload aligned sequences for each species.
  useEffect(() => {
    async function loadSequences(): Promise<void> {
      if (!selectedGene) return; // Guard condition if user hasn't chosen yet
      
      setLoading(true);
      setError(null);
      try {
        const seqMap: Record<string, string> = {};

        // Pull out sequences for every species in speciesList
        for (const sp of speciesList) {
          const geneSequences = (await fetchGenes(sp)) as SequenceItem[];
          
          // Try to find the sequence matching the currently selected human gene
          const matched = geneSequences.find((g) => g.human_gene_name === selectedGene);
          seqMap[sp] = matched?.aligned_sequence ?? ""; // fallback to empty string if missing
        }

        setSequences(seqMap);
        setPageIndex(0); // Reset pagination to beginning for each gene load
        setLoading(false);
      } catch {
        setError("Failed to load sequences");
        setLoading(false);
      }
    }
    loadSequences();
  }, [selectedGene]);

  // Calculates optimal nucleotide scaling based on container width.
  // Keeps consistent sizing when viewport resizes.
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;

    // Rough estimate: try to fit ~25 bases
    let calculatedWidth = Math.floor(containerWidth / 25);

    // Clamp into allowed min/max pixel widths
    if (calculatedWidth < MIN_NUCLEOTIDE_WIDTH_PX) {
      calculatedWidth = MIN_NUCLEOTIDE_WIDTH_PX;
    } else if (calculatedWidth > MAX_NUCLEOTIDE_WIDTH_PX) {
      calculatedWidth = MAX_NUCLEOTIDE_WIDTH_PX;
    }

    // Calculate how many bases can fit in current container width, accounting for gap
    const maxBases = Math.floor((containerWidth + NUCLEOTIDE_GAP_PX) / (calculatedWidth + NUCLEOTIDE_GAP_PX));

    // Adjust width so that bases neatly fit into available pixels with gaps
    const adjustedWidth = Math.floor((containerWidth - (maxBases - 1) * NUCLEOTIDE_GAP_PX) / maxBases) * 0.9;

    setNucleotideWidth(adjustedWidth);
    setPageSize(Math.max(1, maxBases)); // At least 1 base should always fit
  }, []);

  // Run dimension updater initially and listen for browser resize events
  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Compute max DNA sequence length across all species for pagination.
  const maxLength = Math.max(...Object.values(sequences).map((seq) => seq.length), 0);

  // Ensure at least 1 page exists to avoid rendering edge cases.
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  // Bounds check: if the current pageIndex overshoots totalPages, adjust it.
  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  return (
    <main>
      <h1>Genome Browser</h1>
      
      {/* Dropdown selector for choosing a gene */}
      <div className="controls">
        <label htmlFor="gene-select">Select Gene:</label>
        <select
          id="gene-select"
          value={selectedGene ?? allGenes[0] ?? ""}
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

      {/* User feedback states */}
      {loading && <div className="info">Loading data...</div>}
      {error && <div className="error">{error}</div>}

      {/* Container for sequence viewer & page navigation */}
      <div className="container-box" ref={containerRef} aria-live="polite" aria-atomic="true">
        {Object.keys(sequences).length === 0 && !loading && (
          <p>Select a gene to view aligned DNA sequences.</p>
        )}

        {/* Main DNA sequence viewer */}
        <SequenceViewer
          sequences={sequences}
          speciesList={speciesList}
          speciesDisplay={speciesDisplay}
          pageIndex={pageIndex}
          pageSize={pageSize}
          nucleotideWidth={nucleotideWidth}
          setTooltip={setTooltip} // Mouse hover information
        />

        {/* Pagination controls */}
        <PageNavigation
          pageIndex={pageIndex}
          totalPages={totalPages}
          setPageIndex={setPageIndex}
          sequences={sequences}
          selectedGene={selectedGene ?? ""}
        />
      </div>

      {/* Conditional tooltip rendering */}
      {tooltip && <Tooltip tooltip={tooltip} />}

      {/* Inline styling for page layout and UI */}
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
