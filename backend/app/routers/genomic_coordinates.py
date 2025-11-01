from typing import Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from app.models import RegulatorySequences, Species, Genes, RegulatoryElements
from app.dependencies import async_session
from app.routers import species
from fastapi import APIRouter


router = APIRouter(prefix="/elements")

