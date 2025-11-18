import { useCallback, useEffect, useState } from "react";
import {
  fetchAssembly,
  fetchEnhPromBars,
  fetchGeneNums,
  fetchNucleotideBar,
  fetchSequenceNums,
  fetchTFBSBars,
  fetchVariantBars,
} from "../utils/services";
import ColorBar from "./ColorBar";
import Legend from "./Legend";
import {
  LineChart,
  MouseHandlerDataParam,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface NavigatableBarProps {
  gene: string;
  species: string;
  enh: boolean;
  prom: boolean;
  TFBS: string[];
  variants: string[];
  tfbs_color_map: { [key: string]: string };
  enh_prom_color_map: { [key: string]: string };
  nucleotides_color_map: { [key: string]: string };
  variants_color_map: { [key: string]: string };
  zoomToRange?: { start: number; end: number } | null;
}

interface ColorSegment {
  type: string;
  width: number;
  start: number;
  end: number;
}

const NUCLEOTIDES_VIEW = 1000;

const NUCLEOTIDES_LETTERS = 100;

const INITIAL_VIEW = 4000;

const TICKS_NUMS = 5;

const Y_AXIS_MIN = 0;

const Y_AXIS_MAX = 10;

export default function NavigatableBar({
  gene,
  species,
  enh,
  prom,
  TFBS,
  variants,
  tfbs_color_map,
  enh_prom_color_map,
  nucleotides_color_map,
  variants_color_map,
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
  const [nucleotides, setNucleotides] = useState<Array<ColorSegment>>(null);
  const [renderNucleotides, setRenderNucleotides] = useState<boolean>(false);
  const [renderNucleotideLetters, setRenderNucleotideLetters] =
    useState<boolean>(false);
  const [variantsSequence, setVariantsSequence] =
    useState<Array<ColorSegment>>(null);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [currStart, setCurrStart] = useState<number>(null);
  const [currEnd, setCurrEnd] = useState<number>(null);
  const [referenceAreaLeft, setReferenceAreaLeft] = useState<number | undefined>(undefined);
  const [referenceAreaRight, setReferenceAreaRight] =
    useState<number | undefined>(undefined);

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

  async function loadSequences(start: number, end: number) {
    setLoading(true);
    setCurrStart(start);
    setCurrEnd(end);
    try {
      const vars_coroutine = fetchVariantBars(
        gene,
        species,
        variants,
        start,
        end
      );

      const tfbs_coroutine = fetchTFBSBars(gene, species, TFBS, start, end);

      const enh_prom_list = [];
      if (enh == true) {
        enh_prom_list.push("Enh");
      }
      if (prom == true) {
        enh_prom_list.push("Prom");
      }
      const enh_proms_coroutine = fetchEnhPromBars(
        gene,
        species,
        enh_prom_list,
        start,
        end
      );

      let nucleotides_bar = [];

      if (end - start <= NUCLEOTIDES_VIEW) {
        setRenderNucleotides(true);
        if (end - start <= NUCLEOTIDES_LETTERS) {
          setRenderNucleotideLetters(true);
          nucleotides_bar = await fetchNucleotideBar(
            gene,
            species,
            start,
            end,
            true
          );
        } else {
          setRenderNucleotideLetters(false);
          nucleotides_bar = await fetchNucleotideBar(
            gene,
            species,
            start,
            end,
            false
          );
        }
      } else {
        setRenderNucleotides(false);
      }

      const tfbs = await tfbs_coroutine;
      const enh_proms = await enh_proms_coroutine;
      const vars = await vars_coroutine;

      setTFBSSequence(tfbs);

      setEnhancerPromoterSequence(enh_proms);

      setVariantsSequence(vars);

      setNucleotides(nucleotides_bar);
    } finally {
      setLoading(false);
      console.log("set loading false");
    }
  }

  // async function loadNucleotides(
  //   start: number,
  //   end: number,
  //   showLetters: boolean
  // ) {
  //   const nucleotides_bar = await fetchNucleotideBar(
  //     gene,
  //     species,
  //     start,
  //     end,
  //     showLetters
  //   );
  //   setNucleotides(nucleotides_bar);
  // }

  useEffect(() => {
    loadAssembly();
    loadSequenceNums();
    loadGenomicNums();
  }, []);

  useEffect(() => {
    loadAssembly();
    loadSequenceNums();
    loadGenomicNums();
    setLoading(true);
  }, [gene, species, enh, prom, variants, TFBS]);

  // useEffect(() => {
  //   if (endValue - startValue <= NUCLEOTIDES_VIEW) {
  //     setRenderNucleotides(true);
  //     if (endValue - startValue <= NUCLEOTIDES_LETTERS) {
  //       setRenderNucleotideLetters(true);
  //     } else {
  //       setRenderNucleotideLetters(false);
  //     }
  //   } else {
  //     setRenderNucleotides(false);
  //   }
  // }, [nucleotides]);

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
      loadSequences(geneNums[0], geneNums[0] + INITIAL_VIEW);
    }
  }, [assembly, sequenceStart, sequenceEnd, geneNums]);

  useEffect(() => {
    if (!loading && !initialLoad) return;

    if (
      enhancerPromoterSequence !== null &&
      tfbsSequence !== null &&
      variantsSequence !== null &&
      nucleotides !== null
    ) {
      setInitialLoad(false);
      setLoading(false);
    }
  }, [tfbsSequence, enhancerPromoterSequence, variantsSequence, nucleotides]);

  useEffect(() => {
    if (zoomToRange && !loading) {
      setStartValue(zoomToRange.start);
      setEndValue(zoomToRange.end);
    }
  }, [zoomToRange]);

  useEffect(() => {
    if (
      zoomToRange &&
      !loading &&
      startValue === zoomToRange.start &&
      endValue === zoomToRange.end
    ) {
      loadSequences(zoomToRange.start, zoomToRange.end);
    }
  }, [startValue, endValue, zoomToRange]);

  const handleSubmit = (start: number = startValue, end: number = endValue) => {
    let s = Math.max(start, sequenceStart);
    let e = Math.min(end, sequenceEnd);

    if (s >= e) {
      s = e - 1;
      if (s < sequenceStart) {
        s = sequenceStart;
        e = s + 1;
      }
    }

    if (e <= s) {
      e = s + 1;
      if (e > sequenceEnd) {
        e = sequenceEnd;
        s = e - 1;
      }
    }

    setEndValue(e);
    setStartValue(s);
    loadSequences(s, e);
  };

  const handleGeneSubmit = () => {
    setStartValue(geneNums[0]);
    setEndValue(geneNums[0] + INITIAL_VIEW);
    loadSequences(geneNums[0], geneNums[0] + INITIAL_VIEW);
  };

  const handleSegmentClick = (s: number, e: number) => {
    setStartValue(s);
    setEndValue(e);
    loadSequences(s, e);
  };

  const SkeletonLoader = () => (
    <div>
      {/* Title skeleton */}
      <div
        style={{
          height: "32px",
          background: "var(--border)",
          borderRadius: "4px",
          marginBottom: "16px",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Controls skeleton */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: "120px",
              height: "40px",
              background: "var(--border)",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <div
            style={{
              width: "200px",
              height: "20px",
              background: "var(--border)",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            style={{
              width: "150px",
              height: "60px",
              background: "var(--border)",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <div
            style={{
              width: "80px",
              height: "40px",
              background: "var(--border)",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          <div
            style={{
              width: "150px",
              height: "60px",
              background: "var(--border)",
              borderRadius: "4px",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>
      </div>

      {/* Content sections skeleton */}
      <div style={{ marginTop: 24 }}>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              gap: "16px",
              padding: "16px 0",
              borderBottom: index < 4 ? "2px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                height: "20px",
                background: "var(--border)",
                borderRadius: "4px",
                width: "80%",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <div
              style={{
                height: "40px",
                background: "var(--border)",
                borderRadius: "4px",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );


  // Triggered on mouse up
  const zoom = useCallback(() => {
    if (referenceAreaLeft !== undefined && referenceAreaRight !== undefined) {
      handleSubmit(Math.round(referenceAreaLeft), Math.round(referenceAreaRight));
    }
    setReferenceAreaLeft(undefined);
    setReferenceAreaRight(undefined);
  }, [referenceAreaLeft, referenceAreaRight]);

  const onMouseDown = useCallback((e: MouseHandlerDataParam) => {
    setReferenceAreaLeft(Number(e.activeLabel));
    setReferenceAreaRight(undefined); // reset right on new drag
  }, []);

  const onMouseMove = useCallback((e: MouseHandlerDataParam) => {
    if (referenceAreaLeft !== undefined) {
      setReferenceAreaRight(Number(e.activeLabel));
    }
  }, [referenceAreaLeft]);


  return (
    <div
      className="container-box"
      style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md, 12px)",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      {loading ? (
        <SkeletonLoader />
      ) : (
        <div>
          <h1 style={{ color: "var(--text)", marginBottom: "16px" }}>
            {species} -{" "}
            {gene === "ALDH1A3" && species !== "Homo sapiens"
              ? "ALDH1A1"
              : gene}
            :{assembly}
          </h1>
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGeneSubmit()}
                className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{
                  background: "var(--accent)",
                  color: "white",
                }}
              >
                Reset to Gene
              </button>
              <div className="flex flex-col">
                <label
                  className="text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {geneNums[0]} - {geneNums[0] + INITIAL_VIEW}
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label
                  className="text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Min Value = {sequenceStart}
                </label>
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) => {
                    // const newMin = Math.max(
                    //   sequenceStart,
                    //   Number(e.target.value)
                    // );
                    // setStartValue(Math.min(newMin, endValue));
                    setStartValue(Number(e.target.value));
                  }}
                  className="p-2 border rounded"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                  placeholder="Min value"
                />
              </div>
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{
                  background: "var(--primary)",
                  color: "white",
                }}
              >
                Go
              </button>
              <div className="flex flex-col">
                <label
                  className="text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Max Value = {sequenceEnd}
                </label>
                <input
                  type="number"
                  value={endValue}
                  onChange={(e) => {
                    // const newMax = Math.min(
                    //   sequenceEnd,
                    //   Number(e.target.value)
                    // );
                    // setEndValue(Math.max(newMax, startValue));
                    setEndValue(Number(e.target.value));
                  }}
                  className="p-2 border rounded"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
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
                borderBottom: "2px solid var(--border)",
              }}
            >
              <label
                style={{
                  alignSelf: "center",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Number Line
              </label>
              <div style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart
                    data={Array.from({ length: 101 }, (_, i) => ({
                      x: currStart + (i * (currEnd - currStart)) / 100,
                      y: Y_AXIS_MIN + ((Y_AXIS_MAX - Y_AXIS_MIN) * i) / 100,
                    }))}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={zoom}
                  >
                    <XAxis
                      interval="preserveStartEnd"
                      dataKey="x"
                      type="number"
                      ticks={Array.from(
                        { length: TICKS_NUMS + 1 },
                        (_, i) =>
                          currStart + (i * (currEnd - currStart)) / TICKS_NUMS
                      )} // customize tick positions
                      tickLine={{ strokeWidth: 1 }}
                      axisLine={{ strokeWidth: 2 }}
                    />
                    <YAxis hide dataKey="y" width={"auto"} />
                    {referenceAreaLeft !== undefined && referenceAreaRight !== undefined ? (
                      <ReferenceArea
                        x1={Math.min(referenceAreaLeft, referenceAreaRight)}
                        x2={Math.max(referenceAreaLeft, referenceAreaRight)}
                        strokeOpacity={0.3}
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
                borderBottom: "2px solid var(--border)",
              }}
            >
              <label
                style={{
                  alignSelf: "center",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Legend
              </label>
              <div style={{ minWidth: 0 }}>
                <Legend
                  color_map={tfbs_color_map}
                  visible_types={
                    new Set(tfbsSequence.map((segment) => segment.type))
                  }
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
                borderBottom: "2px solid var(--border)",
              }}
            >
              <label
                style={{
                  alignSelf: "center",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Transcription Factor Binding Sites
              </label>
              <div style={{ minWidth: 0 }}>
                <ColorBar
                  segments={tfbsSequence}
                  color_mapping={tfbs_color_map}
                  width="100%"
                  onSegmentClick={handleSegmentClick}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "16px",
                padding: "16px 0",
                borderBottom: "2px solid var(--border)",
              }}
            >
              <label
                style={{
                  alignSelf: "center",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Enhancers and Promoters
              </label>
              <div style={{ minWidth: 0 }}>
                <ColorBar
                  segments={enhancerPromoterSequence}
                  color_mapping={enh_prom_color_map}
                  width="100%"
                  onSegmentClick={handleSegmentClick}
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
              <label
                style={{
                  alignSelf: "center",
                  color: "var(--text)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Nucleotides/Variants
              </label>
              <div style={{ minWidth: 0 }}>
                {renderNucleotides ? (
                  <>
                    <ColorBar
                      segments={nucleotides}
                      color_mapping={nucleotides_color_map}
                      interactible={false}
                      letters={renderNucleotideLetters}
                      width="100%"
                    />
                    <ColorBar
                      segments={variantsSequence}
                      color_mapping={variants_color_map}
                      width="100%"
                      onSegmentClick={handleSegmentClick}
                    />
                  </>
                ) : (
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--panel-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      color: "var(--text-secondary)",
                      fontSize: "13px",
                      fontStyle: "italic",
                    }}
                  >
                    Zoom in to ≤{NUCLEOTIDES_VIEW}bp range to view nucleotides
                    and ≤{NUCLEOTIDES_LETTERS}bp to view letters
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
