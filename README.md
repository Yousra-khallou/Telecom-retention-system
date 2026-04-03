# 📡 Telecom Retention System

> **End-to-end AI system for telecom customer retention** — Churn Prediction · NLP Sentiment Analysis · Hybrid Recommendations

[![HuggingFace](https://img.shields.io/badge/🤗_HuggingFace-Spaces-yellow)](https://huggingface.co/usraai)
[![Vercel](https://img.shields.io/badge/Vercel-Dashboard-black)](https://telecom-retention-system.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org)

---

## 🎯 Project Overview

A complete **AI-powered customer retention system** for a telecom operator, combining three complementary AI models into one unified hybrid pipeline:

```
Customer Data          → ⚡ Churn Prediction    (Who is at risk?)
Customer Review        → 💬 Sentiment Analysis  (How do they feel?)
Churn + Sentiment      → 🎯 Hybrid Recommendations (What to offer them?)
```

**Business goal**: Identify at-risk customers before they leave, understand their frustration through their reviews, and automatically suggest the most relevant retention offers.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Dashboard                       │
│              (Vercel — telecom-retention.vercel.app)     │
└──────────────────┬──────────────────┬───────────────────┘
                   │                  │
        ┌──────────▼───────┐ ┌────────▼────────────┐
        │  Churn + Reco API │ │   Sentiment API      │
        │  HuggingFace Space│ │   HuggingFace Space  │
        │                   │ │                      │
        │  XGBoost + SVD    │ │  DistilBERT          │
        │  (scikit-learn)   │ │  (multilingual)      │
        └───────────────────┘ └──────────────────────┘
```

---

## 🤖 AI Models

### 1. Churn Prediction (Notebook 02)
- **Algorithm**: XGBoost with scikit-learn Pipeline
- **Dataset**: IBM Telco Customer Churn (~7,000 customers, 20 features)
- **Techniques**: Stratified train/val/test split, class imbalance handling (`scale_pos_weight`), ColumnTransformer (StandardScaler + OneHotEncoder)
- **Evaluation**: ROC-AUC, Precision-Recall, Confusion Matrix, custom threshold optimization
- **Output**: Churn probability (0–1) + risk level (Low / Medium / High)

### 2. NLP Sentiment Analysis (Notebook 03)
- **Model**: `distilbert-base-multilingual-cased` (HuggingFace)
- **Languages**: English + French
- **Data sources**:
  - Kaggle: Global Mobile Reviews Dataset
  - Kaggle: Telecom Consumer Complaints
  - Trustpilot scraping: Orange, SFR, Bouygues (EN + FR)
- **Labeling**: 1–2 stars → Negative | 3 stars → Neutral | 4–5 stars → Positive
- **Baseline**: TF-IDF + Logistic Regression (for comparison)
- **Output**: Negative / Neutral / Positive + confidence score

### 3. Hybrid Recommendation System (Notebook 04)
- **Algorithm**: SVD-based Collaborative Filtering
- **Hybrid scoring formula**:
```
hybrid_score = churn_score × 0.5 + (1 - sentiment_score) × 0.3 + collab_score × 0.2
```
- **Why hybrid?**
  - Churn score alone → knows WHO is at risk
  - Sentiment alone → knows HOW they feel
  - Collaborative alone → knows WHAT they might like
  - Combined → knows WHO needs WHAT offer NOW

---

## 📁 Project Structure

```
Telecom-retention-system/
│
├── 📂 Data/
│   ├── raw/
│   │   └── Telco-Customer-Churn.csv        # IBM dataset
│   └── processed/
│       ├── telco_clean.csv                  # Cleaned dataset
│       └── *.png                            # 15 analysis charts
│
├── 📂 Notebooks/
│   ├── 01_exploration.ipynb                 # EDA & visualization
│   ├── 02_churn_model.ipynb                 # ML pipeline
│   ├── 03_nlp_distilbert.ipynb              # NLP fine-tuning
│   └── 04_recommendation.ipynb             # Hybrid reco system
│
├── 📂 api-render/                           # Churn + Reco API (FastAPI)
│   ├── main.py
│   ├── requirements.txt
│   └── models/
│       ├── churn_model.pkl
│       ├── best_threshold.pkl
│       └── recommendation/
│
├── 📂 api-hf/                              # Sentiment API (FastAPI + DistilBERT)
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── model/
│
└── 📂 frontend/                            # React Dashboard
    └── src/
        ├── App.js
        ├── App.css
        └── components/
            ├── ChurnForm.js
            ├── SentimentForm.js
            └── RecoForm.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Data** | pandas, numpy |
| **Visualization** | matplotlib, seaborn |
| **ML** | scikit-learn, XGBoost |
| **NLP** | HuggingFace Transformers, DistilBERT |
| **Recommendation** | SVD (numpy), Collaborative Filtering |
| **Scraping** | BeautifulSoup (Trustpilot) |
| **API** | FastAPI, Uvicorn |
| **Security** | slowapi (rate limiting), CORS, API Key |
| **Frontend** | React 18, Recharts |
| **Deployment** | HuggingFace Spaces (Docker), Vercel |
| **Environment** | Google Colab, Jupyter |

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌐 **Dashboard** | [telecom-retention-system.vercel.app](https://telecom-retention-system.vercel.app) |
| ⚡ **Churn + Reco API** | [usraai-telecom-churn-reco.hf.space/docs](https://usraai-telecom-churn-reco.hf.space/docs) |
| 💬 **Sentiment API** | [usraai-telecom-sentiment.hf.space/docs](https://usraai-telecom-sentiment.hf.space/docs) |

---

## 🔧 How to Use

### Run Notebooks (Google Colab)
1. Open any notebook from the `Notebooks/` folder
2. Upload to Google Colab
3. Connect to GPU (for Notebook 03): `Runtime → Change runtime type → GPU`
4. Run cells in order

### Run API Locally
```bash
# Churn + Reco API
cd api-render
pip install -r requirements.txt
uvicorn main:app --reload

# Sentiment API
cd api-hf
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm start
# → Opens at http://localhost:3000
```

### Test the APIs
```bash
# Predict churn
curl -X POST "https://usraai-telecom-churn-reco.hf.space/predict/churn" \
  -H "Content-Type: application/json" \
  -d '{"tenure": 5, "MonthlyCharges": 85.0, "TotalCharges": 425.0,
       "Contract": "Month-to-month", "InternetService": "Fiber optic",
       "TechSupport": "No", "OnlineSecurity": "No", "OnlineBackup": "No",
       "DeviceProtection": "No", "StreamingTV": "Yes", "StreamingMovies": "Yes",
       "PhoneService": "Yes", "MultipleLines": "No", "PaperlessBilling": "Yes",
       "PaymentMethod": "Electronic check", "SeniorCitizen": 0,
       "Partner": "No", "Dependents": "No", "gender": "Female"}'

# Analyze sentiment
curl -X POST "https://usraai-telecom-sentiment.hf.space/predict/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"text": "Le service client est vraiment nul"}'

# Get recommendations
curl -X POST "https://usraai-telecom-churn-reco.hf.space/recommend" \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 10, "churn_score": 0.85, "sentiment_score": 0.1, "top_k": 3}'
```

---

## 🔐 Security

- **API Key** authentication (x-api-key header)
- **CORS** restricted to the Vercel domain only
- **Rate limiting** : 20 requests/minute per IP (slowapi)
- **Input validation** : strict Pydantic schemas with field constraints
- **HTTPS** : enforced by Vercel and HuggingFace Spaces

---

## 📊 Results

| Model | Metric | Score |
|---|---|---|
| Churn — Logistic Regression | F1 (churn class) | ~0.62 |
| Churn — Random Forest | F1 (churn class) | ~0.67 |
| Churn — **XGBoost** | F1 (churn class) | **~0.72** |
| Sentiment — TF-IDF baseline | Accuracy | ~0.78 |
| Sentiment — **DistilBERT** | Accuracy | **~0.89** |

---

## 👤 Author

**Yousra Khallou**
- GitHub: [@Yousra-khallou](https://github.com/Yousra-khallou)

---

## 📄 License

MIT License — feel free to use and adapt this project.
