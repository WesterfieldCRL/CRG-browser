"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

  const handleEditFilters = () => {
    router.push('/browser');
  };

  return (
    <main style={{ padding: '0' }}>
      {!loading && (
        <>
          {/* Sidebar for Variant Locations */}
          <div className="sidebar">
            <div className="sidebar-toggle">›</div>
            <div className="sidebar-content">
              <h3 className="sidebar-title">Variants</h3>
              {selectedVariants && selectedVariants.length > 0 ? (
                <div className="variant-list">
                  {selectedVariants.map((variant, index) => (
                    <div key={index} className="variant-item">
                      <span className="variant-name">{variant}</span>
                    </div>
                  ))}
                </div>
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
                      <span className="filter-label">Regulatory Elements:</span>
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
                          {selectedTFBS.slice(0, 5).map(tfbs => (
                            <span key={tfbs} className="filter-tag" style={{ backgroundColor: color_map[tfbs], color: 'white' }}>
                              {tfbs}
                            </span>
                          ))}
                          {selectedTFBS.length > 5 && (
                            <span className="filter-tag">+{selectedTFBS.length - 5} more</span>
                          )}
                        </span>
                      </div>
                    )}

                    {selectedVariants && selectedVariants.length > 0 && (
                      <div className="filter-group">
                        <span className="filter-label">Variants ({selectedVariants.length}):</span>
                        <span className="filter-value">
                          {selectedVariants.slice(0, 3).map(variant => (
                            <span key={variant} className="filter-tag">{variant}</span>
                          ))}
                          {selectedVariants.length > 3 && (
                            <span className="filter-tag">+{selectedVariants.length - 3} more</span>
                          )}
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
                <span className="collapse-arrows">
                  {filtersCollapsed ? (
                    <>
                      <span>▼</span>
                      <span>▼</span>
                      <span>▼</span>
                    </>
                  ) : (
                    <>
                      <span>▲</span>
                      <span>▲</span>
                      <span>▲</span>
                    </>
                  )}
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
          padding: 20px 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--main-bg);
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
        }

        .collapse-toggle-btn {
          padding: 8px 40px;
          background-color: var(--button-bg);
          color: white;
          border: 2px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 8px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 101;
        }

        .collapse-arrows {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0.4;
          font-size: 0.7rem;
        }

        .collapse-arrows span {
          display: block;
          height: 6px;
        }

        .collapse-toggle-btn:hover {
          background-color: var(--button-hover);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .collapse-toggle-btn:active {
          transform: translateY(1px);
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
        }

        .sidebar:hover {
          width: 300px;
        }

        .sidebar-toggle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          color: var(--heading-color);
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .sidebar:hover .sidebar-toggle {
          opacity: 0;
        }

        .sidebar-content {
          padding: 20px;
          width: 300px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sidebar:hover .sidebar-content {
          opacity: 1;
        }

        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--heading-color);
          margin-bottom: 1rem;
          white-space: nowrap;
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

        @media (prefers-color-scheme: dark) {
          .sidebar {
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
          }
        }

        [data-theme="dark"] .sidebar {
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </main>
  );
}
