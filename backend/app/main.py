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
some_table = Table("species", metadata_obj, autoload_with=engine)

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
    stmt = select('*').select_from(some_table)

    result = session.execute(stmt)

    output = ""
    for row in result:
        output += str(row) + "\n"

    return {output}