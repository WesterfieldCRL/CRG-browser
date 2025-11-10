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

      {/* Features Grid */}
      <div className="features-grid" role="list">
        <article className="feature-card" role="listitem">
          <Link href="/browser" className="feature-link">
            <span className="feature-icon" role="img" aria-label="DNA">🧬</span>
            <h2 className="feature-title">Browse Genes</h2>
            <p className="feature-description">
              Interactive genome browser with drag-to-zoom functionality. View aligned sequences across human, mouse, and macaque.
            </p>
          </Link>
        </article>

        <article className="feature-card" role="listitem">
          <Link href="/comparison" className="feature-link">
            <span className="feature-icon" role="img" aria-label="Compare">📊</span>
            <h2 className="feature-title">Genome Comparison</h2>
            <p className="feature-description">
              Compare regulatory elements and conservation across species. View PhastCons and PhyloP conservation scores with interactive histograms.
            </p>
          </Link>
        </article>

        <article className="feature-card" role="listitem">
          <Link href="/contact" className="feature-link">
            <span className="feature-icon" role="img" aria-label="Contact">📧</span>
            <h2 className="feature-title">Get In Touch</h2>
            <p className="feature-description">
              Questions or collaboration opportunities? We&apos;d love to hear from you. All data is publicly available.
            </p>
          </Link>
        </article>
      </div>

      {/* About Section */}
      <section className="about-section" aria-labelledby="about-title">
        <h2 id="about-title" className="about-title">About CoRGi</h2>
        <p className="about-text">
          CoRGi (Comparative Regulatory Genomics) is a platform designed to make genomics data accessible and understandable. We provide carefully curated, aligned nucleotide sequences across multiple species, helping researchers identify conserved regulatory elements and evolutionary patterns.
        </p>
        <p className="about-text">
          Our user-friendly interface replaces complex command-line tools with intuitive visualizations, making comparative genomics accessible to researchers at all levels.
        </p>

        {/* Statistics */}
        <div className="stats-grid" role="list">
          <div className="stat-card" role="listitem">
            <span className="stat-number">3</span>
            <span className="stat-label">Species</span>
          </div>
          <div className="stat-card" role="listitem">
            <span className="stat-number">100+</span>
            <span className="stat-label">Genes</span>
          </div>
          <div className="stat-card" role="listitem">
            <span className="stat-number">1M+</span>
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

      {/* Version Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'var(--accent)',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'monospace',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        v2.2 - {new Date().toISOString().split('T')[0]}
      </div>
    </main>
  )
}
