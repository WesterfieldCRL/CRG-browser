from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from app.models import Species
from app.utils import async_session

from fastapi import APIRouter


router = APIRouter(prefix="/species", tags=["Species", "Data"])

@router.get("/names", response_model=List[str], summary="Gets all species names", description="Returns a distinct list of all species in the database")
async def get_names() -> List[str]:
    """
    Docstring for get_names
    
    :return: distinct list of all species names in the database
    :rtype: List[str]
    """
    async with async_session() as session:
        stmt = select(Species.name)
        result = (await session.execute(stmt)).fetchall()


        return [row.name for row in result]

@router.get("/id", response_model=int, summary="Get's species id",  description=("Returns id of species matching the given species name\n\n" "Raises a 404 exception if unable to find a matching species"))
async def get_id(name: str) -> int:
    """
    Docstring for get_id
    
    :param name: name of the species
    :type name: str
    :return: id of the species
    :rtype: int
    """
    async with async_session() as session:    
        stmt = select(Species.id).where(Species.name == name)
        result = (await session.execute(stmt)).scalar() # We should never get more than one row from this query

        if result is not None:
            return result
        else:
            raise HTTPException(status_code=404, detail="Unable to find species name")
        
class Assembly(BaseModel):
    assembly: str

@router.get("/assemblies", response_model=Assembly, summary="Get's assemblies", description=("Returns the assembly for the given species name\n\n" "Raises a 404 exception if unable to find a matching species"))
async def get_assemblies(species_name: str) -> Assembly:
    """
    Docstring for get_assemblies
    
    :param species_name: name of the species
    :type species_name: str
    :return: assembly used in the species
    :rtype: Assembly

    ALDH1A3 is stored as such for the sake of my sanity but is not the assembly used for macaque and mouse sequences. Please see the write up for more details.
    """
    async with async_session() as session:
        stmt = select(Species.assembly).where(Species.name == species_name)
        result = (await session.execute(stmt)).scalar()

        if result is not None:
            return Assembly(assembly=result)
        else:
            raise HTTPException(status_code=404, detail=f"Unable to find assembly for {species_name}")