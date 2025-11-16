'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Page() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Haptic feedback utility
    const vibrate = (duration = 10) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(duration)
      }
    }

    // Add haptic feedback to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .feature-card')
    const handleTouchStart = () => vibrate(10)

    interactiveElements.forEach(el => {
      el.addEventListener('touchstart', handleTouchStart, { passive: true })
    })

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show install prompt after 3 seconds
      setTimeout(() => {
        if (!localStorage.getItem('pwa-dismissed')) {
          setShowInstallPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
          }
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      interactiveElements.forEach(el => {
        el.removeEventListener('touchstart', handleTouchStart)
      })
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response: ${outcome}`)
      setDeferredPrompt(null)
    }
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  return (
    <main className="container">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero-title">🧬 Welcome to CoRGi</h1>
        <p className="hero-subtitle">
          Comparative Regulatory Genomics<br />
          Explore aligned nucleotide sequences across multiple species
        </p>
        <Link href="/browser" className="cta-button" role="button">
          Start Browsing Genes →
        </Link>
      </section>

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
                    <li><strong>Direct Editing</strong> - All filter changes update the view in real-time without page navigation</li>
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
                  <h4>Conservation Scores</h4>
                  <p>View PhastCons and PhyloP scores to identify highly conserved regions indicating functional importance.</p>
                </div>
              </div>

              <div className="doc-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Cross-Species Analysis</h4>
                  <p>Compare regulatory elements across human, mouse, and macaque to understand evolutionary conservation and species-specific variations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="doc-card">
          <div className="doc-header">
            <span className="doc-icon">💡</span>
            <h3>Data & Features</h3>
          </div>
          <div className="doc-content">
            <ul className="feature-list">
              <li><strong>Aligned Sequences</strong> - Multi-species sequence alignments with synchronized coordinates</li>
              <li><strong>Regulatory Elements</strong> - Comprehensive annotation of enhancers, promoters, and TFBS</li>
              <li><strong>Genetic Variants</strong> - Catalogued variant positions and categories with clickable sidebar navigation</li>
              <li><strong>Conservation Analysis</strong> - PhastCons and PhyloP conservation scores</li>
              <li><strong>Interactive Navigation</strong> - Collapsible filter bar, expandable variant sidebar, and zoom controls</li>
              <li><strong>Real-time Updates</strong> - Filter changes update visualizations instantly without page reloads</li>
              <li><strong>Responsive Design</strong> - Optimized for desktop browsers (mobile not currently supported)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="about-section" aria-labelledby="about-title">
        <h2 id="about-title" className="about-title">About CoRGi</h2>
        <p className="about-text">
          CoRGi (Comparative Regulatory Genomics) is an interactive platform for exploring and comparing regulatory elements across species. Our tool provides aligned genomic sequences and comprehensive regulatory annotations for key genes involved in neurodevelopment and behavior.
        </p>
        <p className="about-text">
          By integrating transcription factor binding sites, enhancers, promoters, and genetic variants with conservation scores, CoRGi enables researchers to identify functionally important regulatory regions and understand their evolutionary patterns across human, mouse, and macaque.
        </p>

        {/* Statistics */}
        <div className="stats-grid" role="list">
          <div className="stat-card" role="listitem">
            <span className="stat-number">3</span>
            <span className="stat-label">Species</span>
          </div>
          <div className="stat-card" role="listitem">
            <span className="stat-number">3</span>
            <span className="stat-label">Genes</span>
          </div>
          <div className="stat-card" role="listitem">
            <span className="stat-number">6M+</span>
            <span className="stat-label">Base Pairs</span>
          </div>
        </div>
      </section>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="install-prompt" role="dialog" aria-labelledby="install-title" aria-describedby="install-description">
          <div className="install-content">
            <h3 id="install-title">Install CoRGi</h3>
            <p id="install-description">Add CoRGi to your home screen for quick access and offline capability.</p>
            <div className="install-buttons">
              <button onClick={handleInstall} className="install-accept">Install</button>
              <button onClick={handleDismiss} className="install-dismiss">Not Now</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
