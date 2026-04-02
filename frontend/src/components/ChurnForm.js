import { useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

const API = "https://usraai-telecom-churn-reco.hf.space";

const DEFAULTS = {
  tenure: 12,
  MonthlyCharges: 70.5,
  TotalCharges: 845.0,
  Contract: "Month-to-month",
  InternetService: "Fiber optic",
  TechSupport: "No",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  StreamingTV: "Yes",
  StreamingMovies: "Yes",
  PhoneService: "Yes",
  MultipleLines: "No",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  SeniorCitizen: 0,
  Partner: "No",
  Dependents: "No",
  gender: "Female",
};

const RISK_CONFIG = {
  High:   { color: "#ef4444", bg: "#450a0a", label: "⚠️ High Risk",   msg: "This customer is very likely to leave. Act now!" },
  Medium: { color: "#f59e0b", bg: "#451a03", label: "⚡ Medium Risk", msg: "This customer shows signs of dissatisfaction." },
  Low:    { color: "#22c55e", bg: "#052e16", label: "✅ Low Risk",    msg: "This customer is stable. Keep up the good work!" },
};

export default function ChurnForm() {
  const [form, setForm]     = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/predict/churn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? RISK_CONFIG[result.risk_level] : null;
  const pct  = result ? Math.round(result.churn_probability * 100) : 0;

  return (
    <div className="card-grid">
      {/* Form */}
      <div className="card">
        <div className="card-title">⚡ Customer Profile</div>
        <div className="form-grid">
          <Field label="Tenure (months)">
            <input type="number" value={form.tenure}
              onChange={e => set("tenure", +e.target.value)} />
          </Field>
          <Field label="Monthly Charges ($)">
            <input type="number" value={form.MonthlyCharges}
              onChange={e => set("MonthlyCharges", +e.target.value)} />
          </Field>
          <Field label="Total Charges ($)">
            <input type="number" value={form.TotalCharges}
              onChange={e => set("TotalCharges", +e.target.value)} />
          </Field>
          <Field label="Contract">
            <select value={form.Contract} onChange={e => set("Contract", e.target.value)}>
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </Field>
          <Field label="Internet Service">
            <select value={form.InternetService} onChange={e => set("InternetService", e.target.value)}>
              <option>Fiber optic</option>
              <option>DSL</option>
              <option>No</option>
            </select>
          </Field>
          <Field label="Payment Method">
            <select value={form.PaymentMethod} onChange={e => set("PaymentMethod", e.target.value)}>
              <option>Electronic check</option>
              <option>Mailed check</option>
              <option>Bank transfer (automatic)</option>
              <option>Credit card (automatic)</option>
            </select>
          </Field>
          <Field label="Tech Support">
            <select value={form.TechSupport} onChange={e => set("TechSupport", e.target.value)}>
              <option>No</option><option>Yes</option><option>No internet service</option>
            </select>
          </Field>
          <Field label="Online Security">
            <select value={form.OnlineSecurity} onChange={e => set("OnlineSecurity", e.target.value)}>
              <option>No</option><option>Yes</option><option>No internet service</option>
            </select>
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={e => set("gender", e.target.value)}>
              <option>Female</option><option>Male</option>
            </select>
          </Field>
          <Field label="Senior Citizen">
            <select value={form.SeniorCitizen} onChange={e => set("SeniorCitizen", +e.target.value)}>
              <option value={0}>No</option><option value={1}>Yes</option>
            </select>
          </Field>
          <Field label="Partner">
            <select value={form.Partner} onChange={e => set("Partner", e.target.value)}>
              <option>No</option><option>Yes</option>
            </select>
          </Field>
          <Field label="Streaming TV">
            <select value={form.StreamingTV} onChange={e => set("StreamingTV", e.target.value)}>
              <option>Yes</option><option>No</option><option>No internet service</option>
            </select>
          </Field>
        </div>
        <button className="btn-primary" onClick={predict} disabled={loading}>
          {loading ? <><span className="spinner" /> Analyzing...</> : "Predict Churn →"}
        </button>
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {/* Result */}
      <div className="card result-card">
        <div className="card-title">📊 Prediction Result</div>
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>Fill in the customer profile and click <b>Predict Churn</b></p>
          </div>
        )}
        {loading && (
          <div className="empty-state">
            <div className="loading-ring" />
            <p>Analyzing customer data...</p>
          </div>
        )}
        {result && (
          <div className="result-inner">
            {/* Gauge */}
            <div className="gauge-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%" cy="100%"
                  innerRadius="80%" outerRadius="100%"
                  startAngle={180} endAngle={0}
                  data={[{ value: pct, fill: risk.color }]}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#1e293b" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-value" style={{ color: risk.color }}>{pct}%</div>
              <div className="gauge-label">Churn Probability</div>
            </div>

            {/* Risk badge */}
            <div className="risk-badge" style={{ background: risk.bg, borderColor: risk.color, color: risk.color }}>
              {risk.label}
            </div>
            <p className="risk-msg">{risk.msg}</p>

            {/* Stats */}
            <div className="stats-row">
              <div className="stat">
                <div className="stat-val">{pct}%</div>
                <div className="stat-key">Probability</div>
              </div>
              <div className="stat">
                <div className="stat-val" style={{ color: risk.color }}>{result.risk_level}</div>
                <div className="stat-key">Risk Level</div>
              </div>
              <div className="stat">
                <div className="stat-val">{result.will_churn ? "Yes" : "No"}</div>
                <div className="stat-key">Will Churn</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
