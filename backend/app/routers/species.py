from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Species
from app.dependencies import get_session

from fastapi import APIRouter


router = APIRouter(prefix="/genes")

@router.get("/get/species_id/", response_model=int)
async def get_species_id(name: str, session: AsyncSession = Depends(get_session)) -> int:

    
    stmt = select(Species.id).where(Species.name == name)
    result = (await session.execute(stmt)).first() # We should never get more than one row from this query

    if result is not None:
        return result[0]
    else:
        raise HTTPException(status_code=404, detail="Unable to find species name")