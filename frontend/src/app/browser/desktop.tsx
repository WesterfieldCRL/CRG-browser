"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NavigatableBar from "./NavigatableBar";


export default function GenomeBrowserPage() {


  return (
    <main>
      <NavigatableBar gene="DRD4" species="Homo sapiens" enh={true} prom={true} TFBS={[]} variants={[]}></NavigatableBar>
    </main>
  );
}
