import React, { useState, useEffect } from "react";

interface PageNavigationProps {
  pageIndex: number;
  totalPages: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  sequences: Record<string, string>;
  selectedGene: string; // Added selectedGene prop to customize FASTA output
}

export default function PageNavigation({
  pageIndex,
  totalPages,
  setPageIndex,
  sequences,
  selectedGene,
}: PageNavigationProps) {
  // State to control page number input box (1-based for user friendliness)
  const [inputPage, setInputPage] = useState<string>((pageIndex + 1).toString());

  // Keep input box synced with external programmatic page changes
  useEffect(() => {
    setInputPage((pageIndex + 1).toString());
  }, [pageIndex]);

  // Allow only digits or empty string in input box
  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  }

  // Validate and navigate when input loses focus or enter key pressed
  function navigateToPage() {
    const num = parseInt(inputPage);
    if (!isNaN(num)) {
      // Clamp page number within valid range
      const clamped = Math.min(Math.max(num, 1), totalPages);
      setPageIndex(clamped - 1);
      setInputPage(clamped.toString());
    } else {
      // Reset input if invalid
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

  // Input width dynamically adjusts per number length (+4 chars extra for comfort)
  const inputWidth = Math.max(inputPage.length, 1) + 4;

  // Handles download of sequences as FASTA file with gene and species in header
  function handleDownload() {
    // Compose FASTA formatted content, header = >{gene}|{species}
    const content = Object.entries(sequences)
      .map(([species, seq]) => `>${selectedGene}|${species}\n${seq}`)
      .join("\n");

    // Filename includes gene name
    const fileName = `sequences-${selectedGene}.fasta`;

    // Create blob and simulate anchor click to download file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-nav">
      {/* Prev button disables on first page */}
      <button
        onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
        disabled={pageIndex === 0}
      >
        ← Prev
      </button>

      {/* Page input for direct page number navigation */}
      <span>
        Page{" "}
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={handlePageInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          aria-label="Page number input"
          style={{
            width: `${inputWidth}ch`,
            textAlign: "center",
            fontWeight: "600",
            fontSize: "1rem",
            color: "#123c7c",
            borderRadius: "6px",
            border: "1px solid #123c7c",
            padding: "6px 8px",
            fontFamily: "monospace",
            transition: "width 0.2s",
          }}
        />{" "}
        of {totalPages}
      </span>

      {/* Next button disables on last page */}
      <button
        onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
        disabled={pageIndex === totalPages - 1}
      >
        Next →
      </button>

      {/* Download button triggers FASTA download */}
      <button onClick={handleDownload}>Download Sequences</button>

      {/* Inline CSS for styling the navigation */}
      <style>{`
        .page-nav {
          margin: 20px 0;
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: center;
          font-weight: 600;
          font-size: 1rem;
          color: #123c7c;
        }

        .page-nav button {
          padding: 10px 16px;
          border-radius: 6px;
          border: 1px solid #123c7c;
          background: #123c7c;
          color: white;
          cursor: pointer;
          transition: 0.2s;
          font-weight: 600;
        }

        .page-nav button:hover:not(:disabled) {
          background: #0d2a55;
        }

        .page-nav button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
