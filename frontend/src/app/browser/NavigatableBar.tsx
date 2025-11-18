import { useEffect, useState } from "react";
import {
  fetchAssembly,
  fetchEnhPromBars,
  fetchGeneNums,
  fetchNucleotideBar,
  fetchNucleotides,
  fetchSequenceNums,
  fetchTFBSBars,
  fetchVariantBars,
} from "../utils/services";
import Slider from "rc-slider";
import { spec } from "node:test/reporters";
import ColorBar from "./ColorBar";
import { time } from "console";
import Legend from "./Legend";
import { tree } from "next/dist/build/templates/app-page";

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

      const nucleotides_coroutine = fetchNucleotideBar(
      gene,
      species,
      start,
      end,
      true
    );

      const tfbs = await tfbs_coroutine;
      const enh_proms = await enh_proms_coroutine;
      const vars = await vars_coroutine;
      const nucleotides_bar = await nucleotides_coroutine;

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

  useEffect(() => {
    if (endValue - startValue <= NUCLEOTIDES_VIEW) {
      setRenderNucleotides(true);
      if (endValue - startValue <= NUCLEOTIDES_LETTERS) {
        setRenderNucleotideLetters(true);
      } else {
        setRenderNucleotideLetters(false);
      }
    } else {
      setRenderNucleotides(false);
    }
  }, [nucleotides]);

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

  const handleSubmit = () => {
    loadSequences(startValue, endValue);
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
      {!loading && (
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
                    const newMin = Math.max(
                      sequenceStart,
                      Number(e.target.value)
                    );
                    setStartValue(Math.min(newMin, endValue));
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
                    const newMax = Math.min(
                      sequenceEnd,
                      Number(e.target.value)
                    );
                    setEndValue(Math.max(newMax, startValue));
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
