'use client'

import React from 'react';
import axios from "axios";

// THIS IS NOT A FINAL PAGE, JUST A TEMP PAGE TO TEST THE BROWSER FUNCTIONALITY

export default function Page() {

  const[input, setInput] = React.useState("");
  const[inputClicked, setInputClicked] = React.useState(false);
  const[outputClicked, setOutputClicked] = React.useState(false);
  const[output, setOutput] = React.useState("");

  function handleInputClick() {
    setInputClicked(true);
    setTimeout(() => {
      setInputClicked(false);
    }, 1000); 
    // Call endpoint
  }

  function handleOutputClick() {
    //setOutput("Data go here");
    setOutputClicked(true);
    // Call endpoint

    setOutput("data goes here");
  }

  function handleChange(event) {
    setInput(event.target.value);
  }

  return (
    <div>
      <p>Data Browser Temp Page</p>
      <div style={{display: "flex", gap: "10px", marginLeft: "10px"}}>
        <button className="border" onClick={handleInputClick}>Insert Data</button>
        <input className="border" type="text" name="name" onChange={handleChange}/>
        <p>{inputClicked ? "Submitted!" : ""}</p>
      </div>
      <div style={{display: "flex", gap: "10px", marginLeft: "10px"}}>
        <button className="border" onClick={handleOutputClick}>Search for gene</button>
        <input className="border" type="text" name="name" onChange={handleChange}/>
        <p>{outputClicked ? output : ""}</p>
      </div>
    </div>
  );
}