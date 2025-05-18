# python-api/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/pyapi/hello")
def read_root():
    return {"message": "Hello from Python API you loser!"}
