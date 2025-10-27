// CoRGi Browse Genes - Button-based Gene Selection with Search
// Improved UX with individual gene buttons and search filter

(function () {
  // ---- Configuration / shared state ----
  const speciesList = ["Homo sapiens", "Mus musculus", "Macaca mulatta"];
  const speciesIds = ["human", "mouse", "macaque"];

  let sequenceData = {}; // { gene: { species: sequenceString } }
  let currentGene = null;
  let allGenes = []; // Store all gene names for filtering

  // UI state
  let sequences = null;
  let currentPosition = 0;
  let fullLength = 0;
  let zoomStart = 0;
  let zoomEnd = 0;
  let nucleotidesPerPage = 50;
  let currentPage = 1;

  // DOM elements
  const geneGrid = document.getElementById("gene-grid");
  const geneSearch = document.getElementById("gene-search");
  const geneCount = document.getElementById("gene-count");
  const geneSelectionSection = document.getElementById("gene-selection-section");
  const overviewSection = document.getElementById("overview-section");
  const detailsSection = document.getElementById("details-section");

  const resetBtn = document.getElementById("btn-reset");
  const downloadBtn = document.getElementById("btn-download");

  const zoomRangeDisplay = document.getElementById("zoom-range-display");
  const overviewElement = document.getElementById("overview-summary");

  const sequenceElements = {
    human: document.getElementById("seq-human"),
    mouse: document.getElementById("seq-mouse"),
    macaque: document.getElementById("seq-macaque"),
  };

  const inputPage = document.getElementById("input-page");
  const labelPageCount = document.getElementById("page-count-label");
  const btnPrevPage = document.getElementById("btn-prev-page");
  const btnNextPage = document.getElementById("btn-next-page");

  // CSS category names
  const nucleotideColors = {
    ALL_SAME: "color-all-same",
    TWO_SAME: "color-two-same",
    ALL_DIFF: "color-all-different",
  };

  // ----- CSV parsing & data loader -----
  function parseCSVRows(text) {
    const rows = [];
    let cur = "";
    let inQuotes = false;
    let row = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (ch === '"' && inQuotes && next === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        row.push(cur);
        cur = "";
        continue;
      }
      if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (ch === "\r" && text[i + 1] === "\n") {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
          i++;
          continue;
        } else {
          row.push(cur);
          rows.push(row);
          row = [];
          cur = "";
          continue;
        }
      }
      cur += ch;
    }
    if (cur !== "" || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }
    return rows.map(r => r.map(c => (typeof c === "string" ? c.trim() : c)));
  }

  function parseCSV(csvText) {
    if (!csvText || !csvText.trim()) {
      sequenceData = {};
      return;
    }
    const rows = parseCSVRows(csvText);
    if (rows.length === 0) {
      sequenceData = {};
      return;
    }

    const headers = rows[0].map(h => (h || "").toLowerCase());
    sequenceData = {};

    const hasGene = headers.includes("gene");
    const hasSpecies = headers.includes("species");
    const hasSequence = headers.includes("sequence");

    if (hasGene && hasSpecies && hasSequence) {
      // long format
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < headers.length) continue;
        const obj = {};
        for (let j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
        const gene = obj["gene"];
        const species = obj["species"];
        const seq = obj["sequence"] || "";
        if (!gene) continue;
        if (!sequenceData[gene]) sequenceData[gene] = {};
        sequenceData[gene][species || ""] = seq;
      }
    } else if (hasGene) {
      // wide format
      const headerOriginal = rows[0];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        const gene = row[0];
        if (!gene) continue;
        if (!sequenceData[gene]) sequenceData[gene] = {};
        for (let c = 1; c < headerOriginal.length; c++) {
          const speciesName = headerOriginal[c].trim();
          const seq = row[c] || "";
          sequenceData[gene][speciesName] = seq;
        }
      }
    } else {
      console.warn("parseCSV: unrecognized CSV header format", rows[0]);
      sequenceData = {};
      return;
    }
  }

  function populateGeneButtons() {
    if (!geneGrid) {
      console.error("populateGeneButtons: #gene-grid element not found");
      return;
    }

    allGenes = Object.keys(sequenceData).sort();
    geneGrid.innerHTML = "";

    if (allGenes.length === 0) {
      geneGrid.innerHTML = '<div class="no-results">No genes available</div>';
      updateGeneCount(0, 0);
      return;
    }

    allGenes.forEach((gene) => {
      const button = document.createElement("button");
      button.classList.add("gene-button");
      button.textContent = gene;
      button.setAttribute("role", "option");
      button.setAttribute("aria-label", `Select ${gene}`);
      button.dataset.gene = gene;
      
      button.addEventListener("click", () => {
        selectGene(gene);
        // Scroll gene into view after selection
        setTimeout(() => {
          overviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      });
      
      geneGrid.appendChild(button);
    });

    updateGeneCount(allGenes.length, allGenes.length);
  }

  function selectGene(geneName) {
    if (!geneName) {
      currentGene = null;
      // Deselect all buttons
      document.querySelectorAll('.gene-button').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-selected', 'false');
      });
      return;
    }
    if (!sequenceData[geneName]) {
      console.warn(`Gene '${geneName}' not found in loaded data.`);
      return;
    }

    currentGene = geneName;

    // Update button states
    document.querySelectorAll('.gene-button').forEach(btn => {
      if (btn.dataset.gene === geneName) {
        btn.classList.add('selected');
        btn.setAttribute('aria-selected', 'true');
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      } else {
        btn.classList.remove('selected');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Load and display gene
    loadGeneSequences(geneName);
  }

  function loadGeneSequences(geneName) {
    sequences = getSequencesForGene(geneName);
    if (!sequences) {
      alert("Selected gene sequence could not be loaded.");
      return;
    }

    fullLength = (sequences && sequences[Object.keys(sequences)[0]] || "").length || 0;

    zoomStart = 0;
    zoomEnd = fullLength > 0 ? fullLength - 1 : 0;
    currentPosition = 0;
    currentPage = 1;
    nucleotidesPerPage = calculateNucleotidesPerPage();

    updateZoomRangeDisplay();
    overviewSection.classList.remove("hidden");
    detailsSection.classList.add("hidden");

    renderOverview();
  }

  function getSequencesForGene(geneName) {
    if (!geneName || !sequenceData[geneName]) return null;
    const seqs = {};
    speciesList.forEach((s) => {
      if (sequenceData[geneName][s]) {
        seqs[s] = sequenceData[geneName][s];
        return;
      }
      const key = Object.keys(sequenceData[geneName]).find(k => k && k.toLowerCase() === s.toLowerCase());
      seqs[s] = key ? sequenceData[geneName][key] : "";
    });
    return seqs;
  }

  function updateGeneCount(showing, total) {
    if (!geneCount) return;
    if (showing === total) {
      geneCount.textContent = `${total} ${total === 1 ? 'gene' : 'genes'} available`;
    } else {
      geneCount.textContent = `Showing ${showing} of ${total} ${total === 1 ? 'gene' : 'genes'}`;
    }
  }

  // Search functionality
  if (geneSearch) {
    geneSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const buttons = document.querySelectorAll('.gene-button');
      let visibleCount = 0;

      buttons.forEach(button => {
        const geneName = button.dataset.gene.toLowerCase();
        if (geneName.includes(searchTerm)) {
          button.classList.remove('hidden');
          visibleCount++;
        } else {
          button.classList.add('hidden');
        }
      });

      // Show "no results" message if needed
      if (visibleCount === 0 && allGenes.length > 0) {
        if (!document.getElementById('no-results-msg')) {
          const noResults = document.createElement('div');
          noResults.id = 'no-results-msg';
          noResults.className = 'no-results';
          noResults.textContent = `No genes found matching "${e.target.value}"`;
          geneGrid.appendChild(noResults);
        }
      } else {
        const noResultsMsg = document.getElementById('no-results-msg');
        if (noResultsMsg) {
          noResultsMsg.remove();
        }
      }

      updateGeneCount(visibleCount, allGenes.length);
    });

    // Clear search on Escape key
    geneSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        geneSearch.value = '';
        geneSearch.dispatchEvent(new Event('input'));
        geneSearch.blur();
      }
    });
  }

  async function loadCSV(url) {
    if (!url) {
      console.error("loadCSV: no URL provided");
      return;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const text = await response.text();
      parseCSV(text);
      populateGeneButtons();

      console.log(`Loaded ${Object.keys(sequenceData).length} genes.`);
    } catch (err) {
      console.error("Failed to load data.csv:", err);
      if (geneGrid) {
        geneGrid.innerHTML = '<div class="no-results">Failed to load gene data. Please refresh the page.</div>';
      }
    }
  }

  // Expose API
  window.DataLoader = {
    loadCSV,
    selectGene,
    getSequencesForCurrentGene: () => getSequencesForGene(currentGene),
    get currentGene() { return currentGene; },
    _debug: {
      get sequenceData() { return sequenceData; }
    }
  };

  // ----- UI Controller (overview, drag, render, pagination, download) -----
  function calculateNucleotidesPerPage() {
    const boxApprox = 20;
    const containerWidth = (detailsSection && detailsSection.clientWidth) || window.innerWidth;
    return Math.max(10, Math.floor(containerWidth / boxApprox));
  }

  function matchCategoryTextFromClass(cssClass) {
    switch (cssClass) {
      case nucleotideColors.ALL_SAME:
        return "All species have the same nucleotide";
      case nucleotideColors.TWO_SAME:
        return "Two species share the same nucleotide, one differs";
      case nucleotideColors.ALL_DIFF:
        return "All species have different nucleotides";
      default:
        return "Unknown";
    }
  }

  function nucleotideMatchCategory(pos) {
    if (!sequences) return nucleotideColors.ALL_DIFF;
    const s1 = sequences[speciesList[0]] ? sequences[speciesList[0]][pos] : undefined;
    const s2 = sequences[speciesList[1]] ? sequences[speciesList[1]][pos] : undefined;
    const s3 = sequences[speciesList[2]] ? sequences[speciesList[2]][pos] : undefined;
    if (!s1 || !s2 || !s3) return nucleotideColors.ALL_DIFF;
    if (s1 === s2 && s2 === s3) return nucleotideColors.ALL_SAME;
    if (s1 === s2 || s2 === s3 || s1 === s3) return nucleotideColors.TWO_SAME;
    return nucleotideColors.ALL_DIFF;
  }

  function renderDetailedSequences() {
    if (!sequences) return;

    nucleotidesPerPage = calculateNucleotidesPerPage();

    const start = currentPosition + (currentPage - 1) * nucleotidesPerPage;
    let end = start + nucleotidesPerPage;
    end = end > fullLength ? fullLength : end;

    speciesIds.forEach((id, idx) => {
      const seq = sequences[speciesList[idx]] || "";
      const container = sequenceElements[id];
      if (!container) return;
      container.innerHTML = "";
      for (let i = start; i < end; i++) {
        const nuc = seq[i] || "-";
        const colorClass = nucleotideMatchCategory(i);
        const box = document.createElement("div");
        box.classList.add("nucleotide-box", colorClass);
        box.textContent = nuc;
        const pos1 = i + 1;
        const categoryText = matchCategoryTextFromClass(colorClass);
        const tooltip = `Position ${pos1} of ${fullLength} — ${categoryText}`;
        box.title = tooltip;
        box.setAttribute("aria-label", tooltip);
        box.tabIndex = 0;
        box.dataset.pos = i;
        container.appendChild(box);
      }
    });

    updatePageControls();
  }

  // Make renderDetailedSequences available globally for orientation change
  window.renderDetailedSequences = renderDetailedSequences;

  function updateZoomRangeDisplay() {
    if (zoomRangeDisplay) {
      zoomRangeDisplay.textContent = fullLength ? `${zoomStart + 1} - ${zoomEnd + 1} / ${fullLength}` : "No data loaded";
    }
  }

  function updatePageControls() {
    if (!sequences) return;
    const totalBasesInZoom = zoomEnd - zoomStart + 1;
    nucleotidesPerPage = calculateNucleotidesPerPage();
    const totalPages = Math.max(1, Math.ceil(totalBasesInZoom / nucleotidesPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (inputPage) inputPage.value = currentPage;
    if (labelPageCount) labelPageCount.textContent = `of ${totalPages}`;

    if (btnPrevPage) btnPrevPage.disabled = currentPage <= 1;
    if (btnNextPage) btnNextPage.disabled = currentPage >= totalPages;
  }

  if (btnPrevPage) {
    btnPrevPage.addEventListener("click", () => {
      currentPage--;
      updatePageControls();
      renderDetailedSequences();
    });
  }
  if (btnNextPage) {
    btnNextPage.addEventListener("click", () => {
      currentPage++;
      updatePageControls();
      renderDetailedSequences();
    });
  }
  if (inputPage) {
    inputPage.addEventListener("change", () => {
      const val = parseInt(inputPage.value, 10) || 1;
      currentPage = Math.max(1, val);
      updatePageControls();
      renderDetailedSequences();
    });
  }

  // overview render
  function renderOverview() {
    if (!sequences || !overviewElement) return;

    const maxBlocks = 200;
    const chunkSize = Math.max(1, Math.floor(fullLength / maxBlocks));

    overviewElement.innerHTML = "";
    for (let c = 0; c < maxBlocks; c++) {
      const startPos = c * chunkSize;
      if (startPos > fullLength) break;
      let counts = { allSame: 0, twoSame: 0, allDiff: 0 };
      for (let i = startPos; i < startPos + chunkSize && i < fullLength; i++) {
        const cat = nucleotideMatchCategory(i);
        if (cat === nucleotideColors.ALL_SAME) counts.allSame++;
        else if (cat === nucleotideColors.TWO_SAME) counts.twoSame++;
        else counts.allDiff++;
      }
      let colorClass = nucleotideColors.ALL_DIFF;
      if (counts.allSame >= counts.twoSame && counts.allSame >= counts.allDiff) colorClass = nucleotideColors.ALL_SAME;
      else if (counts.twoSame >= counts.allSame && counts.twoSame >= counts.allDiff) colorClass = nucleotideColors.TWO_SAME;

      const bar = document.createElement("div");
      bar.classList.add(colorClass, "overview-bar");
      bar.style.flex = "1 0 auto";
      bar.dataset.start = startPos;
      bar.dataset.end = Math.min(startPos + chunkSize - 1, fullLength - 1);
      const barStart = startPos + 1;
      const barEnd = Math.min(startPos + chunkSize, fullLength);
      const title = `${barStart} - ${barEnd} / ${fullLength} — ${matchCategoryTextFromClass(colorClass)}`;
      bar.title = title;
      bar.setAttribute("aria-label", title);
      overviewElement.appendChild(bar);
    }
    updateZoomRangeDisplay();
  }

  // drag-to-zoom
  let dragStart = null;
  let dragEnd = null;
  let isDragging = false;

  function getMousePositionInOverview(e) {
    const rect = overviewElement.getBoundingClientRect();
    let x = 0;
    if (!e) return 0;
    if (e.touches && e.touches.length) {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }
    return Math.max(0, Math.min(rect.width, x));
  }

  function highlightDragRange() {
    if (!isDragging || dragStart == null || dragEnd == null) return;
    const rect = overviewElement.getBoundingClientRect();
    const startX = Math.min(dragStart, dragEnd);
    const endX = Math.max(dragStart, dragEnd);

    const children = Array.from(overviewElement.children);
    children.forEach((bar) => {
      const barRect = bar.getBoundingClientRect();
      const barLeft = barRect.left - rect.left;
      const barRight = barLeft + barRect.width;
      if (barRight >= startX && barLeft <= endX) bar.classList.add("highlight");
      else bar.classList.remove("highlight");
    });
  }

  function clearHighlightDrag() {
    Array.from(overviewElement.children).forEach((bar) => bar.classList.remove("highlight"));
  }

  function onDragStart(e) {
    if (!overviewSection || overviewSection.classList.contains("hidden")) return;
    isDragging = true;
    dragStart = getMousePositionInOverview(e);
    dragEnd = dragStart;
    highlightDragRange();
    if (e && e.preventDefault) e.preventDefault();
  }

  function onDragMove(e) {
    if (!isDragging) return;
    dragEnd = getMousePositionInOverview(e);
    highlightDragRange();
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    if (dragStart !== null && dragEnd !== null) {
      const minDrag = Math.min(dragStart, dragEnd);
      const maxDrag = Math.max(dragStart, dragEnd);
      const sourceWidth = overviewElement.clientWidth || 1;
      const proportionStart = minDrag / sourceWidth;
      const proportionEnd = maxDrag / sourceWidth;
      zoomStart = Math.floor(proportionStart * fullLength);
      zoomEnd = Math.ceil(proportionEnd * fullLength) - 1;
      zoomStart = Math.max(0, zoomStart);
      zoomEnd = Math.min(fullLength - 1, zoomEnd);

      currentPosition = zoomStart;
      currentPage = 1;
      if (inputPage) inputPage.value = currentPage;

      overviewSection.classList.remove("hidden");
      detailsSection.classList.remove("hidden");

      renderDetailedSequences();
      updatePageControls();
      updateZoomRangeDisplay();
      
      // Scroll to details after zoom
      setTimeout(() => {
        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    clearHighlightDrag();
    dragStart = null;
    dragEnd = null;
  }

  if (overviewElement) {
    overviewElement.addEventListener("mousedown", (e) => onDragStart(e));
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", (e) => onDragEnd(e));
    overviewElement.addEventListener("touchstart", (e) => onDragStart(e.touches[0]));
    window.addEventListener("touchmove", (e) => onDragMove(e.touches ? e.touches[0] : e));
    window.addEventListener("touchend", (e) => onDragEnd(e.changedTouches ? e.changedTouches[0] : e));
  }

  // Download FASTA
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!sequences) return alert("No sequences loaded");
      const totalBasesInZoom = zoomEnd - zoomStart + 1;
      nucleotidesPerPage = calculateNucleotidesPerPage();
      const start = currentPosition + (currentPage - 1) * nucleotidesPerPage;
      let end = start + nucleotidesPerPage;
      end = end > fullLength ? fullLength : end;

      let fastaText = "";
      speciesList.forEach((species) => {
        let seq = sequences[species] || "";
        seq = seq.substring(start, end);
        const wrappedSeq = seq.match(/.{1,60}/g)?.join("\n") || "";
        fastaText += `>${currentGene || "gene"}_${species.replace(/\s+/g, "_")}\n${wrappedSeq}\n`;
      });

      const blob = new Blob([fastaText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentGene || "gene"}_sequences.fasta`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      sequences = null;
      currentPosition = 0;
      fullLength = 0;
      zoomStart = 0;
      zoomEnd = 0;
      currentPage = 1;
      currentGene = null;
      
      // Deselect all buttons
      document.querySelectorAll('.gene-button').forEach(btn => {
        btn.classList.remove('selected');
        btn.setAttribute('aria-selected', 'false');
      });
      
      overviewSection.classList.add("hidden");
      detailsSection.classList.add("hidden");
      
      // Scroll back to top
      geneSelectionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Respond to window resize
  window.addEventListener("resize", () => {
    if (!detailsSection || detailsSection.classList.contains("hidden")) return;
    nucleotidesPerPage = calculateNucleotidesPerPage();
    updatePageControls();
    renderDetailedSequences();
  });

  // Initialize on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    if (!geneGrid) {
      console.error("data-ui: missing #gene-grid - aborting auto load.");
      return;
    }
    // auto-load data.csv
    loadCSV("data.csv").catch(err => {
      console.error("Failed to load data.csv:", err);
    });
  });

})();
