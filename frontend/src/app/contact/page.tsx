'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <>
      <main style={{ maxWidth: '700px', margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <section>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary, #0b7285)', marginBottom: '24px', fontWeight: '900' }}>
            📧 Get In Touch
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted, #6b7280)', lineHeight: '1.8', marginBottom: '40px' }}>
            Questions, feedback, or collaboration opportunities? We&apos;d love to hear from you!
          </p>

          <div style={{ background: 'var(--panel-bg, #ffffff)', borderRadius: '16px', padding: '48px 32px', margin: '32px 0', border: '2px solid var(--border, rgba(11,17,18,0.08))' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary, #0b7285)', margin: '0 0 24px 0', fontWeight: '800' }}>
              Email Us
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text, #0f1720)', lineHeight: '1.8', margin: '0 0 32px 0' }}>
              All data featured on this website is publicly available online. For questions or collaboration opportunities, please reach out:
            </p>
            <a
              href="mailto:kiron_ang1@baylor.edu"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 36px',
                background: 'linear-gradient(135deg, var(--accent, #2db4b6), var(--accent-dark, #0a8c86))',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.1rem',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(45,180,182,0.3)',
                transition: 'all 200ms ease'
              }}
            >
              <span>✉️</span>
              <span>kiron_ang1@baylor.edu</span>
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '48px' }}>
            <div style={{ background: 'var(--panel-bg, #ffffff)', border: '2px solid var(--border, rgba(11,17,18,0.08))', borderRadius: '12px', padding: '24px', borderLeft: '5px solid var(--accent, #2db4b6)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary, #0b7285)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🗄️</span>
                <span>Open Data</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.6', margin: '0' }}>
                All genomic sequences and data are from publicly available sources
              </p>
            </div>

            <div style={{ background: 'var(--panel-bg, #ffffff)', border: '2px solid var(--border, rgba(11,17,18,0.08))', borderRadius: '12px', padding: '24px', borderLeft: '5px solid var(--accent, #2db4b6)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary, #0b7285)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🔬</span>
                <span>Research</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.6', margin: '0' }}>
                Interested in comparative genomics research and collaboration
              </p>
            </div>

            <div style={{ background: 'var(--panel-bg, #ffffff)', border: '2px solid var(--border, rgba(11,17,18,0.08))', borderRadius: '12px', padding: '24px', borderLeft: '5px solid var(--accent, #2db4b6)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary, #0b7285)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🛠️</span>
                <span>Tools</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.6', margin: '0' }}>
                Providing accessible genomics visualization tools for researchers
              </p>
            </div>

            <div style={{ background: 'var(--panel-bg, #ffffff)', border: '2px solid var(--border, rgba(11,17,18,0.08))', borderRadius: '12px', padding: '24px', borderLeft: '5px solid var(--accent, #2db4b6)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary, #0b7285)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>👥</span>
                <span>Community</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #4b5563)', lineHeight: '1.6', margin: '0' }}>
                Building bridges between bioinformatics and web accessibility
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
