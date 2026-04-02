import { useState } from "react";

const API = "https://usraai-telecom-churn-reco.hf.space";

const SERVICE_INFO = {
  OnlineSecurity:  { icon: "🔒", desc: "Protect against online threats" },
  TechSupport:     { icon: "🛠️", desc: "24/7 technical assistance" },
  OnlineBackup:    { icon: "☁️", desc: "Cloud backup for your data" },
  DeviceProtection:{ icon: "📱", desc: "Insurance for your devices" },
  StreamingTV:     { icon: "📺", desc: "Access to streaming channels" },
  StreamingMovies: { icon: "🎬", desc: "On-demand movie library" },
  MultipleLines:   { icon: "📞", desc: "Add extra phone lines" },
  PhoneService:    { icon: "☎️", desc: "Basic phone service" },
};

export default function RecoForm() {
  const [customerId, setCustomerId] = useState(10);
  const [churnScore, setChurnScore] = useState(0.75);
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const recommend = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, churn_score: churnScore, top_k: 3 }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = churnScore > 0.7 ? "#ef4444" : churnScore > 0.4 ? "#f59e0b" : "#22c55e";

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">🎯 Customer at Risk</div>

        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="field">
            <label>Customer ID</label>
            <input
              type="number" min={0} max={7042}
              value={customerId}
              onChange={e => setCustomerId(+e.target.value)}
            />
            <div className="field-hint">Customer index (0 – 7042)</div>
          </div>

          <div className="field">
            <label>
              Churn Score —{" "}
              <span style={{ color: riskColor, fontWeight: 700 }}>
                {Math.round(churnScore * 100)}%
              </span>
            </label>
            <input
              type="range" min={0} max={1} step={0.01}
              value={churnScore}
              onChange={e => setChurnScore(+e.target.value)}
              style={{ accentColor: riskColor }}
            />
            <div className="range-labels">
              <span style={{ color: "#22c55e" }}>Low risk</span>
              <span style={{ color: "#f59e0b" }}>Medium</span>
              <span style={{ color: "#ef4444" }}>High risk</span>
            </div>
          </div>
        </div>

        {/* Risk indicator */}
        <div className="churn-indicator" style={{ borderColor: riskColor }}>
          <div className="churn-bar-bg">
            <div className="churn-bar-fill" style={{ width: `${churnScore * 100}%`, background: riskColor }} />
          </div>
          <div style={{ color: riskColor, fontWeight: 700, marginTop: 6 }}>
            {churnScore > 0.7 ? "🔴 High churn risk — immediate action needed"
            : churnScore > 0.4 ? "🟡 Medium risk — consider proactive offers"
            : "🟢 Low risk — standard follow-up"}
          </div>
        </div>

        <button className="btn-primary" onClick={recommend} disabled={loading}>
          {loading ? <><span className="spinner" /> Getting recommendations...</> : "Get Recommendations →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {/* Result */}
      <div className="card result-card">
        <div className="card-title">🎁 Personalized Offers</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Enter a customer ID and churn score</p>
            <p className="empty-sub">The AI will suggest the best retention offers</p>
          </div>
        )}
        {loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>Finding best offers...</p>
          </div>
        )}
        {result && (
          <div className="result-inner">
            <div className="urgency-badge">{result.urgency}</div>
            <div className="reco-source">
              Source: <b>{result.source === "collaborative_filtering" ? "🤝 Collaborative Filtering" : "📈 Popularity-based"}</b>
            </div>

            <div className="reco-list">
              {result.recommendations.map((svc, i) => {
                const info = SERVICE_INFO[svc] || { icon: "⭐", desc: "Recommended service" };
                return (
                  <div key={i} className="reco-card" style={{ animationDelay: `${i * 0.1}s` }}>
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

            <div className="stats-row" style={{ marginTop: 20 }}>
              <div className="stat">
                <div className="stat-val">#{result.customer_id}</div>
                <div className="stat-key">Customer ID</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{ color: riskColor }}>
                  {Math.round(result.churn_score * 100)}%
                </div>
                <div className="stat-key">Churn Score</div>
              </div>
              <div className="stat">
                <div className="stat-val">{result.recommendations.length}</div>
                <div className="stat-key">Offers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
