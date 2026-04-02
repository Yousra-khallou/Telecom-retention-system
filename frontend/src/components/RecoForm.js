import { useState, useEffect } from "react";

const API = "https://usraai-telecom-churn-reco.hf.space";

const SERVICE_INFO = {
  OnlineSecurity: { icon: "🔒", desc: "Protect against online threats" },
  TechSupport: { icon: "🛠️", desc: "24/7 technical assistance" },
  OnlineBackup: { icon: "☁️", desc: "Cloud backup for your data" },
  DeviceProtection: { icon: "📱", desc: "Insurance for your devices" },
  StreamingTV: { icon: "📺", desc: "Access to streaming channels" },
  StreamingMovies: { icon: "🎬", desc: "On-demand movie library" },
  MultipleLines: { icon: "📞", desc: "Add extra phone lines" },
  PhoneService: { icon: "☎️", desc: "Basic phone service" },
};

export default function RecoForm({ initialChurnScore }) {
  const [customerId, setCustomerId] = useState(10);
  const [churnScore, setChurnScore] = useState(initialChurnScore || 0.75);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialChurnScore !== null && initialChurnScore !== undefined) {
      setChurnScore(initialChurnScore);
    }
  }, [initialChurnScore]);

  const recommend = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, churn_score: churnScore, top_k: 3 }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const rc = churnScore > 0.7 ? "#ef4444" : churnScore > 0.4 ? "#f59e0b" : "#22c55e";

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">🎯 Customer at Risk</div>
        <div className="step-indicator">
          📋 Step 3 of 3 — Get personalized retention offers
          {initialChurnScore !== null && initialChurnScore !== undefined && (
            <span style={{ marginLeft: 8, color: "#a855f7" }}>
              · Churn score auto-filled from Step 1 ✓
            </span>
          )}
        </div>

        <div className="field">
          <label>Customer ID</label>
          <input type="number" min={0} max={7042} value={customerId}
            onChange={e => setCustomerId(+e.target.value)} />
          <div className="field-hint">Customer index (0 – 7042)</div>
        </div>

        <div className="field">
          <label>
            Churn Score —{" "}
            <span style={{ color: rc, fontWeight: 700 }}>{Math.round(churnScore * 100)}%</span>
          </label>
          <input type="range" min={0} max={1} step={0.01}
            value={churnScore} onChange={e => setChurnScore(+e.target.value)} />
          <div className="range-labels">
            <span style={{ color: "#22c55e" }}>🟢 Low</span>
            <span style={{ color: "#f59e0b" }}>🟡 Medium</span>
            <span style={{ color: "#ef4444" }}>🔴 High</span>
          </div>
        </div>

        <div className="churn-indicator" style={{ borderColor: rc }}>
          <div className="churn-bar-bg">
            <div className="churn-bar-fill" style={{ width: `${churnScore * 100}%`, background: rc }} />
          </div>
          <div style={{ color: rc, fontWeight: 700, marginTop: 8, fontSize: "0.85rem" }}>
            {churnScore > 0.7 ? "🔴 High risk — immediate action needed"
              : churnScore > 0.4 ? "🟡 Medium risk — consider proactive offers"
                : "🟢 Low risk — standard follow-up"}
          </div>
        </div>

        <button className="btn-primary" onClick={recommend} disabled={loading}>
          {loading ? <><span className="spinner" /> Finding offers...</> : "Get Recommendations →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      <div className="card result-card">
        <div className="card-title">🎁 Personalized Offers</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Click <b>Get Recommendations</b></p>
            <p className="empty-sub">The AI will suggest the best retention offers for this customer</p>
          </div>
        )}
        {loading && <div className="empty-state"><div className="loading-ring" /><p>Finding best offers...</p></div>}
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
            <div className="stats-row">
              <div className="stat">
                <div className="stat-val">#{result.customer_id}</div>
                <div className="stat-key">Customer</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{ color: rc }}>{Math.round(result.churn_score * 100)}%</div>
                <div className="stat-key">Churn Score</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{ background: "linear-gradient(135deg,#e8b4b8,#c9a9c4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {result.recommendations.length}
                </div>
                <div className="stat-key">Offers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
