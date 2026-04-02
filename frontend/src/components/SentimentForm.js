import { useState } from "react";

const API = "https://usraai-telecom-sentiment.hf.space";

const EXAMPLES = [
  "Le service client est vraiment nul, je vais changer d'opérateur.",
  "Très bonne couverture réseau, je suis satisfait de mon forfait.",
  "La connexion coupe souvent mais le prix est correct.",
  "Worst customer service ever. Been waiting 2 hours on hold.",
  "Great network speed and the staff was very helpful!",
];

const SENTIMENT_CONFIG = {
  Negative: { color: "#ef4444", bg: "#450a0a", icon: "😠", bar: "#ef4444" },
  Neutral:  { color: "#f59e0b", bg: "#451a03", icon: "😐", bar: "#f59e0b" },
  Positive: { color: "#22c55e", bg: "#052e16", icon: "😊", bar: "#22c55e" },
};

export default function SentimentForm() {
  const [text, setText]     = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/predict/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? SENTIMENT_CONFIG[result.sentiment] : null;

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">💬 Customer Review</div>

        {/* Examples */}
        <div className="examples-label">Quick examples :</div>
        <div className="examples">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="example-chip" onClick={() => setText(ex)}>
              {ex.slice(0, 45)}…
            </button>
          ))}
        </div>

        <textarea
          className="textarea"
          rows={5}
          placeholder="Type a customer review in French or English..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="char-count">{text.length} characters</div>

        <button className="btn-primary" onClick={analyze} disabled={loading || !text.trim()}>
          {loading ? <><span className="spinner" /> Analyzing...</> : "Analyze Sentiment →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {/* Result */}
      <div className="card result-card">
        <div className="card-title">📊 Sentiment Result</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>Type a review and click <b>Analyze Sentiment</b></p>
            <p className="empty-sub">Supports English and French 🇬🇧 🇫🇷</p>
          </div>
        )}
        {loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>DistilBERT is processing...</p>
          </div>
        )}
        {result && cfg && (
          <div className="result-inner">
            {/* Big emoji */}
            <div className="sentiment-emoji">{cfg.icon}</div>
            <div className="risk-badge" style={{ background: cfg.bg, borderColor: cfg.color, color: cfg.color }}>
              {result.sentiment}
            </div>
            <div className="confidence-label">
              Confidence: <b style={{ color: cfg.color }}>{Math.round(result.confidence * 100)}%</b>
            </div>

            {/* Score bars */}
            <div className="score-bars">
              {Object.entries(result.scores).map(([label, score]) => {
                const c = SENTIMENT_CONFIG[label];
                return (
                  <div key={label} className="score-bar-row">
                    <div className="score-bar-label">
                      <span>{c?.icon} {label}</span>
                      <span style={{ color: c?.color }}>{Math.round(score * 100)}%</span>
                    </div>
                    <div className="score-bar-bg">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${score * 100}%`, background: c?.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reviewed text */}
            <div className="reviewed-text">
              <div className="reviewed-label">Analyzed text</div>
              <div className="reviewed-content">"{result.text}"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
