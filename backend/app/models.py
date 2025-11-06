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
    conservation_analysis_fk: Mapped[List["ConservationScores"]] = relationship(back_populates="gene_fk")

class Species(Base):
    __tablename__ = "Species"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    assembly: Mapped[str] = mapped_column(String, unique=True)

    # Relationships
    regulatory_sequences_fk: Mapped[List["RegulatorySequences"]] = relationship(back_populates="species_fk")
    conservation_sequences_fk: Mapped[List["ConservationNucleotides"]] = relationship(back_populates="species_fk")

class RegulatorySequences(Base):
    __tablename__ = "RegulatorySequences"
    __table_args__ = (
        CheckConstraint("start >= 0", name="check_start_nonnegative"),
        CheckConstraint("end >= start", name="check_end_after_start"),
    )


    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    gene_id = mapped_column(ForeignKey("Genes.id"))
    species_id = mapped_column(ForeignKey("Species.id"))
    gene_start: Mapped[int] = mapped_column(BigInteger)
    gene_end: Mapped[int] = mapped_column(BigInteger)
    sequence: Mapped[str] = mapped_column(Text)
    total_start: Mapped[int] = mapped_column(BigInteger)
    total_end: Mapped[int] = mapped_column(BigInteger)
    allignment_num: Mapped[int] = mapped_column(BigInteger)


    # Relationships
    gene_fk: Mapped[Genes] = relationship(back_populates="regulatory_sequences_fk")
    species_fk: Mapped[Species] = relationship(back_populates="regulatory_sequences_fk")
    enhancersPromoters_fk: Mapped[List["EnhancersPromoters"]] = relationship(back_populates="regulatorySequences_fk")
    transcriptionFactorBindingSites_fk: Mapped[List["TranscriptionFactorBindingSites"]] = relationship(back_populates="regulatorySequences_fk")
    variants_fk: Mapped[List["Variants"]] = relationship(back_populates="regulatorySequences_fk")

class EnhancersPromoters(Base):
    __tablename__ = "EnhancersPromoters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chromosome: Mapped[int]
    category: Mapped[str] = mapped_column(String(4))
    start: Mapped[int] = mapped_column(BigInteger)
    end: Mapped[int] = mapped_column(BigInteger)
    regulatory_sequence_id = mapped_column(ForeignKey("RegulatorySequences.id"))

    __table_args__ = (
        CheckConstraint("typeStart >= 0", name="check_typeStart_nonnegative"),
        CheckConstraint("typeEnd >= typeStart", name="check_typeEnd_ge_typeStart"),
    )

    # Relationships
    regulatorySequences_fk: Mapped[RegulatorySequences] = relationship(back_populates="enhancersPromoters_fk")

class TranscriptionFactorBindingSites(Base):
    __tablename__ = "TranscriptionFactorBindingSites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chromosome: Mapped[int]
    category: Mapped[str] = mapped_column(String(4))
    start: Mapped[int] = mapped_column(BigInteger)
    end: Mapped[int] = mapped_column(BigInteger)
    regulatory_sequence_id = mapped_column(ForeignKey("RegulatorySequences.id"))

    __table_args__ = (
        CheckConstraint("typeStart >= 0", name="check_typeStart_nonnegative"),
        CheckConstraint("typeEnd >= typeStart", name="check_typeEnd_ge_typeStart"),
    )

    # Relationships
    regulatorySequences_fk: Mapped[RegulatorySequences] = relationship(back_populates="transcriptionFactorBindingSites_fk")

class Variants(Base):
    __tablename__ = "Variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chromosome: Mapped[int]
    category: Mapped[str] = mapped_column(String(4))
    start: Mapped[int] = mapped_column(BigInteger)
    end: Mapped[int] = mapped_column(BigInteger)
    regulatory_sequence_id = mapped_column(ForeignKey("RegulatorySequences.id"))

    __table_args__ = (
        CheckConstraint("typeStart >= 0", name="check_typeStart_nonnegative"),
        CheckConstraint("typeEnd >= typeStart", name="check_typeEnd_ge_typeStart"),
    )

    # Relationships
    regulatorySequences_fk: Mapped[RegulatorySequences] = relationship(back_populates="variants_fk")

class ConservationScores(Base):
    __tablename__ = "ConservationScores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    gene_id = mapped_column(ForeignKey("Genes.id"))
    phylop_score: Mapped[float] = mapped_column(DECIMAL)
    phastcon_score: Mapped[float] = mapped_column(DECIMAL)
    position: Mapped[str] = mapped_column(String(255))

    # Relationships
    gene_fk: Mapped[Genes] = relationship(back_populates="conservation_analysis_fk")
    conservation_sequences_fk: Mapped[List["ConservationNucleotides"]] = relationship(back_populates="conservation_analysis_fk")
    

class ConservationNucleotides(Base):
    __tablename__ = "ConservationNucleotides"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    species_id = mapped_column(ForeignKey("Species.id"))
    conservation_id = mapped_column(ForeignKey("ConservationScores.id"))
    nucleotide: Mapped[str] = mapped_column(CHAR)

    # Relationships
    species_fk: Mapped[Species] = relationship(back_populates="conservation_sequences_fk")
    conservation_analysis_fk: Mapped[ConservationScores] = relationship(back_populates="conservation_sequences_fk")
            



            
