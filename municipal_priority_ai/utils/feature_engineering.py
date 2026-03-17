from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Iterable, List

SEVERITY_KEYWORDS = [
    "fire",
    "accident",
    "gas leak",
    "sewage overflow",
    "road collapse",
    "flood",
    "electric hazard",
    "electrocution",
    "short circuit",
    "collapse",
    "explosion",
    "water logging",
    "overflow",
]

DEPARTMENT_WEIGHTS = {
    "electricity": 0.9,
    "electric": 0.9,
    "power": 0.9,
    "water": 0.6,
    "sanitation": 0.6,
    "road": 0.6,
    "garbage": 0.3,
}


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def severity_flag(text: str) -> int:
    normalized = normalize_text(text)
    return int(any(keyword in normalized for keyword in SEVERITY_KEYWORDS))


def department_weight(dept: str) -> float:
    if not dept:
        return 0.5
    normalized = normalize_text(dept)
    for key, weight in DEPARTMENT_WEIGHTS.items():
        if key in normalized:
            return weight
    return 0.5


def time_sensitivity_hours(timestamp: datetime) -> float:
    if not timestamp:
        return 0.0
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    delta_hours = (now - timestamp).total_seconds() / 3600.0
    return max(delta_hours, 0.0)


def compute_location_frequency(locations: Iterable[str]) -> List[int]:
    counts = {}
    for loc in locations:
        key = normalize_text(loc)
        counts[key] = counts.get(key, 0) + 1
    return [counts.get(normalize_text(loc), 0) for loc in locations]
