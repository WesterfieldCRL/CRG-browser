import React from "react";

interface SequenceViewerProps {
  // DNA/aligned sequences keyed by species name
  sequences: Record<string, string>;

  // Array of species keys in display order
  speciesList: string[];

  // Mapping of species keys → display name
  speciesDisplay: Record<string, string>;

  // Currently displayed page index (0-based)
  pageIndex: number;

  // Number of nucleotides per page
  pageSize: number;

  // Setter function to update tooltip info on nucleotide hover
  setTooltip: (tip: { text: string; x: number; y: number } | null) => void;
}

/**
 * SequenceViewer component renders aligned DNA sequences per species as rows,
 * showing one paginated segment at a time.
 * Each nucleotide is styled as conserved or divergent across species at the position.
 * Tooltips show detailed info on nucleotide hover.
 */
export default function SequenceViewer({
  sequences,
  speciesList,
  speciesDisplay,
  pageIndex,
  pageSize,
  setTooltip,
}: SequenceViewerProps) {
  /**
   * Helper to render individual nucleotide bases in a segment with styling and tooltip.
   * @param segment nucleotides string array for this page segment
   * @param start zero-based offset of this segment in full sequence
   * @returns array of styled <span> elements
   */
  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, offset) => {
      const absIndex = start + offset + 1; // 1-based genomic position

      // Collect bases from all species at this relative position,
      // filtering empty or undefined characters
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + offset])
        .filter(Boolean);

      // Determine if base is conserved (all identical across species)
      const conserved =
        basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);

      // Assign CSS classes for conserved/divergent bases for visual differentiation
      const className = "nucleotide " + (conserved ? "conserved" : "divergent");

      // Tooltip describing conservation and nucleotide info
      const tooltipText = conserved
        ? `Conserved | Position ${absIndex} | Base: ${base}`
        : `Divergent | Position ${absIndex} | Base: ${base}`;

      return (
        <span
          key={absIndex}
          className={className}
          onMouseMove={(e) =>
            // Update global tooltip state with textual info and screen coordinates
            setTooltip({ text: tooltipText, x: e.pageX + 12, y: e.pageY + 12 })
          }
          onMouseLeave={() => setTooltip(null)} // Hide tooltip on mouse leave
          aria-label={tooltipText} // Accessibility: Describe this element
          role="text"
        >
          {base}
        </span>
      );
    });
  }

  return (
    <>
      {speciesList.map((speciesKey) => {
        // Obtain display name and sequence for species; fallback gracefully
        const displayName = speciesDisplay[speciesKey] ?? speciesKey;
        const sequence = sequences[speciesKey] || "";

        // Compute paginated slice indices
        const start = pageIndex * pageSize;
        const end = Math.min(sequence.length, start + pageSize);

        // Extract sequence segment to render on this page
        const segment = Array.from(sequence.slice(start, end));

        return (
          <section
            className="species-row"
            key={speciesKey}
            aria-labelledby={`label-${speciesKey}`}
          >
            <h2
              className="species-label"
              id={`label-${speciesKey}`}
              tabIndex={-1}
              aria-live="polite"
            >
              {displayName} (Gene length: {sequence.length} nucleotides)
            </h2>
            <div className="sequence-row" role="list">
              {renderNucleotides(segment, start)}
            </div>
          </section>
        );
      })}

      {/* Scoped styling for clean visuals and good UX */}
      <style>{`
        .species-row {
          margin-bottom: 24px;
          outline-offset: 4px;
        }
        .species-label {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 1.1rem;
          color: #123c7c;
          user-select: text;
        }
        .sequence-row {
          display: flex;
          flex-direction: row;
          white-space: nowrap; /* Keep nucleotides in one line */
          font-family: monospace;
          font-size: 1.15rem;
          line-height: 1.3;
          overflow-x: auto; /* Horizontal scrolling for overflow */
          padding-bottom: 4px;
          border-bottom: 1px solid #ccc;
          cursor: default;
          user-select: none;
        }
        .nucleotide {
          display: inline-block;
          width: 18px;
          text-align: center;
          padding: 3px 0;
          border-radius: 4px;
          margin-right: 1px;
          transition: background-color 0.15s ease, color 0.15s ease;
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

        /* Scrollbar styling for modern browsers */
        .sequence-row::-webkit-scrollbar {
          height: 8px;
        }
        .sequence-row::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 4px;
        }
        .sequence-row::-webkit-scrollbar-thumb {
          background: #123c7c;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}
