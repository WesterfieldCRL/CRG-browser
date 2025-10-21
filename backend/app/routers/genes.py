from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Genes
from app.dependencies import get_session

router = APIRouter(prefix="/genes")

@router.get("/names", response_model=List[str])
async def get_names(session: AsyncSession = Depends(get_session)) -> List[str]:
    
    
    stmt = select(Genes.name)
    result = (await session.execute(stmt)).fetchall()


    return [row.name for row in result]

@router.get("/id", response_model=int)
async def get_id(name: str, session: AsyncSession = Depends(get_session)) -> int:

    
    stmt = select(Genes.id).where(Genes.name == name)
    result = (await session.execute(stmt)).first() # We should never get more than one row from this query

    if result is not None:
        return result[0]
    else:
        raise HTTPException(status_code=404, detail="Unable to find gene name")