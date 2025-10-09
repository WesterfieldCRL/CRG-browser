from fastapi import FastAPI, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Annotated, Dict
from sqlalchemy import create_engine, Table, MetaData, select, insert, update, delete
from sqlalchemy.orm import sessionmaker, Session as OrmSession
from fastapi.middleware.cors import CORSMiddleware

# Database connection URL for PostgreSQL
DATABASE_URL = "postgresql+psycopg2://postgres:postgres@db:5432/DB"

# Create SQLAlchemy engine and metadata object
engine = create_engine(DATABASE_URL, echo=False, future=True)
metadata = MetaData()

# Reflect existing tables from the database schema.
# It's recommended to reflect first to populate metadata properly.
metadata.reflect(bind=engine)

# Load tables explicitly from the metadata
genes_table = Table("genes", metadata, autoload_with=engine)
regulatory_elements_table = Table("regulatory_elements", metadata, autoload_with=engine)
snps_table = Table("snps", metadata, autoload_with=engine)

# Create a configured "Session" class
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

# Initialize FastAPI application
app = FastAPI()

# Set CORS origins allowed to communicate with backend
origins = [
    "http://localhost:5432",  # Assuming backend origin for development
    "http://localhost:3030"   # Frontend React or other app
]

# Add CORS middleware to handle cross-origin requests properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods like GET, POST, PUT, DELETE
    allow_headers=["*"],  # Allow all headers
)

# Pydantic models for request/response validation

class GeneModel(BaseModel):
    gene_id: str = Field(..., description="Unique gene identifier")
    species: str = Field(..., description="Species name")
    human_gene_name: str = Field(..., description="Human gene symbol")
    chromosome: int = Field(..., ge=1, le=30, description="Chromosome number (1-30)")
    start_position: int = Field(..., ge=0, description="Genomic start coordinate")
    end_position: int = Field(..., ge=0, description="Genomic end coordinate")
    aligned_sequence: Optional[str] = Field("ABC", description="Aligned DNA sequence placeholder")

class RegulatoryElementModel(BaseModel):
    element_id: Optional[int] = Field(None, description="Regulatory element ID (auto-generated)")
    species: str = Field(..., description="Species name")
    chromosome: int = Field(..., ge=1, le=30, description="Chromosome number (1-30)")
    start_position: int = Field(..., ge=0, description="Start coordinate")
    end_position: int = Field(..., ge=0, description="End coordinate")
    element_type: str = Field(..., description="Type of regulatory element")
    description: Optional[str] = Field(None, description="Optional regulatory element description")

class SNPModel(BaseModel):
    snp_id: str = Field(..., description="SNP identifier (e.g., rsID)")
    species: str = Field(..., description="Species name")
    chromosome: int = Field(..., ge=1, le=30, description="Chromosome number (1-30)")
    position: int = Field(..., ge=0, description="SNP genomic coordinate")
    reference_allele: str = Field(..., min_length=1, max_length=1, description="Reference nucleotide (A,C,G,T)")
    alternate_allele: str = Field(..., min_length=1, max_length=1, description="Alternate nucleotide (A,C,G,T)")
    consequence: Optional[str] = Field(None, description="Functional annotation")
    gene_id: Optional[str] = Field(None, description="Linked gene identifier")

# Dependency to provide a new session for each request and ensure proper close
def get_session() -> OrmSession:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

# --- Gene Endpoints ---

from fastapi import Depends

@app.get("/genes/", response_model=List[GeneModel])
def get_genes(species: Optional[str] = Query(None, description="Filter by species"), session: OrmSession = Depends(get_session)):
    """
    Get genes filtered by species if specified.
    """
    stmt = select(genes_table)
    if species:
        stmt = stmt.where(genes_table.c.species == species)
    results = session.execute(stmt).fetchall()
    return [dict(row._mapping) for row in results]

@app.get("/genes/{gene_id}", response_model=GeneModel)
def get_gene(gene_id: str, session: OrmSession = Depends(get_session)):
    """
    Get a single gene by gene_id.
    Raises 404 if not found.
    """
    stmt = select(genes_table).where(genes_table.c.gene_id == gene_id)
    result = session.execute(stmt).first()
    if not result:
        raise HTTPException(status_code=404, detail="Gene not found")
    return dict(result._mapping)

@app.post("/genes/", status_code=201)
def insert_gene(gene: GeneModel, session: OrmSession = Depends(get_session)):
    """
    Insert a new gene.
    Fail if gene_id already exists.
    """
    exists = session.execute(select(genes_table).where(genes_table.c.gene_id == gene.gene_id)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Gene ID already exists")
    stmt = insert(genes_table).values(**gene.dict())
    session.execute(stmt)
    session.commit()
    return {"status": "Gene inserted"}

@app.put("/genes/{gene_id}")
def update_gene(gene_id: str, gene: GeneModel, session: OrmSession = Depends(get_session)):
    """
    Update an existing gene by gene_id.
    """
    stmt = update(genes_table).where(genes_table.c.gene_id == gene_id).values(**gene.dict())
    result = session.execute(stmt)
    session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Gene not found")
    return {"status": "Gene updated"}

@app.delete("/genes/{gene_id}")
def delete_gene(gene_id: str, session: OrmSession = Depends(get_session)):
    """
    Delete a gene by gene_id.
    """
    stmt = delete(genes_table).where(genes_table.c.gene_id == gene_id)
    result = session.execute(stmt)
    session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Gene not found")
    return {"status": "Gene deleted"}

# --- Regulatory Elements Endpoints ---

@app.get("/regulatory_elements/", response_model=List[RegulatoryElementModel])
def get_reg_elements(species: Optional[str] = Query(None), element_type: Optional[str] = Query(None), session: OrmSession = Depends(get_session)):
    """
    Get regulatory elements optionally filtered by species and/or element_type.
    """
    stmt = select(regulatory_elements_table)
    if species:
        stmt = stmt.where(regulatory_elements_table.c.species == species)
    if element_type:
        stmt = stmt.where(regulatory_elements_table.c.element_type == element_type)
    results = session.execute(stmt).fetchall()
    return [dict(row._mapping) for row in results]

@app.post("/regulatory_elements/", status_code=201)
def insert_regulatory_element(element: RegulatoryElementModel, session: OrmSession = Depends(get_session)):
    """
    Insert a new regulatory element.
    element_id is auto-generated by the database, so it is omitted during insertion.
    """
    data = element.dict()
    data.pop("element_id", None)  # Remove element_id key if present
    stmt = insert(regulatory_elements_table).values(**data)
    session.execute(stmt)
    session.commit()
    return {"status": "Regulatory element inserted"}

@app.delete("/regulatory_elements/{element_id}")
def delete_regulatory_element(element_id: int, session: OrmSession = Depends(get_session)):
    """
    Delete regulatory element by ID.
    """
    stmt = delete(regulatory_elements_table).where(regulatory_elements_table.c.element_id == element_id)
    result = session.execute(stmt)
    session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Regulatory element not found")
    return {"status": "Regulatory element deleted"}

# --- SNP Endpoints ---

@app.get("/snps/", response_model=List[SNPModel])
def get_snps(species: Optional[str] = Query(None), gene_id: Optional[str] = Query(None), session: OrmSession = Depends(get_session)):
    """
    Get SNPs optionally filtered by species and/or gene_id.
    """
    stmt = select(snps_table)
    if species:
        stmt = stmt.where(snps_table.c.species == species)
    if gene_id:
        stmt = stmt.where(snps_table.c.gene_id == gene_id)
    results = session.execute(stmt).fetchall()
    return [dict(row._mapping) for row in results]

@app.get("/snps/{snp_id}", response_model=SNPModel)
def get_snp(snp_id: str, session: OrmSession = Depends(get_session)):
    """
    Get a SNP by its identifier.
    """
    stmt = select(snps_table).where(snps_table.c.snp_id == snp_id)
    result = session.execute(stmt).first()
    if not result:
        raise HTTPException(status_code=404, detail="SNP not found")
    return dict(result._mapping)

@app.post("/snps/", status_code=201)
def insert_snp(snp: SNPModel, session: OrmSession = Depends(get_session)):
    """
    Insert new SNP record.
    Fail if SNP ID already exists.
    """
    exists = session.execute(select(snps_table).where(snps_table.c.snp_id == snp.snp_id)).first()
    if exists:
        raise HTTPException(status_code=400, detail="SNP ID already exists")
    stmt = insert(snps_table).values(**snp.dict())
    session.execute(stmt)
    session.commit()
    return {"status": "SNP inserted"}

@app.delete("/snps/{snp_id}")
def delete_snp(snp_id: str, session: OrmSession = Depends(get_session)):
    """
    Delete SNP by its ID.
    """
    stmt = delete(snps_table).where(snps_table.c.snp_id == snp_id)
    result = session.execute(stmt)
    session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="SNP not found")
    return {"status": "SNP deleted"}




@app.get("/species/", response_model=List[str])
def get_species(session: OrmSession = Depends(get_session)):
    """
    Get a list of all unique species from the genes table.
    """
    stmt = select(genes_table.c.species).distinct()
    results = session.execute(stmt).fetchall()
    return [row.species for row in results]

@app.get("/gene_names/", response_model=List[str])
def get_gene_names(session: OrmSession = Depends(get_session)):
    """
    Get a list of all unique human gene names from the genes table.
    """
    stmt = select(genes_table.c.human_gene_name).distinct()
    results = session.execute(stmt).fetchall()
    return [row.human_gene_name for row in results]

# as of the current schema there is only one aligned sequence per gene, so this will return an array of one sequence
@app.get("/sequences/", response_model=List[str])
def get_sequences(gene_name: str, species_name: str, session: OrmSession = Depends(get_session)):
    """
    Get all aligned sequences for a given human gene name and species.
    """
    stmt = select(genes_table.c.aligned_sequence).where(
        (genes_table.c.human_gene_name == gene_name) &
        (genes_table.c.species == species_name)
    )
    results = session.execute(stmt).fetchall()
    return [row.aligned_sequence for row in results if row.aligned_sequence is not None]


def compare_sequences(sequences: List[str]) -> List[bool]:
    # Compare sequences character by character and return a list indicating if all characters at each position are identical
    if not sequences:
        return []
    
    length = len(sequences[0])
    comparison = []
    
    for i in range(length):
        chars_at_pos_i = [seq[i] for seq in sequences]
        all_same = len(set(chars_at_pos_i)) == 1
        comparison.append(all_same)
    
    return comparison

class ColorSegment(BaseModel):
    color: str = Field(..., description="Hex color code representing similarity")
    width: float = Field(..., ge=0, le=100, description="Width percentage (0-100)")

class CondensedSequences(BaseModel):
    sequences: Dict[str, List[ColorSegment]] = Field(..., description="Dictionary mapping species to their condensed sequences")
    start: int = Field(..., description="Start position of the sequence range")
    end: int = Field(..., description="End position of the sequence range")

THRESHOLD = 0.009  # Threshold for merging segments

def populate_color_map(sequence_map):
    comparison = compare_sequences(list(sequence_map.values()))

    # Condense the sequences based on similarity
    color_map = {}
    for species_name, sequence in sequence_map.items():
        color_map[species_name] = []  # Initialize an empty list that will hold ColorSegment objects

        # populate color map
        for i in range(len(sequence)):

            # check if all characters at this position are identical
            color = "#ffdad9"  # Default color for different characters
            
            if sequence[i] == '-':
                color = "#7a7a7a"  # Color for gaps
            else:
                if comparison[i]:
                    color = "#d9ebff"  # Color for identical characters

            # apply color #d9ebff if the same, #ffdad9 if different, #7A7A7A if gap
            if i > 0:
                if color_map[species_name][-1].color == color:
                    color_map[species_name][-1].width += 1
                else:
                    color_map[species_name].append(ColorSegment(color=color, width=1))
            else:
                color_map[species_name].append(ColorSegment(color=color, width=1))


        # Convert widths to percentages
        total_width = len(sequence)
        for segment in color_map[species_name]:
            segment.width = (segment.width / total_width) * 100

        # normalization (for each percantage calculate the sum and divide each by the sum)

        # Merge segments that are below the threshold
        length = len(color_map[species_name])
        i = 0
        while i < length:
            
            if color_map[species_name][i].width < THRESHOLD:
                if i > 0:
                    color_map[species_name][i - 1].width += color_map[species_name][i].width
                    del color_map[species_name][i]
                    i -= 1
                    length -= 1
                else:
                    color_map[species_name][i + 1].width += color_map[species_name][i].width
                    del color_map[species_name][i]
                    i -= 1
                    length -= 1

            i += 1
                

    return color_map

### Gets the sequences for all species based on gene name and condenses them into an array based on the similarity between sequences
@app.get("/condensed_sequences/", response_model=CondensedSequences)
def get_condensed_sequences(gene_name: str, session: OrmSession = Depends(get_session)):
    # Get the sequences from the database based on the gene name and put in array
    species = get_species(session)
    
    # Create a dictionary to store species -> sequence mapping
    sequence_map = {}
    
    # For each species, get its sequence for the given gene
    for species_name in species:
        sequence_map[species_name] = get_sequences(gene_name, species_name, session)[0]
    
    
    color_map = populate_color_map(sequence_map)



    # Wrap the color_map in the expected response format
    return {"sequences": color_map, "start": 0, "end": len(sequence_map[species[0]])}
    
### Same as condensed_sequences but only for a specific range of the sequence
@app.get("/condensed_sequences_range", response_model=CondensedSequences)
def get_condensed_sequences_range(gene_name: str, start: int, end: int, session: OrmSession = Depends(get_session)):
    
    species = get_species(session)

    sequence_map = {}

    for species_name in species:
        full_sequence = get_sequences(gene_name, species_name, session)[0]
        sequence_map[species_name] = full_sequence[start:end]

    color_map = populate_color_map(sequence_map)

    # Wrap the color_map in the expected response format
    return {"sequences": color_map, "start": start, "end": end}