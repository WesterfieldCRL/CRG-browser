'use client'

import React, {useEffect, useState} from "react";
import Link from "next/link";
import InteractiveLine from "../components/InteractiveLine";

enum Genes {
    NONE,
    GENE1 = 'gene1',
    GENE2 = 'gene2',
    GENE3 = 'gene3',
}



export default function RegComp() {
    const[selectedGene, setSelectedGene] = useState<Genes>(Genes.NONE);

    const dummyShapes = [
        {
            start: 0,
            end: 20,
            info: "Initialization phase",
            color: "#4CAF50", // green
        },
        {
            start: 15,
            end: 35,
            info: "Loading data",
            color: "#2196F3", // blue
        },
        {
            start: 40,
            end: 60,
            info: "Processing",
            color: "#FFC107", // amber
        },
        {
            start: 55,
            end: 80,
            info: "Finalizing",
            // no color → will use default in component
        },
        {
            start: 85,
            end: 100,
            info: "Completed",
            color: "#9C27B0", // purple
        },
    ];

    const dummyProps = {
        start: 0,
        end: 100,
        shapes: dummyShapes,
        height: 40,
        width: "80%",
    };

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

    function handleBackButton() {
        setSelectedGene(Genes.NONE);
    }

    return (
        <>
            <main>
                {selectedGene == Genes.NONE &&
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                        <button color="black" onClick={handleGene1Press}>{Genes.GENE1}</button>
                        <button color="black" onClick={handleGene2Press}>{Genes.GENE2}</button>
                        <button color="black" onClick={handleGene3Press}>{Genes.GENE3}</button>
                    </div>
                }
                {selectedGene != Genes.NONE &&
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: '100%'}}>
                        <h1>
                            Some Title goes here
                        </h1>
                        <InteractiveLine {...dummyProps} />
                        <InteractiveLine {...dummyProps} />
                        <InteractiveLine {...dummyProps} />
                        <div style={{display: "flex", flexDirection: 'row'}}>
                            <button onClick={handleBackButton}>
                                Back
                            </button>
                        </div>
                    </div>
                }
            </main>        
        </>
    )
}

