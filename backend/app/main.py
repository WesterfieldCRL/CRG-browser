from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
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
