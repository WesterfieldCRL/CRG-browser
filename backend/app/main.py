from fastapi import FastAPI
from sqlalchemy import create_engine, text


engine = create_engine("postgresql+psycopg2://postgres:postgres@db:5432/DB")
conn = engine.connect()


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}