// SequenceViewer.tsx
// React functional component to render DNA sequences aligned by species,
// with dynamically paged segments and nucleotide conservation highlighting.
// Provides accessible tooltips on nucleotide hover.
// Fully typed with TypeScript and professionally commented for maintainability.

import React from "react";

interface SequenceViewerProps {
  // Dictionary of aligned sequences keyed by species name
  sequences: Record<string, string>;

  // Ordered array of species keys controlling display order
  speciesList: string[];

  // Mapping of species keys to friendly display names
  speciesDisplay: Record<string, string>;

  // Zero-based index of the current pagination page
  pageIndex: number;

  // Number of nucleotides to display per page, calculated dynamically
  pageSize: number;

  // Setter function for updating tooltip state on nucleotide hover
  setTooltip: (tip: { text: string; x: number; y: number } | null) => void;
}

/**
 * SequenceViewer Component
 * ------------------------
 * Renders one page (segment) of aligned nucleotide sequences across species,
 * highlighting conserved nucleotides (all same base) in blue and divergent in red.
 * Each nucleotide is a span with mouse event handlers to update tooltip info.
 * 
 * Assumes each nucleotide has fixed width styling for layout calculations.
 * Supports keyboard and screen-reader accessibility with aria attributes.
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
   * Renders spans for a segment of nucleotides, applying visual and interaction effects.
   * 
   * @param segment The nucleotide array for current page segment
   * @param start Zero-based index offset into the full sequence
   * @returns Array of <span> elements representing nucleotides
   */
  function renderNucleotides(segment: string[], start: number) {
    // Loop over bases, compute conservation, assign classes and tooltip data
    return segment.map((base, offset) => {
      const absIndex = start + offset + 1; // 1-based position for display

      // Gather bases at this position across all species (filter out empty)
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + offset])
        .filter(Boolean);

      // Determine if site is conserved: more than 1 base and all identical
      const conserved =
        basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);

      // Set CSS class for coloring: blue if conserved, red if divergent
      const className = "nucleotide " + (conserved ? "conserved" : "divergent");

      // Tooltip text describing conservation info and base detail
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
        >
          {base}
        </span>
      );
    });
  }

  return (
    <>
      {/* Render each species row in display order */}
      {speciesList.map((speciesKey) => {
        // Fallback species display name if missing in map
        const displayName = speciesDisplay[speciesKey] ?? speciesKey;

        // Retrieve sequence for species or empty string if missing
        const seq = sequences[speciesKey] || "";

        // Calculate the segment indices for current page
        const start = pageIndex * pageSize;
        const end = Math.min(seq.length, start + pageSize);

        // Extract segment array of bases to display
        const segment = Array.from(seq.slice(start, end));

        return (
          <section
            className="species-row"
            key={speciesKey}
            aria-labelledby={`label-${speciesKey}`}
          >
            {/* Species label with aria connection for screen readers */}
            <h2
              className="species-label"
              id={`label-${speciesKey}`}
              tabIndex={-1}
              aria-live="polite"
            >
              {displayName} (Gene length: {seq.length} nucleotides)
            </h2>

            {/* Sequence row container with list role */}
            <div className="sequence-row" role="list">
              {renderNucleotides(segment, start)}
            </div>
          </section>
        );
      })}

      {/* Styled JSX for component-scoped styles */}
      <style>{`
        /* Container styles for each species row */
        .species-row {
          margin-bottom: 24px;
          outline-offset: 4px;
        }
        /* Species label heading style */
        .species-label {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 1.1rem;
          color: #123c7c;
          user-select: text;
        }
        /* Sequence displayed in monospace, horizontally aligned and scroll disabled */
        .sequence-row {
          display: flex;
          flex-direction: row;
          white-space: nowrap; /* prevent wrapping */
          font-family: monospace;
          font-size: 1.15rem;
          line-height: 1.3;
          overflow-x: hidden; /* overflow prevented by dynamic pagination */
          padding-bottom: 4px;
          border-bottom: 1px solid #ccc;
          cursor: default;
          user-select: none;
        }
        /* Nucleotide base blocks consistently sized and styled */
        .nucleotide {
          display: inline-block;
          width: 18px; /* fixed width used for layout calculation */
          text-align: center;
          padding: 3px 0;
          border-radius: 4px;
          margin-right: 1px;
          transition: background-color 0.15s ease, color 0.15s ease;
          user-select: none;
        }
        /* Highlight on hover for clarity */
        .nucleotide:hover {
          background-color: #ffef87;
          color: #333;
          font-weight: 700;
          cursor: help;
        }
        /* Conserved nucleotides: blue background & dark blue text */
        .conserved {
          background: #d9ebff;
          color: #003f87;
        }
        /* Divergent nucleotides: light red background & dark red text */
        .divergent {
          background: #ffdad9;
          color: #a10000;
        }
      `}</style>
    </>
  );
}
