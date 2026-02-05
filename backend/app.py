# from fastapi import FastAPI
# from model import predict_priority

# app = FastAPI(title="Space Optimiser AI API")

# @app.post("/predict")
# def predict(data: dict):
#     return predict_priority(data)

# @app.get("/")
# def root():
#     return {"status": "AI service is running"}

from fastapi import FastAPI
from pydantic import BaseModel
from model import predict_priority

app = FastAPI()

class InputData(BaseModel):
    AQI: int
    PM2_5: int
    PM10: int
    BOD: int
    waste_tons_per_day: int
    green_cover_percent: int
    population_density: int

@app.get("/")
def root():
    return {"status": "AI service is running"}

@app.post("/predict")
def predict(data: InputData):
    result = predict_priority(data.dict())
    return result

