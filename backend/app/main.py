from fastapi import FastAPI
from sqlalchemy import create_engine, Table, MetaData, select
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager


# Connect to PostgreSQL database
engine = create_engine("postgresql+psycopg2://postgres:postgres@db:5432/DB")
conn = engine.connect()

# Loads exisitng table metadata
metadata_obj = MetaData()
metadata_obj.create_all(engine)
# Gets table information from existing database
some_table = Table("genes", metadata_obj, autoload_with=engine)

Session = sessionmaker(engine)
session = Session()

# Runs on startup and must finish before accepting requests
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")

    # Runs on shutdown
    yield
    print("Shutting down...")
    session.close()
    conn.close()


app = FastAPI(lifespan=lifespan)

# Dummy endpoint
@app.get("/")
async def root():
    stmt = select('*').select_from(species_table)

    result = session.execute(stmt)

    output = ""
    for row in result:
        output += str(row) + "\n"

    return {output}


# This endpoint will return all elements in the table matching the given name
# example: 
#           given "Homo sapiens" this endpoint will return ('Homo sapiens', 'human', 'GRCh38'),
@app.get("/get/species")
async def get_species(name: str):

    stmt = select(species_table).where(species_table.c.scientific_name == name)
    result = session.execute(stmt).all()
    users = [dict(row._mapping) for row in result]

    return users