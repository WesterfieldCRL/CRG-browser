'use client'

import React from 'react';
import axios from "axios";
import { JSONTree } from 'react-json-tree';
import { useForm } from "react-hook-form";
import { Tracker } from '@/components/Tracker'

// THIS IS NOT A FINAL PAGE, JUST A TEMP PAGE TO TEST THE BROWSER FUNCTIONALITY
// TODO: Remove Json viewer dependency once not needed


const data = [  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-red-600", tooltip: "Error" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-red-600", tooltip: "Error" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-yellow-600", tooltip: "Warn" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },  { color: "bg-emerald-600", tooltip: "Tracker Info" },]

export default function Page() {
  const[input, setInput] = React.useState("");
  const[outputClicked, setOutputClicked] = React.useState(false);
  const[output, setOutput] = React.useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => handleInputClick(data);

  function handleInputClick(data) {
    // Call endpoint
    try {
      const response = axios.post("http://localhost:8000/insert_genes", data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleOutputClick() {
    //setOutput("Data go here");
    setOutputClicked(true);
    // Call endpoint
    try {
    const response = await axios.get("http://localhost:8000/get_genes?name=" + input);
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
      <Tracker data={data} hoverEffect={true} />
      <form onSubmit={handleSubmit(onSubmit)} style={{display: "flex",  gap: "10px"}}>
        <input type="submit" />

        <input {...register("gene_id", { required: true })} placeholder="gene_id" className='border'/>
        {errors.gene_id && <span>This field is required</span>}

        <input {...register("species", { required: true })} className='border' placeholder="species"/>
        {errors.species && <span>This field is required</span>}

        <input {...register("human_gene_name", { required: true })} className='border' placeholder="human_gene_name"/>
        {errors.human_gene_name && <span>This field is required</span>}

        <input {...register("chromosome", { required: true })} className='border' placeholder="chromosome"/>
        {errors.chromosome && <span>This field is required</span>}

        <input {...register("start_position", { required: true })} className='border' placeholder="start_position"/>
        {errors.start_position && <span>This field is required</span>}

        <input {...register("end_position", { required: true })} className='border' placeholder="end_position"/>
        {errors.end_position && <span>This field is required</span>}
      </form>
      <div style={{display: "flex",  gap: "10px"}}>
        <button onClick={handleOutputClick}>Search for gene</button>
        <input className="border" type="text" name="name" value={input} onChange={handleChange}/>
      </div>
      {outputClicked ? <JSONTree data={output} /> : ""}
      
    </div>
  );
}