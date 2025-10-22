from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Genes
from app.dependencies import async_session

router = APIRouter(prefix="/genes")

@router.get("/names", response_model=List[str])
async def get_names() -> List[str]:
    
    async with async_session() as session:
        stmt = select(Genes.name)
        result = (await session.execute(stmt)).fetchall()


        return [row.name for row in result]

@router.get("/id", response_model=int)
async def get_id(name: str) -> int:

    async with async_session() as session:

        stmt = select(Genes.id).where(Genes.name == name)
        result = (await session.execute(stmt)).scalar() # We should never get more than one row from this query

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find gene name")