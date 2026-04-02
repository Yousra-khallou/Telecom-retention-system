import { useState, useEffect } from "react";

const API = "https://usraai-telecom-churn-reco.hf.space";

const SERVICE_INFO = {
  OnlineSecurity:   { icon: "🔒", desc: "Protect against online threats" },
  TechSupport:      { icon: "🛠️", desc: "24/7 technical assistance" },
  OnlineBackup:     { icon: "☁️", desc: "Cloud backup for your data" },
  DeviceProtection: { icon: "📱", desc: "Insurance for your devices" },
  StreamingTV:      { icon: "📺", desc: "Access to streaming channels" },
  StreamingMovies:  { icon: "🎬", desc: "On-demand movie library" },
  MultipleLines:    { icon: "📞", desc: "Add extra phone lines" },
  PhoneService:     { icon: "☎️", desc: "Basic phone service" },
};

export default function RecoForm({ initialChurnScore, initialSentimentScore }) {
  const [customerId,     setCustomerId]     = useState(10);
  const [churnScore,     setChurnScore]     = useState(initialChurnScore     ?? 0.75);
  const [sentimentScore, setSentimentScore] = useState(initialSentimentScore ?? 0.5);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => { if (initialChurnScore     != null) setChurnScore(initialChurnScore); },     [initialChurnScore]);
  useEffect(() => { if (initialSentimentScore != null) setSentimentScore(initialSentimentScore); }, [initialSentimentScore]);

  const recommend = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_API_KEY
        },
        body: JSON.stringify({
          customer_id:     customerId,
          churn_score:     churnScore,
          sentiment_score: sentimentScore,
          top_k: 3
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const rc = churnScore     > 0.7 ? "#ef4444" : churnScore     > 0.4 ? "#f59e0b" : "#22c55e";
  const sc = sentimentScore < 0.35 ? "#ef4444" : sentimentScore < 0.65 ? "#f59e0b" : "#22c55e";

  // Score hybride affiché (preview)
  const hybridPreview = (0.5 * churnScore + 0.3 * (1 - sentimentScore)).toFixed(2);

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">🎯 Hybrid Scoring</div>
        <div className="step-indicator">
          📋 Step 3 of 3 — Combining churn + sentiment for personalized offers
        </div>

        {/* Scores reçus des étapes précédentes */}
        <div style={{ display: "flex", gap: 10 }}>
          <div className="stat" style={{ flex: 1 }}>
            <div className="stat-val" style={{ color: rc }}>{Math.round(churnScore * 100)}%</div>
            <div className="stat-key">⚡ Churn Score</div>
            {initialChurnScore != null && <div style={{ fontSize: "0.65rem", color: "#22c55e", marginTop: 3 }}>✓ From Step 1</div>}
          </div>
          <div className="stat" style={{ flex: 1 }}>
            <div className="stat-val" style={{ color: sc }}>
              {sentimentScore < 0.35 ? "😠" : sentimentScore < 0.65 ? "😐" : "😊"}
            </div>
            <div className="stat-key">💬 Sentiment</div>
            {initialSentimentScore != null && <div style={{ fontSize: "0.65rem", color: "#22c55e", marginTop: 3 }}>✓ From Step 2</div>}
          </div>
          <div className="stat" style={{ flex: 1 }}>
            <div className="stat-val" style={{
              background: "linear-gradient(135deg,#7c3aed,#ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              {hybridPreview}
            </div>
            <div className="stat-key">🔀 Hybrid</div>
          </div>
        </div>

        {/* Formule hybride */}
        <div style={{
          background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: 10, padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,1)",
          fontFamily: "JetBrains Mono, monospace"
        }}>
          hybrid = churn×0.5 + (1-sentiment)×0.3 + collab×0.2
        </div>

        <div className="field">
          <label>Customer ID</label>
          <input type="number" min={0} max={7042} value={customerId}
            onChange={e => setCustomerId(+e.target.value)} />
          <div className="field-hint">Customer index (0 – 7042)</div>
        </div>

        {/* Ajustement manuel si pas de score auto */}
        {initialChurnScore == null && (
          <div className="field">
            <label>Churn Score — <span style={{ color: rc }}>{Math.round(churnScore * 100)}%</span></label>
            <input type="range" min={0} max={1} step={0.01} value={churnScore}
              onChange={e => setChurnScore(+e.target.value)} />
          </div>
        )}
        {initialSentimentScore == null && (
          <div className="field">
            <label>Sentiment Score — <span style={{ color: sc }}>
              {sentimentScore < 0.35 ? "😠 Négatif" : sentimentScore < 0.65 ? "😐 Neutre" : "😊 Positif"}
            </span></label>
            <input type="range" min={0} max={1} step={0.01} value={sentimentScore}
              onChange={e => setSentimentScore(+e.target.value)} />
          </div>
        )}

        <button className="btn-primary" onClick={recommend} disabled={loading}>
          {loading ? <><span className="spinner" /> Finding offers...</> : "Get Hybrid Recommendations →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      <div className="card result-card">
        <div className="card-title">🎁 Personalized Offers</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Click <b>Get Hybrid Recommendations</b></p>
            <p className="empty-sub">Combining churn risk + sentiment + collaborative filtering</p>
          </div>
        )}
        {loading && <div className="empty-state"><div className="loading-ring" /><p>Computing hybrid scores...</p></div>}
        {result && (
          <div className="result-inner">
            <div className="urgency-badge">{result.urgency}</div>

            {/* Scores hybrides */}
            <div className="stats-row">
              <div className="stat">
                <div className="stat-val" style={{ color: rc }}>{Math.round(result.churn_score * 100)}%</div>
                <div className="stat-key">⚡ Churn</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{ color: sc }}>{result.sentiment_label}</div>
                <div className="stat-key">💬 Sentiment</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{
                  background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                }}>{result.hybrid_score}</div>
                <div className="stat-key">🔀 Hybrid</div>
              </div>
            </div>

            <div className="reco-source">
              Source: <b>🔀 {result.source}</b>
            </div>

            <div className="reco-list">
              {result.recommendations.map((svc, i) => {
                const info = SERVICE_INFO[svc] || { icon: "⭐", desc: "Recommended service" };
                return (
                  <div key={i} className="reco-card" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="reco-rank">#{i + 1}</div>
                    <div className="reco-icon">{info.icon}</div>
                    <div className="reco-info">
                      <div className="reco-name">{svc}</div>
                      <div className="reco-desc">{info.desc}</div>
                    </div>
                    <button className="reco-action">Offer →</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
