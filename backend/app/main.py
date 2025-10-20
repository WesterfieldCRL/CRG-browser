from fastapi import FastAPI, HTTPException, Query, Body, Depends
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy import create_engine, MetaData, select, insert, update, delete
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from csv import DictReader
import asyncio

# Importing all of the sqlalchemy classes
from app import models

DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/DB"

async_engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = async_sessionmaker(async_engine)

metadata = MetaData()


# Session = sessionmaker(engine)


app = FastAPI()

origins = [
    "http://localhost:5432",  # Database
    "http://localhost:3030"   # Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def load_Genes() -> None:
    print("loading genes table")

    with open("app/Genes.csv", "r") as genes_file:

        async with async_session() as session:
            reader = DictReader(genes_file)
            rows = [dict(row) for row in reader]
            
            stmt = insert(models.Genes).values(rows)

            await session.execute(stmt)
            await session.commit()

async def load_Species() -> None:
    print("loading species table")

    with open("app/Species.csv", "r") as genes_file:

        async with async_session() as session:
            reader = DictReader(genes_file)
            rows = [dict(row) for row in reader]
            
            stmt = insert(models.Species).values(rows)

            await session.execute(stmt)
            await session.commit()

async def load_RegulatorySequences() -> None:
    print("loading regulatory sequences table")

    with open("app/Species.csv", "r") as genes_file:

        async with async_session() as session:
            reader = DictReader(genes_file)
            rows = [dict(row) for row in reader]
            
            # Since this table depends on Genes and Species we need to get the correct id's for the given values


            stmt = insert(models.Species).values(rows)

            await session.execute(stmt)
            await session.commit()

async def load_RegulatroyElements() -> None:
    print("loading regulatory elements table")

async def load_ConservationAnalysis() -> None:
    print("loading conservation analysis table")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs before application starts
    
    print("Started loading tables")

    # These tables don't depend on anything but everything depends on them so we are running them both at the same time
    await asyncio.gather(
        load_Genes(),
        load_Species()
    )

    # These tables both depend on genes and species so we can load these now
    # conservation_analysis_future = load_ConservationAnalysis()
    # regulatory_sequences_future = load_RegulatorySequences()
    

    # await regulatory_sequences_future
    # # This table depends on RegulatorySequences so we we can run that now
    # await load_RegulatroyElements()

    # # Make sure all tasks have finished
    # await conservation_analysis_future

    print("Finished loading tables")
    yield
    # Runs after application ends

app = FastAPI(lifespan=lifespan)

@app.get("/all_genes/", response_model=List[str])
async def get_all_genes() -> List[str]:
    
    async with async_session() as session:
        stmt = select(models.Genes.name)
        result = (await session.execute(stmt)).fetchall()


    return [row.name for row in result]
