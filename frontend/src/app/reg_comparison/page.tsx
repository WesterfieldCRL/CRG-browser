'use client'

import React, {useEffect, useState} from "react";
import Link from "next/link";

enum Genes {
    NONE,
    GENE1 = 'gene1',
    GENE2 = 'gene2',
    GENE3 = 'gene3',
}

export default function RegComp() {
    const[selectedGene, setSelectedGene] = useState<Genes>(Genes.NONE);


    function handleGene1Press() {
        setSelectedGene(Genes.GENE1);
    }

    function handleGene2Press() {
        setSelectedGene(Genes.GENE2);
    }

    function handleGene3Press() {
        setSelectedGene(Genes.GENE3);
    }

    useEffect(() => {
        if (selectedGene != Genes.NONE) {
            // Load graph data from endpoint
        }
    }, [selectedGene]);

    return (
        <>
            <header style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <nav style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 2rem'
                }}>
                <Link href="/" style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textDecoration: 'none'
                }}>GenomeHub</Link>
                <ul style={{
                    display: 'flex',
                    listStyle: 'none',
                    gap: '2rem',
                    margin: 0,
                    padding: 0,
                }}>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/browser">Genome Browser</Link></li>
                    <li><Link href="/comparison">Genome Comparison</Link></li>
                </ul>
                </nav>
            </header>

            <main style={{
                margin: 0,
                padding: '20px',
                fontFamily: 'Helvetica Neue", Arial, sans-serif',
                backgroundColor: '#f6f9fc',
                color: '#1c1c1c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh',
            }}>
                {selectedGene == Genes.NONE &&
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                        <button color="black" onClick={handleGene1Press}>{Genes.GENE1}</button>
                        <button color="black" onClick={handleGene2Press}>{Genes.GENE2}</button>
                        <button color="black" onClick={handleGene3Press}>{Genes.GENE3}</button>
                    </div>
                }
                {selectedGene != Genes.NONE &&
                    <div>

                    </div>
                }
            </main>        
        </>
    )
}

