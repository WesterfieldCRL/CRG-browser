from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes
from app.dependencies import async_session

from fastapi import APIRouter

from app.routers import species


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
async def get_sequences(gene_name: str, species_name: str) -> str:
    async with async_session() as session:
        stmt = select(RegulatorySequences.sequence).join(Genes).join(Species).where(Genes.name == gene_name).where(Species.name == species_name)
        result = (await session.execute(stmt)).scalar() # There should only be 1 result

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find sequence")


class ColorSegment(BaseModel):
    color: str = Field(..., description="Hex color code representing similarity")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

class CondensedSequences(BaseModel):
    sequences: Dict[str, List[ColorSegment]] = Field(..., description="Dictionary mapping species to their condensed sequences")
    start: int = Field(..., description="Start position of the sequence range")
    end: int = Field(..., description="End position of the sequence range")

THRESHOLD = 0.009  # Threshold for merging segments

async def compare_sequences(sequences: List[str]) -> List[bool]:
    # Compare sequences character by character and return a list indicating if all characters at each position are identical
    if not sequences:
        return []
    
    length = len(sequences[0])
    comparison = []
    
    for i in range(length):
        chars_at_pos_i = [seq[i] for seq in sequences]
        all_same = len(set(chars_at_pos_i)) == 1
        comparison.append(all_same)
    
    return comparison

async def populate_color_map(sequence_map):
    comparison = await compare_sequences(list(sequence_map.values()))

    # Condense the sequences based on similarity
    color_map = {}
    for species_name, sequence in sequence_map.items():
        color_map[species_name] = []  # Initialize an empty list that will hold ColorSegment objects

        # populate color map
        for i in range(len(sequence)):

            # check if all characters at this position are identical
            color = "#ffdad9"  # Default color for different characters
            
            if sequence[i] == '-':
                color = "#7a7a7a"  # Color for gaps
            else:
                if comparison[i]:
                    color = "#d9ebff"  # Color for identical characters

            # apply color #d9ebff if the same, #ffdad9 if different, #7A7A7A if gap
            if i > 0:
                if color_map[species_name][-1].color == color:
                    color_map[species_name][-1].width += 1
                else:
                    color_map[species_name].append(ColorSegment(color=color, width=1))
            else:
                color_map[species_name].append(ColorSegment(color=color, width=1))


        # Convert widths to percentages
        total_width = len(sequence)
        for segment in color_map[species_name]:
            segment.width = (segment.width / total_width) * 100

        # normalization (for each percantage calculate the sum and divide each by the sum)

        # Merge segments that are below the threshold
        length = len(color_map[species_name])
        i = 0
        while i < length:
            
            if color_map[species_name][i].width < THRESHOLD:
                if i > 0:
                    color_map[species_name][i - 1].width += color_map[species_name][i].width
                    del color_map[species_name][i]
                    i -= 1
                    length -= 1
                else:
                    color_map[species_name][i + 1].width += color_map[species_name][i].width
                    del color_map[species_name][i]
                    i -= 1
                    length -= 1

            i += 1
                

    return color_map

### Gets the sequences for all species based on gene name and condenses them into an array based on the similarity between sequences
@router.get("/condensed_sequences/", response_model=CondensedSequences)
async def get_condensed_sequences(gene_name: str):
    # Get the sequences from the database based on the gene name and put in array
    species_list = await species.get_names()
    
    # Create a dictionary to store species -> sequence mapping
    sequence_map = {}
    
    # For each species, get its sequence for the given gene
    for species_name in species_list:
        sequence_map[species_name] = await get_sequences(gene_name, species_name)
    
    
    color_map = await populate_color_map(sequence_map)



    # Wrap the color_map in the expected response format
    return {"sequences": color_map, "start": 0, "end": len(sequence_map[species_list[0]])}
    
### Same as condensed_sequences but only for a specific range of the sequence
@router.get("/condensed_sequences_range", response_model=CondensedSequences)
async def get_condensed_sequences_range(gene_name: str, start: int, end: int):
    async with async_session() as session:
        species_list = await species.get_names()

        sequence_map = {}

        for species_name in species_list:
            full_sequence = await get_sequences(gene_name, species_name)
            sequence_map[species_name] = full_sequence[start:end]

        color_map = await populate_color_map(sequence_map)

        # Wrap the color_map in the expected response format
        return {"sequences": color_map, "start": start, "end": end}