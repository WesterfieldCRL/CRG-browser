"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NavigatableBar from "./NavigatableBar";
import {
  fetchGenes,
  fetchSpecies,
  fetchTFBS,
  generateTFBSColorMap,
} from "../utils/services";

const Enh_Prom_Color_Mapping = {
  Enh: "stripes",
  Prom: "bars",
  none: "#8a8a8aff",
};

const Nucleotides_Color_Mapping = {
  A: "#00ff2aff",
  T: "#ff0000ff",
  G: "#ca8606ff",
  C: "#003ee7ff",
};

export default function GenomeBrowserPage() {
  const [color_map, setColorMap] = useState<{ [key: string]: string }>(null);
  const [loading, setLoading] = useState(true);
  const [genes, setGenes] = useState<Array<string>>(null);
  const [species, setSpecies] = useState<Array<string>>(null);
  const [allTFBS, setAllTFBS] = useState<Array<string>>(null);
  const [selectedTFBS, setSelectedTFBS] = useState<Array<string>>(null);
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
    if (selectedTFBS !== null && allTFBS !== null) {
      setColorMap(generateTFBSColorMap(selectedTFBS));
    }
  }, [selectedTFBS, allTFBS]);

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
                variants={[]}
                tfbs_color_map={color_map}
                enh_prom_color_map={Enh_Prom_Color_Mapping}
                nucleotides_color_map={Nucleotides_Color_Mapping}
              ></NavigatableBar>
            </React.Fragment>
          ))}
        </div>
      )}
    </main>
  );
}
