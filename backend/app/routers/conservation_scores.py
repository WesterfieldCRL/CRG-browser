from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import ConservationNucleotides, ConservationScores, Genes, Species
from app.dependencies import async_session
from pydantic import BaseModel, Field
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
import io

router = APIRouter(prefix="/conservation_scores")

class HistogramData(BaseModel):
    nucleotide: str = Field(..., description="The single letter nucleotide")
    phastcon_score: float = Field(..., description="The phastcon_score for this position")
    phylop_score: float = Field(..., description="The phylop_score for this position")

# This gets the scores in a sorted list for creating a histogram for a given species
@router.get("/histogram_data", response_model=List[HistogramData])
async def get_histogram_data(species_name: str, gene_name: str) -> List[HistogramData]:

    async with async_session() as session:
        stmt = select(ConservationScores.phastcon_score, ConservationScores.phylop_score, ConservationNucleotides.nucleotide).join(Genes).join(Species).where(Genes.name == gene_name).where(Species.name == species_name).order_by(ConservationScores.position)

        result = (await session.execute(stmt)).tuples().all()

        if result is None:
            raise HTTPException(status_code=404, detail="Unable to find scores for given gene and species")

        data: list[HistogramData] = []

        for row in result:
            data.append(HistogramData(nucleotide=row[2], phastcon_score=row[0], phylop_score=row[1]))


        return data

@router.get("/plot/phastcons/{gene_name}")
async def get_phastcons_plot(gene_name: str):
    """Generate PhastCons conservation plot for a given gene"""
    async with async_session() as session:
        stmt = select(ConservationScores.phastcon_score, ConservationScores.position).join(Genes).where(Genes.name == gene_name).order_by(ConservationScores.position)

        result = (await session.execute(stmt)).tuples().all()

        if not result:
            raise HTTPException(status_code=404, detail=f"No conservation data found for gene {gene_name}")

        # Extract data
        scores = [row[0] for row in result]
        positions = list(range(1, len(scores) + 1))

        # Create plot
        plt.figure(figsize=(12, 4))
        plt.plot(positions, scores, linewidth=0.8, color='#2196f3')
        plt.fill_between(positions, scores, alpha=0.3, color='#2196f3')
        plt.xlabel('Position (bp)', fontsize=10)
        plt.ylabel('PhastCons Score', fontsize=10)
        plt.title(f'PhastCons Conservation Scores - {gene_name}', fontsize=12, fontweight='bold')
        plt.grid(True, alpha=0.3, linestyle='--')
        plt.ylim(0, 1)
        plt.tight_layout()

        # Save to bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return StreamingResponse(buf, media_type="image/png")

@router.get("/plot/phylop/{gene_name}")
async def get_phylop_plot(gene_name: str):
    """Generate PhyloP conservation plot for a given gene"""
    async with async_session() as session:
        stmt = select(ConservationScores.phylop_score, ConservationScores.position).join(Genes).where(Genes.name == gene_name).order_by(ConservationScores.position)

        result = (await session.execute(stmt)).tuples().all()

        if not result:
            raise HTTPException(status_code=404, detail=f"No conservation data found for gene {gene_name}")

        # Extract data
        scores = [row[0] for row in result]
        positions = list(range(1, len(scores) + 1))

        # Create plot
        plt.figure(figsize=(12, 4))
        plt.plot(positions, scores, linewidth=0.8, color='#ff9800')
        plt.fill_between(positions, scores, alpha=0.3, color='#ff9800')
        plt.xlabel('Position (bp)', fontsize=10)
        plt.ylabel('PhyloP Score', fontsize=10)
        plt.title(f'PhyloP Conservation Scores - {gene_name}', fontsize=12, fontweight='bold')
        plt.grid(True, alpha=0.3, linestyle='--')
        plt.tight_layout()

        # Save to bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return StreamingResponse(buf, media_type="image/png")

@router.get("/histogram/phastcons/{gene_name}")
async def get_phastcons_histogram(gene_name: str):
    """Generate PhastCons conservation histogram with nucleotide-colored bars"""
    async with async_session() as session:
        # Get conservation scores with nucleotides for hg38 (human)
        stmt = (
            select(
                ConservationScores.phastcon_score,
                ConservationScores.position,
                ConservationNucleotides.nucleotide,
                Species.name
            )
            .join(Genes)
            .join(ConservationNucleotides, ConservationScores.id == ConservationNucleotides.conservation_id)
            .join(Species, ConservationNucleotides.species_id == Species.id)
            .where(Genes.name == gene_name)
            .where(Species.name == 'Homo sapiens')
            .order_by(ConservationScores.position)
        )

        result = (await session.execute(stmt)).all()

        if not result:
            raise HTTPException(status_code=404, detail=f"No conservation data found for gene {gene_name}")

        # Extract data
        scores = [float(row[0]) for row in result]
        nucleotides = [row[2] for row in result]

        # Create histogram
        fig, ax = plt.subplots(figsize=(14, 6))

        # Define colors for nucleotides (matching genome browser colors)
        nuc_colors = {
            'A': '#4caf50',  # Green
            'T': '#f44336',  # Red
            'G': '#ff9800',  # Orange
            'C': '#2196f3',  # Blue
            'N': '#9e9e9e',  # Gray
            '-': '#9e9e9e'   # Gray for gaps
        }
        colors = [nuc_colors.get(nuc, '#9e9e9e') for nuc in nucleotides]

        # Create bar chart
        x_pos = list(range(len(scores)))
        bars = ax.bar(x_pos, scores, color=colors, width=1.0, edgecolor='none')

        ax.set_xlabel('Position (bp)', fontsize=11, fontweight='bold')
        ax.set_ylabel('PhastCons Score', fontsize=11, fontweight='bold')
        ax.set_title(f'PhastCons Conservation Histogram - {gene_name} (hg38)', fontsize=13, fontweight='bold')
        ax.set_ylim(0, 1)
        ax.grid(True, alpha=0.3, linestyle='--', axis='y')

        # Add legend for nucleotides
        legend_elements = [
            Patch(facecolor='#4caf50', label='A'),
            Patch(facecolor='#f44336', label='T'),
            Patch(facecolor='#ff9800', label='G'),
            Patch(facecolor='#2196f3', label='C')
        ]
        ax.legend(handles=legend_elements, loc='upper right', title='Nucleotides (hg38)', framealpha=0.9)

        plt.tight_layout()

        # Save to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return StreamingResponse(buf, media_type="image/png")

@router.get("/histogram/phylop/{gene_name}")
async def get_phylop_histogram(gene_name: str):
    """Generate PhyloP conservation histogram with nucleotide-colored bars"""
    async with async_session() as session:
        # Get conservation scores with nucleotides for hg38 (human)
        stmt = (
            select(
                ConservationScores.phylop_score,
                ConservationScores.position,
                ConservationNucleotides.nucleotide,
                Species.name
            )
            .join(Genes)
            .join(ConservationNucleotides, ConservationScores.id == ConservationNucleotides.conservation_id)
            .join(Species, ConservationNucleotides.species_id == Species.id)
            .where(Genes.name == gene_name)
            .where(Species.name == 'Homo sapiens')
            .order_by(ConservationScores.position)
        )

        result = (await session.execute(stmt)).all()

        if not result:
            raise HTTPException(status_code=404, detail=f"No conservation data found for gene {gene_name}")

        # Extract data
        scores = [float(row[0]) for row in result]
        nucleotides = [row[2] for row in result]

        # Create histogram
        fig, ax = plt.subplots(figsize=(14, 6))

        # Define colors for nucleotides (matching genome browser colors)
        nuc_colors = {
            'A': '#4caf50',  # Green
            'T': '#f44336',  # Red
            'G': '#ff9800',  # Orange
            'C': '#2196f3',  # Blue
            'N': '#9e9e9e',  # Gray
            '-': '#9e9e9e'   # Gray for gaps
        }
        colors = [nuc_colors.get(nuc, '#9e9e9e') for nuc in nucleotides]

        # Create bar chart
        x_pos = list(range(len(scores)))
        bars = ax.bar(x_pos, scores, color=colors, width=1.0, edgecolor='none')

        ax.set_xlabel('Position (bp)', fontsize=11, fontweight='bold')
        ax.set_ylabel('PhyloP Score', fontsize=11, fontweight='bold')
        ax.set_title(f'PhyloP Conservation Histogram - {gene_name} (hg38)', fontsize=13, fontweight='bold')
        ax.grid(True, alpha=0.3, linestyle='--', axis='y')

        # Add legend for nucleotides
        legend_elements = [
            Patch(facecolor='#4caf50', label='A'),
            Patch(facecolor='#f44336', label='T'),
            Patch(facecolor='#ff9800', label='G'),
            Patch(facecolor='#2196f3', label='C')
        ]
        ax.legend(handles=legend_elements, loc='upper right', title='Nucleotides (hg38)', framealpha=0.9)

        plt.tight_layout()

        # Save to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        plt.close()

        return StreamingResponse(buf, media_type="image/png")
