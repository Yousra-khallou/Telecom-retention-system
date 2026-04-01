"""
Telecom Retention API — Churn + Recommendation
Déployé sur Render.com (gratuit)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import List
import os

app = FastAPI(
    title="Telecom Retention API",
    description="Churn prediction + Service recommendations",
    version="1.0.0"
)

# CORS — autorise n'importe quel front à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Chargement des modèles au démarrage ───────────────────────

BASE = os.path.dirname(__file__)

# Churn
churn_model     = joblib.load(os.path.join(BASE, "models/churn_model.pkl"))
best_threshold  = joblib.load(os.path.join(BASE, "models/best_threshold.pkl"))

# Recommendation (SVD)
U               = np.load(os.path.join(BASE, "models/recommendation/U.npy"))
sigma           = joblib.load(os.path.join(BASE, "models/recommendation/sigma.pkl"))
Vt              = np.load(os.path.join(BASE, "models/recommendation/Vt.npy"))
predicted_ratings = np.load(os.path.join(BASE, "models/recommendation/predicted_ratings.npy"))
service_matrix  = pd.read_csv(os.path.join(BASE, "models/recommendation/service_matrix.csv"), index_col=0)
services_list   = joblib.load(os.path.join(BASE, "models/recommendation/services_list.pkl"))
service_to_idx  = joblib.load(os.path.join(BASE, "models/recommendation/service_to_idx.pkl"))
popularity      = joblib.load(os.path.join(BASE, "models/recommendation/popularity.pkl"))

print("✅ Tous les modèles sont chargés")

# ── Schémas de données ────────────────────────────────────────

class CustomerData(BaseModel):
    tenure: int
    MonthlyCharges: float
    TotalCharges: float
    Contract: str           # "Month-to-month" | "One year" | "Two year"
    InternetService: str    # "DSL" | "Fiber optic" | "No"
    TechSupport: str        # "Yes" | "No" | "No internet service"
    OnlineSecurity: str     # "Yes" | "No" | "No internet service"
    OnlineBackup: str
    DeviceProtection: str
    StreamingTV: str
    StreamingMovies: str
    PhoneService: str
    MultipleLines: str
    PaperlessBilling: str
    PaymentMethod: str
    SeniorCitizen: int      # 0 ou 1
    Partner: str            # "Yes" | "No"
    Dependents: str         # "Yes" | "No"
    gender: str             # "Male" | "Female"

class RecoRequest(BaseModel):
    customer_id: int        # index dans service_matrix (0-based)
    churn_score: float      # entre 0 et 1
    top_k: int = 3

# ── Endpoints ─────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "✅ API is running",
        "endpoints": {
            "churn":   "POST /predict/churn",
            "reco":    "POST /recommend",
            "docs":    "GET  /docs"
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/churn")
def predict_churn(data: CustomerData):
    """
    Retourne la probabilité de churn et le niveau de risque.
    """
    try:
        df = pd.DataFrame([data.dict()])
        proba = float(churn_model.predict_proba(df)[0][1])
        threshold = float(best_threshold) if not isinstance(best_threshold, dict) else best_threshold.get("threshold", 0.5)

        if proba >= threshold + 0.2:
            risk = "High"
        elif proba >= threshold:
            risk = "Medium"
        else:
            risk = "Low"

        return {
            "churn_probability": round(proba, 3),
            "threshold_used": round(threshold, 3),
            "risk_level": risk,
            "will_churn": bool(proba >= threshold)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend")
def recommend(data: RecoRequest):
    """
    Retourne les top-k services recommandés pour un client à risque.
    Combine le score SVD (collaboratif) + popularité si client inconnu.
    """
    try:
        n_customers = predicted_ratings.shape[0]

        if data.customer_id < 0 or data.customer_id >= n_customers:
            # Client inconnu → recommandations basées sur la popularité
            top_services = sorted(popularity, key=popularity.get, reverse=True)[:data.top_k]
            source = "popularity"
        else:
            # Client connu → SVD scores
            customer_ratings = predicted_ratings[data.customer_id]

            # Masquer les services déjà souscrits
            already_subscribed = service_matrix.iloc[data.customer_id]
            for service in services_list:
                if service in service_to_idx and already_subscribed.get(service, 0) == 1:
                    customer_ratings[service_to_idx[service]] = -999

            top_indices = np.argsort(customer_ratings)[::-1][:data.top_k]
            top_services = [services_list[i] for i in top_indices if i < len(services_list)]
            source = "collaborative_filtering"

        # Boost si churn élevé : on ajoute une explication d'urgence
        urgency = "🔴 Haute priorité" if data.churn_score > 0.7 else \
                  "🟡 Priorité moyenne" if data.churn_score > 0.4 else \
                  "🟢 Faible priorité"

        return {
            "customer_id": data.customer_id,
            "churn_score": data.churn_score,
            "urgency": urgency,
            "recommendations": top_services,
            "source": source
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))