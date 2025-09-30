"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { fetchGenes } from "./services";
import PageNavigation from "../components/PageNavigation";
import SequenceViewer from "../components/SequenceViewer";
import Tooltip from "../components/Tooltip";

const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];

const speciesDisplay: Record<string, string> = {
  "Homo sapiens": "Homo sapiens",
  "Mus musculus": "Mus musculus",
  "Macaca mulatta": "Macaca mulatta",
};

const MIN_NUCLEOTIDE_WIDTH_PX = 30;
const MAX_NUCLEOTIDE_WIDTH_PX = 50;
const NUCLEOTIDE_GAP_PX = 1;

interface GeneListItem {
  human_gene_name: string;
}

interface SequenceItem {
  human_gene_name: string;
  aligned_sequence: string;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function GenomeBrowserPage() {
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [sequences, setSequences] = useState<Record<string, string>>({});
  const [allGenes, setAllGenes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);
  const [nucleotideWidth, setNucleotideWidth] = useState<number>(MIN_NUCLEOTIDE_WIDTH_PX);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadGenes(): Promise<void> {
      try {
        setLoading(true);
        const geneList = (await fetchGenes("Homo sapiens")) as GeneListItem[];
        const geneNames = Array.from(new Set(geneList.map((g) => g.human_gene_name))).sort();
        setAllGenes(geneNames);
        if (geneNames.length > 0) setSelectedGene(geneNames[0]);
        setLoading(false);
      } catch {
        setError("Failed to load gene list");
        setLoading(false);
      }
    }
    loadGenes();
  }, []);

  useEffect(() => {
    async function loadSequences(): Promise<void> {
      if (!selectedGene) return;
      
      setLoading(true);
      setError(null);
      try {
        const seqMap: Record<string, string> = {};
        for (const sp of speciesList) {
          const geneSequences = (await fetchGenes(sp)) as SequenceItem[];
          const matched = geneSequences.find((g) => g.human_gene_name === selectedGene);
          seqMap[sp] = matched?.aligned_sequence ?? "";
        }
        setSequences(seqMap);
        setPageIndex(0);
        setLoading(false);
      } catch {
        setError("Failed to load sequences");
        setLoading(false);
      }
    }
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
    const maxBases = Math.floor((containerWidth + NUCLEOTIDE_GAP_PX) / (calculatedWidth + NUCLEOTIDE_GAP_PX));
    const adjustedWidth = Math.floor((containerWidth - (maxBases - 1) * NUCLEOTIDE_GAP_PX) / maxBases) * 0.9;
    setNucleotideWidth(adjustedWidth);
    setPageSize(Math.max(1, maxBases));
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  const maxLength = Math.max(...Object.values(sequences).map((seq) => seq.length), 0);
  const totalPages = Math.max(1, Math.ceil(maxLength / pageSize));

  useEffect(() => {
    if (pageIndex >= totalPages) {
      setPageIndex(totalPages - 1);
    }
  }, [pageIndex, totalPages]);

  return (
    <>
      <header className="header">
        <nav className="nav-container">
          <Link href="/" className="logo">GenomeHub</Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/browser">Genome Browser</Link></li>
            <li><Link href="/comparison">Genome Comparison</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <h1>Genome Browser</h1>
        
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
              <option key={gene} value={gene}>{gene}</option>
            ))}
          </select>
        </div>

        {loading && <div className="info">Loading data...</div>}
        {error && <div className="error">{error}</div>}

        <div className="container-box" ref={containerRef} aria-live="polite" aria-atomic="true">
          {Object.keys(sequences).length === 0 && !loading && (
            <p>Select a gene to view aligned DNA sequences.</p>
          )}

          <SequenceViewer
            sequences={sequences}
            speciesList={speciesList}
            speciesDisplay={speciesDisplay}
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
            selectedGene={selectedGene ?? ""}
          />
        </div>

        {tooltip && <Tooltip tooltip={tooltip} />}
      </main>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }

        .nav-links a:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

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
    </>
  );
}
