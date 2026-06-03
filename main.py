# Inference API (Web)
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from classifier import FEATURES, LABELS, load_model, predict


class Features(BaseModel):
    age: float = Field(..., description="Age of the customer")
    annual_income: float = Field(..., description="Annual income in USD")
    credit_score: float = Field(..., description="Credit score")
    loan_amount: float = Field(..., description="Loan amount in USD")
    loan_term_months: float = Field(..., description="Loan term in months")
    employment_years: float = Field(..., description="Years of employment")
    num_prev_loans: float = Field(..., description="Number of previous loans")
    num_defaults: float = Field(..., description="Number of defaults")
    savings_balance: float = Field(..., description="Savings balance in USD")
    monthly_expenses: float = Field(..., description="Monthly expenses in USD")
    debt_to_income_ratio: float = Field(..., description="Debt to income ratio")
    has_mortgage: float = Field(..., description="Has mortgage (0 or 1)")
    region: str = Field(..., description="Region (North, South, East, West)")
    education_level: str = Field(..., description="Education level (High School, Bachelor, Master, PhD)")
    marital_status: str = Field(..., description="Marital status (Single, Married, Divorced)")


class Prediction(BaseModel):
    label: str
    class_index: int
    probabilities: dict[str, float]
    confidence: float


class ModelInfo(BaseModel):
    features: list[str]
    labels: list[str]
    model_type: str
    n_features: int
    n_classes: int


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
    yield


app = FastAPI(
    title="ML Classifier API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/model/info", response_model=ModelInfo)
def model_info():
    model = load_model()
    return {
        "features": FEATURES,
        "labels": LABELS,
        "model_type": type(model).__name__,
        "n_features": len(FEATURES),
        "n_classes": len(LABELS),
    }


@app.post("/predict", response_model=Prediction)
def predict_single(payload: Features):
    return predict(payload.model_dump())