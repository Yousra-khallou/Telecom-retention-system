import { useState } from "react";
import ChurnForm from "./components/ChurnForm";
import SentimentForm from "./components/SentimentForm";
import RecoForm from "./components/RecoForm";
import "./App.css";

const STEPS = [
  { id: "churn",     label: "Churn",      icon: "⚡", desc: "Predict risk" },
  { id: "sentiment", label: "Sentiment",  icon: "💬", desc: "Analyze review" },
  { id: "reco",      label: "Recommend",  icon: "🎯", desc: "Get offers" },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [key, setKey]   = useState(0);
  const [churnScore, setChurnScore] = useState(null);

  const goTo = (i) => { setStep(i); setKey(k => k + 1); };
  const next  = ()  => goTo(Math.min(step + 1, STEPS.length - 1));

  return (
    <div className="app">
      <div className="bg-mesh" />
      <div className="bg-grid" />

      <header className="header">
        <div className="logo">
          <div className="logo-icon">📡</div>
          <div>
            <div className="logo-title">TeleRetain</div>
            <div className="logo-sub">AI Retention System</div>
          </div>
        </div>
        <div className="status-pill">
          <span className="status-dot" />
          2 APIs Online
        </div>
      </header>

      {/* Step navigation */}
      <nav className="step-nav">
        {STEPS.map((s, i) => (
          <div key={s.id} className="step-item">
            <button
              className={`step-btn ${step === i ? "active" : ""} ${step > i ? "done" : ""}`}
              onClick={() => goTo(i)}
            >
              <div className="step-circle">
                {step > i ? "✓" : s.icon}
              </div>
              <span className="step-label">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`step-connector ${step > i ? "done" : ""}`} />
            )}
          </div>
        ))}
      </nav>

      <main className="main">
        <div key={key} className="page-enter">
          {step === 0 && <ChurnForm onNext={next} onChurnScore={setChurnScore} />}
          {step === 1 && <SentimentForm onNext={next} />}
          {step === 2 && <RecoForm initialChurnScore={churnScore} />}
        </div>
      </main>

      <footer className="footer">
        Powered by HuggingFace Spaces · TeleRetain Dashboard
      </footer>
    </div>
  );
}
