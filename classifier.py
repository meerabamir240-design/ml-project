# AI/ML
from functools import lru_cache
from pathlib import Path
import joblib

import pandas as pd
from sklearn.preprocessing import OrdinalEncoder


MODEL_PATH = Path(__file__).parent / "notebooks" / "final_model.joblib"
FEATURES = [
    "age", "annual_income", "credit_score", "loan_amount",
    "loan_term_months", "employment_years", "num_prev_loans",
    "num_defaults", "savings_balance", "monthly_expenses",
    "debt_to_income_ratio", "has_mortgage",
    "region", "education_level", "marital_status",
]
LABELS = ["High Risk", "Low Risk", "Medium Risk"]

CAT_COLS = ["region", "education_level", "marital_status"]
_oe = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
_oe.fit([
    ["East",  "Bachelor",    "Divorced"],
    ["North", "High School", "Married"],
    ["South", "Master",      "Single"],
    ["West",  "PhD",         "Single"],
])


@lru_cache
def load_model():
    return joblib.load(MODEL_PATH)


def predict(features: dict) -> dict:
    X = pd.DataFrame([features], columns=FEATURES)
    X[CAT_COLS] = _oe.transform(X[CAT_COLS])
    [proba] = load_model().predict_proba(X)
    idx = int(proba.argmax())
    return {
        "label": LABELS[idx],
        "class_index": idx,
        "probabilities": dict(zip(LABELS, map(float, proba))),
        "confidence": float(proba[idx]),
    }