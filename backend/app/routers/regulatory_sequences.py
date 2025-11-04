import asyncio
from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes
from app.utils import async_session

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
        
@router.get("/allignment_num", response_model=dict[str,int])
async def get_allignment_num(gene_name: str) -> dict[str,int]:
    async with async_session() as session:
        stmt = select(RegulatorySequences.allignment_num, Species.name).select_from(RegulatorySequences).join(Genes).join(Species).where(Genes.name == gene_name)
        result = (await session.execute(stmt)).tuples().all()

        return_value: dict[str, int] = {}

        for row in result:
            return_value[row[1]] = row[0]

    return return_value

class GeonomicCoordinate(BaseModel):
    start: int = Field(..., description="Start position of the sequence range")
    end: int = Field(..., description="End position of the sequence range")

@router.get("/geonomic_coordinates", response_model=dict[str, GeonomicCoordinate])
async def get_geonomic_coordinates(gene_name: str) -> dict[str, GeonomicCoordinate]:
    async with async_session() as session:

        stmt = (select(Species.name, RegulatorySequences.total_start, RegulatorySequences.total_end, RegulatorySequences.allignment_num)
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
@router.get("/sequence_offsets", response_model=dict[str, int])
async def get_sequence_offsets(gene_name: str) -> tuple[dict[str, int],int]:
    async with async_session() as session:

        allignment_num = await get_allignment_num(gene_name)


        geo_coords = await get_geonomic_coordinates(gene_name)

        offsets: dict[str, int] = {}

        largest_negative_start_coordinate = 0

        # Since everything needs to be alligned relative to something I am positioning every sequence so that the allignment number is at 0
        # and then shifting them back over so that the sequence with the smallest start value has the start value at 0 but they are all alligned by the allignment num
        for species in geo_coords:
            new_start_coord = geo_coords[species].start - allignment_num[species]

            # to move everything the same amount after alligning them we need to know what the furthest point past zero is
            if new_start_coord < largest_negative_start_coordinate:
                largest_negative_start_coordinate = new_start_coord
            
            geo_coords[species].start = new_start_coord

        largest_negative_start_coordinate *= -1

        max_right_value = 0

        for species in geo_coords:
            geo_coords[species].start += largest_negative_start_coordinate
            offsets[species] = offsets[species] - geo_coords[species].start

            curr_right_value = geo_coords[species].end + offsets[species]

            if curr_right_value > max_right_value:
                max_right_value = curr_right_value


        return offsets, max_right_value



# class ColorSegment(BaseModel):
#     color: str = Field(..., description="Hex color code representing similarity")
#     width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

# class CondensedSequences(BaseModel):
#     sequences: Dict[str, List[ColorSegment]] = Field(..., description="Dictionary mapping species to their condensed sequences")
#     start: int = Field(..., description="Start position of the sequence range")
#     end: int = Field(..., description="End position of the sequence range")

# THRESHOLD = 0.009  # Threshold for merging segments

# async def compare_sequences(sequences: List[str]) -> List[bool]:
#     # Compare sequences character by character and return a list indicating if all characters at each position are identical
#     if not sequences:
#         return []
    
#     length = len(sequences[0])
#     comparison = []
    
#     for i in range(length):
#         chars_at_pos_i = [seq[i] for seq in sequences]
#         all_same = len(set(chars_at_pos_i)) == 1
#         comparison.append(all_same)
    
#     return comparison

# async def populate_color_map(sequence_map):
#     comparison = await compare_sequences(list(sequence_map.values()))

#     # Condense the sequences based on similarity
#     color_map = {}
#     for species_name, sequence in sequence_map.items():
#         color_map[species_name] = []  # Initialize an empty list that will hold ColorSegment objects

#         # populate color map
#         for i in range(len(sequence)):

#             # check if all characters at this position are identical
#             color = "#ffdad9"  # Default color for different characters

#             if sequence[i] == '-':
#                 color = "#7a7a7a"  # Color for gaps
#             else:
#                 if comparison[i]:
#                     color = "#d9ebff"  # Color for identical characters

#             # apply color #d9ebff if the same, #ffdad9 if different, #7A7A7A if gap
#             if i > 0:
#                 if color_map[species_name][-1].color == color:
#                     color_map[species_name][-1].width += 1
#                 else:
#                     color_map[species_name].append(ColorSegment(color=color, width=1))
#             else:
#                 color_map[species_name].append(ColorSegment(color=color, width=1))


#         # Convert widths to percentages
#         total_width = len(sequence)
#         for segment in color_map[species_name]:
#             segment.width = (segment.width / total_width) * 100

#         # normalization (for each percantage calculate the sum and divide each by the sum)

#         # Merge segments that are below the threshold
#         length = len(color_map[species_name])
#         i = 0
#         while i < length:
            
#             if color_map[species_name][i].width < THRESHOLD:
#                 if i > 0:
#                     color_map[species_name][i - 1].width += color_map[species_name][i].width
#                     del color_map[species_name][i]
#                     i -= 1
#                     length -= 1
#                 else:
#                     color_map[species_name][i + 1].width += color_map[species_name][i].width
#                     del color_map[species_name][i]
#                     i -= 1
#                     length -= 1

#             i += 1
                

#     return color_map

# ### Gets the sequences for all species based on gene name and condenses them into an array based on the similarity between sequences
# @router.get("/condensed_sequences/", response_model=CondensedSequences)
# async def get_condensed_sequences(gene_name: str):
#     # Get the sequences from the database based on the gene name and put in array
#     species_list = await species.get_names()
    
#     # Create a dictionary to store species -> sequence mapping
#     sequence_map = {}
    
#     # For each species, get its sequence for the given gene
#     for species_name in species_list:
#         sequence_map[species_name] = await get_sequences(gene_name, species_name)
    
    
#     color_map = await populate_color_map(sequence_map)



#     # Wrap the color_map in the expected response format
#     return {"sequences": color_map, "start": 0, "end": len(sequence_map[species_list[0]])}
    
# ### Same as condensed_sequences but only for a specific range of the sequence
# @router.get("/condensed_sequences_range", response_model=CondensedSequences)
# async def get_condensed_sequences_range(gene_name: str, start: int, end: int):
#     async with async_session() as session:
#         species_list = await species.get_names()

#         sequence_map = {}

#         for species_name in species_list:
#             full_sequence = await get_sequences(gene_name, species_name)
#             sequence_map[species_name] = full_sequence[start:end]

#         color_map = await populate_color_map(sequence_map)

#         # Wrap the color_map in the expected response format
#         return {"sequences": color_map, "start": start, "end": end}