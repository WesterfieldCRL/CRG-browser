"use client";

import React, { useEffect, useState } from "react";
import InteractiveLine from "./InteractiveLine";
import ConservationHistogram from "./ConservationHistogram";
import {
  fetchGenes,
  fetchRegulatoryElementLines,
} from "../utils/services";

class LineShapes {
  start: number;
  end: number;
  info: string;
  color: string;

  constructor(start: number, end: number, info: string, color: string) {
    this.start = start;
    this.end = end;
    this.info = info;
    this.color = color;
  }
}

class RegulatoryLine {
  relative_start: number;
  relative_end: number;
  real_start: number;
  real_end: number;
  shapes: Array<LineShapes>;

  constructor(
    relative_start: number,
    relative_end: number,
    real_start: number,
    real_end: number,
    shapes: Array<LineShapes>
  ) {
    this.relative_start = relative_start;
    this.relative_end = relative_end;
    this.real_start = real_start;
    this.real_end = real_end;
    this.shapes = shapes;
  }
}

// Force recompile - updated for dark mode support
export default function RegComp() {
  const [loading, setLoading] = useState<boolean>(true);
  const [genes, setGenes] = useState<Array<string>>([]);
  const [selected_gene, setSelectedGene] = useState<string>("none");
  const [reg_lines, setRegLines] = useState<Record<string, RegulatoryLine>>();

  async function loadGenes() {
    setLoading(true);
    try {
      const data = await fetchGenes();
      setGenes(data);
    } catch (error) {
      console.error("Error fetching condensed sequences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLines(geneName: string) {
    setLoading(true);
    try {
      const data = await fetchRegulatoryElementLines(geneName);

      setRegLines(data);
    } catch (error) {
      console.error("Error fetching condensed sequences:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleButtonPress(gene: string) {
    loadLines(gene);
    setSelectedGene(gene);
  }

  // Initial load
  useEffect(() => {
    loadGenes();
  }, []);

  return (
    <>
      <main>
        <h1>Regulatory Element Comparison</h1>
        <p className="page-description">
          Compare regulatory elements and their conservation across species
        </p>
        {!loading && (
          <>
            <div className="controls">
              <label>Select Gene:</label>
              <div className="gene-buttons">
                {genes.map((gene) => (
                  <button
                    key={gene}
                    className="gene-button"
                    onClick={() => handleButtonPress(gene)}
                  >
                    {gene}
                  </button>
                ))}
              </div>
            </div>
            {!(selected_gene === "none") && (
              <div className="results-container">
                {Object.entries(reg_lines).map(([key, value]) => (
                  <div key={key} className="container-box">
                    <div className="species-name">{key}</div>
                    <InteractiveLine
                      start={value.relative_start}
                      end={value.relative_end}
                      start_label={value.real_start}
                      end_label={value.real_end}
                      shapes={value.shapes}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && genes.length > 0 && (
          <div className="conservation-section">
            <h2>Conservation Analysis</h2>
            <div className="conservation-table-container">
              <table className="conservation-table">
                <thead>
                  <tr>
                    <th>Gene</th>
                    <th>PhastCons</th>
                    <th>PhyloP</th>
                  </tr>
                </thead>
                <tbody>
                  {genes.map((gene) => (
                    <tr key={gene}>
                      <td className="gene-name-cell">{gene}</td>
                      <td className="data-cell">
                        <ConservationHistogram geneName={gene} scoreType="phastcons" />
                      </td>
                      <td className="data-cell">
                        <ConservationHistogram geneName={gene} scoreType="phylop" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        main {
          margin: 0;
          padding: 20px;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: var(--main-bg);
          color: var(--main-text);
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        h1 {
          font-weight: 700;
          font-size: 2rem;
          color: var(--heading-color);
          margin-bottom: 10px;
          transition: color 0.3s ease;
        }

        .page-description {
          font-size: 1rem;
          color: var(--main-text);
          text-align: center;
          margin-bottom: 20px;
          opacity: 0.8;
          transition: color 0.3s ease;
        }

        .controls {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        label {
          font-weight: 600;
          color: var(--label-color);
          transition: color 0.3s ease;
        }

        .gene-buttons {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .gene-button {
          padding: 10px 20px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background-color: var(--button-bg);
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .gene-button:hover {
          background-color: var(--button-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 180, 182, 0.3);
        }

        .gene-button:active {
          transform: translateY(0);
        }

        .results-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 90vw;
          gap: 20px;
        }

        .container-box {
          width: 100%;
          background: var(--container-bg);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 20px;
          box-sizing: border-box;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid var(--border-color, rgba(11, 17, 18, 0.08));
        }

        .container-box:hover {
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        }

        .species-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-color);
          transition: color 0.3s ease, border-color 0.3s ease;
        }

        .conservation-section {
          width: 90vw;
          margin-top: 40px;
          margin-bottom: 40px;
        }

        .conservation-section h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 20px;
          text-align: center;
          transition: color 0.3s ease;
        }

        .conservation-table-container {
          width: 100%;
          overflow-x: auto;
          background: var(--container-bg);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 20px;
          box-sizing: border-box;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid var(--border-color, rgba(11, 17, 18, 0.08));
        }

        .conservation-table {
          width: 100%;
          border-collapse: collapse;
          background: transparent;
        }

        .conservation-table thead {
          background: var(--button-bg);
          color: white;
        }

        .conservation-table th {
          padding: 15px;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
          border: 1px solid var(--border-color);
        }

        .conservation-table td {
          padding: 15px;
          text-align: center;
          border: 1px solid var(--border-color);
          transition: background-color 0.3s ease;
        }

        .conservation-table tbody tr:hover {
          background-color: rgba(45, 180, 182, 0.1);
        }

        .gene-name-cell {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--heading-color);
          transition: color 0.3s ease;
        }

        .data-cell {
          padding: 10px;
          vertical-align: middle;
        }
      `}</style>
    </>
  );
}
