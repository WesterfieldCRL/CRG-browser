import React, { useState, useEffect } from "react";

interface PageNavigationProps {
  pageIndex: number; // Current zero-based page index
  totalPages: number; // Total number of pages available
  setPageIndex: React.Dispatch<React.SetStateAction<number>>; // Setter for changing page index
  sequences: Record<string, string>; // Sequences keyed by species (for download)
  selectedGene: string; // Gene name for FASTA header and file naming
}

/**
 * PageNavigation component provides controls to navigate paginated sequence data.
 * Includes previous/next buttons, direct page number input, and sequences download.
 *
 * Features:
 * - Input box for quick page navigation with input validation and clamping.
 * - Prev/Next buttons with disabled states.
 * - Download button exporting displayed sequences as multi-FASTA file.
 * - Accessible labels and keyboard-friendly input.
 * - Modern styling with transitions and button feedback.
 */
export default function PageNavigation({
  pageIndex,
  totalPages,
  setPageIndex,
  sequences,
  selectedGene,
}: PageNavigationProps) {
  // Local state to control the page number input box (1-based for user clarity)
  const [inputPage, setInputPage] = useState<string>((pageIndex + 1).toString());

  // Sync input box with external pageIndex changes for correctness
  useEffect(() => {
    setInputPage((pageIndex + 1).toString());
  }, [pageIndex]);

  // Allow only empty or digits in input for smooth typing experience
  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  }

  // Validate and apply navigation upon blur or pressing Enter
  function navigateToPage() {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum)) {
      // Clamp to valid 1-based page range and update
      const clamped = Math.min(Math.max(pageNum, 1), totalPages);
      setPageIndex(clamped - 1);
      setInputPage(clamped.toString());
    } else {
      // Reset invalid input to current page
      setInputPage((pageIndex + 1).toString());
    }
  }

  function handleInputBlur() {
    navigateToPage();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      navigateToPage();
      (e.target as HTMLInputElement).blur();
    }
  }

  // Dynamically adjust input width based on number of digits + padding
  const inputWidth = Math.max(inputPage.length, 1) + 4;

  // Trigger download of sequences in FASTA format
  function handleDownload() {
    // Compose multi-FASTA content with headers ">gene|species"
    const fastaContent = Object.entries(sequences)
      .map(([species, seq]) => `>${selectedGene}|${species}\n${seq}`)
      .join("\n");

    const fileName = `sequences-${selectedGene}.fasta`;
    // Create blob and programmatically click anchor for download
    const blob = new Blob([fastaContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-navigation" role="navigation" aria-label="Page navigation controls">
      {/* Previous Page Button */}
      <button
        onClick={() => setPageIndex((idx) => Math.max(0, idx - 1))}
        disabled={pageIndex === 0}
        aria-disabled={pageIndex === 0}
        aria-label="Go to previous page"
        type="button"
      >
        ← Prev
      </button>

      {/* Page Number Input for direct navigation */}
      <label htmlFor="page-number-input" className="sr-only">
        Page number input
      </label>
      <input
        id="page-number-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputPage}
        onChange={handlePageInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        style={{ width: `${inputWidth}ch` }}
        aria-describedby="pagination-total-pages"
        aria-label="Current page number"
      />

      {/* Display total pages */}
      <span id="pagination-total-pages" aria-live="polite" aria-atomic="true">
        {" "}
        of {totalPages}
      </span>

      {/* Next Page Button */}
      <button
        onClick={() => setPageIndex((idx) => Math.min(totalPages - 1, idx + 1))}
        disabled={pageIndex >= totalPages - 1}
        aria-disabled={pageIndex >= totalPages - 1}
        aria-label="Go to next page"
        type="button"
      >
        Next →
      </button>

      {/* Download Sequences Button */}
      <button onClick={handleDownload} type="button" aria-label="Download sequences as FASTA file">
        Download Sequences
      </button>

      <style>{`
        /* Visually hidden utility for accessibility */
        .sr-only {
          border: 0 !important;
          clip: rect(1px, 1px, 1px, 1px) !important;
          -webkit-clip-path: inset(50%) !important;
                  clip-path: inset(50%) !important;
          height: 1px !important;
          margin: -1px !important;
          overflow: hidden !important;
          padding: 0 !important;
          position: absolute !important;
          width: 1px !important;
          white-space: nowrap !important;
        }

        .page-navigation {
          display: flex;
          align-items: center;
          gap: 16px;
          font-weight: 600;
          font-size: 1rem;
          color: #123c7c;
          user-select: none;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 480px;
          margin: 0 auto;
        }

        .page-navigation button {
          padding: 10px 18px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          background-color: #123c7c;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          font-weight: 600;
          user-select: none;
          min-width: 90px;
        }

        .page-navigation button:hover:not(:disabled) {
          background-color: #0d2a55;
          box-shadow: 0 0 6px rgba(18, 60, 124, 0.6);
        }

        .page-navigation button:disabled,
        .page-navigation button[aria-disabled="true"] {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .page-navigation input[type="text"] {
          padding: 8px 12px;
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
          color: #123c7c;
          border-radius: 6px;
          border: 1px solid #123c7c;
          font-family: monospace;
          outline-offset: 2px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          min-width: 50px;
          user-select: text;
        }

        .page-navigation input[type="text"]:focus {
          border-color: #0d2a55;
          box-shadow: 0 0 6px rgba(18, 60, 124, 0.6);
        }
      `}</style>
    </div>
  );
}
