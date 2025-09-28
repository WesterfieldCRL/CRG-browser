'use client'

import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import React, { useState } from 'react';



export default () => {
    const[value, setValue] = useState<Array<number>>([0, 0]);

    function handleChange(newValue: Array<number>) {
        setValue(newValue);
        console.log(newValue);
    }

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
            <div style={{width: "75%", marginTop: "5%"}}>
                <Slider
                    range
                    min={0}
                    max={10000}
                    onChangeComplete={handleChange}
                />
            </div>
        </div>
    )
};