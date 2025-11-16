"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NavigatableBar from "./NavigatableBar";
import {
  fetchGenes,
  fetchSpecies,
  fetchTFBS,
  fetchVariants,
  generateTFBSColorMap,
} from "../utils/services";

const Enh_Prom_Color_Mapping = {
  Enh: "stripes",
  Prom: "bars",
};

const Nucleotides_Color_Mapping = {
  A: "#00ff2aff",
  T: "#ff0000ff",
  G: "#ca8606ff",
  C: "#003ee7ff",
};

// I just want all the variants to be one color
const Variants_Color_Mapping = () =>
  new Proxy({}, {
    get(_, prop: string) {
      if (prop === "none") {
        return undefined;       // return nothing
      }
      return "#555555ff";
    }
  }) as { [key: string]: string };

export default function GenomeBrowserPage() {
  const [color_map, setColorMap] = useState<{ [key: string]: string }>(null);
  const [loading, setLoading] = useState(true);
  const [genes, setGenes] = useState<Array<string>>(null);
  const [species, setSpecies] = useState<Array<string>>(null);
  const [allTFBS, setAllTFBS] = useState<Array<string>>(null);
  const [selectedTFBS, setSelectedTFBS] = useState<Array<string>>(null);
  const [allVariants, setAllVariants] = useState<Array<string>>(null);
  const [selectedVariants, setSelectedVariants] = useState<Array<string>>(null);
  const [selectedGene, setSelectedGene] = useState<string>(null);

  async function loadGenesAndSpecies() {
    const gene_list = await fetchGenes();
    setGenes(gene_list);
    setSelectedGene(gene_list[0]);

    const species_list = await fetchSpecies();
    setSpecies(species_list);
  }

  async function loadTFBS() {
    const tfbs_list = await fetchTFBS(selectedGene);
    setAllTFBS(tfbs_list);
    setSelectedTFBS(tfbs_list);

    const variants_list = await fetchVariants(selectedGene);
    setAllVariants(variants_list);
    setSelectedVariants(variants_list);
  }

  useEffect(() => {
    loadGenesAndSpecies();
  }, []);

  useEffect(() => {
    if (genes !== null && species !== null) {
      loadTFBS();
    }
  }, [genes, species]);

  useEffect(() => {
    if (selectedTFBS !== null && allTFBS !== null && selectedVariants !== null && allVariants !== null) {
      setColorMap(generateTFBSColorMap(selectedTFBS));
    }
  }, [selectedTFBS, allTFBS, selectedVariants, allVariants]);

  useEffect(() => {
    if (color_map !== null) {
      setLoading(false);
    }
  }, [color_map]);

  return (
    <main>
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {species.map((species_name, index) => (
            <React.Fragment key={species_name}>
              <NavigatableBar
                gene={selectedGene}
                species={species_name}
                enh={true}
                prom={true}
                TFBS={selectedTFBS}
                variants={selectedVariants}
                tfbs_color_map={color_map}
                enh_prom_color_map={Enh_Prom_Color_Mapping}
                nucleotides_color_map={Nucleotides_Color_Mapping}
                variants_color_map={Variants_Color_Mapping()}
              ></NavigatableBar>
            </React.Fragment>
          ))}
        </div>
      )}
    </main>
  );
}
