from fastapi import FastAPI
from sqlalchemy import create_engine, Table, MetaData, select, insert
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


# Connect to PostgreSQL database
engine = create_engine("postgresql+psycopg2://postgres:postgres@db:5432/DB")
conn = engine.connect()

# Loads exisitng table metadata
metadata_obj = MetaData()
metadata_obj.create_all(engine)
# Gets table information from existing database
genes_table = Table("genes", metadata_obj, autoload_with=engine)

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

origins = [
    "http://localhost:5432",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy endpoint
@app.get("/")
async def root():
    stmt = select('*').select_from(genes_table)

    result = session.execute(stmt)

    output = ""
    for row in result:
        output += str(row) + "\n"

    return {output}


# This endpoint will return all elements in the table matching the given name
# example: 
#           given "Homo sapiens" this endpoint will return ('Homo sapiens', 'human', 'GRCh38'),
@app.get("/get_genes")
async def get_species(name: str):

    stmt = select(genes_table).where(genes_table.c.species == name)
    result = session.execute(stmt).all()
    users = [dict(row._mapping) for row in result]

    return users

# This endpoint will insert a given item into the genes table
@app.post("/insert_genes")
async def insert_species(gene_id_input: str, species_input: str, human_gene_name_input: str, chromosome_input: int, start_position_input: int, end_position_input: int):
    stmt = insert(genes_table).values(gene_id=gene_id_input, species=species_input, 
                                      human_gene_name=human_gene_name_input, chromosome=chromosome_input, 
                                      start_position=start_position_input, end_position=end_position_input)
    result = session.execute(stmt)
    return result