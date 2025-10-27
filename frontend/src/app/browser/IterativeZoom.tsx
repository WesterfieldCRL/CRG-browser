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
                {loading && <h2 style={{textAlign: "center", color: "var(--main-text)"}}>Loading Data...</h2>}

                {!loading &&
                <div style={{width: "75%", marginTop: "5%"}}>
                    <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "var(--main-text)", fontWeight: 600}}>
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
                                width: '4px',
                                height: '230px',
                                marginTop: '-10px',
                                backgroundColor: 'var(--accent, #2db4b6)',
                                borderRadius: '2px',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                boxShadow: '0 0 8px rgba(45, 180, 182, 0.6)',
                                cursor: 'ew-resize'
                            },
                            rail: {
                                backgroundColor: 'transparent'
                            },
                            track: {
                                height: '210px',
                                marginTop: '0px',
                                backgroundColor: 'rgba(45, 180, 182, 0.15)',
                                borderRadius: '0',
                                border: '2px solid var(--accent, #2db4b6)',
                                boxShadow: 'inset 0 0 10px rgba(45, 180, 182, 0.2)'
                            }
                        }}
                    />
                    <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
                        {sequences.map((sequence, index) => (
                            <React.Fragment key={sequence.name}>
                                <div style={{color: 'var(--main-text)', userSelect: 'none', fontWeight: 600, fontSize: '1.1rem'}}>{sequence.name}</div>
                                <ColorBar segments={sequence.segments} />
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{marginTop: '30px', display: "flex", flexDirection: "row", gap: "5px"}}>
                        <button
                            onClick={() => handleButtonPress()}
                            className='zoom-button'
                        >
                            Enlarge Data
                        </button>
                        <button
                            onClick={() => handleSuperZoomButton()}
                            className='zoom-button'
                        >
                            View Individual Letters
                        </button>
                        {prevRange.length > 0 &&
                        <button
                            onClick={() => handleBackButtonPress()}
                            className='zoom-button'
                        >
                            Back
                        </button>}
                    </div>
                </div>}

                <style jsx>{`
                    .zoom-button {
                        padding: 10px 16px;
                        border-radius: 6px;
                        border: 1px solid var(--border-color);
                        background-color: var(--button-bg);
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background-color 0.3s ease, box-shadow 0.2s ease, transform 0.15s ease;
                        min-width: 120px;
                    }

                    .zoom-button:hover {
                        background-color: var(--button-hover);
                        box-shadow: 0 0 8px rgba(45, 180, 182, 0.6);
                        transform: translateY(-1px);
                    }

                    .zoom-button:active {
                        transform: translateY(0);
                    }
                `}</style>
            </div>
    )
};