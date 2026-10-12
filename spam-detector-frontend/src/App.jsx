import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDetect() {
    if (!message.trim()) {
      setError("Please enter a message first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Could not analyse the message.");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(
        "Unable to connect to the backend. Make sure your FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessage("");
    setResult(null);
    setError("");
  }

  return (
    <main className="page">
      <header className="header">
        <div className="logo">S</div>
        <span>SpamGuard</span>
        <span className="status">
          <span className="status-dot"></span>
          ML CLASSIFIER
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">INTELLIGENT MESSAGE ANALYSIS</p>

        <h1>
          Spot spam.
          <br />
          <span>Stay protected.</span>
        </h1>

        <p className="subtitle">
          Paste any message and let our machine learning model analyse it.
        </p>

        <div className="detector">
          <div className="input-heading">
            <label htmlFor="message">YOUR MESSAGE</label>
            <span>{message.length} characters</span>
          </div>

          <textarea
            id="message"
            placeholder="Paste your suspicious message here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError("");
            }}
            maxLength={10000}
          />

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button
              className="clear-button"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>

            <button
              className="detect-button"
              onClick={handleDetect}
              disabled={loading || !message.trim()}
            >
              {loading ? "Analysing..." : "Detect spam →"}
            </button>
          </div>
        </div>

        {result && (
          <section
            className={`result ${
              result.prediction === "spam" ? "spam" : "ham"
            }`}
            aria-live="polite"
          >
            <p className="result-label">ANALYSIS RESULT</p>

            <h2>
              {result.prediction === "spam"
                ? "Potential spam detected"
                : "Likely legitimate"}
            </h2>

            <p className="result-description">
              {result.prediction === "spam"
                ? "Our model classified this message as spam."
                : "Our model classified this message as legitimate."}
            </p>

            <div className="probability">
              <div className="probability-heading">
                <span>Estimated spam probability</span>
                <strong>
                  {(result.spam_probability * 100).toFixed(1)}%
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${result.spam_probability * 100}%`,
                  }}
                />
              </div>
            </div>

            <p className="disclaimer">
              This is a machine learning prediction, not a guarantee.
            </p>
          </section>
        )}

        <p className="footer-note">
          Powered by TF-IDF and Multinomial Naive Bayes
        </p>
      </section>
    </main>
  );
}

export default App;