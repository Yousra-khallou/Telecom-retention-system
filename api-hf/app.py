
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import json
import os

app = FastAPI(title="Telecom Sentiment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Chargement du modèle ──────────────────────────────────────

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model     = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

# label_map : {"0": "Negative", "1": "Neutral", "2": "Positive"}
with open(os.path.join(MODEL_DIR, "label_map.json")) as f:
    label_map = json.load(f)

print("✅ DistilBERT chargé")

# ── Schéma ────────────────────────────────────────────────────

class ReviewInput(BaseModel):
    text: str

# ── Endpoints ─────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "✅ Sentiment API running", "endpoint": "POST /predict/sentiment"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict/sentiment")
def predict_sentiment(data: ReviewInput):
    """
    Analyse le sentiment d'un avis client (EN ou FR).
    Retourne: Negative / Neutral / Positive + score de confiance.
    """
    inputs = tokenizer(
        data.text,
        return_tensors="pt",
        truncation=True,
        max_length=128,
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs   = torch.softmax(outputs.logits, dim=1)[0]
        pred_id = torch.argmax(probs).item()

    label = label_map.get(str(pred_id), str(pred_id))
    confidence = round(float(probs[pred_id]), 3)

    return {
        "text": data.text,
        "sentiment": label,
        "confidence": confidence,
        "scores": {
            label_map.get(str(i), str(i)): round(float(probs[i]), 3)
            for i in range(len(probs))
        }
    }