from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from utils.feature_engineering import SEVERITY_KEYWORDS


DEPARTMENTS = [
    "Electricity",
    "Water Supply",
    "Sanitation",
    "Roads",
    "Garbage",
    "Parks",
    "Street Lighting",
]

LOCATIONS = [f"Ward {i}" for i in range(1, 21)]

BASE_TEMPLATES = [
    "Street lights not working in {location}",
    "Overflowing garbage bins near {location}",
    "Water leakage reported in {location}",
    "Potholes causing traffic issues in {location}",
    "Sewage overflow near {location}",
    "Trees fallen due to storm in {location}",
]

SEVERITY_TEMPLATES = [
    "Major {keyword} reported near {location}",
    "{keyword} situation affecting residents in {location}",
    "Emergency: {keyword} at {location}",
]


def assign_priority_label(description: str, department: str, has_evidence: bool) -> str:
    desc_lower = description.lower()
    severe = any(keyword in desc_lower for keyword in SEVERITY_KEYWORDS)
    if severe:
        return "CRITICAL"
    if "Electric" in department or "Electricity" in department:
        return "HIGH"
    if has_evidence and department in ("Sanitation", "Roads", "Water Supply"):
        return "HIGH"
    if department in ("Sanitation", "Roads", "Water Supply"):
        return "MEDIUM"
    return "LOW"


def generate_dataset(size: int = 5000) -> pd.DataFrame:
    rows = []
    now = datetime.now(timezone.utc)

    for idx in range(size):
        department = random.choice(DEPARTMENTS)
        location = random.choice(LOCATIONS)
        has_evidence = random.random() < 0.45

        if random.random() < 0.2:
            keyword = random.choice(SEVERITY_KEYWORDS)
            description = random.choice(SEVERITY_TEMPLATES).format(
                keyword=keyword, location=location
            )
        else:
            description = random.choice(BASE_TEMPLATES).format(location=location)

        timestamp = now - timedelta(hours=random.randint(0, 120))
        priority_label = assign_priority_label(description, department, has_evidence)

        rows.append(
            {
                "complaint_id": f"CMP-{100000 + idx}",
                "description": description,
                "department": department,
                "has_evidence": int(has_evidence),
                "location": location,
                "timestamp": timestamp.isoformat(),
                "priority_label": priority_label,
            }
        )

    df = pd.DataFrame(rows)
    return df


if __name__ == "__main__":
    output_path = Path(__file__).resolve().parents[1] / "data" / "complaints_dataset.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataset = generate_dataset(5000)
    dataset.to_csv(output_path, index=False)
    print(f"Generated dataset at {output_path}")
