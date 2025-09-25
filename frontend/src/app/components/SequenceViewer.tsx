import React from "react";

interface SequenceViewerProps {
  sequences: Record<string, string>;
  speciesList: string[];
  speciesDisplay: Record<string, string>;
  pageIndex: number;
  pageSize: number;
  setTooltip: (tip: { text: string; x: number; y: number } | null) => void;
}

export default function SequenceViewer({
  sequences,
  speciesList,
  speciesDisplay,
  pageIndex,
  pageSize,
  setTooltip,
}: SequenceViewerProps) {
  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, i) => {
      const absIndex = start + i + 1;
      const positionBases = Object.values(sequences)
        .map((seq) => seq[start + i])
        .filter(Boolean);

      const conserved =
        positionBases.length > 1 &&
        positionBases.every((b) => b === positionBases[0]);

      const className = "nucleotide " + (conserved ? "conserved" : "divergent");
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

  return (
    <>
      {speciesList.map((sp) => {
        const species = speciesDisplay[sp];
        const seq = sequences[species] || "";
        const start = pageIndex * pageSize;
        const end = Math.min(seq.length, (pageIndex + 1) * pageSize);
        const segment = Array.from(seq.slice(start, end));

        return (
          <div className="species-row" key={species}>
            <div className="species-label">
              {species} (Gene length: {seq.length} nucleotides)
            </div>
            <div className="sequence-row">{renderNucleotides(segment, start)}</div>
          </div>
        );
      })}

      <style>{`
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
          user-select: none;
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
