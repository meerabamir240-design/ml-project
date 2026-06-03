"use client";

import { useState, useEffect } from "react";
import {
  Features,
  Prediction,
  ModelInfo,
  fetchModelInfo,
  predict,
  checkHealth,
} from "@/lib/api";

const REGIONS = ["North", "South", "East", "West"];
const EDUCATION_LEVELS = ["High School", "Bachelor", "Master", "PhD"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced"];

const DEFAULT_FEATURES: Features = {
  age: 35,
  annual_income: 50000,
  credit_score: 650,
  loan_amount: 10000,
  loan_term_months: 36,
  employment_years: 5,
  num_prev_loans: 2,
  num_defaults: 0,
  savings_balance: 5000,
  monthly_expenses: 2000,
  debt_to_income_ratio: 0.3,
  has_mortgage: 0,
  region: "North",
  education_level: "Bachelor",
  marital_status: "Married",
};

function RiskBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    "High Risk": "bg-red-500",
    "Medium Risk": "bg-yellow-500",
    "Low Risk": "bg-green-500",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-white font-medium ${colors[label] || "bg-gray-500"}`}
    >
      {label}
    </span>
  );
}

function ProbabilityBar({
  label,
  value,
  isPredicted,
}: {
  label: string;
  value: number;
  isPredicted: boolean;
}) {
  const colors: Record<string, string> = {
    "High Risk": "bg-red-500",
    "Medium Risk": "bg-yellow-500",
    "Low Risk": "bg-green-500",
  };
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className={`font-medium ${isPredicted ? "text-gray-900" : "text-gray-600"}`}>
          {label} {isPredicted && "✓"}
        </span>
        <span className="text-gray-600">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colors[label]}`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [features, setFeatures] = useState<Features>(DEFAULT_FEATURES);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then(setApiHealthy)
      .catch(() => setApiHealthy(false));
    fetchModelInfo()
      .then(setModelInfo)
      .catch((err) => {
        console.error("Failed to fetch model info:", err);
        setError("Cannot load model info from API");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await predict(features);
      setPrediction(result);
    } catch (err) {
      setError("Failed to get prediction. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(DEFAULT_FEATURES);
    setPrediction(null);
    setError(null);
  };

  if (apiHealthy === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">API Unavailable</h1>
          <p className="text-gray-600 mb-4">
            Cannot connect to the inference API at{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code>
          </p>
          <p className="text-sm text-gray-500">Make sure the FastAPI server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Loan Risk Classifier</h1>
          <p className="text-sm text-gray-500">ML-powered loan risk assessment dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h2>
              {modelInfo ? (
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Model Type</dt>
                    <dd className="font-medium text-gray-900">{modelInfo.model_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Features</dt>
                    <dd className="font-medium text-gray-900">{modelInfo.n_features}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Classes</dt>
                    <dd className="font-medium text-gray-900">{modelInfo.n_classes}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Risk Categories</dt>
                    <dd className="flex gap-2 mt-1">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        Low Risk
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Medium Risk
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        High Risk
                      </span>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-gray-500">Loading model info...</p>
              )}
            </div>
          </div>

          {/* Prediction Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Application Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Numeric Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={features.age}
                    onChange={(e) => setFeatures({ ...features, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Income ($)
                  </label>
                  <input
                    type="number"
                    value={features.annual_income}
                    onChange={(e) =>
                      setFeatures({ ...features, annual_income: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                  <input
                    type="number"
                    value={features.credit_score}
                    onChange={(e) =>
                      setFeatures({ ...features, credit_score: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Amount ($)
                  </label>
                  <input
                    type="number"
                    value={features.loan_amount}
                    onChange={(e) =>
                      setFeatures({ ...features, loan_amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Term (months)
                  </label>
                  <input
                    type="number"
                    value={features.loan_term_months}
                    onChange={(e) =>
                      setFeatures({ ...features, loan_term_months: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Years
                  </label>
                  <input
                    type="number"
                    value={features.employment_years}
                    onChange={(e) =>
                      setFeatures({ ...features, employment_years: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Loans
                  </label>
                  <input
                    type="number"
                    value={features.num_prev_loans}
                    onChange={(e) =>
                      setFeatures({ ...features, num_prev_loans: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defaults</label>
                  <input
                    type="number"
                    value={features.num_defaults}
                    onChange={(e) =>
                      setFeatures({ ...features, num_defaults: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Savings Balance ($)
                  </label>
                  <input
                    type="number"
                    value={features.savings_balance}
                    onChange={(e) =>
                      setFeatures({ ...features, savings_balance: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Expenses ($)
                  </label>
                  <input
                    type="number"
                    value={features.monthly_expenses}
                    onChange={(e) =>
                      setFeatures({ ...features, monthly_expenses: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debt-to-Income Ratio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={features.debt_to_income_ratio}
                    onChange={(e) =>
                      setFeatures({ ...features, debt_to_income_ratio: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Has Mortgage</label>
                  <select
                    value={features.has_mortgage}
                    onChange={(e) =>
                      setFeatures({ ...features, has_mortgage: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                {/* Select Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <select
                    value={features.region}
                    onChange={(e) => setFeatures({ ...features, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education Level
                  </label>
                  <select
                    value={features.education_level}
                    onChange={(e) =>
                      setFeatures({ ...features, education_level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {EDUCATION_LEVELS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={features.marital_status}
                    onChange={(e) =>
                      setFeatures({ ...features, marital_status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {MARITAL_STATUSES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? "Predicting..." : "Predict Risk"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Reset
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </form>

            {/* Results */}
            {prediction && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Prediction Result</h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-sm text-gray-500">Risk Assessment:</div>
                  <RiskBadge label={prediction.label} />
                  <div className="text-sm text-gray-500">
                    Confidence: <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mb-3">Probability Distribution</h3>
                {Object.entries(prediction.probabilities).map(([label, value]) => (
                  <ProbabilityBar
                    key={label}
                    label={label}
                    value={value}
                    isPredicted={label === prediction.label}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}