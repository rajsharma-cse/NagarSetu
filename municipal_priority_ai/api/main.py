from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from model.preprocess import prepare_training_frame
from utils.feature_engineering import compute_location_frequency

MODEL_PATH = Path(__file__).resolve().parents[1] / "model" / "priority_model.pkl"

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Municipal Complaint Priority API", version="1.0.0")


class PriorityRequest(BaseModel):
    description: str = Field(..., min_length=5)
    department: str
    has_evidence: bool = False
    location: str
    timestamp: Optional[str] = None
    location_frequency: Optional[int] = None


class PriorityResponse(BaseModel):
    priority_score: int
    priority_level: str


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("Model file not found. Train the model first.")
    bundle = joblib.load(MODEL_PATH)
    return bundle["model"], bundle["pipeline"]


def score_to_label(score: float) -> str:
    if score <= 25:
        return "LOW"
    if score <= 50:
        return "MEDIUM"
    if score <= 75:
        return "HIGH"
    return "CRITICAL"


@app.post("/predict-priority", response_model=PriorityResponse)
def predict_priority(payload: PriorityRequest):
    try:
        model, pipeline = load_model()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    df = pd.DataFrame(
        [
            {
                "description": payload.description,
                "department": payload.department,
                "has_evidence": int(payload.has_evidence),
                "location": payload.location,
                "timestamp": payload.timestamp or pd.Timestamp.utcnow().isoformat(),
                "priority_label": "MEDIUM",
            }
        ]
    )

    if payload.location_frequency is None:
        df["location_frequency"] = compute_location_frequency(df["location"])
    else:
        df["location_frequency"] = payload.location_frequency

    df = prepare_training_frame(df)
    features = pipeline.transform(df)
    probabilities = model.predict_proba(features)[0]
    max_prob = float(np.max(probabilities))
    priority_score = int(round(max_prob * 100))
    priority_level = score_to_label(priority_score)

    return PriorityResponse(priority_score=priority_score, priority_level=priority_level)


@app.get("/health")
def health_check():
    return {"status": "ok"}
