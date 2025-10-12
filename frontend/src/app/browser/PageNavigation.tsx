// PageNavigation.tsx
// Pagination component with direct input and download functionality,
// fully typed with TypeScript, enhanced accessibility, and modern styling.

import React, { useState, useEffect } from "react";

interface PageNavigationProps {
  // Current zero-based page index
  pageIndex: number;
  // Total number of pages
  totalPages: number;
  // Setter to update current page index
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  // Sequences by species, used for FASTA download
  sequences: Record<string, string>;
  // Selected gene symbol for FASTA headers and filename
  selectedGene: string;
  // Callback to toggle iterative zoom mode
  onValueChange: (value: boolean) => void;
}

/**
 * PageNavigation Component provides:
 * - Previous/Next buttons (with disabled states)
 * - Input box for direct page number entry (validated and clamped)
 * - Download button to export sequences as multi-FASTA file
 *
 * Features:
 * - Accessible labels and roles for screen readers
 * - Keyboard-friendly: Enter key submits input
 * - Dynamic input width based on content length
 * - Modern, consistent styling with smooth hover/focus effects
 */
export default function PageNavigation({
  pageIndex,
  totalPages,
  setPageIndex,
  sequences,
  selectedGene,
  onValueChange,
}: PageNavigationProps) {
  // Local input state (1-based page display for user)
  const [inputPage, setInputPage] = useState<string>((pageIndex + 1).toString());

  // Sync input box state whenever pageIndex prop changes externally
  useEffect(() => {
    setInputPage((pageIndex + 1).toString());
  }, [pageIndex]);

  // Allow only digits or empty string for smooth typing experience
  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  }

  // Validate and update pageIndex based on inputPage
  function navigateToPage() {
    const num = parseInt(inputPage, 10);
    if (!isNaN(num)) {
      // Clamp input page within bounds [1, totalPages]
      const clamped = Math.min(Math.max(num, 1), totalPages);
      setPageIndex(clamped - 1);
      setInputPage(clamped.toString()); // Reset input to clamped to keep consistent
    } else {
      // Invalid input: reset to current page
      setInputPage((pageIndex + 1).toString());
    }
  }

  // Called when input loses focus
  function handleInputBlur() {
    navigateToPage();
  }

  // Submit input on Enter key press
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      navigateToPage();
      // Remove focus to trigger blur validation
      (e.target as HTMLInputElement).blur();
    }
  }

  // Dynamically adjust input width based on input length (+ padding chars)
  const inputWidth = Math.max(inputPage.length, 1) + 4;

  // Compose and trigger download of sequences as multi-FASTA file
  function handleDownload() {
    // Compose FASTA content string
    const content = Object.entries(sequences)
      .map(([species, seq]) => `>${selectedGene}|${species}\n${seq}`)
      .join("\n");

    const fileName = `sequences-${selectedGene}.fasta`;

    // Create blob link and simulate click for file download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a); // Append for Firefox support
    a.click();
    a.remove(); // Clean up
    URL.revokeObjectURL(url);
  }

  function handleIterativeZoom() {
    onValueChange(true);
  }

  return (
    <nav className="page-nav" aria-label="Pagination navigation">
      {/* Previous Page Button */}
      <button
        type="button"
        disabled={pageIndex === 0}
        aria-disabled={pageIndex === 0}
        aria-label="Go to previous page"
        onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
      >
        ← Prev
      </button>

      {/* Page Input Control */}
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
        aria-label="Current page number"
        aria-describedby="page-total"
        style={{ width: `${inputWidth}ch` }}
      />
      <span id="page-total" aria-live="polite" aria-atomic="true">
        {" "}
        of {totalPages}
      </span>

      {/* Next Page Button */}
      <button
        type="button"
        disabled={pageIndex === totalPages - 1}
        aria-disabled={pageIndex === totalPages - 1}
        aria-label="Go to next page"
        onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
      >
        Next →
      </button>

      {/* Download FASTA Button */}
      <button
        type="button"
        aria-label="Download sequences as FASTA file"
        onClick={handleDownload}
      >
        Download Sequences
      </button>

      {/* Iterative Zoom Button */}
      <button
        type="button"
        aria-label="Enter iterative zoom mode"
        onClick={handleIterativeZoom}
      >
        Iterative Zoom
      </button>

      {/* Styles */}
      <style>{`
        /* Visually hidden label for screen readers */
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

        .page-nav {
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
          color: #123c7c;
          user-select: none;
          flex-wrap: wrap;
        }

        .page-nav button {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          background-color: #123c7c;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          min-width: 90px;
          user-select: none;
        }

        .page-nav button:hover:not(:disabled) {
          background-color: #0d2a55;
          box-shadow: 0 0 6px rgba(18, 60, 124, 0.6);
        }

        .page-nav button:disabled,
        .page-nav button[aria-disabled="true"] {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .page-nav input[type="text"] {
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

        .page-nav input[type="text"]:focus {
          border-color: #0d2a55;
          box-shadow: 0 0 6px rgba(18, 60, 124, 0.6);
        }
      `}</style>
    </nav>
  );
}
