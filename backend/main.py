from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel

modelPath = "../model/medicalCostModel2.pkl"
model = joblib.load(modelPath)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

class HealthData(BaseModel):
    age: int
    sex: str
    bmi: float
    children: int
    smoker: str
    region: str

def makeFeatures(data: HealthData):
    sex_map = {'male': 0, 'female': 1}
    smoker_map = {'no': 0, 'yes': 1}
    reigon_map = {'northeast': 0, 'northwest': 1, 'southeast': 2, 'southwest': 3}

    features = [
        data.age,
        sex_map[data.sex.lower()],
        data.bmi,
        data.children,
        smoker_map[data.smoker.lower()],
        reigon_map[data.region.lower()]
    ]

    return features


@app.post("/predict")
def predict(data: HealthData):
    input_features = [makeFeatures(data)]  # wrap in list → single-row input
    prediction = model.predict(input_features)[0]
    return {"predicted_charges": float(prediction)}