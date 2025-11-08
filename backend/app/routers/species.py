from typing import List
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.models import Species
from app.utils import async_session

from fastapi import APIRouter


router = APIRouter(prefix="/species")

@router.get("/names", response_model=List[str])
async def get_names() -> List[str]:
    
    async with async_session() as session:
        stmt = select(Species.name)
        result = (await session.execute(stmt)).fetchall()


        return [row.name for row in result]

@router.get("/id", response_model=int)
async def get_id(name: str) -> int:

    async with async_session() as session:    
        stmt = select(Species.id).where(Species.name == name)
        result = (await session.execute(stmt)).scalar() # We should never get more than one row from this query

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find species name")
        

@router.get("/assemblies", response_model=str)
async def get_assemblies(species_name: str) -> str:

    async with async_session() as session:
        stmt = select(Species.assembly).where(Species.name == species_name)
        result = (await session.execute(stmt)).scalar()

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail=f"Unable to find assembly for {species_name}")