from fastapi import APIRouter
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.utils import async_session
from fastapi import APIRouter

class Element(BaseModel):
    type: str = Field(..., description="string representing what the element is")
    start: int = Field(..., description="start of this element")
    end: int = Field(..., description="end of this element")

router = APIRouter(prefix="/elements")    


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
    

ALLIGNMENT_GAP = "none"
NORMAL_GAP = "gray"
THRESHOLD = 0.009  # Threshold for merging segments

class ColorSegment(BaseModel):
    color: str = Field(..., description="string representing how it will be displayed on the frontend, if a solid color it will be a hex value")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

# From the parameters generates a list of segments where the widths add up to 100 that can be given to the frontend to display
async def populate_color_map(total_start: int, total_end: int, sequence_start: int, sequence_end: int, element_list: list[Element]) -> list[ColorSegment]:

    total_width = total_end-total_start

    prev_index = total_start

    color_segment_list: list[ColorSegment] = []

    starting_gap = ((sequence_start - total_start) / total_width) * 100

    if starting_gap != 0:
        color_segment_list.append(ColorSegment(color=ALLIGNMENT_GAP, width = starting_gap))
        prev_index = sequence_start

    for element in element_list:

        # if the elements are right not right next to each other we need this to fill in the gap
        if element.start > prev_index:
            gap_width = ((element.start - prev_index) / total_width) * 100
            color_segment_list.append(ColorSegment(color = NORMAL_GAP, width = gap_width))
            prev_index = element.start

        # using prev_index instead of element.start to handle overlaps
        element_width = ((element.end - prev_index) / total_width) * 100
        color_segment_list.append(ColorSegment(color = element.visual, width = element_width))
        prev_index = element.end

    return color_segment_list
    