'use client'

import React from "react";
import Link from "next/link";

export default function HomePageDesktop() {
  return (
    <>
      <header className="header">
        <nav className="nav-container">
          <Link href="/" className="logo">GenomeHub</Link>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/browser">Genome Browser</Link></li>
            <li><Link href="/comparison">Genome Comparison</Link></li>
          </ul>
        </nav>
      </header>

      <main className="main-container">
        <section className="hero">
          <h1 className="hero-title">Welcome to GenomeHub</h1>
          <p className="hero-subtitle">Advanced Comparative Genomics Analysis Platform</p>
          <p className="hero-description">
            Explore evolutionary relationships through multi-species gene expression analysis 
            and interactive genome visualization tools
          </p>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">🧬</div>
            <h3>Genome Browser</h3>
            <p>Interactive multi-species sequence alignment viewer with support for comparative genomics</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Genome Comparison</h3>
            <p>Analyze evolutionary divergence and gene expression correlations across species</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Data Analysis</h3>
            <p>Comprehensive genomic data analysis with support for SNPs and regulatory elements</p>
          </div>
        </section>
      </main>

      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }

        .nav-links a:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          font-family: "Helvetica Neue", Arial, sans-serif;
          background-color: #f6f9fc;
          min-height: calc(100vh - 80px);
        }

        .hero {
          text-align: center;
          padding: 3rem 0;
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: #123c7c;
          margin-bottom: 1rem;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #3b82f6;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .hero-description {
          font-size: 1.1rem;
          color: #555;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: #123c7c;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #555;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
