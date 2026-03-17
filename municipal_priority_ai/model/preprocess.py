from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder

from utils.feature_engineering import department_weight, severity_flag, time_sensitivity_hours


@dataclass
class PreprocessArtifacts:
    pipeline: Pipeline


def _add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["severity_flag"] = df["description"].apply(severity_flag)
    df["department_weight"] = df["department"].apply(department_weight)
    df["time_sensitivity_hours"] = df["timestamp"].apply(time_sensitivity_hours)
    df["has_evidence"] = df["has_evidence"].astype(int)
    df["location_frequency"] = df["location_frequency"].fillna(1).astype(int)
    return df


def build_preprocess_pipeline() -> PreprocessArtifacts:
    feature_cols = [
        "description",
        "department",
        "has_evidence",
        "location_frequency",
        "severity_flag",
        "department_weight",
        "time_sensitivity_hours",
    ]

    def select_features(df: pd.DataFrame) -> pd.DataFrame:
        return df[feature_cols].copy()

    transformer = ColumnTransformer(
        transformers=[
            ("text", TfidfVectorizer(max_features=1200, ngram_range=(1, 2)), "description"),
            ("dept", OneHotEncoder(handle_unknown="ignore"), ["department"]),
            ("num", "passthrough", [
                "has_evidence",
                "location_frequency",
                "severity_flag",
                "department_weight",
                "time_sensitivity_hours",
            ]),
        ],
        remainder="drop",
    )

    pipeline = Pipeline(
        steps=[
            ("select", FunctionTransformer(select_features)),
            ("transform", transformer),
        ]
    )

    return PreprocessArtifacts(pipeline=pipeline)


def prepare_training_frame(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df = _add_engineered_features(df)
    return df
