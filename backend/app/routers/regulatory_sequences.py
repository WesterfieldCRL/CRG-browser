import asyncio
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes
from app.utils import async_session

from fastapi import APIRouter

from app.routers import species

class GeonomicCoordinate(BaseModel):
    start: int = Field(..., description="Start position of the sequence range")
    end: int = Field(..., description="End position of the sequence range")

class Offsets(BaseModel):
    offsets: dict[str, int] = Field(..., description="Dictionary mapping species to their offsets alligned starting at zero")
    max_value: int = Field(..., description="The rightmost value of all the alligned sequence (the leftmost will be zero)")

class NucleotideSegment(BaseModel):
    type: str = Field(..., description="single char representing a nucelotide letter")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

router = APIRouter(prefix="/sequences")

@router.get("/id", response_model=int)
async def get_id(species_name: str, gene_name: str) -> int:

    async with async_session() as session:
        stmt = select(RegulatorySequences.id).join(Genes).join(Species).where(Species.name == species_name).where(Genes.name == gene_name)
        result = (await session.execute(stmt)).scalar() # We should never get more than one row from this query

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find sequence")
        
@router.get("/sequence", response_model=str)
async def get_sequence(gene_name: str, species_name: str) -> str:
    async with async_session() as session:
        stmt = select(RegulatorySequences.sequence).join(Genes).join(Species).where(Genes.name == gene_name).where(Species.name == species_name)
        result = (await session.execute(stmt)).scalar() # There should only be 1 result

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find sequence")
    
# returns the range in [start, end]
@router.get("/total_range", response_model=tuple[int, int])
async def get_total_range(gene_name: str, species_name: str) -> tuple[int, int]:
    async with async_session() as session:
        stmt = (select(RegulatorySequences.total_start, RegulatorySequences.total_end)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name))
    
        result = (await session.execute(stmt)).tuples().first()

        if result is None:
            raise HTTPException(status_code=404, detail=f"Unable to find range for {gene_name} and {species_name}")

    return (result[0], result[1])

@router.get("/range", response_model=str)
async def get_sequence_range(gene_name: str, species_name: str, start: int, end: int) -> str:

    range, sequence = await asyncio.gather(
        get_total_range(gene_name, species_name),
        get_sequence(gene_name, species_name)
    )

    if range[0] > start or range[1] < end:
        raise HTTPException(status_code=400, detail="Invalid coordinates")

    relative_start = start - range[0]
    relative_end = end - range[0]

    return sequence[relative_start:relative_end]
        
@router.get("/allignment_numbers", response_model=dict[str,int])
async def get_allignment_numbers(gene_name: str) -> dict[str,int]:
    async with async_session() as session:
        stmt = select(RegulatorySequences.allignment_num, Species.name).select_from(RegulatorySequences).join(Genes).join(Species).where(Genes.name == gene_name)
        result = (await session.execute(stmt)).tuples().all()

        return_value: dict[str, int] = {}

        for row in result:
            return_value[row[1]] = row[0]

    return return_value

# gets the genomic coordinates for the individual gene
@router.get("/genomic_coordinate", response_model=GeonomicCoordinate)
async def get_genomic_coordinate(gene_name: str, species_name: str) -> GeonomicCoordinate:
    async with async_session() as session:
        stmt = (select(RegulatorySequences.gene_start, RegulatorySequences.gene_end)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name))
        
        result = (await session.execute(stmt)).tuples().first()

        if result is None:
            raise HTTPException(status_code=404, detail=f"Unable to get gene coordinates for {gene_name} and {species_name}")

        return GeonomicCoordinate(start = result[0], end = result[1])
    
# gets the genomic coordinates for the total sequence
@router.get("/sequence_coordinate", response_model=GeonomicCoordinate)
async def get_sequence_coordinate(gene_name: str, species_name: str) -> GeonomicCoordinate:
    async with async_session() as session:
        stmt = (select(RegulatorySequences.total_start, RegulatorySequences.total_end)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name))
        
        result = (await session.execute(stmt)).tuples().first()

        if result is None:
            raise HTTPException(status_code=404, detail=f"Unable to get sequence coordinates for {gene_name} and {species_name}")

        return GeonomicCoordinate(start = result[0], end = result[1])

# gets the sequence coordinates for every species in a dictionary with species as the key
@router.get("/all_sequence_coordinates", response_model=dict[str, GeonomicCoordinate])
async def get_all_sequence_coordinates(gene_name: str) -> dict[str, GeonomicCoordinate]:
    async with async_session() as session:

        stmt = (select(Species.name, RegulatorySequences.total_start, RegulatorySequences.total_end)
                .select_from(RegulatorySequences)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name))
        
        result = (await session.execute(stmt)).tuples().all()
        
        return_value: dict[str, GeonomicCoordinate] = {}

        for row in result:
            curr_geo_coord = GeonomicCoordinate(start = row[1], end = row[2])
            return_value[row[0]] = curr_geo_coord

        return return_value
    
# gets the gene coordinates for every species in a dictionary with species as the key
@router.get("/all_geonomic_coordinates", response_model=dict[str, GeonomicCoordinate])
async def get_all_geonomic_coordinates(gene_name: str) -> dict[str, GeonomicCoordinate]:
    async with async_session() as session:

        stmt = (select(Species.name, RegulatorySequences.gene_start, RegulatorySequences.gene_end)
                .select_from(RegulatorySequences)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name))
        
        result = (await session.execute(stmt)).tuples().all()
        
        return_value: dict[str, GeonomicCoordinate] = {}

        for row in result:
            curr_geo_coord = GeonomicCoordinate(start = row[1], end = row[2])
            return_value[row[0]] = curr_geo_coord

        return return_value
    
# This is going to return a list of all species mapped to the offsets of their sequences from zero
@router.get("/sequence_offsets", response_model=Offsets)
async def get_sequence_offsets(gene_name: str) -> Offsets:

    allignment_num = await get_allignment_numbers(gene_name)


    geo_coords = await get_all_sequence_coordinates(gene_name)

    offsets: dict[str, int] = {}

    largest_negative_start_coordinate = 0

    # Since everything needs to be alligned relative to something I am positioning every sequence so that the allignment number is at 0
    # and then shifting them back over so that the sequence with the smallest start value has the start value at 0 but they are all alligned by the allignment num
    for species in geo_coords:
        offsets[species] = geo_coords[species].start
        new_start_coord = geo_coords[species].start - allignment_num[species]

        # to move everything the same amount after alligning them we need to know what the furthest point past zero is
        if new_start_coord < largest_negative_start_coordinate:
            largest_negative_start_coordinate = new_start_coord
        
        geo_coords[species].start = new_start_coord

    largest_negative_start_coordinate *= -1

    max_right_value = 0

    # Now move everything back so that the minimum value is at 0
    for species in geo_coords:
        geo_coords[species].start += largest_negative_start_coordinate
        offsets[species] = geo_coords[species].start - offsets[species]

        curr_right_value = geo_coords[species].end + offsets[species]

        if curr_right_value > max_right_value:
            max_right_value = curr_right_value

    return Offsets(offsets = offsets, max_value = max_right_value)

# @router.get("/min_and_max", response_model=tuple[int, int])
# async def get_sequence_max_and_min(gene_name: str, species_name: str) -> tuple[int, int]:
    
#     offsets, original_coordinates = await asyncio.gather(
#         get_sequence_offsets(gene_name),
#         get_sequence_coordinate(gene_name, species_name)
#     )

#     max = original_coordinates.end + offsets.offsets[species_name]
#     min = original_coordinates.start + offsets.offsets[species_name]

#     return (min, max)

@router.get("/mapped_nucleotides", response_model=list[NucleotideSegment])
async def get_mapped_nucleotides(gene_name: str, species_name: str, start: int, end: int, show_letters: bool) -> list[NucleotideSegment]:

    sequence = await get_sequence_range(gene_name, species_name, start, end)

    nucleotide_bar: list[NucleotideSegment] = []

    for i in range(len(sequence)):

        if i > 0 and not show_letters:
            if nucleotide_bar[-1].type == sequence[i]:
                nucleotide_bar[-1].width += 1
            else:
                nucleotide_bar.append(NucleotideSegment(type=sequence[i], width=1))
        else:
            nucleotide_bar.append(NucleotideSegment(type=sequence[i], width=1))


    # Convert widths to percentages
    total_width = len(sequence)
    for segment in nucleotide_bar:
        segment.width = (segment.width / total_width) * 100

    return nucleotide_bar