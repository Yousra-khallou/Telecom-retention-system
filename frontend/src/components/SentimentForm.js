import { useState } from "react";

const API = "https://usraai-telecom-sentiment.hf.space";

const EXAMPLES = [
  "Le service client est vraiment nul, je vais changer d'opérateur.",
  "Très bonne couverture réseau, je suis satisfait de mon forfait.",
  "La connexion coupe souvent mais le prix est correct.",
  "Worst customer service ever. Been waiting 2 hours on hold.",
  "Great network speed and the staff was very helpful!",
];

const CFG = {
  Negative: { color: "#ef4444", bg: "rgba(239,68,68,0.15)",  bar: "linear-gradient(90deg,#ef4444,#f87171)", icon: "😠", score: 0.1 },
  Neutral:  { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", bar: "linear-gradient(90deg,#f59e0b,#fcd34d)", icon: "😐", score: 0.5 },
  Positive: { color: "#22c55e", bg: "rgba(34,197,94,0.15)",  bar: "linear-gradient(90deg,#22c55e,#4ade80)", icon: "😊", score: 0.9 },
};

export default function SentimentForm({ onNext, onSentimentScore }) {
  const [text, setText]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/predict/sentiment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      // Transmet le score numérique à App.js
      const cfg = CFG[data.sentiment];
      onSentimentScore && onSentimentScore(cfg ? cfg.score : 0.5);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const cfg = result ? CFG[result.sentiment] : null;

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">💬 Customer Review</div>
        <div className="step-indicator">
          📋 Step 2 of 3 — Analyze the sentiment · Score will be sent to Step 3
        </div>
        <div className="examples-label">Quick examples :</div>
        <div className="examples">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="example-chip" onClick={() => setText(ex)}>
              {ex.slice(0, 42)}…
            </button>
          ))}
        </div>
        <textarea className="textarea" rows={5}
          placeholder="Type a customer review in French or English..."
          value={text} onChange={e => setText(e.target.value)} />
        <div className="char-count">{text.length} characters</div>
        <button className="btn-primary" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? <><span className="spinner" /> Analyzing...</> : "Analyze Sentiment →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      <div className="card result-card">
        <div className="card-title">📊 Sentiment Result</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Type a review and click <b>Analyze Sentiment</b></p>
            <p className="empty-sub">Supports English 🇬🇧 and French 🇫🇷</p>
          </div>
        )}
        {loading && <div className="empty-state"><div className="loading-ring" /><p>DistilBERT is processing...</p></div>}
        {result && cfg && (
          <div className="result-inner">
            <div className="sentiment-emoji">{cfg.icon}</div>
            <div className="risk-badge" style={{ background: cfg.bg, borderColor: cfg.color, color: cfg.color }}>
              {result.sentiment}
            </div>
            <div className="confidence-label">
              Confidence: <b style={{ color: cfg.color }}>{Math.round(result.confidence * 100)}%</b>
            </div>
            <div className="score-bars">
              {Object.entries(result.scores).map(([label, score]) => {
                const c = CFG[label];
                return (
                  <div key={label} className="score-bar-row">
                    <div className="score-bar-label">
                      <span>{c?.icon} {label}</span>
                      <span style={{ color: c?.color, fontWeight: 700 }}>{Math.round(score * 100)}%</span>
                    </div>
                    <div className="score-bar-bg">
                      <div className="score-bar-fill" style={{ width: `${score * 100}%`, background: c?.bar }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="reviewed-text">
              <div className="reviewed-label">Analyzed text</div>
              <div className="reviewed-content">"{result.text}"</div>
            </div>
            {/* Indicateur de transmission */}
            <div className="step-indicator" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }}>
              ✅ Sentiment score transmitted to Step 3 — Score: {cfg.score}
            </div>
            <button className="btn-next" onClick={onNext}>
              Next: Get Recommendations 🎯 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
