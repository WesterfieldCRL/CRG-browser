from fastapi import FastAPI, HTTPException, Query, Body, Depends
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy import create_engine, MetaData, select, insert, update, delete
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import csv

# Importing all of the sqlalchemy classes
from models import *

DATABASE_URL = "postgresql+psycopg2://postgres:postgres@db:5432/DB"

engine = create_engine(DATABASE_URL, echo=False, future=True)

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

def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs before application starts

    yield
    # Runs after application ends

