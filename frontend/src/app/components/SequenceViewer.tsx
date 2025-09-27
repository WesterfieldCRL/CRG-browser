import React from "react";

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

interface SequenceViewerProps {
  sequences: Record<string, string>;
  speciesList: string[];
  speciesDisplay: Record<string, string>;
  pageIndex: number;
  pageSize: number;
  setTooltip: (tip: TooltipState | null) => void;
  nucleotideWidth: number;
}

export default function SequenceViewer({
  sequences,
  speciesList,
  speciesDisplay,
  pageIndex,
  pageSize,
  setTooltip,
  nucleotideWidth,
}: SequenceViewerProps) {
  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, offset) => {
      const absIndex = start + offset + 1;
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + offset])
        .filter(Boolean);
      const conserved = basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);
      const className = "nucleotide " + (conserved ? "conserved" : "divergent");
      const tooltipText = conserved
        ? `Conserved | Position ${absIndex} | Base: ${base}`
        : `Divergent | Position ${absIndex} | Base: ${base}`;
      return (
        <span
          key={absIndex}
          className={className}
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
            userSelect: "none",
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
          const displayName = speciesDisplay[speciesKey] ?? speciesKey;
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
                {displayName} (Gene length: {seq.length} nucleotides)
              </h2>
              <div className="sequence-row">{renderNucleotides(segment, start)}</div>
            </section>
          );
        })}
      </div>
      <style>{`
        .species-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          gap: 16px;
          border: 1px solid #ccc;
          padding: 12px;
          box-sizing: border-box;
          overflow-y: auto;
          background: #fefefe;
          border-radius: 8px;
        }
        .species-row {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 12px;
          background: #f9faff;
          box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
          outline-offset: 4px;
        }
        .species-label {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 1.2rem;
          color: #123c7c;
          user-select: text;
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
          border-bottom: 1px solid #ccc;
          cursor: default;
          user-select: none;
          width: 100%;
          gap: 1px;
        }
        .nucleotide {
          text-align: center;
          padding: 3px 0;
          border-radius: 4px;
          transition: background-color 0.15s ease, color 0.15s ease;
          user-select: none;
          flex-shrink: 0;
        }
        .nucleotide:hover {
          background-color: #ffef87;
          color: #333;
          font-weight: 700;
          cursor: help;
        }
        .conserved {
          background: #d9ebff;
          color: #003f87;
        }
        .divergent {
          background: #ffdad9;
          color: #a10000;
        }
      `}</style>
    </>
  );
}
