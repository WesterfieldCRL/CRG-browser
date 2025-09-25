"use client";

import React, { useState, useEffect } from "react";
import { speciesList, speciesDisplay, dataset, genes } from "../browser/data";
import { fetchEnsemblId, fetchFastaSequence } from "../browser/services";
import SequenceViewer from "../components/SequenceViewer";
import PageNavigation from "../components/PageNavigation";
import Tooltip from "../components/Tooltip";

export default function Page() {
  const [selectedGene, setSelectedGene] = useState<string>(genes[0]);
  const [sequences, setSequences] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Calculate dynamic page size
  useEffect(() => {
    function calculatePageSize() {
      const nucleotideWidth = 16;
      const padding = 300;
      const width = window.innerWidth - padding;
      const count = Math.floor(width / nucleotideWidth);
      setPageSize(Math.max(20, count));
    }
    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);
    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

  // Load sequences when gene changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const seqMap: Record<string, string> = {};
      for (const sp of speciesList) {
        const geneInfo = await fetchEnsemblId(sp, selectedGene);
        if (!geneInfo) {
          seqMap[speciesDisplay[sp]] = "";
          continue;
        }
        const seq = await fetchFastaSequence(geneInfo.id);
        seqMap[speciesDisplay[sp]] = seq || "";
      }
      setSequences(seqMap);
      setPageIndex(0);
      setLoading(false);
    }
    loadData();
  }, [selectedGene]);

  const maxLength =
    Math.max(...Object.values(sequences).map((seq) => seq.length), 0) || 0;
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  return (
    <main>
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

      <h1>Genome Browser</h1>

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

      <div className="container-box">
        {loading ? (
          <div style={{ textAlign: "center", fontSize: "1.25rem" }}>
            Loading...
          </div>
        ) : (
          <>
            <SequenceViewer
              sequences={sequences}
              speciesList={speciesList}
              speciesDisplay={speciesDisplay}
              pageIndex={pageIndex}
              pageSize={pageSize}
              setTooltip={setTooltip}
            />

            <PageNavigation
              pageIndex={pageIndex}
              totalPages={totalPages}
              setPageIndex={setPageIndex}
              sequences={sequences}
            />
          </>
        )}
      </div>

      {tooltip && <Tooltip tooltip={tooltip} />}
    </main>
  );
}
