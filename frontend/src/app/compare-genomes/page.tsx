'use client';

import React from 'react';
import Comparison from '../comparison/page';
import RegComparison from '../reg_comparison/page';

export default function CompareGenomesPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1 className="title">Compare Genomes</h1>
        <p className="subtitle">Sequence and regulatory comparisons in one place.</p>
      </section>

      <div className="grid grid--2">
        <section className="panel">
          <h2 className="section-title">Sequence Comparison</h2>
          <Comparison />
        </section>

        <section className="panel">
          <h2 className="section-title">Regulatory Comparison</h2>
          <RegComparison />
        </section>
      </div>
    </main>
  );
}
