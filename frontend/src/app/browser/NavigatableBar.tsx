import { useEffect, useState } from "react";
import {
  fetchAssembly,
  fetchEnhPromBars,
  fetchGeneNums,
  fetchSequenceNums,
  fetchTFBSBars,
} from "../utils/services";
import Slider from "rc-slider";
import { spec } from "node:test/reporters";
import ColorBar from "./ColorBar";

interface NavigatableBarProps {
  gene: string;
  species: string;
  enh: boolean;
  prom: boolean;
  TFBS: string[];
  variants: string[];
  color_map: { [key: string]: string };
}

interface ColorSegment {
  type: string;
  width: number; 
  start: number; 
  end: number;
}

const INITIAL_VIEW = 4000;

const Enh_Prom_Color_Mapping = {"Enh": "stripes", "Prom": "bars", "none": "#8a8a8aff"}

export default function NavigatableBar({
  gene,
  species,
  enh,
  prom,
  TFBS,
  variants,
  color_map,
}: NavigatableBarProps) {
  const [assembly, setAssembly] = useState<string>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<[number, number]>(null);
  const [startValue, setStartValue] = useState<number>(null);
  const [endValue, setEndValue] = useState<number>(null);
  const [sequenceStart, setSequenceStartValue] = useState<number>(null);
  const [sequenceEnd, setSequenceEndValue] = useState<number>(null);
  const [geneNums, setGeneNumsValue] = useState<[number, number]>(null);
  const [tfbsSequence, setTFBSSequence] = useState<Array<ColorSegment>>(null);
  const [enhancerPromoterSequence, setEnhancerPromoterSequence] = useState<Array<ColorSegment>>(null);

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
    const enh_proms = await fetchEnhPromBars(gene, species, enh_prom_list, startValue, endValue);
    setEnhancerPromoterSequence(enh_proms);

  }

  useEffect(() => {
    loadAssembly();
    loadSequenceNums();
    loadGenomicNums();
  }, []);

  useEffect(() => {
    if (!loading) return;

    if (
      assembly !== null &&
      sequenceEnd !== null &&
      sequenceStart !== null &&
      geneNums !== null
    ) {
      setRange([sequenceStart, sequenceEnd]);
      setStartValue(geneNums[0]);
      setEndValue(geneNums[0] + INITIAL_VIEW);
      setRange([geneNums[0], geneNums[0] + INITIAL_VIEW]);
    }
  }, [assembly, sequenceStart, sequenceEnd, geneNums]);

  useEffect(() => {
    if (!loading) return;

    if (
      startValue !== null &&
      endValue !== null && 
      enhancerPromoterSequence == null &&
      tfbsSequence == null
    ) {
      loadSequences();
    }
  }, [startValue, endValue])

  useEffect(() => {
    if (!loading) return;

    if (
      enhancerPromoterSequence !== null &&
      tfbsSequence !== null
    ) {
      setLoading(false);
    }

  }, [tfbsSequence, enhancerPromoterSequence])

  const handleSubmit = () => {
    setRange([startValue, endValue]);
  };

  return (
    <div className="container-box">
      {!loading && (
        <div>
          <h1>
            {species} -{" "}
            {gene === "ALDH1A3" && species !== "Homo sapiens"
              ? "ALDH1A1"
              : gene}
            :{assembly}
          </h1>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1">
                  Min Value = {sequenceStart}
                </label>
                <input
                  type="number"
                  value={startValue}
                  onChange={(e) => setStartValue(Number(e.target.value))}
                  className="p-2 border rounded"
                  placeholder="Min value"
                />
              </div>
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set Min
              </button>
            </div>
            <div style={{ display: "contents", pointerEvents: "none" }}>
              <Slider
                range={{ draggableTrack: true }}
                min={sequenceStart}
                max={sequenceEnd}
                value={range}
                styles={{
                  handle: {
                    height: "230px",
                    marginTop: "-10px",
                    border: "3px solid var(--accent, #2db4b6)",
                    boxShadow: "inset 0 0 15px rgba(45, 180, 182, 0.4)",
                  },
                  rail: {
                    backgroundColor: "gray",
                    marginTop: "105px",
                    height: "5px",
                  },
                  track: {
                    height: "230px",
                    marginTop: "-10px",
                    backgroundColor: "rgba(45, 180, 182, 0.35)",
                    border: "3px solid var(--accent, #2db4b6)",
                    boxShadow: "inset 0 0 15px rgba(45, 180, 182, 0.4)",
                  },
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set Max
              </button>
              <div className="flex flex-col">
                <label className="text-sm mb-1">
                  Max Value = {sequenceEnd}
                </label>
                <input
                  type="number"
                  value={endValue}
                  onChange={(e) => setEndValue(Number(e.target.value))}
                  className="p-2 border rounded"
                  placeholder="Max value"
                />
              </div>
            </div>
          </div>
          <div style={{marginTop: 30}}>
            <div className="flex items-center gap-2">
              <label>
                  Transformation Binding Factors
              </label>
              <ColorBar segments={tfbsSequence} color_mapping={color_map}/>
            </div>

            <div className="flex items-center gap-2">
              <label>
                  Enhancers and Promoters
              </label>
              <ColorBar segments={enhancerPromoterSequence} color_mapping={Enh_Prom_Color_Mapping}/>
            </div>
            <div className="flex items-center gap-2">
              <label>
                  Nucleotides/Variants
              </label>
              Nucleotides are not visible at this zoom level. Please zoom in to see individual nucletoides and variants.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
