"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NavigatableBar from "./NavigatableBar";
import { generateTFBSColorMap } from "../utils/services";

const tfbs_dummy_data = ["MAFA", "NEUROD1", "Neurod2", "SOX10", "STAT3"];

const tfbsColorMap = generateTFBSColorMap(tfbs_dummy_data);

export default function GenomeBrowserPage() {
  const [color_map, setColorMap] = useState<{ [key: string]: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setColorMap(generateTFBSColorMap(tfbs_dummy_data));
  }, []);

  useEffect(() => {
    if (color_map !== null) {
      setLoading(false);
    }
  }, [color_map]);

  return (
    <main>
      {!loading && (
        <NavigatableBar
          gene="DRD4"
          species="Homo sapiens"
          enh={true}
          prom={true}
          TFBS={tfbs_dummy_data}
          variants={[]}
          color_map={color_map}
        ></NavigatableBar>
      )}
    </main>
  );
}
