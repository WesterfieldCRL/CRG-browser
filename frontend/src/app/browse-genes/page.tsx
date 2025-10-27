'use client';

import React from 'react';
import GenomeBrowserPage from '../browser/desktop';

export default function BrowseGenesPage() {
  return (
    <main className="container">
      <section className="hero">
        <h1 className="title">Browse Genes</h1>
        <p className="subtitle">Explore sequences and annotations with the interactive browser.</p>
      </section>
      <section className="panel">
        <GenomeBrowserPage />
      </section>
    </main>
  );
}
