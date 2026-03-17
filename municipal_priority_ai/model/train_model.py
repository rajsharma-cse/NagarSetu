from __future__ import annotations

import logging
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

from model.preprocess import build_preprocess_pipeline, prepare_training_frame

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "complaints_dataset.csv"
MODEL_PATH = Path(__file__).resolve().parents[1] / "model" / "priority_model.pkl"
LOG_PATH = Path(__file__).resolve().parents[1] / "model" / "training.log"
FEATURE_PLOT = Path(__file__).resolve().parents[1] / "model" / "feature_importance.png"


def setup_logging() -> None:
    logging.basicConfig(
        filename=str(LOG_PATH),
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
    )


def train() -> None:
    setup_logging()
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    data = pd.read_csv(DATA_PATH)
    data = prepare_training_frame(data)

    X = data
    y = data["priority_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    artifacts = build_preprocess_pipeline()
    X_train_transformed = artifacts.pipeline.fit_transform(X_train)
    X_test_transformed = artifacts.pipeline.transform(X_test)

    model = RandomForestClassifier(
        n_estimators=250,
        max_depth=20,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train_transformed, y_train)
    predictions = model.predict(X_test_transformed)
    report = classification_report(y_test, predictions)
    logging.info("Classification report:\n%s", report)
    print(report)

    joblib.dump(
        {
            "model": model,
            "pipeline": artifacts.pipeline,
            "labels": sorted(y.unique().tolist()),
        },
        MODEL_PATH,
    )

    # Feature importance (aggregated for non-text features)
    try:
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[-15:]
        plt.figure(figsize=(10, 6))
        plt.barh(range(len(top_indices)), importances[top_indices], color="#2563eb")
        plt.yticks(range(len(top_indices)), [f"f{i}" for i in top_indices])
        plt.title("Top Feature Importances (Random Forest)")
        plt.tight_layout()
        plt.savefig(FEATURE_PLOT)
        plt.close()
    except Exception as exc:
        logging.warning("Feature importance plot skipped: %s", exc)


if __name__ == "__main__":
    train()
