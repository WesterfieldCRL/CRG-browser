'use client'

import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from 'react';
import ColorBar from '../components/ColorBar';
import { useRouter } from 'next/navigation';
import { fetchCondensedSequences } from '../utils/services';



export default function ZoomDemo() {
    const router = useRouter();
    const[value, setValue] = useState<Array<number>>([0, 0]);
    const[range, setRange] = useState<Array<number>>([0, 0]);
    const[sequences, setSequences] = useState<Array<{name: string, segments: Array<{color: string, width: number}>}>>([]);

    async function loadData() {
        try {
            const data = (await fetchCondensedSequences("DRD4"))
            setRange([0, data.sequences[Object.keys(data.sequences)[0]].length-1]);
            
            // Convert the sequences object to an array of sequences with names
            const sequenceArray = Object.entries(data.sequences).map(([key, segments]) => ({
                name: key,
                segments: segments as Array<{color: string, width: number}>
            }));
            
            setSequences(sequenceArray);
        } catch (error) {
            console.error("Error fetching condensed sequences:", error);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
    }, [range]);

    function handleChange(newValue: Array<number>) {
/*         if (newValue[1] - newValue[0] > 1000) {
            // Determine which handle was moved
            if (newValue[0] !== oldValue[0]) {
                // Left handle was moved
                newValue[0] = newValue[1] - 1000;
            } else {
                // Right handle was moved
                newValue[1] = newValue[0] + 1000;
            }
        } */
        setValue(newValue);

    }

    return (
        <main style={{height: "100vh", padding: "20px", backgroundColor: "#f0f2f5"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                <div style={{width: "75%", marginTop: "5%"}}>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "black"}}>
                        <span>Start: {value[0]}</span>
                        <span>End: {value[1]}</span>
                    </div>
                    <Slider
                        range={{ draggableTrack: true }}
                        min={0}
                        max={100}
                        value={value}
                        onChange={handleChange}
                        allowCross={true}
                        styles={{
                            handle: {
                                width: '2px',
                                height: '230px',
                                marginTop: '-10px',
                                backgroundColor: '#1890ff',
                                borderRadius: '0'
                            },
                            rail: {
                                backgroundColor: 'transparent'
                            },
                            track: {
                                height: '210px',
                                marginTop: '0px',
                                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                                borderRadius: '0'
                            }
                        }}
                    />
                    <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
                        {sequences.map((sequence, index) => (
                            <React.Fragment key={sequence.name}>
                                <div style={{color: 'black', userSelect: 'none'}}>{sequence.name}</div>
                                <ColorBar segments={sequence.segments} />
                            </React.Fragment>
                        ))}
                    </div>
                    <button 
                        onClick={() => router.push('/browser')}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '6px',
                            border: '1px solid #123c7c',
                            backgroundColor: '#123c7c',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                            minWidth: '90px',
                            userSelect: 'none',
                            marginTop: '40px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d2a55';
                            e.currentTarget.style.boxShadow = '0 0 6px rgba(18, 60, 124, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#123c7c';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Enlarge Data
                    </button>
                </div>
            </div>
        </main>
    )
};