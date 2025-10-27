'use client';

import React from 'react';
import GenomeBrowserPage from '../browser/desktop';

export default function BrowseGenesMobilePage() {
  return (
    <main className="container container--narrow">
      <section className="hero hero--compact">
        <h1 className="title">Browse Genes (Mobile)</h1>
        <p className="subtitle">Optimized for small screens.</p>
      </section>
      <section className="panel panel--elevated">
        <GenomeBrowserPage />
      </section>
    </main>
  );
}
