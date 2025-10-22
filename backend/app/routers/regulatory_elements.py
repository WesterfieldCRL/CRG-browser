from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.dependencies import async_session
from app.routers import species
from fastapi import APIRouter


router = APIRouter(prefix="/elements")

class LineShapes(BaseModel):
    start: int = Field(..., description="Start position of the shape")
    end: int = Field(..., description="End position of the shape")
    info: str = Field(..., description="Information to be displayed when clicked on") # This will likley be changed later when we have more information
    color: str = Field(..., description="Hex color code representing something(?)")

class RegulatoryLine(BaseModel):
    relative_start: int = Field(..., description="Start position of the line")
    relative_end: int = Field(..., description="End position of the line")
    real_start: int = Field(..., description="Start position of the sequence based on the larger genome")
    real_end: int = Field(..., description="Start position of the sequence based on the larger genome")
    shapes: List[LineShapes] = Field(..., description="list of regulatory elements represented by shapes")


### assembles a line for a specifc species's regulatory elements
async def get_species_regulatory_line(given_species: str, given_gene: str) -> RegulatoryLine:
    async with async_session() as session:

        stmt = select(RegulatorySequences.id, RegulatorySequences.start, RegulatorySequences.end).join(Genes).join(Species).where(Genes.name == given_gene).where(Species.name == given_species)

        reg_elem_endpoints = (await session.execute(stmt)).scalar() # This should only give me one row I think

        if reg_elem_endpoints is None:
            raise HTTPException(status_code=404, detail = "Unable to find specifed sequence when getting regulatory line elements")

        relative_start = 0
        relative_end = reg_elem_endpoints.end - reg_elem_endpoints.start
        real_start = reg_elem_endpoints.start
        real_end = reg_elem_endpoints.end

        stmt = select(RegulatoryElements).join(RegulatorySequences).where(RegulatorySequences.id == reg_elem_endpoints.id)
        
        reg_elems = (await session.execute(stmt)).all()

        shapes = []
        for row in reg_elems:
            shapes.append(LineShapes(start = row.type_start_index, 
                                    end = row.type_end_index, 
                                    info = f"Chromosome: {row.chromosome} | {row.strand} | {row.gene_type}",
                                    color = "#ad463e"))
        
        return RegulatoryLine(relative_start = relative_start, relative_end = relative_end, real_start = real_start, real_end = real_end, shapes = shapes)

@router.get("/regulatory_line_elements", response_model=Dict[str, RegulatoryLine])
async def get_regulatory_line(gene_name: str) -> Dict[str, RegulatoryLine]:
    async with async_session() as session:

        species_list = await species.get_names()

        result = {}

        for species_name in species_list:
            result[species_name] = await get_species_regulatory_line(species_name, gene_name)

        return result