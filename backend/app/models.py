from typing import List
from sqlalchemy import String, Integer, ForeignKey, BigInteger, CheckConstraint, CHAR, Text, DECIMAL
from sqlalchemy.orm import Mapped, DeclarativeBase, relationship, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs

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