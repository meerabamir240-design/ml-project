const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Features {
  age: number;
  annual_income: number;
  credit_score: number;
  loan_amount: number;
  loan_term_months: number;
  employment_years: number;
  num_prev_loans: number;
  num_defaults: number;
  savings_balance: number;
  monthly_expenses: number;
  debt_to_income_ratio: number;
  has_mortgage: number;
  region: string;
  education_level: string;
  marital_status: string;
}

export interface Prediction {
  label: string;
  class_index: number;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface ModelInfo {
  features: string[];
  labels: string[];
  model_type: string;
  n_features: number;
  n_classes: number;
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_BASE}/model/info`);
  if (!res.ok) throw new Error("Failed to fetch model info");
  return res.json() as Promise<ModelInfo>;
}

export async function predict(features: Features): Promise<Prediction> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  if (!res.ok) throw new Error("Failed to get prediction");
  return res.json() as Promise<Prediction>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}