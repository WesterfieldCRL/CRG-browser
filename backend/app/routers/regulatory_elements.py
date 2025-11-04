from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.utils import ColorSegment, Element, async_session
from app.routers import species, regulatory_sequences
from fastapi import APIRouter


router = APIRouter(prefix="/elements")    

class Sequence(BaseModel):
    sequences: Dict[str, list[ColorSegment]] = Field(..., description="Dictionary mapping species to their condensed sequences")
    start: int = Field(..., description="Start position of the sequence range")
    end: int = Field(..., description="End position of the sequence range")

@router.get("/enhancers_and_promoters", response_model=Sequence)
async def get_enh_prom_sequence(gene_name: str, start: Optional[int] = None, end: Optional[int] = None) -> Sequence:
    async with async_session() as session:
        # Allign our sequences together
        allignment_tuple = await regulatory_sequences.get_sequence_offsets(gene_name)
        offsets = allignment_tuple[0]
        max_sequence_value = allignment_tuple[1]
        min_sequence_value = 0

        sequences: Dict[str, list[ColorSegment]]

        species_list = await species.get_names()

        element_dict: dict[str, list[Element]] = {} 

        enhancer_visual_representation = "stripes"
        promoter_visual_representation = "bars"
        enhancer_string = "Enh"
        promoter_string = "Prom"

        for species_name in species_list:

            stmt = (select(RegulatoryElements.element_type, RegulatoryElements.start, RegulatoryElements.end)
                    .select_from(RegulatoryElements)
                    .join(RegulatorySequences)
                    .join(Genes)
                    .join(Species)
                    .where(Genes.name == gene_name)
                    .where(Species.name == species_name)
                    .where(or_(RegulatoryElements.element_type == enhancer_string, RegulatoryElements.element_type == promoter_string))
                    .order_by(RegulatoryElements.start))
            
            result = (await session.execute(stmt)).tuples().all()

            for row in result:
                
                element_visual = promoter_visual_representation

                if row[0] == enhancer_string:
                    element_visual = enhancer_visual_representation

                element_start = row[1] + offsets[species_name]
                element_end = row[2] + offsets[species_name]

                element_dict[species_name].append(Element(visual = element_visual, start = element_start, end = element_end))
    
    
        # Now that we have collected all of the elements we need to generate a color bar from them
        
        for species_name in species_list:

    
        return 