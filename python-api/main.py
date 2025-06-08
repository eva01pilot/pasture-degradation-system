# python-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from analysis import PastureMonitoringStub
from typing import Any, Dict, Literal, Optional,List

app = FastAPI()


class Geometry(BaseModel):
    type: Literal["Polygon"]
    coordinates: List[List[List[float]]]  # list of rings -> list of [lon, lat]

class PolygonRequest(BaseModel):
    geometry: Geometry

@app.get("/pyapi/hello")
def read_root():
    return {"message": "Hello from Python API you loser!"}

@app.post("/analyze")
async def analyze_pasture(data: PolygonRequest):
    stub = PastureMonitoringStub()
    
    try:
        result = stub.process(data.dict(exclude_none=True))
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
