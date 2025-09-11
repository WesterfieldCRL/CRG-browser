'use client'

import React from 'react';
import axios from "axios";
import { JSONTree } from 'react-json-tree';
import { useForm } from "react-hook-form";

// THIS IS NOT A FINAL PAGE, JUST A TEMP PAGE TO TEST THE BROWSER FUNCTIONALITY
// TODO: Remove Json viewer dependency once not needed

export default function Page() {
  const[input, setInput] = React.useState("");
  const[outputClicked, setOutputClicked] = React.useState(false);
  const[output, setOutput] = React.useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => handleInputClick(data);

  function handleInputClick(data) {
    setInput(data.example);
    // Call endpoint
  }

  async function handleOutputClick() {
    //setOutput("Data go here");
    setOutputClicked(true);
    // Call endpoint
    try {
    const response = await axios.get("http://localhost:8000/get/species?name=" + input);
      setOutput(response.data);
    } catch (error) {
      setOutput("Error fetching data");
      console.error(error);
    }
  }

  function handleChange(event) {
    setInput(event.target.value);
  }

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
      <p>Data Browser Temp Page</p>
      <form onSubmit={handleSubmit(onSubmit)} style={{display: "flex",  gap: "10px"}}>
        <input type="submit" />

        <input {...register("example", { required: true })} className='border'/>
        {errors.example && <span>This field is required</span>}

        <input {...register("exampleRequired", { required: true })} className='border'/>
        {errors.exampleRequired && <span>This field is required</span>}
      </form>
      <div style={{display: "flex",  gap: "10px"}}>
        <button onClick={handleOutputClick}>Search for gene</button>
        <input className="border" type="text" name="name" value={input} onChange={handleChange}/>
      </div>
      {outputClicked ? 
        <JSONTree data={output} /> : ""}
      
    </div>
  );
}