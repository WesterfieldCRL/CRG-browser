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
      <style jsx>{`
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
          color: var(--label-color);
          user-select: none;
          flex-wrap: wrap;
          margin-top: 20px;
          transition: color 0.3s ease;
        }

        .page-nav button {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background-color: var(--button-bg);
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease, box-shadow 0.2s ease, border-color 0.3s ease, transform 0.15s ease;
          min-width: 90px;
          user-select: none;
        }

        .page-nav button:hover:not(:disabled) {
          background-color: var(--button-hover);
          box-shadow: 0 0 8px rgba(45, 180, 182, 0.6);
          transform: translateY(-1px);
        }

        .page-nav button:active:not(:disabled) {
          transform: translateY(0);
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
          color: var(--main-text);
          background-color: var(--select-bg);
          border-radius: 6px;
          border: 1px solid var(--border-color);
          font-family: monospace;
          outline-offset: 2px;
          transition: border-color 0.3s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
          min-width: 50px;
          user-select: text;
        }

        .page-nav input[type="text"]:focus {
          border-color: var(--accent, #2db4b6);
          box-shadow: 0 0 8px rgba(45, 180, 182, 0.4);
        }
      `}</style>
    </nav>
  );
}
