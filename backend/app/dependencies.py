from fastapi import FastAPI, HTTPException, Query, Body, Depends
from pydantic import BaseModel, Field
from typing import List, AsyncGenerator
from sqlalchemy import create_engine, MetaData, select, insert, update, delete
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from csv import DictReader
import asyncio



DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/DB"

async_engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = async_sessionmaker(async_engine)

metadata = MetaData()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session