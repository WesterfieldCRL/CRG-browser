"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavigatableBar from "./NavigatableBar";
import {
  fetchGenes,
  fetchSpecies,
  fetchTFBS,
  fetchVariants,
  fetchVariantsDict,
  generateTFBSColorMap,
} from "../utils/services";

const Enh_Prom_Color_Mapping = {
  Enh: "stripes",
  Prom: "bars",
  none: "#8a8a8aff",
};

export default function GeneBrowserPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [color_map, setColorMap] = useState<{ [key: string]: string }>(null);
  const [loading, setLoading] = useState(true);
  const [genes, setGenes] = useState<Array<string>>(null);
  const [species, setSpecies] = useState<Array<string>>(null);
  const [allTFBS, setAllTFBS] = useState<Array<string>>(null);
  const [selectedTFBS, setSelectedTFBS] = useState<Array<string>>(null);
  const [selectedGene, setSelectedGene] = useState<string>(null);
  const [showEnhancers, setShowEnhancers] = useState<boolean>(false);
  const [showPromoters, setShowPromoters] = useState<boolean>(false);
  const [selectedVariants, setSelectedVariants] = useState<Array<string>>([]);
  const [allVariants, setAllVariants] = useState<Array<string>>([]);
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(false);
  const [variantPositions, setVariantPositions] = useState<{ [species: string]: { variants: { [variantType: string]: Array<{ type: string; start: number; end: number }> } } }>({});
  const [zoomRanges, setZoomRanges] = useState<{ [species: string]: { start: number; end: number } | null }>({});
  const [collapsedSpecies, setCollapsedSpecies] = useState<{ [species: string]: boolean }>({});
  const [collapsedVariantTypes, setCollapsedVariantTypes] = useState<{ [species: string]: { [variantType: string]: boolean } }>({});
  const [currentContext, setCurrentContext] = useState<{ species: string; variantType: string } | null>(null);

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

  async function loadVariants() {
    try {
      const variants_list = await fetchVariants(selectedGene);
      setAllVariants(variants_list);

      // Get variant selection from URL params
      const variantsParam = searchParams.get('variants');
      if (variantsParam) {
        const requestedVariants = variantsParam.split(',').filter(v => variants_list.includes(v));
        setSelectedVariants(requestedVariants);
      } else {
        setSelectedVariants([]);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
      setAllVariants([]);
      setSelectedVariants([]);
    }
  }

  async function loadVariantPositions() {
    if (!selectedVariants || selectedVariants.length === 0 || !species || !selectedGene) {
      setVariantPositions({});
      return;
    }

    try {
      const positions: { [species: string]: any } = {};

      // Fetch variant positions for each species
      for (const speciesName of species) {
        const result = await fetchVariantsDict(selectedGene, speciesName, selectedVariants);
        positions[speciesName] = result;
      }

      setVariantPositions(positions);
    } catch (error) {
      console.error('Error loading variant positions:', error);
      setVariantPositions({});
    }
  }

  useEffect(() => {
    loadGenesAndSpecies();
  }, []);

  useEffect(() => {
    if (genes !== null && species !== null) {
      loadTFBS();
      loadVariants();
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

  useEffect(() => {
    loadVariantPositions();
  }, [selectedVariants, species, selectedGene]);

  // Initialize current context with first species
  useEffect(() => {
    if (species && species.length > 0 && variantPositions && Object.keys(variantPositions).length > 0) {
      if (!currentContext) {
        setCurrentContext({
          species: species[0],
          variantType: ''
        });
      }
    }
  }, [species, variantPositions]);

  // Scroll tracking for sticky context header
  useEffect(() => {
    if (!variantPositions || Object.keys(variantPositions).length === 0) {
      setCurrentContext(null);
      return;
    }

    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const observerOptions = {
      root: sidebar,
      rootMargin: '-100px 0px -80% 0px',
      threshold: [0, 0.1, 0.5, 1]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Filter to only intersecting entries
      const intersecting = entries.filter(entry => entry.isIntersecting);

      if (intersecting.length === 0) return;

      // Find the entry with the highest intersectionRatio and closest to top
      const topEntry = intersecting.reduce((closest, entry) => {
        if (!closest) return entry;

        // Calculate distance from top of viewport
        const entryTop = entry.boundingClientRect.top;
        const closestTop = closest.boundingClientRect.top;

        // Prefer the one closer to the top
        return entryTop < closestTop ? entry : closest;
      });

      if (topEntry) {
        const element = topEntry.target as HTMLElement;
        const species = element.getAttribute('data-species');

        if (species) {
          setCurrentContext({
            species: species,
            variantType: ''
          });
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Only observe species sections
    const speciesSections = document.querySelectorAll('.species-section');
    speciesSections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [variantPositions, collapsedSpecies, collapsedVariantTypes]);

  const handleEditFilters = () => {
    const params = new URLSearchParams();
    params.set('gene', selectedGene);

    if (selectedTFBS && selectedTFBS.length > 0) {
      params.set('tfbs', selectedTFBS.join(','));
    }

    if (showEnhancers) {
      params.set('enh', 'true');
    }

    if (showPromoters) {
      params.set('prom', 'true');
    }

    if (selectedVariants && selectedVariants.length > 0) {
      params.set('variants', selectedVariants.join(','));
    }

    router.push(`/browser?${params.toString()}`);
  };

  const handleVariantClick = (speciesName: string, start: number, end: number) => {
    setZoomRanges({
      ...zoomRanges,
      [speciesName]: { start, end }
    });
  };

  const toggleSpeciesCollapse = (speciesName: string) => {
    setCollapsedSpecies({
      ...collapsedSpecies,
      [speciesName]: !collapsedSpecies[speciesName]
    });
  };

  const toggleVariantType = (speciesName: string, variantType: string) => {
    setCollapsedVariantTypes({
      ...collapsedVariantTypes,
      [speciesName]: {
        ...(collapsedVariantTypes[speciesName] || {}),
        [variantType]: !(collapsedVariantTypes[speciesName]?.[variantType] || false)
      }
    });
  };

  return (
    <main style={{ padding: '0' }}>
      {!loading && (
        <>
          {/* Sidebar for Variant Locations */}
          <div className="sidebar">
            <div className="sidebar-toggle">›</div>
            <div className="sidebar-content">
              <h3 className="sidebar-title">Variant Instances</h3>

              {/* Sticky Context Header - Shows current species */}
              {currentContext && (
                <div className="sticky-context-header">
                  <div className="context-species">{currentContext.species}</div>
                </div>
              )}

              {selectedVariants && selectedVariants.length > 0 && Object.keys(variantPositions).length > 0 ? (
                <div className="variant-list">
                  {species.map((speciesName) => {
                    const totalInstances = variantPositions[speciesName]?.variants
                      ? Object.values(variantPositions[speciesName].variants).reduce((sum, instances) => sum + instances.length, 0)
                      : 0;
                    const isCollapsed = collapsedSpecies[speciesName];

                    return (
                      <div key={speciesName} className="species-section" data-species={speciesName}>
                        <div
                          className="species-header"
                          onClick={() => toggleSpeciesCollapse(speciesName)}
                        >
                          <span className={`species-chevron ${isCollapsed ? 'collapsed' : 'expanded'}`}>⌄</span>
                          <h4 className="species-name">{speciesName}</h4>
                          <span className="species-count">({totalInstances})</span>
                        </div>

                        {!isCollapsed && (
                          <>
                            {variantPositions[speciesName] && variantPositions[speciesName].variants ? (
                              Object.entries(variantPositions[speciesName].variants).map(([variantType, instances]: [string, any[]]) => {
                                const isVariantTypeCollapsed = collapsedVariantTypes[speciesName]?.[variantType] || false;

                                return (
                                  <div key={variantType} className="variant-type-section" data-variant-type={variantType}>
                                    <div
                                      className="variant-type-header"
                                      onClick={() => toggleVariantType(speciesName, variantType)}
                                    >
                                      <span className={`variant-type-chevron ${isVariantTypeCollapsed ? 'collapsed' : 'expanded'}`}>⌄</span>
                                      <span className="variant-type-name">{variantType}</span>
                                      <span className="variant-type-count">({instances.length})</span>
                                    </div>

                                    {!isVariantTypeCollapsed && (
                                      <div className="variant-instances">
                                        {instances.map((instance, idx) => (
                                          <div
                                            key={idx}
                                            className="variant-instance"
                                            onClick={() => handleVariantClick(speciesName, instance.start, instance.end)}
                                          >
                                            <span className="variant-type-label">{variantType}:</span>
                                            <span className="instance-position">{instance.start}-{instance.end}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="no-instances">No instances found</p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : selectedVariants && selectedVariants.length > 0 ? (
                <p className="loading-variants">Loading variant positions...</p>
              ) : (
                <p className="no-variants">No variants selected</p>
              )}
            </div>
          </div>

          {/* Collapsible Filter Bar */}
          <div className="filter-bar-container">
            <div className="filter-bar">
              <div className="filter-bar-header">
                <h2 className="filter-bar-title">🧬 {selectedGene}</h2>
              </div>

              {!filtersCollapsed && (
                <div className="filter-bar-content">
                  <div className="filter-summary">
                    <div className="filter-group">
                      <span className="filter-label">Enh/Pro:</span>
                      <span className="filter-value">
                        {showEnhancers && <span className="filter-tag">Enhancers</span>}
                        {showPromoters && <span className="filter-tag">Promoters</span>}
                        {!showEnhancers && !showPromoters && <span className="filter-empty">None selected</span>}
                      </span>
                    </div>

                    {selectedTFBS && selectedTFBS.length > 0 && (
                      <div className="filter-group">
                        <span className="filter-label">TFBS ({selectedTFBS.length}):</span>
                        <span className="filter-value">
                          {selectedTFBS.map(tfbs => (
                            <span key={tfbs} className="filter-tag" style={{ backgroundColor: color_map[tfbs], color: 'white' }}>
                              {tfbs}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}

                    {selectedVariants && selectedVariants.length > 0 && (
                      <div className="filter-group">
                        <span className="filter-label">Variants ({selectedVariants.length}):</span>
                        <span className="filter-value">
                          {selectedVariants.map(variant => (
                            <span key={variant} className="filter-tag">{variant}</span>
                          ))}
                        </span>
                      </div>
                    )}

                    <button className="edit-filters-btn" onClick={handleEditFilters}>
                      Edit Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button */}
            <div className="collapse-toggle-wrapper">
              <button
                className="collapse-toggle-btn"
                onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                aria-label={filtersCollapsed ? 'Expand filters' : 'Collapse filters'}
              >
                <span className="toggle-handle">
                  <span className={`chevron ${filtersCollapsed ? 'collapsed' : 'expanded'}`}>⌄</span>
                </span>
              </button>
            </div>
          </div>

          {/* Browser Content */}
          <div className="browser-content">
            {species.map((species_name, index) => (
              <React.Fragment key={species_name}>
                <NavigatableBar
                  gene={selectedGene}
                  species={species_name}
                  enh={showEnhancers}
                  prom={showPromoters}
                  TFBS={selectedTFBS}
                  variants={selectedVariants}
                  tfbs_color_map={color_map}
                  enh_prom_color_map={Enh_Prom_Color_Mapping}
                  zoomToRange={zoomRanges[species_name] || null}
                ></NavigatableBar>
              </React.Fragment>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .filter-bar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 10px 20px 0 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: var(--main-bg);
          margin-left: 60px;
        }

        .filter-bar {
          width: 100%;
          background: var(--container-bg);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .browser-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 0 20px 20px 20px;
          margin-left: 60px;
          transition: margin-left 0.3s ease;
        }

        .filter-bar-header {
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
        }

        .filter-bar-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--heading-color);
        }

        .filter-bar-content {
          padding: 1.5rem 2rem;
        }

        .filter-summary {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-group {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-label {
          font-weight: 600;
          color: var(--label-color);
          min-width: 150px;
        }

        .filter-value {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          flex: 1;
        }

        .filter-tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: var(--button-bg);
          color: white;
          border-radius: 16px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .filter-empty {
          color: var(--info-color);
          font-style: italic;
        }

        .edit-filters-btn {
          align-self: flex-start;
          padding: 0.75rem 1.5rem;
          background-color: var(--button-bg);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-filters-btn:hover {
          background-color: var(--button-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .collapse-toggle-wrapper {
          display: flex;
          justify-content: center;
          margin-top: -2px;
          margin-bottom: 15px;
          width: 100%;
        }

        .collapse-toggle-btn {
          padding: 0;
          background: linear-gradient(180deg, var(--button-bg) 0%, var(--button-hover) 100%);
          color: white;
          border: 2px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 12px 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 101;
          min-width: 80px;
          position: relative;
          overflow: hidden;
        }

        .toggle-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 0;
          position: relative;
        }

        .toggle-handle::before {
          content: '';
          position: absolute;
          top: 4px;
          width: 40px;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .chevron {
          font-size: 1.5rem;
          font-weight: bold;
          transition: transform 0.3s ease;
          display: inline-block;
          margin-top: 4px;
        }

        .chevron.expanded {
          transform: rotate(180deg);
        }

        .chevron.collapsed {
          transform: rotate(0deg);
        }

        .collapse-toggle-btn:hover {
          background: linear-gradient(180deg, var(--button-hover) 0%, var(--button-bg) 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }

        .collapse-toggle-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        @media (prefers-color-scheme: dark) {
          .filter-bar {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
        }

        [data-theme="dark"] .filter-bar {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 50px;
          background: var(--container-bg);
          border-right: 2px solid var(--border-color);
          transition: width 0.3s ease;
          overflow-x: hidden;
          overflow-y: auto;
          z-index: 200;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

          /* Move scrollbar to left side */
          direction: rtl;

          /* Modern scrollbar styling - hidden when collapsed */
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
        }

        .sidebar::-webkit-scrollbar {
          display: none;
        }

        .sidebar:hover {
          width: 300px;

          /* Modern scrollbar styling - visible on hover */
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
        }

        .sidebar:hover::-webkit-scrollbar {
          display: block;
          width: 8px;
        }

        .sidebar:hover::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar:hover::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }

        .sidebar:hover::-webkit-scrollbar-thumb:hover {
          background: var(--button-bg);
        }

        .sidebar-toggle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          color: var(--heading-color);
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;

          /* Fix direction for icon */
          direction: ltr;
        }

        .sidebar:hover .sidebar-toggle {
          opacity: 0;
        }

        .sidebar-content {
          padding: 20px;
          width: 300px;
          opacity: 0;
          transition: opacity 0.3s ease;
          min-height: 100%;

          /* Reset text direction to normal */
          direction: ltr;
        }

        .sidebar:hover .sidebar-content {
          opacity: 1;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 0;
          padding-bottom: 1rem;
          white-space: nowrap;
          position: sticky;
          top: 0;
          background: var(--main-bg);
          z-index: 11;
          margin: -20px -20px 0 -20px;
          padding: 20px 20px 1rem 20px;
        }

        .sticky-context-header {
          position: sticky;
          top: 60px;
          z-index: 10;
          background: var(--button-bg);
          padding: 1rem;
          margin: 1rem -20px 1rem -20px;
          border-bottom: 3px solid var(--accent, #2db4b6);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(8px);
        }

        .context-species {
          font-weight: 800;
          font-size: 1.1rem;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .context-separator {
          color: var(--button-bg);
          font-weight: 600;
          font-size: 1rem;
        }

        .context-variant {
          font-weight: 600;
          color: var(--button-bg);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .variant-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .variant-item {
          padding: 0.75rem;
          background: var(--button-bg);
          color: white;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .variant-item:hover {
          background: var(--button-hover);
          transform: translateX(5px);
        }

        .variant-name {
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .no-variants {
          color: var(--info-color);
          font-style: italic;
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        .loading-variants {
          color: var(--info-color);
          font-style: italic;
          font-size: 0.875rem;
          margin-top: 1rem;
        }

        .species-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .species-section:last-child {
          border-bottom: none;
        }

        .species-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
          background: var(--container-bg);
          border-left: 4px solid var(--button-bg);
        }

        .species-header:hover {
          background: var(--main-bg);
          border-left-color: var(--accent, #2db4b6);
        }

        .species-chevron {
          font-size: 1.4rem;
          font-weight: bold;
          transition: transform 0.3s ease;
          display: inline-block;
          color: var(--button-bg);
        }

        .species-chevron.expanded {
          transform: rotate(0deg);
        }

        .species-chevron.collapsed {
          transform: rotate(-90deg);
        }

        .species-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--heading-color);
          margin: 0;
          flex: 1;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .species-count {
          font-size: 0.9rem;
          color: var(--button-bg);
          font-weight: 600;
          background: var(--main-bg);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }

        .variant-type-section {
          margin-bottom: 1rem;
        }

        .variant-type-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--heading-color);
          margin-bottom: 0.5rem;
          margin-left: 1rem;
          padding: 0.4rem 0.5rem;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .variant-type-header:hover {
          background: var(--container-bg);
        }

        .variant-type-chevron {
          font-size: 0.9rem;
          font-weight: bold;
          transition: transform 0.3s ease;
          display: inline-block;
          color: var(--info-color);
        }

        .variant-type-chevron.expanded {
          transform: rotate(0deg);
        }

        .variant-type-chevron.collapsed {
          transform: rotate(-90deg);
        }

        .variant-type-name {
          flex: 1;
          color: var(--button-bg);
          font-weight: 600;
        }

        .variant-type-count {
          font-size: 0.75rem;
          color: var(--info-color);
          font-weight: 500;
        }

        .variant-instances {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-left: 2rem;
        }

        .variant-instance {
          padding: 0.375rem 0.5rem;
          background: var(--container-bg);
          border-left: 3px solid var(--button-bg);
          border-radius: 2px;
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .variant-instance:hover {
          background: var(--button-bg);
          transform: translateX(3px);
        }

        .variant-instance:hover .variant-type-label,
        .variant-instance:hover .instance-position {
          color: white;
        }

        .variant-type-label {
          font-weight: 600;
          color: var(--button-bg);
          margin-right: 0.5rem;
        }

        .instance-position {
          font-family: monospace;
          color: var(--heading-color);
        }

        .no-instances {
          color: var(--info-color);
          font-style: italic;
          font-size: 0.8125rem;
          margin-left: 2rem;
        }

        @media (prefers-color-scheme: dark) {
          .sidebar {
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
          }

          .sidebar:hover {
            /* Modern dark mode scrollbar */
            scrollbar-color: #4a5568 transparent;
          }

          .sidebar:hover::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar:hover::-webkit-scrollbar-thumb {
            background: #4a5568;
          }

          .sidebar:hover::-webkit-scrollbar-thumb:hover {
            background: var(--button-bg);
          }
        }

        [data-theme="dark"] .sidebar {
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] .sidebar:hover {
          /* Modern dark mode scrollbar */
          scrollbar-color: #4a5568 transparent;
        }

        [data-theme="dark"] .sidebar:hover::-webkit-scrollbar-track {
          background: transparent;
        }

        [data-theme="dark"] .sidebar:hover::-webkit-scrollbar-thumb {
          background: #4a5568;
        }

        [data-theme="dark"] .sidebar:hover::-webkit-scrollbar-thumb:hover {
          background: var(--button-bg);
        }
      `}</style>
    </main>
  );
}
