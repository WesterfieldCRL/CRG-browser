"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { fetchGenes } from "../utils/services";
import PageNavigation from "../components/PageNavigation";
import SequenceViewer from "../components/SequenceViewer";
import Tooltip from "../components/Tooltip";
import Zoom from "../components/IterativeZoom";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);
  const [nucleotideWidth, setNucleotideWidth] = useState<number>(MIN_NUCLEOTIDE_WIDTH_PX);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [iterativeZoom, setIterativeZoom] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadGenes(): Promise<void> {
      setLoading(true);
      try {
        const geneList = (await fetchGenes("Homo sapiens")) as GeneListItem[];
        const geneNames = Array.from(new Set(geneList.map((g) => g.human_gene_name))).sort();
        setAllGenes(geneNames);
        if (geneNames.length > 0) setSelectedGene(geneNames[0]);
      } catch {
        setError("Failed to load gene list");
      } finally {
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
      } catch {
        setError("Failed to load sequences");
      } finally {
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
  }, [updateDimensions, iterativeZoom]);

  const maxLength = Math.max(...Object.values(sequences).map((seq) => seq.length), 0);
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

        {!loading && !error && iterativeZoom &&

        <div className="container-box">
          <Zoom 
            gene_name={selectedGene}
            onValueChange={setIterativeZoom}
          />
        </div> }

        {!loading && !error && !iterativeZoom &&

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
            onValueChange={setIterativeZoom}
          />
        </div>}

        {tooltip && <Tooltip tooltip={tooltip} />}
      </main>
    </>
  );
}
