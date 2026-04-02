import { useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

const API = "https://usraai-telecom-churn-reco.hf.space";

const DEFAULTS = {
  tenure: 12, MonthlyCharges: 70.5, TotalCharges: 845.0,
  Contract: "Month-to-month", InternetService: "Fiber optic",
  TechSupport: "No", OnlineSecurity: "No", OnlineBackup: "No",
  DeviceProtection: "No", StreamingTV: "Yes", StreamingMovies: "Yes",
  PhoneService: "Yes", MultipleLines: "No", PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check", SeniorCitizen: 0,
  Partner: "No", Dependents: "No", gender: "Female",
};

const RISK = {
  High:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.4)",   msg: "⚠️ This customer is very likely to leave. Act now!" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.4)",  msg: "⚡ This customer shows signs of dissatisfaction." },
  Low:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.4)",   msg: "✅ This customer is stable. Keep up the good work!" },
};

export default function ChurnForm({ onNext, onChurnScore }) {
  const [form, setForm]       = useState(DEFAULTS);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/predict/churn`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_API_KEY
         },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      onChurnScore && onChurnScore(data.churn_probability);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const r   = result ? RISK[result.risk_level] : null;
  const pct = result ? Math.round(result.churn_probability * 100) : 0;

  return (
    <div className="card-grid">
      <div className="card">
        <div className="card-title">⚡ Customer Profile</div>
        <div className="step-indicator">📋 Step 1 of 3 — Fill in the customer data to predict churn risk</div>
        <div className="form-grid">
          {[
            ["Tenure (months)", "tenure", "number"],
            ["Monthly Charges ($)", "MonthlyCharges", "number"],
            ["Total Charges ($)", "TotalCharges", "number"],
          ].map(([label, key, type]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input type={type} value={form[key]} onChange={e => set(key, +e.target.value)} />
            </div>
          ))}
          {[
            ["Contract", "Contract", ["Month-to-month","One year","Two year"]],
            ["Internet Service", "InternetService", ["Fiber optic","DSL","No"]],
            ["Payment Method", "PaymentMethod", ["Electronic check","Mailed check","Bank transfer (automatic)","Credit card (automatic)"]],
            ["Tech Support", "TechSupport", ["No","Yes","No internet service"]],
            ["Online Security", "OnlineSecurity", ["No","Yes","No internet service"]],
            ["Online Backup", "OnlineBackup", ["No","Yes","No internet service"]],
            ["Streaming TV", "StreamingTV", ["Yes","No","No internet service"]],
            ["Gender", "gender", ["Female","Male"]],
            ["Partner", "Partner", ["No","Yes"]],
          ].map(([label, key, opts]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <select value={form[key]} onChange={e => set(key, e.target.value)}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="field">
            <label>Senior Citizen</label>
            <select value={form.SeniorCitizen} onChange={e => set("SeniorCitizen", +e.target.value)}>
              <option value={0}>No</option><option value={1}>Yes</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={predict} disabled={loading}>
          {loading ? <><span className="spinner" /> Analyzing...</> : "Predict Churn →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      <div className="card result-card">
        <div className="card-title">📊 Prediction Result</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Fill in the profile and click <b>Predict Churn</b></p>
            <p className="empty-sub">The AI will calculate the churn probability</p>
          </div>
        )}
        {loading && <div className="empty-state"><div className="loading-ring" /><p>Analyzing...</p></div>}
        {result && r && (
          <div className="result-inner">
            <div className="gauge-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart cx="50%" cy="100%" innerRadius="80%" outerRadius="100%" startAngle={180} endAngle={0}
                  data={[{ value: pct, fill: r.color }]}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "rgba(255,255,255,0.05)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-value">{pct}%</div>
              <div className="gauge-label">Churn Probability</div>
            </div>
            <div className="risk-badge" style={{ background: r.bg, borderColor: r.border, color: r.color }}>
              {result.risk_level} Risk
            </div>
            <p className="risk-msg">{r.msg}</p>
            <div className="stats-row">
              <div className="stat"><div className="stat-val" style={{ color: r.color }}>{pct}%</div><div className="stat-key">Probability</div></div>
              <div className="stat"><div className="stat-val" style={{ color: r.color }}>{result.risk_level}</div><div className="stat-key">Risk Level</div></div>
              <div className="stat"><div className="stat-val">{result.will_churn ? "Yes" : "No"}</div><div className="stat-key">Will Churn</div></div>
            </div>
            <button className="btn-next" onClick={onNext}>
              Next: Analyze Review 💬 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
