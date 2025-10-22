from fastapi import FastAPI, Depends
from sqlalchemy import insert, select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from csv import DictReader
import asyncio

# Importing all of the sqlalchemy classes
from app.models import *
from app.routers import genes, species, regulatory_sequences
from app.dependencies import async_session


async def load_Genes() -> None:
    async with async_session() as session:
        print("loading genes table")

        with open("app/data/Genes.csv", "r") as file:

            reader = DictReader(file)
            rows = [dict(row) for row in reader]
            
            stmt = insert(Genes).values(rows)

            await session.execute(stmt)
            await session.commit()

async def load_Species() -> None:
    async with async_session() as session:
        print("loading species table")

        with open("app/data/Species.csv", "r") as file:

            
            reader = DictReader(file)
            rows = [dict(row) for row in reader]
            
            stmt = insert(Species).values(rows)

            await session.execute(stmt)
            await session.commit()

# TODO: handle loading more asyncronously
async def load_RegulatorySequences() -> None:
    async with async_session() as session:
        print("loading regulatory sequences table")

        with open("app/data/RegulatorySequences.csv", "r") as file:

            
            reader = DictReader(file)
            
            # Since this table depends on Genes and Species we need to get the correct id's for the given values

            for row in reader:

                stmt = select(Genes).where(Genes.name == row["fk_gene"])
                local_gene = (await session.execute(stmt)).scalar()

                if local_gene is None:
                    raise ValueError("Unable to get gene")
                
                stmt = select(Species).where(Species.name == row["fk_species"])
                local_species = (await session.execute(stmt)).scalar()

                if local_species is None:
                    raise ValueError("Unable to get species")

                regulatory_sequences_object = RegulatorySequences(
                    gene_id = local_gene.id,
                    species_id = local_species.id,
                    start = int(row["start"]),
                    end = int(row["end"]),
                    sequence = row["sequence"])
                session.add(regulatory_sequences_object)

            await session.commit()


async def load_RegulatoryElements() -> None:
    async with async_session() as session:
        print("loading regulatory elements table")

        with open("app/data/RegulatoryElements.csv", "r") as file:

            
            reader = DictReader(file)        

            for row in reader:
                stmt = select(RegulatorySequences).join(Genes).join(Species).where(Genes.name == row["gene_name"]).where(Species.name == row["species_name"])

                reg_seq = (await session.execute(stmt)).scalar()

                if reg_seq is None:
                    raise ValueError("Unable to find regulatory sequence")

                regulatory_elements_object = RegulatoryElements(
                    chromosome = int(row["chromosome"]),
                    strand = row["strand"],
                    element_type = row["element_type"],
                    start = int(row["start"]),
                    end = int(row["end"]),
                    regulatory_sequence_id = reg_seq.id)
                
                session.add(regulatory_elements_object)
        await session.commit()

async def load_ConservationAnalysis() -> None:
    async with async_session() as session:
        print("loading conservation analysis and sequences tables")

        results = await asyncio.gather(
            species.get_id("Homo sapiens"),
            species.get_id("Mus musculus"),
            species.get_id("Macaca mulatta"))

        species_list = [[results[0], "hg38"],
                        [results[1], "mm10"],
                        [results[2], "rheMac3"]]

        genes_list = ["DRD4", "ALDH1A3", "CHRNA6"]

        # For each gene
        for gene_name in genes_list:
            with open(f"app/data/ConservationAnalysis{gene_name}.csv", "r") as file:
                reader = DictReader(file)
                gene_id = await genes.get_id(gene_name)
                for row in reader:

                    # add an item to the conservation anaysis table and get its id for use in the conservation sequences table
                    conservation_analysis_object = ConservationAnalysis(gene_id = gene_id, phylop_score = float(row["phylop_score"]), phastcon_score = float(row["phastcon_score"]), header = row["header"])
                    
                    session.add(conservation_analysis_object)
                    await session.flush()

                    # add all 3 nucleotides to the conservaiton sequences table
                    for i in range(3):
                        conservation_sequences_object = ConservationSequences(species_id = species_list[i][0], conservation_id = conservation_analysis_object.id, nucleotide = row[species_list[i][1]])
                        session.add(conservation_sequences_object)

        await session.commit()

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
    await load_RegulatoryElements()
    # Make sure all tasks have finished
    await conservation_analysis_future

    print("Finished loading tables")
    yield
    # Runs after application ends


app = FastAPI(lifespan=lifespan)

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

app.include_router(genes.router)
app.include_router(species.router)
app.include_router(regulatory_sequences.router)