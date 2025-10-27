"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenomeComparisonPage() {
  const [loading, setLoading] = useState(false);
  const [selectedSpecies1, setSelectedSpecies1] = useState("Homo sapiens");
  const [selectedSpecies2, setSelectedSpecies2] = useState("Mus musculus");

  const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];

  return (
    <>

      <main>
        <h1>Genome Comparison</h1>
        <p className="page-description">
          Compare gene expression patterns and evolutionary divergence across species
        </p>

        <div className="comparison-controls">
          <div className="species-selector">
            <div className="selector-group">
              <label htmlFor="species1">Species 1:</label>
              <select
                id="species1"
                value={selectedSpecies1}
                onChange={(e) => setSelectedSpecies1(e.target.value)}
              >
                {speciesList.map((species) => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>

            <div className="vs-divider">vs</div>

            <div className="selector-group">
              <label htmlFor="species2">Species 2:</label>
              <select
                id="species2"
                value={selectedSpecies2}
                onChange={(e) => setSelectedSpecies2(e.target.value)}
              >
                {speciesList.map((species) => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedSpecies1 === selectedSpecies2 && (
            <div className="warning">
              Please select two different species to compare
            </div>
          )}
        </div>

        <div className="results-grid">
          <div className="container-box result-box">
            <h2>Expression Correlation Analysis</h2>
            <div className="placeholder-chart">
              <p>Scatter plot visualization will appear here</p>
            </div>
          </div>

          <div className="container-box result-box">
            <h2>Regulatory Element Distribution</h2>
            <div className="placeholder-chart">
              <p>Bar chart visualization will appear here</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: var(--main-bg);
          color: var(--main-text);
          min-height: calc(100vh - 80px);
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        h1 {
          font-weight: 700;
          font-size: 2.5rem;
          color: var(--heading-color);
          margin-bottom: 0.5rem;
          text-align: center;
          transition: color 0.3s ease;
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--info-color);
          text-align: center;
          margin-bottom: 2rem;
          transition: color 0.3s ease;
        }

        .comparison-controls {
          background: var(--container-bg);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border: 1px solid var(--border-color, rgba(11,17,18,0.08));
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .species-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        label {
          font-weight: 600;
          color: var(--label-color);
          transition: color 0.3s ease;
        }

        select {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background-color: var(--select-bg);
          color: var(--main-text);
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        .vs-divider {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--accent, #2db4b6);
          align-self: flex-end;
          margin-bottom: 0.5rem;
          transition: color 0.3s ease;
        }

        .warning {
          text-align: center;
          color: #f59e0b;
          font-weight: 600;
          padding: 0.75rem;
          background: rgba(255, 251, 235, 0.5);
          border-radius: 6px;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (min-width: 900px) {
          .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        .container-box {
          background: var(--container-bg);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-color, rgba(11,17,18,0.08));
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .result-box {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        h2 {
          font-size: 1.5rem;
          color: var(--heading-color);
          margin-bottom: 1.5rem;
          transition: color 0.3s ease;
        }

        .placeholder-chart {
          text-align: center;
          padding: 4rem 1rem;
          background: var(--main-bg);
          border-radius: 6px;
          border: 2px dashed var(--border-color);
          color: var(--info-color);
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </>
  );
}
