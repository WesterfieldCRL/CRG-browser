"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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

//TODO: add variants cause I cant be bothered to deal with that rn
export default function GeneBrowserPage() {
  const searchParams = useSearchParams();

  const [color_map, setColorMap] = useState<{ [key: string]: string }>(null);
  const [loading, setLoading] = useState(true);
  const [genes, setGenes] = useState<Array<string>>(null);
  const [species, setSpecies] = useState<Array<string>>(null);
  const [allTFBS, setAllTFBS] = useState<Array<string>>(null);
  const [selectedTFBS, setSelectedTFBS] = useState<Array<string>>(null);
  const [selectedGene, setSelectedGene] = useState<string>(null);
  const [showEnhancers, setShowEnhancers] = useState<boolean>(false);
  const [showPromoters, setShowPromoters] = useState<boolean>(false);

  async function loadGenesAndSpecies() {
    const gene_list = await fetchGenes();
    setGenes(gene_list);

    // Get gene from URL params or default to first gene
    const geneParam = searchParams.get('gene');
    setSelectedGene(geneParam && gene_list.includes(geneParam) ? geneParam : gene_list[0]);

    // Get enhancer/promoter settings from URL params
    setShowEnhancers(searchParams.get('enh') === 'true');
    setShowPromoters(searchParams.get('prom') === 'true');

    const species_list = await fetchSpecies();
    setSpecies(species_list);
  }

  async function loadTFBS() {
    const tfbs_list = await fetchTFBS(selectedGene);
    setAllTFBS(tfbs_list);

    // Get TFBS selection from URL params or default to all
    const tfbsParam = searchParams.get('tfbs');
    if (tfbsParam) {
      const requestedTFBS = tfbsParam.split(',').filter(t => tfbs_list.includes(t));
      setSelectedTFBS(requestedTFBS.length > 0 ? requestedTFBS : tfbs_list);
    } else {
      setSelectedTFBS(tfbs_list);
    }
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
                enh={showEnhancers}
                prom={showPromoters}
                TFBS={selectedTFBS}
                variants={[]}
                tfbs_color_map={color_map}
                enh_prom_color_map={Enh_Prom_Color_Mapping}
              ></NavigatableBar>
            </React.Fragment>
          ))}
        </div>
      )}
    </main>
  );
}
