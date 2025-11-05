from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.utils import ColorSegment, async_session
from app.routers import species, regulatory_sequences
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
    