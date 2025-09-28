'use client'

import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import React, { useState } from 'react';
import ColorBar from '../components/ColorBar';



export default () => {
    const[value, setValue] = useState<Array<number>>([0, 0]);
    
    // Example colored segments
    const colorSegments1 = [
        { color: '#ffdad9', width: 20 },
        { color: '#d9ebff', width: 10 },
        { color: '#ffdad9', width: 5 },
        { color: '#d9ebff', width: 5 },
        { color: '#ffdad9', width: 10 },
        { color: '#d9ebff', width: 25 },
        { color: '#ffdad9', width: 25 }
    ];

    const colorSegments2 = [
        { color: '#d9ebff', width: 10 },
        { color: '#ffdad9', width: 10 },
        { color: '#d9ebff', width: 30 },
        { color: '#ffdad9', width: 10 },
        { color: '#d9ebff', width: 20 },
        { color: '#ffdad9', width: 20 }
    ];

    const colorSegments3 = [
        { color: '#ffdad9', width: 10 },
        { color: '#d9ebff', width: 20 },
        { color: '#ffdad9', width: 15 },
        { color: '#d9ebff', width: 15 },
        { color: '#ffdad9', width: 20 },
        { color: '#d9ebff', width: 20 }
    ];

    function handleChange(newValue: Array<number>) {
        if (newValue[1] - newValue[0] <= 1000) {
            setValue(newValue);    
        }
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
                        max={10000}
                        value={value}
                        onChange={handleChange}
                        step={100}
                        allowCross={false}
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
                    <div style={{display: "flex", flexDirection: "column", gap: "50px"}}>
                        <ColorBar segments={colorSegments1} />
                        <ColorBar segments={colorSegments2} />
                        <ColorBar segments={colorSegments3} />
                    </div>

                </div>
            </div>
        </main>
    )
};