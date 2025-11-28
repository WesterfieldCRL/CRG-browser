from fastapi import APIRouter, HTTPException
from typing import List
from sqlalchemy import select
from app.models import Genes
from app.utils import async_session

router = APIRouter(prefix="/genes", tags=["Genes", "Data"])

@router.get("/names", response_model=List[str], summary="Get all gene names", description="Returns a distinct list of all genes in the database")
async def get_names() -> List[str]:
    """
    Docstring for get_names
    
    :return: distinct list all of the gene names in the database
    :rtype: List[str]
    """
    async with async_session() as session:
        stmt = select(Genes.name)
        result = (await session.execute(stmt)).fetchall()


        return [row.name for row in result]

@router.get("/id", response_model=int, summary="Get's gene id", description=("Returns id of gene matching the given gene name\n\n" "Raises a 404 exception if unable to find a matching gene"))
async def get_id(name: str) -> int:
    """
    Docstring for get_id
    
    :param name: name of the gene
    :type name: str
    :return: id of the gene
    :rtype: int
    """
    async with async_session() as session:

        stmt = select(Genes.id).where(Genes.name == name)
        result = (await session.execute(stmt)).scalar() # We should never get more than one row from this query

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find gene name")