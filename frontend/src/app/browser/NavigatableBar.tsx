import { useEffect, useState } from "react";
import {
  fetchAssembly,
  fetchEnhPromBars,
  fetchGeneNums,
  fetchNucleotides,
  fetchSequenceNums,
  fetchTFBSBars,
} from "../utils/services";
import Slider from "rc-slider";
import { spec } from "node:test/reporters";
import ColorBar from "./ColorBar";
import { time } from "console";

interface NavigatableBarProps {
  gene: string;
  species: string;
  enh: boolean;
  prom: boolean;
  TFBS: string[];
  variants: string[];
  tfbs_color_map: { [key: string]: string };
  enh_prom_color_map: { [key: string]: string};
  zoomToRange?: { start: number; end: number } | null;
}

interface ColorSegment {
  type: string;
  width: number;
  start: number;
  end: number;
}

const NUCLEOTIDES_VIEW = 100;

const INITIAL_VIEW = 4000;



export default function NavigatableBar({
  gene,
  species,
  enh,
  prom,
  TFBS,
  variants,
  tfbs_color_map,
  enh_prom_color_map,
  zoomToRange,
}: NavigatableBarProps) {
  const [assembly, setAssembly] = useState<string>(null);
  const [loading, setLoading] = useState(true);
  const [startValue, setStartValue] = useState<number>(null);
  const [endValue, setEndValue] = useState<number>(null);
  const [sequenceStart, setSequenceStartValue] = useState<number>(null);
  const [sequenceEnd, setSequenceEndValue] = useState<number>(null);
  const [geneNums, setGeneNumsValue] = useState<[number, number]>(null);
  const [tfbsSequence, setTFBSSequence] = useState<Array<ColorSegment>>(null);
  const [enhancerPromoterSequence, setEnhancerPromoterSequence] =
    useState<Array<ColorSegment>>(null);
  const [nucletoides, setNucleotides] = useState<string>(null);
  const [renderNucleotides, setRenderNucleotides] = useState<boolean>(false);

  async function loadAssembly() {
    setAssembly((await fetchAssembly(species)).assembly);
  }

  async function loadSequenceNums() {
    const sequence_nums = await fetchSequenceNums(gene, species);
    setSequenceStartValue(sequence_nums.start);
    setSequenceEndValue(sequence_nums.end);
  }

  async function loadGenomicNums() {
    const genomic_nums = await fetchGeneNums(gene, species);
    setGeneNumsValue([genomic_nums.start, genomic_nums.end]);
  }

  async function loadSequences() {
    const tfbs = await fetchTFBSBars(gene, species, TFBS, startValue, endValue);
    setTFBSSequence(tfbs);

    const enh_prom_list = [];
    if (enh == true) {
      enh_prom_list.push("Enh");
    }
    if (prom == true) {
      enh_prom_list.push("Prom");
    }
    const enh_proms = await fetchEnhPromBars(
      gene,
      species,
      enh_prom_list,
      startValue,
      endValue
    );
    setEnhancerPromoterSequence(enh_proms);
  }

  async function loadNucleotides() {
    const nucleotides_string = await fetchNucleotides(
      gene,
      species,
      startValue,
      endValue
    );
    setNucleotides(nucleotides_string);
  }

  useEffect(() => {
    loadAssembly();
    loadSequenceNums();
    loadGenomicNums();
  }, []);

  useEffect(() => {
    loadAssembly();
    loadSequenceNums();
    loadGenomicNums();
  }, [gene, species, enh, prom, variants, TFBS]);

  useEffect(() => {
    if (!loading) return;

    if (
      assembly !== null &&
      sequenceEnd !== null &&
      sequenceStart !== null &&
      geneNums !== null
    ) {
      setStartValue(geneNums[0]);
      setEndValue(geneNums[0] + INITIAL_VIEW);
    }
  }, [assembly, sequenceStart, sequenceEnd, geneNums]);

  useEffect(() => {
    if (
      startValue !== null &&
      endValue !== null &&
      enhancerPromoterSequence == null &&
      tfbsSequence == null
    ) {
      loadSequences();
    } else if (
      !loading &&
      startValue == geneNums[0] &&
      endValue == geneNums[0] + INITIAL_VIEW
    ) {
      loadSequences();
    }
  }, [startValue, endValue]);

  useEffect(() => {
    if (!loading) return;

    if (enhancerPromoterSequence !== null && tfbsSequence !== null) {
      setLoading(false);
    }
  }, [tfbsSequence, enhancerPromoterSequence]);

  useEffect(() => {
    if (zoomToRange && !loading) {
      setStartValue(zoomToRange.start);
      setEndValue(zoomToRange.end);
    }
  }, [zoomToRange]);

  useEffect(() => {
    if (zoomToRange && !loading && startValue === zoomToRange.start && endValue === zoomToRange.end) {
      loadSequences();
      if (zoomToRange.end - zoomToRange.start <= NUCLEOTIDES_VIEW) {
        setRenderNucleotides(true);
        loadNucleotides();
      } else {
        setRenderNucleotides(false);
      }
    }
  }, [startValue, endValue, zoomToRange]);

  const handleSubmit = () => {
    loadSequences();
    if (endValue - startValue <= NUCLEOTIDES_VIEW) {
      setRenderNucleotides(true);
      loadNucleotides();
    } else {
      setRenderNucleotides(false);
    }
  };

  const handleGeneSubmit = () => {
    setStartValue(geneNums[0]);
    setEndValue(geneNums[0] + INITIAL_VIEW);
  };

  return (
    <div className="container-box" style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 12px)',
      padding: '24px',
      marginBottom: '16px'
    }}>
      {!loading && (
        <div>
          <h1 style={{ color: 'var(--text)', marginBottom: '16px' }}>
            {species} -{" "}
            {gene === "ALDH1A3" && species !== "Homo sapiens"
              ? "ALDH1A1"
              : gene}
            :{assembly}
          </h1>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Min Value = {sequenceStart}
                </label>
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) =>
                    setStartValue(
                      Math.max(sequenceStart, Number(e.target.value))
                    )
                  }
                  className="p-2 border rounded"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)'
                  }}
                  placeholder="Min value"
                />
              </div>
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{
                  background: 'var(--primary)',
                  color: 'white'
                }}
              >
                Set Min
              </button>
            </div>{" "}
            {/*Commented out cause it looked like shit, we can do something with this later*/}
            {/* <div style={{ display: "contents", pointerEvents: "none" }}>
              <Slider
                range={{ draggableTrack: true }}
                min={sequenceStart}
                max={sequenceEnd}
                value={range}
                styles={{
                  handle: {
                    height: "130px",
                    marginTop: "40px",
                    border: "3px solid var(--accent, #2db4b6)",
                    boxShadow: "inset 0 0 15px rgba(45, 180, 182, 0.4)",
                  },
                  rail: {
                    backgroundColor: "gray",
                    marginTop: "105px",
                    height: "5px",
                  },
                  track: {
                    height: "130px",
                    marginTop: "40px",
                    backgroundColor: "rgba(45, 180, 182, 0.35)",
                    border: "3px solid var(--accent, #2db4b6)",
                    boxShadow: "inset 0 0 15px rgba(45, 180, 182, 0.4)",
                  },
                }}
              />
            </div> */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGeneSubmit()}
                className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{
                  background: 'var(--accent)',
                  color: 'white'
                }}
              >
                Reset to Gene
              </button>
              <div className="flex flex-col">
                <label className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {geneNums[0]} - {geneNums[0] + INITIAL_VIEW}
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{
                  background: 'var(--primary)',
                  color: 'white'
                }}
              >
                Set Max
              </button>
              <div className="flex flex-col">
                <label className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Max Value = {sequenceEnd}
                </label>
                <input
                  type="number"
                  value={endValue}
                  onChange={(e) =>
                    setEndValue(Math.min(sequenceEnd, Number(e.target.value)))
                  }
                  className="p-2 border rounded"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)'
                  }}
                  placeholder="Max value"
                />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
                borderBottom: '2px solid var(--border)',
              }}
            >
              <label style={{
                alignSelf: "center",
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Transcription Factor Binding Sites
              </label>
              <div style={{ minWidth: 0 }}>
                <ColorBar
                  segments={tfbsSequence}
                  color_mapping={tfbs_color_map}
                  width="100%"
                />
                {(() => {
                  // Get unique TFBS types that are actually visible in current view
                  const visibleTypes = new Set(
                    tfbsSequence
                      .map(segment => segment.type)
                      .filter(type => type !== 'none')
                  );

                  return visibleTypes.size > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginTop: '8px',
                      padding: '8px',
                      background: 'var(--bg)',
                      borderRadius: '4px',
                      border: '1px solid var(--border)'
                    }}>
                      {Object.entries(tfbs_color_map)
                        .filter(([key]) => visibleTypes.has(key))
                        .map(([name, color]) => (
                          <div key={name} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: color,
                              borderRadius: '3px',
                              border: '1px solid var(--border)',
                              flexShrink: 0
                            }} />
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text)',
                              whiteSpace: 'nowrap'
                            }}>
                              {name}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
                borderBottom: '2px solid var(--border)',
              }}
            >
              <label style={{
                alignSelf: "center",
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Enhancers and Promoters
              </label>
              <div style={{ minWidth: 0 }}>
                <ColorBar
                  segments={enhancerPromoterSequence}
                  color_mapping={enh_prom_color_map}
                  width="100%"
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
              }}
            >
              <label style={{
                alignSelf: "center",
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px'
              }}>
                Nucleotides/Variants
              </label>
              <div style={{ minWidth: 0 }}>
                {renderNucleotides ? (
                  <div
                    style={{
                      display: "grid",
                      gridAutoFlow: "row",
                      gridTemplateColumns: `repeat(${
                        nucletoides?.length || 1
                      }, 1fr)`,
                      width: "100%",
                      gap: "1px",
                      height: "30px", // Match ColorBar default height
                    }}
                  >
                    {nucletoides?.split("").map((char, index) => (
                      <span
                        key={index}
                        style={{
                          border: '1px solid var(--border)',
                          background: 'var(--panel-bg)',
                          color: 'var(--text)',
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 0,
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      fontStyle: 'italic'
                    }}
                  >
                    Zoom in to ≤{NUCLEOTIDES_VIEW}bp range to view nucleotides
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
