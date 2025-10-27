from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine



DATABASE_URL = "postgresql+psycopg://postgres:postgres@db:5432/DB"

async_engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async_session = async_sessionmaker(async_engine)

metadata = MetaData()
