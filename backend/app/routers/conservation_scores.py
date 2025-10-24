from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ConservationNucleotides, ConservationScores, Genes, Species
from app.dependencies import async_session
from pydantic import BaseModel, Field

router = APIRouter(prefix="/conservation_scores")

class HistogramData(BaseModel):
    nucleotide: str = Field(..., description="The single letter nucleotide")
    phastcon_score: float = Field(..., description="The phastcon_score for this position")
    phylop_score: float = Field(..., description="The phylop_score for this position")

# This gets the scores in a sorted list for creating a histogram for a given species
@router.get("/histogram_data", response_model=List[HistogramData])
async def get_histogram_data(species_name: str, gene_name: str) -> List[HistogramData]:

    async with async_session() as session:
        stmt = select(ConservationScores.phastcon_score, ConservationScores.phylop_score, ConservationNucleotides.nucleotide).join(Genes).join(Species).where(Genes.name == gene_name).where(Species.name == species_name).order_by(ConservationScores.position)

        result = (await session.execute(stmt)).tuples().all()

        if result is None:
            raise HTTPException(status_code=404, detail="Unable to find scores for given gene and species")
        
        data: list[HistogramData] = []

        for row in result:
            data.append(HistogramData(nucleotide=row[2], phastcon_score=row[0], phylop_score=row[1]))            


        return data