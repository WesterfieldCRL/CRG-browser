'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchGenes, fetchTFBS, fetchVariants } from '../utils/services';

function GeneBrowserFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [genes, setGenes] = useState<string[]>([]);
  const [selectedGene, setSelectedGene] = useState<string>('');

  // Filter options
  const [allTFBS, setAllTFBS] = useState<string[]>([]);
  const [selectedTFBS, setSelectedTFBS] = useState<string[]>([]);

  const [showEnhancers, setShowEnhancers] = useState<boolean>(false);
  const [showPromoters, setShowPromoters] = useState<boolean>(false);

  const [allVariants, setAllVariants] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Load genes on mount
  useEffect(() => {
    const loadGenes = async () => {
      try {
        setBackendError(false);
        const geneList = await fetchGenes();
        setGenes(geneList);

        // Check for gene parameter in URL
        const geneParam = searchParams.get('gene');
        if (geneParam && geneList.includes(geneParam)) {
          setSelectedGene(geneParam);
        }

        setLoading(false);
      } catch (error) {
        console.error('Backend not ready:', error);
        setBackendError(true);

        // Auto-retry up to 10 times with 2 second delay
        if (retryCount < 10) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          setLoading(false);
        }
      }
    };
    loadGenes();
  }, [retryCount]);

  // Load filter options when gene is selected
  useEffect(() => {
    if (!selectedGene) return;

    const loadFilterOptions = async () => {
      try {
        const [tfbsList, variantsList] = await Promise.all([
          fetchTFBS(selectedGene),
          fetchVariants(selectedGene)
        ]);

        setAllTFBS(tfbsList);

        // Check for TFBS selections in URL
        const tfbsParam = searchParams.get('tfbs');
        if (tfbsParam) {
          const requestedTFBS = tfbsParam.split(',').filter(t => tfbsList.includes(t));
          setSelectedTFBS(requestedTFBS);
        } else {
          setSelectedTFBS([]); // Reset selections
        }

        setAllVariants(variantsList);

        // Check for variant selections in URL
        const variantsParam = searchParams.get('variants');
        if (variantsParam) {
          const requestedVariants = variantsParam.split(',').filter(v => variantsList.includes(v));
          setSelectedVariants(requestedVariants);
        } else {
          setSelectedVariants([]); // Reset selections
        }

        // Check for enhancer/promoter settings in URL
        setShowEnhancers(searchParams.get('enh') === 'true');
        setShowPromoters(searchParams.get('prom') === 'true');
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, [selectedGene]);

  const handleGeneClick = (gene: string) => {
    setSelectedGene(gene);
  };

  const handleTFBSToggle = (tfbs: string) => {
    setSelectedTFBS(prev =>
      prev.includes(tfbs)
        ? prev.filter(t => t !== tfbs)
        : [...prev, tfbs]
    );
  };

  const handleTFBSSelectAll = () => {
    if (selectedTFBS.length === allTFBS.length) {
      setSelectedTFBS([]); // Deselect all if all are selected
    } else {
      setSelectedTFBS([...allTFBS]); // Select all
    }
  };

  const handleVariantToggle = (variant: string) => {
    setSelectedVariants(prev =>
      prev.includes(variant)
        ? prev.filter(v => v !== variant)
        : [...prev, variant]
    );
  };

  const handleVariantSelectAll = () => {
    if (selectedVariants.length === allVariants.length) {
      setSelectedVariants([]); // Deselect all if all are selected
    } else {
      setSelectedVariants([...allVariants]); // Select all
    }
  };

  const handleGo = () => {
    const params = new URLSearchParams();
    params.set('gene', selectedGene);

    if (selectedTFBS.length > 0) {
      params.set('tfbs', selectedTFBS.join(','));
    }

    if (showEnhancers) {
      params.set('enh', 'true');
    }

    if (showPromoters) {
      params.set('prom', 'true');
    }

    if (selectedVariants.length > 0) {
      params.set('variants', selectedVariants.join(','));
    }

    router.push(`/browser/view?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <main className="filter-page">
          <div className="loading-container">
            {backendError ? (
              <>
                <div className="loading-icon">⏳</div>
                <div className="loading-title">Backend Initializing...</div>
                <div className="loading-subtitle">
                  The server is starting up and loading data. This may take up to 20 seconds.
                </div>
                <div className="loading-retry">
                  Attempt {retryCount + 1} of 10
                </div>
              </>
            ) : (
              <>
                <div className="loading-icon">🧬</div>
                <div className="loading-title">Loading Gene Browser...</div>
              </>
            )}
          </div>
        </main>

        <style jsx>{`
          .filter-page {
            min-height: calc(100vh - 60px);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .loading-container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }

          .loading-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
          }

          .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0a6080;
            margin-bottom: 0.5rem;
          }

          .loading-subtitle {
            font-size: 1rem;
            color: #666;
            line-height: 1.5;
            margin-bottom: 1rem;
          }

          .loading-retry {
            font-size: 0.875rem;
            color: #1a8fa0;
            font-weight: 600;
            font-family: monospace;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <main className="filter-page">
        <div className="container">
          <h1 className={`title ${selectedGene ? 'compact' : ''}`}>Gene Browser</h1>
          {!selectedGene && <p className="subtitle">Select a gene to explore</p>}

          {/* Instructions */}
          {!selectedGene && <div className="instructions">
            <div className="instructions-header">
              <span className="instructions-icon">ℹ️</span>
              <h3>How to Use</h3>
            </div>
            <ol className="instructions-list">
              <li><strong>Select a gene</strong> from the options below (DRD4, CHRNA6, or ALDH1A3)</li>
              <li><strong>Choose filters</strong> for regulatory elements, transcription factors, and variant categories</li>
              <li><strong>Click &ldquo;Go to Browser&rdquo;</strong> to view aligned sequences across Human, Mouse, and Macaque</li>
            </ol>
          </div>}

          {/* Backend Error State */}
          {genes.length === 0 && !loading && (
            <section className="error-section">
              <div className="error-icon">⚠️</div>
              <h2 className="error-title">Backend Connection Failed</h2>
              <p className="error-message">
                Unable to connect to the backend server after multiple attempts.
                Please ensure the backend is running and try refreshing the page.
              </p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Retry
              </button>
            </section>
          )}

          {/* Gene Selection */}
          {genes.length > 0 && (
            <section className="gene-selection">
              <h2>Select Gene</h2>
              <div className="gene-grid">
                {genes.map(gene => (
                  <button
                    key={gene}
                    className={`gene-card ${selectedGene === gene ? 'selected' : ''}`}
                    onClick={() => handleGeneClick(gene)}
                  >
                    {gene}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Filter Options - Only show when gene is selected */}
          {selectedGene && (
            <>
              <section className="filter-section">
                <h2>Regulatory Elements</h2>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showEnhancers}
                      onChange={(e) => setShowEnhancers(e.target.checked)}
                    />
                    <span>Show Enhancers</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showPromoters}
                      onChange={(e) => setShowPromoters(e.target.checked)}
                    />
                    <span>Show Promoters</span>
                  </label>
                </div>
              </section>

              {allTFBS.length > 0 && (
                <section className="filter-section">
                  <div className="section-header">
                    <h2>Transcription Factor Binding Sites</h2>
                    <button className="select-all-button" onClick={handleTFBSSelectAll}>
                      {selectedTFBS.length === allTFBS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="checkbox-grid">
                    {allTFBS.map(tfbs => (
                      <label key={tfbs} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedTFBS.includes(tfbs)}
                          onChange={() => handleTFBSToggle(tfbs)}
                        />
                        <span>{tfbs}</span>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              <section className="filter-section">
                {allVariants.length > 0 ? (
                  <>
                    <div className="section-header">
                      <h2>Variant Categories</h2>
                      <button className="select-all-button" onClick={handleVariantSelectAll}>
                        {selectedVariants.length === allVariants.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="checkbox-grid">
                      {allVariants.map(variant => (
                        <label key={variant} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedVariants.includes(variant)}
                            onChange={() => handleVariantToggle(variant)}
                          />
                          <span>{variant}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2>Variant Categories</h2>
                    <p className="no-data-message">No variant categories available for this gene</p>
                  </>
                )}
              </section>

              <div className="action-section">
                <button className="go-button" onClick={handleGo}>
                  Go to Browser
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        .filter-page {
          min-height: calc(100vh - 60px);
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 2rem;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading {
          text-align: center;
          font-size: 1.25rem;
          color: #333;
          padding: 4rem;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0a6080;
          margin-bottom: 0.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .title.compact {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          margin-top: 0;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #555;
          text-align: center;
          margin-bottom: 2rem;
        }

        .instructions {
          background: rgba(26, 143, 160, 0.1);
          border-left: 4px solid #1a8fa0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .instructions-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .instructions-icon {
          font-size: 1.5rem;
        }

        .instructions-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a6080;
          margin: 0;
        }

        .instructions-list {
          margin: 0;
          padding-left: 1.5rem;
          color: #333;
          line-height: 1.8;
        }

        .instructions-list li {
          margin-bottom: 0.5rem;
        }

        .instructions-list strong {
          color: #0a6080;
        }

        .error-section {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #d32f2f;
          margin-bottom: 1rem;
        }

        .error-message {
          font-size: 1rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          background: #1a8fa0;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-button:hover {
          background: #0a6080;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .gene-selection {
          margin-bottom: 3rem;
        }

        .gene-selection h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0a6080;
          margin-bottom: 1rem;
        }

        .gene-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .gene-card {
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 2rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .gene-card:hover {
          border-color: #1a8fa0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .gene-card.selected {
          background: linear-gradient(135deg, #0a6080 0%, #1a8fa0 100%);
          color: white;
          border-color: #0a6080;
          box-shadow: 0 4px 16px rgba(10, 96, 128, 0.3);
        }

        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .filter-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a6080;
          margin-bottom: 1rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          margin-bottom: 0;
        }

        .select-all-button {
          background: #0a6080;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-all-button:hover {
          background: #1a8fa0;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .checkbox-label:hover {
          background-color: #f5f7fa;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #1a8fa0;
        }

        .checkbox-label span {
          font-size: 0.9375rem;
          color: #333;
        }

        .no-data-message {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }

        .action-section {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .go-button {
          background: linear-gradient(135deg, #0a6080 0%, #1a8fa0 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 3rem;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(10, 96, 128, 0.3);
        }

        .go-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(10, 96, 128, 0.4);
        }

        .go-button:active {
          transform: translateY(0);
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .filter-page {
            background: linear-gradient(135deg, #0f1720 0%, #1a2332 100%);
          }

          .title {
            color: #5ecbcd;
          }

          .subtitle {
            color: #94a3b8;
          }

          .instructions {
            background: rgba(94, 203, 205, 0.15);
            border-left-color: #5ecbcd;
          }

          .instructions-header h3 {
            color: #5ecbcd;
          }

          .instructions-list {
            color: #94a3b8;
          }

          .instructions-list strong {
            color: #5ecbcd;
          }

          .error-section,
          .gene-card,
          .filter-section {
            background: #1a2332;
            border-color: rgba(94, 203, 205, 0.3);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .gene-card {
            color: #f8fafc;
          }

          .gene-card:hover {
            border-color: #5ecbcd;
            box-shadow: 0 4px 12px rgba(94, 203, 205, 0.2);
          }

          .gene-card.selected {
            background: linear-gradient(135deg, #2db4b6 0%, #5ecbcd 100%);
            border-color: #5ecbcd;
            box-shadow: 0 4px 16px rgba(94, 203, 205, 0.4);
          }

          .gene-selection h2,
          .filter-section h2 {
            color: #5ecbcd;
          }

          .error-message,
          .checkbox-label span,
          .no-data-message {
            color: #94a3b8;
          }

          .checkbox-label:hover {
            background-color: rgba(94, 203, 205, 0.1);
          }

          .checkbox-label input[type="checkbox"] {
            accent-color: #5ecbcd;
          }

          .go-button {
            background: linear-gradient(135deg, #2db4b6 0%, #5ecbcd 100%);
            box-shadow: 0 4px 12px rgba(94, 203, 205, 0.3);
          }

          .go-button:hover {
            box-shadow: 0 6px 16px rgba(94, 203, 205, 0.4);
          }

          .retry-button {
            background: #2db4b6;
          }

          .retry-button:hover {
            background: #5ecbcd;
          }

          .select-all-button {
            background: #2db4b6;
          }

          .select-all-button:hover {
            background: #5ecbcd;
            box-shadow: 0 2px 6px rgba(94, 203, 205, 0.3);
          }
        }

        [data-theme="dark"] .filter-page {
          background: linear-gradient(135deg, #0f1720 0%, #1a2332 100%);
        }

        [data-theme="dark"] .title {
          color: #5ecbcd;
        }

        [data-theme="dark"] .subtitle {
          color: #94a3b8;
        }

        [data-theme="dark"] .instructions {
          background: rgba(94, 203, 205, 0.15);
          border-left-color: #5ecbcd;
        }

        [data-theme="dark"] .instructions-header h3 {
          color: #5ecbcd;
        }

        [data-theme="dark"] .instructions-list {
          color: #94a3b8;
        }

        [data-theme="dark"] .instructions-list strong {
          color: #5ecbcd;
        }

        [data-theme="dark"] .error-section,
        [data-theme="dark"] .gene-card,
        [data-theme="dark"] .filter-section {
          background: #1a2332;
          border-color: rgba(94, 203, 205, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        [data-theme="dark"] .gene-card {
          color: #f8fafc;
        }

        [data-theme="dark"] .gene-card:hover {
          border-color: #5ecbcd;
          box-shadow: 0 4px 12px rgba(94, 203, 205, 0.2);
        }

        [data-theme="dark"] .gene-card.selected {
          background: linear-gradient(135deg, #2db4b6 0%, #5ecbcd 100%);
          border-color: #5ecbcd;
          box-shadow: 0 4px 16px rgba(94, 203, 205, 0.4);
        }

        [data-theme="dark"] .gene-selection h2,
        [data-theme="dark"] .filter-section h2 {
          color: #5ecbcd;
        }

        [data-theme="dark"] .error-message,
        [data-theme="dark"] .checkbox-label span,
        [data-theme="dark"] .no-data-message {
          color: #94a3b8;
        }

        [data-theme="dark"] .checkbox-label:hover {
          background-color: rgba(94, 203, 205, 0.1);
        }

        [data-theme="dark"] .checkbox-label input[type="checkbox"] {
          accent-color: #5ecbcd;
        }

        [data-theme="dark"] .go-button {
          background: linear-gradient(135deg, #2db4b6 0%, #5ecbcd 100%);
          box-shadow: 0 4px 12px rgba(94, 203, 205, 0.3);
        }

        [data-theme="dark"] .go-button:hover {
          box-shadow: 0 6px 16px rgba(94, 203, 205, 0.4);
        }

        [data-theme="dark"] .retry-button {
          background: #2db4b6;
        }

        [data-theme="dark"] .retry-button:hover {
          background: #5ecbcd;
        }

        [data-theme="dark"] .select-all-button {
          background: #2db4b6;
        }

        [data-theme="dark"] .select-all-button:hover {
          background: #5ecbcd;
          box-shadow: 0 2px 6px rgba(94, 203, 205, 0.3);
        }

        @media (max-width: 768px) {
          .filter-page {
            padding: 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .gene-grid {
            grid-template-columns: 1fr;
          }

          .checkbox-grid {
            grid-template-columns: 1fr;
          }

          .filter-section {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

export default function GeneBrowserFilterPage() {
  return (
    <Suspense fallback={
      <>
        <main className="filter-page">
          <div className="loading-container">
            <div className="loading-icon">🧬</div>
            <div className="loading-title">Loading Gene Browser...</div>
          </div>
        </main>
        <style jsx>{`
          .filter-page {
            min-height: calc(100vh - 60px);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .loading-container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }
          .loading-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
          }
          .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0a6080;
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </>
    }>
      <GeneBrowserFilter />
    </Suspense>
  );
}
