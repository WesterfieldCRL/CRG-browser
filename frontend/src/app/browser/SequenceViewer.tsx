import React from "react";

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

interface SequenceViewerProps {
  sequences: Record<string, string>;
  speciesList: string[];
  pageIndex: number;
  pageSize: number;
  setTooltip: (tip: TooltipState | null) => void;
  nucleotideWidth: number;
}

export default function SequenceViewer({
  sequences,
  speciesList,
  pageIndex,
  pageSize,
  setTooltip,
  nucleotideWidth,
}: SequenceViewerProps) {

  // Get nucleotide-specific color
  function getNucleotideColor(base: string): string {
    switch (base.toUpperCase()) {
      case 'A': return '#4caf50'; // Balanced green
      case 'T': return '#f44336'; // Balanced red
      case 'G': return '#ff9800'; // Balanced orange
      case 'C': return '#2196f3'; // Balanced blue
      case '-': return '#9e9e9e'; // Gray for gaps
      default: return '#9e9e9e'; // Gray for unknown
    }
  }

  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, offset) => {
      const absIndex = start + offset + 1;
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + offset])
        .filter(Boolean);
      const conserved = basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);
      const nucleotideColor = getNucleotideColor(base);
      const tooltipText = conserved
        ? `Conserved | Position ${absIndex} | Base: ${base}`
        : `Divergent | Position ${absIndex} | Base: ${base}`;
      return (
        <span
          key={absIndex}
          className="nucleotide"
          role="text"
          aria-label={tooltipText}
          onMouseMove={(e) =>
            setTooltip({ text: tooltipText, x: e.pageX + 12, y: e.pageY + 12 })
          }
          onMouseLeave={() => setTooltip(null)}
          style={{
            width: nucleotideWidth,
            minWidth: nucleotideWidth,
            display: "inline-block",
            textAlign: "center",
            userSelect: "none",
            backgroundColor: nucleotideColor,
            color: 'white',
            fontWeight: 'bold',
            padding: '3px 0',
            borderRadius: '4px',
          }}
        >
          {base}
        </span>
      );
    });
  }

  return (
    <>
      <div className="species-container" role="list" aria-label="Species sequences">
        {speciesList.map((speciesKey) => {
          const seq = sequences[speciesKey] || "";
          const start = pageIndex * pageSize;
          const end = Math.min(seq.length, start + pageSize);
          const segment = Array.from(seq.slice(start, end));
          return (
            <section
              key={speciesKey}
              className="species-row"
              aria-labelledby={`label-${speciesKey}`}
              role="listitem"
            >
              <h2
                className="species-label"
                id={`label-${speciesKey}`}
                tabIndex={-1}
                aria-live="polite"
              >
                {speciesKey} (Gene length: {seq.length} nucleotides)
              </h2>
              <div className="sequence-row">{renderNucleotides(segment, start)}</div>
            </section>
          );
        })}
      </div>
      <style jsx>{`
        .species-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          gap: 16px;
          border: 1px solid var(--border-color, rgba(11,17,18,0.08));
          padding: 12px;
          box-sizing: border-box;
          overflow-y: auto;
          background: var(--container-bg);
          border-radius: 8px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .species-row {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid var(--border-color, rgba(11,17,18,0.08));
          border-radius: 6px;
          padding: 12px;
          background: var(--main-bg);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          outline-offset: 4px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .species-label {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 1.2rem;
          color: var(--heading-color);
          user-select: text;
          transition: color 0.3s ease;
        }
        .sequence-row {
          display: flex;
          flex-direction: row;
          justify-content: center;
          font-family: monospace;
          font-size: 1.15rem;
          line-height: 1.3;
          overflow-x: hidden;
          padding-bottom: 4px;
          cursor: default;
          user-select: none;
          width: 100%;
          gap: 1px;
        }
        .nucleotide {
          text-align: center;
          padding: 3px 0;
          border-radius: 4px;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
          user-select: none;
          flex-shrink: 0;
        }
        .nucleotide:hover {
          background-color: var(--accent, #2db4b6);
          color: white;
          font-weight: 700;
          cursor: help;
          transform: scale(1.1);
          z-index: 10;
        }
        .conserved {
          background: rgba(45, 180, 182, 0.2);
          color: var(--primary, #0b7285);
        }
        .divergent {
          background: rgba(246, 182, 60, 0.2);
          color: var(--main-text);
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme]) .conserved {
            background: rgba(94, 203, 205, 0.3);
            color: #5ecbcd;
          }
          :root:not([data-theme]) .divergent {
            background: rgba(246, 182, 60, 0.2);
            color: #f6b63c;
          }
        }

        [data-theme="dark"] .conserved {
          background: rgba(94, 203, 205, 0.3);
          color: #5ecbcd;
        }
        [data-theme="dark"] .divergent {
          background: rgba(246, 182, 60, 0.2);
          color: #f6b63c;
        }
      `}</style>
    </>
  );
}
