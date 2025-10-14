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
    
    # load regulatory elements data
    with open('Enh_Prom_Location_Data.csv', newline='') as csvfile:
        reg_data = csv.reader(csvfile)
        print("Inserting reg element data from csv")
        for row in reg_data:
            stmt = insert(regulatory_elements_table).values(
                gene=row[0],
                species=row[1],
                chromosome=row[2],
                strand=row[3],
                gene_type=row[4],
                type_start_index=row[5],
                type_end_index=row[6]
            )
            conn.execute(stmt)
        conn.commit()

    yield
    # Runs after application ends

