"use client";

import React, { useEffect, useState } from "react";
import InteractiveLine from "./InteractiveLine";
import {
  fetchRegulatoryGenes,
  fetchRegulatoryELementLines,
} from "../utils/services";

class LineShapes {
  start: number;
  end: number;
  info: string;
  color: string;

  constructor(start: number, end: number, info: string, color: string) {
    this.start = start;
    this.end = end;
    this.info = info;
    this.color = color;
  }
}

class RegulatoryLine {
  relative_start: number;
  relative_end: number;
  real_start: number;
  real_end: number;
  shapes: Array<LineShapes>;

  constructor(
    relative_start: number,
    relative_end: number,
    real_start: number,
    real_end: number,
    shapes: Array<LineShapes>
  ) {
    this.relative_start = relative_start;
    this.relative_end = relative_end;
    this.real_start = real_start;
    this.real_end = real_end;
    this.shapes = shapes;
  }
}

export default function RegComp() {
  const [loading, setLoading] = useState<boolean>(true);
  const [genes, setGenes] = useState<Array<string>>([]);
  const [selected_gene, setSelectedGene] = useState<string>("none");
  const [reg_lines, setRegLines] = useState<Record<string, RegulatoryLine>>();

  async function loadGenes() {
    setLoading(true);
    try {
      const data = await fetchRegulatoryGenes();
      setGenes(data);
    } catch (error) {
      console.error("Error fetching condensed sequences:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadLines(geneName: string) {
    setLoading(true);
    try {
      const data = await fetchRegulatoryELementLines(geneName);

      setRegLines(data);
    } catch (error) {
      console.error("Error fetching condensed sequences:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleButtonPress(gene: string) {
    loadLines(gene);
    setSelectedGene(gene);
  }

  // Initial load
  useEffect(() => {
    loadGenes();
  }, []);

  return (
    <>
      <main>
        {!loading && (
          <>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {genes.map((gene) => (
                <React.Fragment key={gene}>
                  <button onClick={() => handleButtonPress(gene)}>
                    {gene}
                  </button>
                </React.Fragment>
              ))}
            </div>
            {!(selected_gene === "none") && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "left",
                  width: "100%",
                  padding: "100px",
                  fontSize: "25px",
                  gap: "20px",
                }}
              >
                {Object.entries(reg_lines).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <div
                      style={{
                        backgroundColor: "#ddeaffff",
                        borderRadius: "15px",
                        padding: "10px",
                      }}
                    >
                      {key}
                      <InteractiveLine
                        start={value.relative_start}
                        end={value.relative_end}
                        start_label={value.real_start}
                        end_label={value.real_end}
                        shapes={value.shapes}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
