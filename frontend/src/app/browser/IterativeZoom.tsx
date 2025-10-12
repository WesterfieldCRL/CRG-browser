'use client'

import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from 'react';
import ColorBar from './ColorBar';
import { fetchCondensedSequences, fetchCondensedSequencesInRange } from '../utils/services';

interface ZoomProps {
    gene_name: string;
    onValueChange: (value: boolean) => void;
}

export default function Zoom({gene_name, onValueChange}: ZoomProps) {
    const[value, setValue] = useState<Array<number>>([0, 0]);
    const[range, setRange] = useState<Array<number>>([0, 0]);
    const[prevRange, setPrevRange] = useState<Array<Array<number>>>([]);
    const[update, setUpdate] = useState<boolean>(false);
    const[sequences, setSequences] = useState<Array<{name: string, segments: Array<{color: string, width: number}>}>>([]);
    const[loading, setLoading] = useState<boolean>(true);

    async function loadData() {
        setLoading(true);
        try {
            const data = (await fetchCondensedSequences(gene_name))
            setRange([data.start, data.end]);
            
            // Convert the sequences object to an array of sequences with names
            const sequenceArray = Object.entries(data.sequences).map(([key, segments]) => ({
                name: key,
                segments: segments as Array<{color: string, width: number}>
            }));
            
            setSequences(sequenceArray);
        } catch (error) {
            console.error("Error fetching condensed sequences:", error);
        } finally {
            setLoading(false);
        }
    }

    async function loadRangeData(start: number, end: number) {
        setLoading(true);
        try {
            const data = (await fetchCondensedSequencesInRange(gene_name, start, end))
            setRange([data.start, data.end]);
            
            // Convert the sequences object to an array of sequences with names
            const sequenceArray = Object.entries(data.sequences).map(([key, segments]) => ({
                name: key,
                segments: segments as Array<{color: string, width: number}>
            }));

            setSequences(sequenceArray);
            setValue([0,0]);
        } catch (error) {
            console.error("Error fetching condensed sequences in range:", error);
        } finally {
            setLoading(false);
        }
    }

    // Initial load
    useEffect(() => {
        loadData();
    }, [gene_name]);

    // On button press
    useEffect(() => {
        if (!loading)   {
            loadRangeData(value[0], value[1]);
        }
    }, [update]);

    function handleSliderChange(newValue: Array<number>) {
        setValue(newValue);
    }

    function handleButtonPress() {
        if (value[1] - value[0] < 100) {
            onValueChange(false);
        }
        else {
            prevRange.push(range);
            setUpdate(!update)
        }
    }

    function handleBackButtonPress() {
        setValue(prevRange.pop());
        setUpdate(!update);
    }

    function handleSuperZoomButton() {
        onValueChange(false);
    }

    return (
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                {loading && <h2 style={{textAlign: "center", color: "black"}}>Loading Data...</h2>}

                {!loading &&
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
                    <div style={{marginTop: '30px', display: "flex", flexDirection: "row", gap: "5px"}}>
                        <button 
                            onClick={() => handleButtonPress()}
                            className='button'
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
                        <button 
                            onClick={() => handleSuperZoomButton()}
                            className='button'
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#0d2a55';
                                e.currentTarget.style.boxShadow = '0 0 6px rgba(18, 60, 124, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#123c7c';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            View Individual Letters
                        </button>
                        {prevRange.length > 0 && 
                        <button 
                            onClick={() => handleBackButtonPress()}
                            className='button'
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#0d2a55';
                                e.currentTarget.style.boxShadow = '0 0 6px rgba(18, 60, 124, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#123c7c';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                                Back
                        </button>}
                    </div>
                </div>}
            </div>
    )
};