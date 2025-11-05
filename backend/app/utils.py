from pydantic import BaseModel, Field
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.routers.regulatory_elements import Element



DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/DB"

async_engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = async_sessionmaker(async_engine)

metadata = MetaData()

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
