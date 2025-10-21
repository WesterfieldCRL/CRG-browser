from fastapi import FastAPI, HTTPException, Query, Body, Depends, APIRouter
from pydantic import BaseModel, Field
from typing import List, AsyncGenerator
from sqlalchemy import create_engine, MetaData, select, insert, update, delete
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from csv import DictReader
import asyncio

# Importing all of the sqlalchemy classes
from app.models import load_ConservationAnalysis, load_Genes, load_RegulatorySequences, load_RegulatroyElements, load_Species
from routers import genes, species



app = FastAPI()

app.include_router(genes.router)
app.include_router(species.router)

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
    conservation_analysis_future = load_ConservationAnalysis()
    regulatory_sequences_future = load_RegulatorySequences()
    

    await regulatory_sequences_future
    # This table depends on RegulatorySequences so we we can run that now
    await load_RegulatroyElements()

    # Make sure all tasks have finished
    await conservation_analysis_future

    print("Finished loading tables")
    yield
    # Runs after application ends

app = FastAPI(lifespan=lifespan)