import { useState } from "react";
import ChurnForm from "./components/ChurnForm";
import SentimentForm from "./components/SentimentForm";
import RecoForm from "./components/RecoForm";
import "./App.css";

const TABS = [
  { id: "churn",     label: "Churn Prediction",   icon: "⚡" },
  { id: "sentiment", label: "Sentiment Analysis",  icon: "💬" },
  { id: "reco",      label: "Recommendations",     icon: "🎯" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("churn");

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">📡</span>
            <div>
              <div className="logo-title">TeleRetain</div>
              <div className="logo-sub">AI Retention Dashboard</div>
            </div>
          </div>
          <div className="status-bar">
            <span className="status-dot" />
            <span className="status-text">2 APIs Online</span>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === "churn"     && <ChurnForm />}
        {activeTab === "sentiment" && <SentimentForm />}
        {activeTab === "reco"      && <RecoForm />}
      </main>

      <footer className="footer">
        Powered by HuggingFace Spaces · Telecom Retention System
      </footer>
    </div>
  );
}
