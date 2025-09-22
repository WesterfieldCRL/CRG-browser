"use client";
import React, { useEffect, useState } from "react";

const dataset: any = {
  DRD4: {
    description:
      "Dopamine receptor D4, a GPCR involved in dopamine signaling, attention, novelty-seeking behavior, ADHD risk.",
    annotations: {
      "Homo sapiens": {
        regulatory: [{ start: 35, end: 45, type: "Promoter" }],
        snps: [{ pos: 15, ref: "G", alt: "C", rsid: "rs1800955" }],
        chromosome: "11",
        chromStart: 6330000,
      },
      "Mus musculus": {
        regulatory: [{ start: 50, end: 60, type: "Enhancer" }],
        snps: [{ pos: 70, ref: "A", alt: "T" }],
        chromosome: "7",
        chromStart: 4520000,
      },
      "Macaca mulatta": {
        regulatory: [{ start: 80, end: 90, type: "Enhancer" }],
        snps: [{ pos: 20, ref: "C", alt: "A" }],
        chromosome: "3",
        chromStart: 1230000,
      },
    },
  },
  CHRNA6: {
    description:
      "Nicotinic acetylcholine receptor alpha-6 subunit, expressed in midbrain dopamine neurons; modulates addiction and Parkinson’s disease pathways.",
    annotations: {
      "Homo sapiens": {
        regulatory: [{ start: 5, end: 15, type: "Promoter" }],
        snps: [{ pos: 30, ref: "C", alt: "T" }],
        chromosome: "8",
        chromStart: 45000000,
      },
      "Mus musculus": {
        regulatory: [{ start: 40, end: 50, type: "Enhancer" }],
        snps: [{ pos: 75, ref: "G", alt: "A" }],
        chromosome: "6",
        chromStart: 23300000,
      },
      "Macaca mulatta": {
        regulatory: [{ start: 60, end: 70, type: "Promoter" }],
        snps: [{ pos: 10, ref: "A", alt: "G" }],
        chromosome: "9",
        chromStart: 8830000,
      },
    },
  },
  ALDH1: {
    description:
      "Long non-coding RNA antisense to ALDH1A4 gene; implicated in transcriptional regulation and metabolic processes.",
    annotations: {
      "Homo sapiens": {
        regulatory: [{ start: 20, end: 30, type: "Enhancer" }],
        snps: [{ pos: 55, ref: "A", alt: "G" }],
        chromosome: "12",
        chromStart: 7500000,
      },
      "Mus musculus": {
        regulatory: [{ start: 10, end: 18, type: "Promoter" }],
        snps: [{ pos: 25, ref: "C", alt: "T" }],
        chromosome: "15",
        chromStart: 13000000,
      },
      "Macaca mulatta": {
        regulatory: [{ start: 70, end: 80, type: "Silencer" }],
        snps: [{ pos: 5, ref: "T", alt: "C" }],
        chromosome: "1",
        chromStart: 7800000,
      },
    },
  },
};

const genes = Object.keys(dataset);
const speciesList = ["homo_sapiens", "mus_musculus", "macaca_mulatta"];
const speciesDisplay: any = {
  homo_sapiens: "Homo sapiens",
  mus_musculus: "Mus musculus",
  macaca_mulatta: "Macaca mulatta",
};

async function fetchEnsemblId(species: string, geneSymbol: string) {
  const url = `https://rest.ensembl.org/lookup/symbol/${species}/${geneSymbol}?content-type=application/json`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`No Ensembl ID for ${geneSymbol} in ${species}`);
    const data = await res.json();
    return data.id;
  } catch (e: any) {
    console.warn(e.message);
    return null;
  }
}

async function fetchFastaSequence(geneId: string) {
  const url = `https://rest.ensembl.org/sequence/id/${geneId}?content-type=text/x-fasta`;
  try {
    const res = await fetch(url, { headers: { "Content-Type": "text/x-fasta" } });
    if (!res.ok) throw new Error(`No FASTA for gene ID ${geneId}`);
    return await res.text();
  } catch (e: any) {
    console.warn(e.message);
    return null;
  }
}

function parseFasta(fastaText: string): string {
  return fastaText
    .split("\n")
    .filter((line) => line && !line.startsWith(">"))
    .join("");
}

function isConserved(position: number, sequences: Record<string, string>) {
  const bases = Object.values(sequences).map((seq) => seq?.[position]);
  return bases.every((b) => b === bases[0]);
}

export default function Page() {
  const [selectedGene, setSelectedGene] = useState<string>(genes[0]);
  const [sequences, setSequences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [popupContent, setPopupContent] = useState<string | null>(null);

  // Load only current selected gene sequences
  useEffect(() => {
    async function loadSequences() {
      setLoading(true);
      const updatedDataset = { ...dataset };

      updatedDataset[selectedGene].sequences = {};
      for (const sp of speciesList) {
        const ensemblId = await fetchEnsemblId(sp, selectedGene);
        if (ensemblId) {
          const fasta = await fetchFastaSequence(ensemblId);
          updatedDataset[selectedGene].sequences[speciesDisplay[sp]] = fasta ? parseFasta(fasta) : null;
        } else {
          updatedDataset[selectedGene].sequences[speciesDisplay[sp]] = null;
        }
      }
      setSequences(updatedDataset);
      setLoading(false);
    }
    loadSequences();
  }, [selectedGene]);

  // Horizontal scroll helper on wheel (vertical mouse wheel -> horizontal scroll)
  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    const container = e.currentTarget;
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }

  const renderSequences = () => {
    if (loading) return <p>Loading sequences for {selectedGene}...</p>;

    if (!sequences[selectedGene] || !sequences[selectedGene].sequences) {
      return <p>No sequences loaded yet.</p>;
    }

    const seqs = sequences[selectedGene].sequences;
    const annots = sequences[selectedGene].annotations;
    if (!seqs["Homo sapiens"]) return <p>No sequence data available</p>;

    const seqLength = seqs["Homo sapiens"].length;
    let conservedCount = 0;
    let divergentCount = 0;
    for (let i = 0; i < seqLength; i++) {
      if (isConserved(i, seqs)) conservedCount++;
      else divergentCount++;
    }

    return (
      <>
        {Object.entries(seqs).map(([species, seq]) => {
          if (typeof seq !== "string") return null;
          return (
            <div className="track" key={species}>
              <div className="track-label">{species}</div>
              {/* Horizontal scrollable sequence container */}
              <div className="sequence" onWheel={handleWheel} tabIndex={0} aria-label={`${species} sequence`}>
                {seq.split("").map((base: string, i: number) => {
                  const conserved = isConserved(i, seqs);
                  let className = "nucleotide " + (conserved ? "conserved" : "divergent");

                  let tooltipText = `Pos ${i} | Base: ${base} | ${conserved ? "Conserved" : "Divergent"}`;

                  annots[species].regulatory.forEach((reg: any) => {
                    if (i >= reg.start && i <= reg.end) {
                      className += " regulatory";
                      tooltipText += ` | Regulatory: ${reg.type}`;
                    }
                  });

                  annots[species].snps.forEach((snp: any) => {
                    if (i === snp.pos) {
                      className += " snp";
                      tooltipText += ` | SNP: ${snp.ref}→${snp.alt}`;
                    }
                  });

                  return (
                    <span
                      key={i}
                      className={className}
                      onMouseMove={(e) => setTooltip({ text: tooltipText, x: e.pageX + 10, y: e.pageY + 10 })}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => {
                        // Compose detailed popup info based on new schema requirements
                        // For simplicity, hardcoding some example data; extend with real data as needed.
                        const chrom = annots[species].chromosome ?? "Unknown";
                        const chromPos = annots[species].chromStart !== undefined ? annots[species].chromStart + i : "Unknown";

                        // Find any known variant rsID if SNP exists at position
                        const knownSNP = annots[species].snps.find((snp: any) => snp.pos === i);
                        const rsid = knownSNP?.rsid ?? "None";
                        // For demo, static gene info and context (you can extend dynamically)
                        const geneInfo = `${selectedGene}, example gene description or Entrez ID`;
                        const funcAnnotation = annots[species].regulatory.find((reg: any) => i >= reg.start && i <= reg.end)?.type || "None";
                        // For demo, coding context and variant consequences are placeholders
                        const codingContext = conserved ? `Codon X, amino acid Y` : "Non-coding region";
                        const variantConsequences = rsid === "None" ? "None" : "Missense mutation";
                        const regulatoryFeatures = funcAnnotation !== "None" ? `TFBS: Example binding site` : "None";
                        const dbSnpLink = rsid !== "None" ? `https://www.ncbi.nlm.nih.gov/snp/${rsid}` : "";

                        let detail = `
                          <ul style="padding-left: 1em; line-height: 1.4;">
                            <li><strong>Species:</strong> ${species}</li>
                            <li><strong>Genomic coordinate:</strong> chr${chrom}:${chromPos}</li>
                            <li><strong>Nucleotide identity:</strong> ${base}</li>
                            <li><strong>Gene information:</strong> ${geneInfo}</li>
                            <li><strong>Functional annotation:</strong> ${funcAnnotation}</li>
                            <li><strong>Coding context:</strong> ${codingContext}</li>
                            <li><strong>Known variants:</strong> ${rsid === "None" ? "None" : `<a href="${dbSnpLink}" target="_blank" rel="noreferrer">${rsid}</a>`}</li>
                            <li><strong>Variant consequences:</strong> ${variantConsequences}</li>
                            <li><strong>Regulatory features:</strong> ${regulatoryFeatures}</li>
                            <li><strong>External links:</strong> ${
                              rsid === "None"
                                ? "None"
                                : `<a href="${dbSnpLink}" target="_blank" rel="noreferrer">dbSNP</a> | <a href="https://omim.org" target="_blank" rel="noreferrer">OMIM</a> | <a href="https://www.uniprot.org" target="_blank" rel="noreferrer">UniProt</a>`
                            }</li>
                          </ul>
                        `;

                        setPopupContent(detail);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Nucleotide ${base} at position ${i} in ${species}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                    >
                      {base}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="summary">
          Gene length: {seqLength} | Conserved: {conservedCount} | Divergent: {divergentCount}
        </div>
      </>
    );
  };

  return (
    <main>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body, main {
          margin: 0; padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: #e6f0ff;
          color: #0b2545;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        h1 {
          margin-bottom: 16px;
          font-weight: 700;
          color: #1a3c85;
        }
        .controls {
          margin-bottom: 20px;
        }
        select {
          padding: 8px 14px;
          font-size: 16px;
          border-radius: 6px;
          border: 1.5px solid #2c4a9f;
          background: white;
          color: #0b2545;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        select:hover, select:focus {
          border-color: #1a3c85;
          outline: none;
        }
        .browser {
          width: 90%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgb(26 60 133 / 0.15);
          padding: 18px;
          font-family: monospace;
          user-select: none;
          /* horizontal scroll container styling */
          overflow-x: auto;
          white-space: nowrap;
          max-width: 100vw;
        }
        .track {
          margin: 16px 0;
        }
        .track-label {
          font-weight: 700;
          margin-bottom: 6px;
          color: #1a3c85;
          user-select: text;
        }
        .sequence {
          display: inline-block;
          white-space: nowrap;
          outline: none;
        }
        .nucleotide {
          padding: 4px 8px;
          margin: 0 1px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.15s ease, background-color 0.15s ease;
          color: #0b2545;
          min-width: 20px;
          text-align: center;
          display: inline-block;
          user-select: none;
        }
        .nucleotide:hover, .nucleotide:focus {
          transform: scale(1.15);
          background: #c9d9ff;
          color: #0b2545;
          outline: none;
        }
        .conserved {
          background-color: #a3c4ff;
          color: #0b2545;
        }
        .divergent {
          background-color: #bad1ff;
          color: #0b2545;
        }
        .regulatory {
          background-color: #ffd966 !important;
          color: #4a3c00 !important;
          font-weight: 600;
        }
        .snp {
          background-color: #1c3faa !important;
          color: white !important;
          font-weight: 700;
        }
        .summary {
          margin-top: 20px;
          font-weight: 600;
          font-size: 15px;
          color: #274472;
          text-align: center;
          user-select: none;
        }
        .tooltip {
          position: fixed;
          padding: 6px 12px;
          background: rgba(11, 37, 69, 0.85);
          color: white;
          font-size: 12px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
          max-width: 250px;
          user-select: none;
          white-space: nowrap;
        }
        #popup {
          position: fixed;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgb(26 60 133 / 0.3);
          padding: 20px;
          z-index: 2000;
          max-width: 480px;
          width: 80%;
          max-height: 70vh;
          overflow-y: auto;
          color: #0b2545;
          user-select: text;
        }
        #popup h3 {
          margin-top: 0;
          font-weight: 700;
          color: #1a3c85;
        }
        #popup button {
          margin-top: 16px;
          background-color: #1a3c85;
          border: none;
          padding: 8px 16px;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        #popup button:hover {
          background-color: #2c4a9f;
        }
      `}</style>

      <h1>Kiron&apos;s Genome Browser</h1>

      <div className="controls">
        <label htmlFor="geneSelect" style={{ marginRight: 8, fontWeight: "700", color: "#1a3c85" }}>
          Select Gene:
        </label>
        <select id="geneSelect" value={selectedGene} onChange={(e) => setSelectedGene(e.target.value)}>
          {genes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <section className="browser">{renderSequences()}</section>

      {tooltip && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-live="polite"
        >
          {tooltip.text}
        </div>
      )}

      {popupContent && (
        <aside
          id="popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popupTitle"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="popupTitle">Details</h3>
          <div dangerouslySetInnerHTML={{ __html: popupContent }} />
          <button onClick={() => setPopupContent(null)}>Close</button>
        </aside>
      )}
    </main>
  );
}
