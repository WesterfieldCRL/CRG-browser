import React, { useState, useEffect } from "react";

interface PageNavigationProps {
  pageIndex: number;
  totalPages: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  sequences: Record<string, string>;
}

export default function PageNavigation({
  pageIndex,
  totalPages,
  setPageIndex,
  sequences,
}: PageNavigationProps) {
  const [inputPage, setInputPage] = useState<string>((pageIndex + 1).toString());

  // Keep input in sync if pageIndex changes outside input (e.g. Prev/Next buttons)
  useEffect(() => {
    setInputPage((pageIndex + 1).toString());
  }, [pageIndex]);

  // Allow only digits or empty string in the input field
  function handlePageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputPage(val);
    }
  }

  // Navigate to page on blur or enter press
  function navigateToPage() {
    const num = parseInt(inputPage);
    if (!isNaN(num)) {
      const clamped = Math.min(Math.max(num, 1), totalPages);
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

  // Adjust input width based on number of digits entered + 1 char buffer
  const inputWidth = Math.max(inputPage.length, 1) + 4;

  // Prepare FASTA download
  function handleDownload() {
    const content = Object.entries(sequences)
      .map(([species, seq]) => `>${species}\n${seq}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequences.fasta";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-nav">
      <button
        onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
        disabled={pageIndex === 0}
      >
        ← Prev
      </button>

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

      <button
        onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
        disabled={pageIndex === totalPages - 1}
      >
        Next →
      </button>

      <button onClick={handleDownload}>Download Sequences</button>

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
