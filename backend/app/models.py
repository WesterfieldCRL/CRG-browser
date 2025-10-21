from typing import List
from sqlalchemy import String, Integer, ForeignKey, BigInteger, CheckConstraint, CHAR, Text, DECIMAL
from sqlalchemy.orm import Mapped, DeclarativeBase, relationship, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession
from sqlalchemy import select, insert
from dependencies import get_session
from fastapi import Depends
from csv import DictReader
from routers import species, genes, regulatory_sequences

class Base(AsyncAttrs, DeclarativeBase):
     pass


class Genes(Base):
    __tablename__ = "Genes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

    # Relationships
    regulatory_sequences_fk: Mapped[List["RegulatorySequences"]] = relationship(back_populates="gene_fk")
    conservation_analysis_fk: Mapped[List["ConservationAnalysis"]] = relationship(back_populates="gene_fk")

class Species(Base):
    __tablename__ = "Species"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    assembly: Mapped[str] = mapped_column(String, unique=True)

    # Relationships
    regulatory_sequences_fk: Mapped[List["RegulatorySequences"]] = relationship(back_populates="species_fk")
    conservation_analysis_fk: Mapped[List["ConservationAnalysis"]] = relationship(back_populates="species_fk")

class RegulatorySequences(Base):
    __tablename__ = "RegulatorySequences"
    __table_args__ = (
        CheckConstraint("start >= 0", name="check_start_nonnegative"),
        CheckConstraint("end >= start", name="check_end_after_start"),
    )


    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    gene_id = mapped_column(ForeignKey("Genes.id"))
    species_id = mapped_column(ForeignKey("Species.id"))
    start: Mapped[int] = mapped_column(BigInteger)
    end: Mapped[int] = mapped_column(BigInteger)
    sequence: Mapped[str] = mapped_column(Text)

    # Relationships
    gene_fk: Mapped[Genes] = relationship(back_populates="regulatory_sequences_fk")
    species_fk: Mapped[Species] = relationship(back_populates="regulatory_sequences_fk")
    regulatoryElements_fk: Mapped[List["RegulatoryElements"]] = relationship(back_populates="regulatorySequences_fk")

class RegulatoryElements(Base):
    __tablename__ = "RegulatoryElements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chromosome: Mapped[int]
    strand: Mapped[str] = mapped_column(CHAR)
    geneType: Mapped[str] = mapped_column(String(4))
    start: Mapped[int]
    end: Mapped[int]
    regulatory_sequence_id = mapped_column(ForeignKey("RegulatorySequences.id"))

    __table_args__ = (
        CheckConstraint("typeStart >= 0", name="check_typeStart_nonnegative"),
        CheckConstraint("typeEnd >= typeStart", name="check_typeEnd_ge_typeStart"),
    )

    # Relationships
    regulatorySequences_fk: Mapped[RegulatorySequences] = relationship(back_populates="regulatoryElements_fk")

class ConservationAnalysis(Base):
    __tablename__ = "ConservationAnalysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    gene_id = mapped_column(ForeignKey("Genes.id"))
    species_id = mapped_column(ForeignKey("Species.id"))
    phylop_score: Mapped[float] = mapped_column(DECIMAL)
    phastcon_score: Mapped[float] = mapped_column(DECIMAL)
    nucleotide: Mapped[str] = mapped_column(CHAR)

    # Relationships
    gene_fk: Mapped[Genes] = relationship(back_populates="conservation_analysis_fk")
    species_fk: Mapped[Species] = relationship(back_populates="conservation_analysis_fk")



# Functions for loading the data from files into the database

async def load_Genes(session: AsyncSession = Depends(get_session)) -> None:
    print("loading genes table")

    with open("app/data/Genes.csv", "r") as file:

        reader = DictReader(file)
        rows = [dict(row) for row in reader]
        
        stmt = insert(Genes).values(rows)

        await session.execute(stmt)
        await session.commit()

async def load_Species(session: AsyncSession = Depends(get_session)) -> None:
    print("loading species table")

    with open("app/data/Species.csv", "r") as file:

        
        reader = DictReader(file)
        rows = [dict(row) for row in reader]
        
        stmt = insert(Species).values(rows)

        await session.execute(stmt)
        await session.commit()

async def load_RegulatorySequences(session: AsyncSession = Depends(get_session)) -> None:
    print("loading regulatory sequences table")

    with open("app/data/RegulatorySequences.csv", "r") as file:

        
        reader = DictReader(file)
        
        # Since this table depends on Genes and Species we need to get the correct id's for the given values

        for row in reader:
            gene_id = genes.get_id(row.pop("fk_gene"))
            row["gene_id"] = id

            species_id = species.get_id(row.pop("fk_species"))
            row["species_id"] = id


            # convert the strings to integers
            row["start"] = int(row["start"])

            row["end"] = int(row["end"])

        rows = [dict(row) for row in reader]
        stmt = insert(Species).values(rows)

        await session.execute(stmt)
        await session.commit()

async def load_RegulatroyElements(session: AsyncSession = Depends(get_session)) -> None:
    print("loading regulatory elements table")

    with open("app/data/RegualtoryElements.csv", "r") as file:

        reader = DictReader(file)
        
        # Since this table depends on Genes and Species we need to get the correct id's for the given values

        for row in reader:
            # convert the strings to integers
            row["chromosome"] = int(row["chromosome"])
            row["start"] = int(row["start"])
            row["end"] = int(row["end"])

            # Get the gene and species names, remove those items in the dict and add the id to the sequence we belong to
            row["regulatory_sequence_id"] = regulatory_sequences.get_id(row.pop("gene_name"), row.pop("species_name"))
            


        rows = [dict(row) for row in reader]
        stmt = insert(RegulatoryElements).values(rows)

        await session.execute(stmt)
        await session.commit()

async def load_ConservationAnalysis() -> None:
    print("loading conservation analysis table")

    with open("app/data/ConservationAnalysis.csv", "r") as file:
        