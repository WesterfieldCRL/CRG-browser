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
          <div className="container-box">
            <h2>Expression Correlation Analysis</h2>
            <div className="placeholder-chart">
              <p>Scatter plot visualization will appear here</p>
            </div>
          </div>

          <div className="container-box">
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
          background-color: #f6f9fc;
          min-height: calc(100vh - 80px);
        }

        h1 {
          font-weight: 700;
          font-size: 2.5rem;
          color: #123c7c;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .page-description {
          font-size: 1.1rem;
          color: #555;
          text-align: center;
          margin-bottom: 2rem;
        }

        .comparison-controls {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
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
          color: #123c7c;
        }

        select {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          font-size: 16px;
          cursor: pointer;
        }

        .vs-divider {
          font-size: 1.5rem;
          font-weight: bold;
          color: #3b82f6;
          align-self: flex-end;
          margin-bottom: 0.5rem;
        }

        .warning {
          text-align: center;
          color: #f59e0b;
          font-weight: 600;
          padding: 0.75rem;
          background: #fffbeb;
          border-radius: 6px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .container-box {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        h2 {
          font-size: 1.5rem;
          color: #123c7c;
          margin-bottom: 1.5rem;
        }

        .placeholder-chart {
          text-align: center;
          padding: 4rem 1rem;
          background: #f8fbff;
          border-radius: 6px;
          border: 2px dashed #93c5fd;
          color: #555;
        }
      `}</style>
    </>
  );
}
