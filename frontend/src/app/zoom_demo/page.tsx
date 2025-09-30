'use client'

import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from 'react';
import ColorBar from '../components/ColorBar';
import { useRouter } from 'next/navigation';
import { fetchCondensedSequences, fetchCondensedSequencesInRange } from '../utils/services';



export default function ZoomDemo() {
    const router = useRouter();
    const[value, setValue] = useState<Array<number>>([0, 0]);
    const[range, setRange] = useState<Array<number>>([0, 0]);
    const[update, setUpdate] = useState<boolean>(false);
    const[sequences, setSequences] = useState<Array<{name: string, segments: Array<{color: string, width: number}>}>>([]);
    const[loading, setLoading] = useState<boolean>(true);

    async function loadData() {
        setLoading(true);
        try {
            const data = (await fetchCondensedSequences("DRD4"))
            setRange([data.start, data.end]);
            
            // Convert the sequences object to an array of sequences with names
            const sequenceArray = Object.entries(data.sequences).map(([key, segments]) => ({
                name: key,
                segments: segments as Array<{color: string, width: number}>
            }));
            
            setSequences(sequenceArray);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching condensed sequences:", error);
        }
    }

    async function loadRangeData(start: number, end: number) {
        setLoading(true);
        try {
            const data = (await fetchCondensedSequencesInRange("DRD4", start, end))
            setRange([data.start, data.end]);
            
            // Convert the sequences object to an array of sequences with names
            const sequenceArray = Object.entries(data.sequences).map(([key, segments]) => ({
                name: key,
                segments: segments as Array<{color: string, width: number}>
            }));

            setSequences(sequenceArray);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching condensed sequences in range:", error);
        }
    }

    // Initial load
    useEffect(() => {
        loadData();
    }, []);

    // On button press
    useEffect(() => {
        loadRangeData(value[0], value[1]);
    }, [update]);

    function handleSliderChange(newValue: Array<number>) {
        setValue(newValue);
    }

    function handleButtonPress() {
        if (value[1] - value[0] < 100) {
            router.push('/browser');
        }
        else {setUpdate(!update)}
    }

    return (
        <main style={{height: "100vh", padding: "20px", backgroundColor: "#f0f2f5"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                {loading ? (<h2 style={{textAlign: "center", color: "black"}}>Loading Data...</h2>) : 
                <div style={{width: "75%", marginTop: "5%"}}>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "black"}}>
                        <span>Start: {value[0]}</span>
                        <span>End: {value[1]}</span>
                    </div>
                    <Slider
                        range={{ draggableTrack: true }}
                        min={range[0]}
                        max={range[1]}
                        value={value}
                        onChange={handleSliderChange}
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
                        onClick={() => handleButtonPress()}
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
                </div>}
            </div>
        </main>
    )
};