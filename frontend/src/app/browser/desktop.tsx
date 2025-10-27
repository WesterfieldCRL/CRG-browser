"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { fetchGenes, fetchSequence, fetchSpecies } from "../utils/services";
import PageNavigation from "./PageNavigation";
import SequenceViewer from "./SequenceViewer";
import Tooltip from "../components/Tooltip";
import Zoom from "./IterativeZoom";

const MIN_NUCLEOTIDE_WIDTH_PX = 30;
const MAX_NUCLEOTIDE_WIDTH_PX = 50;
const NUCLEOTIDE_GAP_PX = 1;

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function GenomeBrowserPage() {
  const [selectedGene, setSelectedGene] = useState<string>(null);
  const [sequences, setSequences] = useState<Record<string, string>>({});
  const [allGenes, setAllGenes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);
  const [nucleotideWidth, setNucleotideWidth] = useState<number>(
    MIN_NUCLEOTIDE_WIDTH_PX
  );
  const[speciesList, setSpeciesList] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [iterativeZoom, setIterativeZoom] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  async function loadGenes() {
    setLoading(true);
    try {
      const genes = await fetchGenes()
      setAllGenes(genes)
      setSelectedGene(genes[0])  // Use genes directly instead of allGenes
    } catch {
      setError("Failed to load gene list");
    } finally {
      loadSpecies()
    }
  }

  async function loadSpecies() {
    setLoading(true);
    try {
      setSpeciesList(await fetchSpecies());
    } catch {
      setError("Failed to load gene list");
    } finally {
      setLoading(false);
    }
  }

  async function loadSequences() {
      try {
        const seqMap: Record<string, string> = {};
        for (const sp of speciesList) {
          seqMap[sp] = await fetchSequence(selectedGene, sp);
        }
        setSequences(seqMap);
        setPageIndex(0);
      } catch {
        setError("Failed to load sequences");
      } finally {
      }
    }

  useEffect(() => {
    loadGenes();
  }, []);

  useEffect(() => {
    loadSequences();
  }, [selectedGene]);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    let calculatedWidth = Math.floor(containerWidth / 25);
    if (calculatedWidth < MIN_NUCLEOTIDE_WIDTH_PX) {
      calculatedWidth = MIN_NUCLEOTIDE_WIDTH_PX;
    } else if (calculatedWidth > MAX_NUCLEOTIDE_WIDTH_PX) {
      calculatedWidth = MAX_NUCLEOTIDE_WIDTH_PX;
    }
    const maxBases = Math.floor(
      (containerWidth + NUCLEOTIDE_GAP_PX) /
        (calculatedWidth + NUCLEOTIDE_GAP_PX)
    );
    const adjustedWidth =
      Math.floor(
        (containerWidth - (maxBases - 1) * NUCLEOTIDE_GAP_PX) / maxBases
      ) * 0.9;
    setNucleotideWidth(adjustedWidth);
    setPageSize(Math.max(1, maxBases));
  }, []);

  useEffect(() => {
    updateDimensions();
    loadSequences();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions, iterativeZoom]);

  const maxLength = Math.max(
    ...Object.values(sequences).map((seq) => seq.length),
    0
  );
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  return (
    <>
      <main>
        <h1>Genome Browser</h1>
        {!loading && !error &&
        <div className="controls">
          <label htmlFor="gene-select">Select Gene:</label>
          <select
            id="gene-select"
            value={selectedGene || ""}
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
        </div>}

        {loading && <div className="info">Loading data...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && iterativeZoom && (
          <div className="container-box">
            <Zoom gene_name={selectedGene} onValueChange={setIterativeZoom} />
          </div>
        )}

        {!loading && !error && !iterativeZoom && (
          <div
            className="container-box"
            ref={containerRef}
            aria-live="polite"
            aria-atomic="true"
          >
            {Object.keys(sequences).length === 0 && !loading && (
              <p>Select a gene to view aligned DNA sequences.</p>
            )}

            <SequenceViewer
              sequences={sequences}
              speciesList={speciesList}
              pageIndex={pageIndex}
              pageSize={pageSize}
              nucleotideWidth={nucleotideWidth}
              setTooltip={setTooltip}
            />

            <PageNavigation
              pageIndex={pageIndex}
              totalPages={totalPages}
              setPageIndex={setPageIndex}
              sequences={sequences}
              selectedGene={selectedGene}
              onValueChange={setIterativeZoom}
            />
          </div>
        )}

        {tooltip && <Tooltip tooltip={tooltip} />}
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
          margin-bottom: 20px;
          transition: color 0.3s ease;
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
          min-width: 220px;
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        select:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .container-box {
          width: 90vw;
          background: var(--container-bg);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          padding: 20px;
          box-sizing: border-box;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid var(--border-color, rgba(11,17,18,0.08));
        }

        .info {
          font-style: italic;
          color: var(--info-color);
          margin-bottom: 20px;
          transition: color 0.3s ease;
        }

        .error {
          color: var(--error-color);
          font-weight: 600;
          margin-bottom: 20px;
          transition: color 0.3s ease;
        }
      `}</style>
    </>
  );
}
