from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes
from app.dependencies import async_session

from fastapi import APIRouter


router = APIRouter(prefix="/sequences")

@router.get("/id", response_model=int)
async def get_id(species_name: str, genes_name: str) -> int:

    async with async_session() as session:
        stmt = select(RegulatorySequences.id).join(Genes).join(Species).where(Species.name == species_name).where(Genes.name == genes_name)
        result = (await session.execute(stmt)).first() # We should never get more than one row from this query

        if result is not None:
            return result[0]
        else:
            raise HTTPException(status_code=404, detail="Unable to find sequence")