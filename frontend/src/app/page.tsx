'use client'

export default function Page() {
  return (
    <main className="container">
      {/* User Documentation */}
      <div className="documentation-section">
        <h2 className="doc-title">How to Use CoRGi</h2>

        <div className="doc-card">
          <div className="doc-header">
            <span className="doc-icon">🧬</span>
            <h3>Gene Browser</h3>
          </div>
          <div className="doc-content">
            <p className="doc-intro">Explore regulatory elements and sequences across species with our interactive browser.</p>

            <div className="doc-steps">
              <div className="doc-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Select a Gene</h4>
                  <p>Choose from DRD4, CHRNA6, or ALDH1A3 to begin your analysis.</p>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Configure Filters</h4>
                  <p>Use the collapsible filter bar at the top to select which regulatory elements to display:</p>
                  <ul>
                    <li><strong>Regulatory Elements</strong> - Toggle Enhancers and Promoters</li>
                    <li><strong>Transcription Factor Binding Sites (TFBS)</strong> - Select specific binding sites with &ldquo;Select All&rdquo; option</li>
                    <li><strong>Variants</strong> - Choose genetic variant categories to analyze with &ldquo;Select All&rdquo; option</li>
                    <li><strong>Apply Changes</strong> - After making selections, click the &quot;Update View&quot; button at the bottom of the filter bar to apply your changes</li>
                  </ul>
                  <p>The filter bar can be collapsed using the pull tab to save screen space while browsing.</p>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Explore the Browser</h4>
                  <p>View aligned sequences across three species (Human, Mouse, Macaque) with interactive features:</p>
                  <ul>
                    <li><strong>Variant Sidebar</strong> - Hover over the left sidebar to expand and view variant locations by species and type. Click any variant to zoom directly to that location.</li>
                    <li><strong>Zoom Navigation</strong> - Enter min/max values to focus on specific genomic regions</li>
                    <li><strong>Reset View</strong> - Return to full gene view with the &ldquo;Reset to Gene&rdquo; button</li>
                    <li><strong>Color-Coded Elements</strong> - Each element type (TFBS, Enhancers, Promoters, Variants) has unique colors with a legend for reference</li>
                    <li><strong>Nucleotide View</strong> - Zoom in to ≤1000bp to see nucleotide bars, or ≤100bp to view individual nucleotide letters</li>
                    <li><strong>Interactive Elements</strong> - Click on any regulatory element to zoom to that region at 100bp resolution</li>
                    <li><strong>Update View</strong> - After making filter selections, click the &quot;Update View&quot; button to apply changes and refresh the visualization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-card">
          <div className="doc-header">
            <span className="doc-icon">📊</span>
            <h3>Gene Comparison</h3>
          </div>
          <div className="doc-content">
            <p className="doc-intro">Analyze conservation patterns and evolutionary relationships across species.</p>

            <div className="doc-steps">
              <div className="doc-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Access Conservation Data</h4>
                  <p>Navigate to the Gene Comparison page to view conservation analysis for all available genes.</p>
                  <ul>
                    <li><strong>Spreadsheet Access</strong> - Click the spreadsheet link at the top of the page to access comprehensive conservation data in spreadsheet format</li>
                    <li><strong>Visual Histograms</strong> - View PhastCons and PhyloP score distributions for each gene</li>
                  </ul>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Understanding Conservation Scores</h4>
                  <p>Two types of conservation scores are provided for evolutionary analysis:</p>
                  <ul>
                    <li><strong>PhastCons Scores</strong> - Measure the probability that a nucleotide is in a conserved element. Higher scores indicate regions under selective pressure across species.</li>
                    <li><strong>PhyloP Scores</strong> - Detect both conservation and acceleration of evolution. Positive scores indicate conservation, while negative scores suggest rapid evolution.</li>
                  </ul>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Download Gene-Specific Data</h4>
                  <p>Export conservation scores for individual genes for further analysis:</p>
                  <ul>
                    <li><strong>CSV Download</strong> - Click the &quot;Download CSV&quot; button next to any gene to download its complete conservation score data</li>
                    <li><strong>Data Format</strong> - Downloaded files contain nucleotide positions with corresponding PhastCons and PhyloP scores</li>
                    <li><strong>External Analysis</strong> - Use the exported data in your own statistical analysis tools or visualization software</li>
                  </ul>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>Interpreting Results</h4>
                  <p>Use conservation scores to identify functionally important regions:</p>
                  <ul>
                    <li><strong>High Conservation</strong> - Regions with high PhastCons and positive PhyloP scores likely have functional significance</li>
                    <li><strong>Regulatory Importance</strong> - Conserved non-coding regions often indicate regulatory elements like enhancers or promoters</li>
                    <li><strong>Cross-Species Comparison</strong> - Compare conservation patterns across human, mouse, and macaque to understand evolutionary relationships</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
