// SequenceViewer.tsx
// React functional component rendering aligned DNA sequences by species,
// with equal vertical height rows inside a tall container.
// Supports pagination, nucleotide conservation coloring, and accessible tooltips.
// Fully typed with TypeScript and clean code style for professional use.

import React from "react";

// Props interface representing essential inputs to the component
interface SequenceViewerProps {
  // Aligned sequences keyed by species name
  sequences: Record<string, string>;

  // Display order of species keys
  speciesList: string[];

  // Mapping of species key to friendly display name
  speciesDisplay: Record<string, string>;

  // Current pagination page (zero-based)
  pageIndex: number;

  // Number of nucleotides per page slice
  pageSize: number;

  // Tooltip setter function accepts either tooltip data or null to clear
  setTooltip: (tip: { text: string; x: number; y: number } | null) => void;
}

/**
 * SequenceViewer Component
 * ------------------------
 * Renders aligned nucleotide sequences for a subset (page) of the full sequence per species,
 * organized in rows. Each species row is guaranteed equal height within a tall container
 * for consistent UI. Nucleotides are color-coded by conservation (blue for conserved, red for divergent),
 * and show accessible tooltips on hover.
 * 
 * Accessibility features:
 * - Aria roles and labels for nucleotide spans for screen readers
 * - Aria-live regions on species labels for dynamic updates
 * 
 * Styling is scoped with Styled JSX and leverages flexbox for layout and equal row heights.
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
   * Renders nucleotide spans with interactive and visual features for a segment.
   *
   * @param segment Array of nucleotide characters for the current page segment
   * @param start Zero-based global index offset in the full sequence for this segment
   * @returns Array of React elements for each nucleotide span
   */
  function renderNucleotides(segment: string[], start: number) {
    return segment.map((base, offset) => {
      const absIndex = start + offset + 1; // 1-based position for user-friendly display

      // Gather bases from all species at the current nucleotide index to determine conservation
      const basesAtPos = Object.values(sequences)
        .map((seq) => seq[start + offset])
        .filter(Boolean);

      // Determine if nucleotides at this position are conserved (all identical and >1 base)
      const conserved =
        basesAtPos.length > 1 && basesAtPos.every((b) => b === basesAtPos[0]);

      // Assign color class for nucleotide: 'conserved' or 'divergent'
      const className = "nucleotide " + (conserved ? "conserved" : "divergent");

      // Construct tooltip text for screen reader and mouse hover context
      const tooltipText = conserved
        ? `Conserved | Position ${absIndex} | Base: ${base}`
        : `Divergent | Position ${absIndex} | Base: ${base}`;

      // Return interactive span element for this nucleotide
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
      {/* Root container enforcing vertical height and equal row sizing via flex */}
      <div className="species-container" role="list" aria-label="Species sequences">
        {/* Map over species to render each species' sequence row */}
        {speciesList.map((speciesKey) => {
          const displayName = speciesDisplay[speciesKey] ?? speciesKey;
          const seq = sequences[speciesKey] || "";

          // Calculate nucleotide segment for current page
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
              {/* Species label with aria-live for accessibility */}
              <h2
                className="species-label"
                id={`label-${speciesKey}`}
                tabIndex={-1}
                aria-live="polite"
              >
                {displayName} (Gene length: {seq.length} nucleotides)
              </h2>

              {/* Nucleotide sequence container */}
              <div className="sequence-row">{renderNucleotides(segment, start)}</div>
            </section>
          );
        })}
      </div>

      {/* Scoped styling for layout and UI */}
      <style>{`
        /* Container that holds all species rows with fixed height and column flex layout */
        .species-container {
          display: flex;
          flex-direction: column;
          height: 600px; /* Tall vertical height for demonstration, adjust as needed */
          gap: 16px; /* Spacing between species rows */
          border: 1px solid #ccc;
          padding: 12px;
          box-sizing: border-box;
          overflow-y: auto; /* Scroll if content exceeds height */
          background: #fefefe;
          border-radius: 8px;
        }

        /* Each species-row grows equally to fill vertical space */
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

        /* Header label for each species */
        .species-label {
          font-weight: 700;
          margin-bottom: 12px;
          font-size: 1.2rem;
          color: #123c7c;
          user-select: text;
        }

        /* Nucleotide sequence displayed in a horizontal flex row */
        .sequence-row {
          display: flex;
          flex-direction: row;
          white-space: nowrap; /* Prevent wrapping nucleotide bases */
          font-family: monospace;
          font-size: 1.15rem;
          line-height: 1.3;
          overflow-x: auto; /* Enable horizontal scroll if needed */
          padding-bottom: 4px;
          border-bottom: 1px solid #ccc;
          cursor: default;
          user-select: none;
        }

        /* Styling nucleotide base blocks */
        .nucleotide {
          display: inline-block;
          width: 18px; /* Fixed width for consistent alignment */
          text-align: center;
          padding: 3px 0;
          border-radius: 4px;
          margin-right: 1px;
          transition: background-color 0.15s ease, color 0.15s ease;
          user-select: none;
          flex-shrink: 0; /* Prevent shrinking in flex container */
        }

        /* Hover highlight for nucleotide bases */
        .nucleotide:hover {
          background-color: #ffef87;
          color: #333;
          font-weight: 700;
          cursor: help;
        }

        /* Conserved nucleotides styling */
        .conserved {
          background: #d9ebff;
          color: #003f87;
        }

        /* Divergent nucleotides styling */
        .divergent {
          background: #ffdad9;
          color: #a10000;
        }
      `}</style>
    </>
  );
}
