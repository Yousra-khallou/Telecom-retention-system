---
title: Telecom Sentiment API
emoji: 📡
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Telecom Sentiment API

API de classification de sentiment pour les avis clients télécom (EN + FR).

**Modèle :** DistilBERT multilingual fine-tuné

## Endpoint

```
POST /predict/sentiment
{
  "text": "Le service client est vraiment nul"
}
```

**Réponse :**
```json
{
  "sentiment": "Negative",
  "confidence": 0.94,
  "scores": { "Negative": 0.94, "Neutral": 0.04, "Positive": 0.02 }
}
```