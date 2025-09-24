"use client";

import React, { useEffect, useState } from "react";

const speciesList = ["homo_sapiens", "mus_musculus", "macaca_mulatta"];
const speciesDisplay: Record<string, string> = {
  homo_sapiens: "Homo sapiens",
  mus_musculus: "Mus musculus",
  macaca_mulatta: "Macaca mulatta",
};

const dataset: Record<string, any> = {
  DRD4: {
    description:
      "Dopamine receptor D4, involved in dopamine signaling, attention, novelty-seeking behavior, ADHD risk.",
  },
  CHRNA6: {
    description:
      "Nicotinic acetylcholine receptor alpha-6 subunit; modulates addiction and Parkinson’s disease pathways.",
  },
};
const genes = Object.keys(dataset);

async function fetchEnsemblId(species: string, geneSymbol: string) {
  const url = `https://rest.ensembl.org/lookup/symbol/${species}/${geneSymbol}?content-type=application/json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchFastaSequence(geneId: string) {
  const url = `https://rest.ensembl.org/sequence/id/${geneId}?content-type=text/x-fasta`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("No FASTA for gene ID " + geneId);
    const text = await res.text();
    return parseFasta(text);
  } catch {
    return null;
  }
}

function parseFasta(fastaText: string): string {
  let seq = "";
  for (const line of fastaText.split("\n")) {
    if (line && !line.startsWith(">")) seq += line.trim();
  }
  return seq;
}

export default function Page() {
  const [selectedGene, setSelectedGene] = useState<string>(genes[0]);
  const [sequences, setSequences] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100); // computed dynamically
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Dynamically recalc page size when viewport size changes
  useEffect(() => {
    function calculatePageSize() {
      const nucleotideWidth = 16; // each nucleotide spans ≈16px
      const padding = 300; // margin/labels etc.
      const width = window.innerWidth - padding;
      const count = Math.floor(width / nucleotideWidth);
      setPageSize(Math.max(20, count)); // at least show 20 so it's not too small
    }

    calculatePageSize();
    window.addEventListener("resize", calculatePageSize);
    return () => window.removeEventListener("resize", calculatePageSize);
  }, []);

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

  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, i) => {
      const absIndex = start + i + 1; // position number (1-based)

      // Conservation check
      const positionBases = Object.values(sequences)
        .map((seq) => seq[start + i])
        .filter(Boolean);

      const conserved =
        positionBases.length > 1 &&
        positionBases.every((b) => b === positionBases[0]);

      let className = "nucleotide ";
      if (conserved) className += "conserved";
      else className += "divergent";

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

  function renderPageNavigation() {
    return (
      <div className="page-nav">
        <button
          onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
          disabled={pageIndex === 0}
        >
          ← Prev
        </button>
        <span>
          Page {pageIndex + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={pageIndex === totalPages - 1}
        >
          Next →
        </button>
      </div>
    );
  }

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
        }
        .conserved {
          background: #d9ebff;
          color: #003f87;
        }
        .divergent {
          background: #ffdad9;
          color: #a10000;
        }
        .page-nav {
          margin: 20px 0;
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          font-weight: 600;
          font-size: 1rem;
          color: #123c7c;
        }
        .tooltip {
          position: fixed;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 12px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
          max-width: 250px;
          white-space: nowrap;
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
            {renderPageNavigation()}

            {speciesList.map((sp) => {
              const species = speciesDisplay[sp];
              const seq = sequences[species] || "";
              const start = pageIndex * pageSize;
              const end = Math.min(seq.length, (pageIndex + 1) * pageSize);
              const segment = Array.from(seq.slice(start, end));
              const length = seq.length;

              return (
                <div className="species-row" key={species}>
                  <div className="species-label">
                    {species} (Gene length: {length} nucleotides)
                  </div>
                  <div className="sequence-row">
                    {renderNucleotides(segment, start)}
                  </div>
                </div>
              );
            })}

            {renderPageNavigation()}
          </>
        )}
      </div>

      {tooltip && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          role="tooltip"
        >
          {tooltip.text}
        </div>
      )}
    </main>
  );
}
