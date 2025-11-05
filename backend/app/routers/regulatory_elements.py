import asyncio
from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.utils import async_session
from fastapi import APIRouter
from app.routers import regulatory_sequences

class Element(BaseModel):
    type: str = Field(..., description="string representing what the element is")
    start: int = Field(..., description="start of this element")
    end: int = Field(..., description="end of this element")

class ColorSegment(BaseModel):
    color: str = Field(..., description="string representing how it will be displayed on the frontend, if a solid color it will be a hex value")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

router = APIRouter(prefix="/elements")    

NORMAL_GAP = "gap"

THRESHOLD = 0.09

@router.get("/all_TFBS", response_model=list[str])
async def get_all_TFBS(gene_name: str) -> list[str]:
    async with async_session() as session:

        stmt = (select(RegulatoryElements.element_type)
                .join(RegulatorySequences)
                .join(Genes)
                .where(Genes.name == gene_name)
                .where(((RegulatoryElements.element_type != "Enh") & (RegulatoryElements.element_type != "Prom")))
                .distinct())
        
        result = (await session.execute(stmt)).scalars().all()

    return list(result)

# Returns a list of all elements within the given parameters
@router.get("/filtered_list", response_model=list[Element])
async def get_filtered_elements(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[Element]:
    async with async_session() as session:

        element_list: list[Element] = []


        stmt = (select(RegulatoryElements.element_type, RegulatoryElements.start, RegulatoryElements.end)
                .join(RegulatorySequences)
                .join(Genes)
                .join(Species)
                .where(Genes.name == gene_name)
                .where(Species.name == species_name)
                .where((RegulatoryElements.start >= start) & (RegulatoryElements.end <= end))
                .where(RegulatoryElements.element_type.in_(element_types))
                .order_by(RegulatoryElements.start))
            
        result = (await session.execute(stmt)).tuples().all()

        for row in result:

            element_list.append(Element(type = row[0], start = row[1], end = row[2]))

    
        return element_list
    
@router.get("/mapped_list", response_model=list[ColorSegment])
async def get_mapped_list(gene_name: str, species_name: str, element_types: list[str], start: int, end: int) -> list[ColorSegment]:

    element_list, offsets, sequence_coords = await asyncio.gather(
        get_filtered_elements(gene_name, species_name, element_types, start, end),
        regulatory_sequences.get_sequence_offsets(gene_name),
        regulatory_sequences.get_sequence_coordinate(gene_name,species_name)
    )

    total_start = 0
    total_end = offsets.max_value

    sequence_start = sequence_coords.start + offsets.offsets[species_name]
    sequence_end = sequence_coords.end + offsets.offsets[species_name]

    color_map = await populate_color_map(total_start, total_end, sequence_start, sequence_end, element_list, offsets.offsets[species_name])

    return color_map
    
# From the parameters generates a list of segments where the widths add up to 100 that can be given to the frontend to display
async def populate_color_map(total_start: int, total_end: int, sequence_start: int, sequence_end: int, element_list: list[Element], offset: int) -> list[ColorSegment]:

    total_width = total_end-total_start

    prev_index = total_start

    curr_width = 0

    color_segment_list: list[ColorSegment] = []

    for element in element_list:

        element_start = element.start + offset
        element_end = element.end + offset

        # if the elements are right not right next to each other we need this to fill in the gap
        if element_start > prev_index:
            gap_width = ((element_start - prev_index) / total_width) * 100
            color_segment_list.append(ColorSegment(color = NORMAL_GAP, width = gap_width))
            curr_width += gap_width
            prev_index = element_start

        # using prev_index instead of element.start to handle overlaps
        element_width = ((element_end - prev_index) / total_width) * 100
        color_segment_list.append(ColorSegment(color = element.type, width = element_width))
        curr_width += element_width
        prev_index = element_end

    # add any remaing space in the sequence

    # add any remaing allignment space
    color_segment_list.append(ColorSegment(color = NORMAL_GAP, width=100-curr_width))
    

    # Merge segments that are below the threshold
    # length = len(color_map[species_name])
    # i = 0
    # while i < length:
        
    #     if color_map[species_name][i].width < THRESHOLD:
    #         if i > 0:
    #             color_map[species_name][i - 1].width += color_map[species_name][i].width
    #             del color_map[species_name][i]
    #             i -= 1
    #             length -= 1
    #         else:
    #             color_map[species_name][i + 1].width += color_map[species_name][i].width
    #             del color_map[species_name][i]
    #             i -= 1
    #             length -= 1

    #     i += 1


    return color_segment_list
    