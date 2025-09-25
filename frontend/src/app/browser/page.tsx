"use client";

import React, { useState, useEffect } from "react";
import { speciesList, speciesDisplay, dataset, genes } from "../browser/data";
import { fetchEnsemblId, fetchFastaSequence } from "../browser/services";
import SequenceViewer from "../components/SequenceViewer";
import PageNavigation from "../components/PageNavigation";
import Tooltip from "../components/Tooltip";

export default function Page() {
  // Currently selected gene symbol
  const [selectedGene, setSelectedGene] = useState<string>(genes[0]);

  // Map of species display names to DNA sequences for the selected gene
  const [sequences, setSequences] = useState<Record<string, string>>({});

  // Loading status while fetching sequences
  const [loading, setLoading] = useState<boolean>(false);

  // Current page index in pagination (0-based)
  const [pageIndex, setPageIndex] = useState<number>(0);

  // Number of nucleotides shown per page, dynamically calculated
  const [pageSize, setPageSize] = useState<number>(100);

  // Tooltip info to show on nucleotide hover (text and position)
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Effect: Recalculate how many nucleotides fit per page based on window width
  useEffect(() => {
    function calculatePageSize() {
      const nucleotideWidth = 16; // width in pixels per nucleotide character
      const padding = 300; // left/right padding for layout
      const width = window.innerWidth - padding;
      const count = Math.floor(width / nucleotideWidth);
      setPageSize(Math.max(20, count)); // minimum 20 nucleotides per page
    }

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);
    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  // Effect: Fetch sequences for selected gene for all species
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const seqMap: Record<string, string> = {};

      for (const sp of speciesList) {
        // Fetch ensembl gene ID by species and gene symbol
        const geneInfo = await fetchEnsemblId(sp, selectedGene);
        if (!geneInfo) {
          seqMap[speciesDisplay[sp]] = "";
          continue;
        }

        // Fetch FASTA sequence by gene ID
        const seq = await fetchFastaSequence(geneInfo.id);
        seqMap[speciesDisplay[sp]] = seq || "";
      }

      setSequences(seqMap);
      // Reset to first page when gene changes
      setPageIndex(0);
      setLoading(false);
    }

    loadData();
  }, [selectedGene]);

  // Calculate the longest sequence length to determine total pages
  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  return (
    <main>
      {/* Global styles for layout and typography */}
      <style>{`
        body, main {
          margin: 0;
          padding: 0;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background: #f6f9fc;
          color: #1c1c1c;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
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
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
          padding: 20px;
        }
      `}</style>

      {/* Page title */}
      <h1>Genome Browser</h1>

      {/* Controls for gene selection */}
      <div className="controls">
        <label htmlFor="geneSelect">Select Gene:</label>
        <select
          id="geneSelect"
          value={selectedGene}
          onChange={(e) => setSelectedGene(e.target.value)}
        >
          {genes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Main container for sequences and pagination */}
      <div className="container-box">
        {loading ? (
          // Loading indicator while fetching sequences
          <div style={{ textAlign: "center", fontSize: "1.25rem" }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Render nucleotide sequences with paging */}
            <SequenceViewer
              sequences={sequences}
              speciesList={speciesList}
              speciesDisplay={speciesDisplay}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setTooltip={setTooltip}
            />

            {/* Render page navigation controls,
                passing selectedGene for enhanced download naming */}
            <PageNavigation
              pageIndex={pageIndex}
              totalPages={totalPages}
              setPageIndex={setPageIndex}
              sequences={sequences}
              selectedGene={selectedGene} // Pass selected gene to enable headers/filename
            />
          </>
        )}
      </div>

      {/* Tooltip shows nucleotide info on hover */}
      {tooltip && <Tooltip tooltip={tooltip} />}
    </main>
  );
}
