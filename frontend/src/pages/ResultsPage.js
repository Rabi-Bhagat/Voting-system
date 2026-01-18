// src/pages/ResultsPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/results_page.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [electionConducted, setElectionConducted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        // const statusRes = await axios.get("http://localhost:5000/admin/election-status");
        const statusRes = await axios.get(`${API_BASE}/admin/election-status`); 
        setElectionConducted(statusRes.data.conducted);
        const resultsPublished = statusRes.data.resultsPublished;

        if (statusRes.data.conducted && resultsPublished) {
          // const res = await axios.get("http://localhost:5000/admin/results");
          const res = await axios.get(`${API_BASE}/admin/results`);
          setResults(res.data);
        }
      } catch (err) {
        setError("⚠️ Failed to fetch results or status.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="results-container"><p>Loading results...</p></div>;
  if (error) return <div className="results-container"><p className="error">{error}</p></div>;

  return (
<<<<<<< HEAD
    <div className="results-container">
      <h1 className="text-center my-4 mt-2">ONLINE VOTING MANAGEMENT SYSTEM</h1>
      <h2 className="results-title">ELECTION RESULTS</h2>

      {!electionConducted ? (
        <div
          className="result-card"
          style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeeba", color: "#856404" }}
        >
          <p>🚫 No election has been conducted yet.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="result-card" style={{ backgroundColor: "#fff3cd", border: "1px solid #ffeeba", color: "#856404" }}>
          <p className="no-results">Results have not been published yet.</p>
        </div>
      ) : (
        results.map(({ constituency, candidates }) => {
          const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
          const winners = candidates.filter(c => c.isWinner && c.votes > 0);

          return (
            <div key={constituency.id}>
              <h3>{constituency.name}</h3>
              {totalVotes === 0 ? (
                <div className="result-card no-votes">
                  🛑 No votes cast in this constituency.
                </div>
              ) : (
                <>
                  {winners.length > 1 && (
                    <div className="draw-info">⚖️ It's a draw between the following candidates:</div>
                  )}
                  {candidates.map((c, index) => (
                    <div
                      key={index}
                      className={`result-card ${
                        c.isWinner
                          ? (winners.length > 1 ? "draw-card" : "winner-card")
                          : "loser-card"
                      }`}
                    >
                      <p>
                        {c.isWinner
                          ? winners.length > 1
                            ? "🤝 Draw: "
                            : "🏆 Winner: "
                          : "Participant: "}
                        <strong>{c.name}</strong> ({c.party_name}) - Votes: {c.votes}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })
      )}

      <button className="back-button" onClick={handleBack}>← Back</button>
=======
    <div className="results-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">📊</span>
          <h1 className="navbar-title">Election Results</h1>
        </div>
        <button className="btn btn-back" onClick={handleBack}>
          <span className="btn-icon">←</span>
          Back
        </button>
      </nav>

      <div className="results-container">
        <div className="results-header">
          <h1 className="results-main-title">ONLINE VOTING MANAGEMENT SYSTEM</h1>
          <h2 className="results-subtitle">Official Election Results</h2>
        </div>

        {!electionConducted ? (
          <div className="alert-card alert-warning">
            <div className="alert-icon">🚫</div>
            <div className="alert-content">
              <h3 className="alert-title">No Election Conducted</h3>
              <p className="alert-text">No election has been conducted yet. Please check back later.</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="alert-card alert-info">
            <div className="alert-icon">⏳</div>
            <div className="alert-content">
              <h3 className="alert-title">Results Pending</h3>
              <p className="alert-text">Results have not been published yet. Please wait for the official announcement.</p>
            </div>
          </div>
        ) : (
          <div className="constituencies-grid">
            {results.map(({ constituency, candidates }) => {
              const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
              const winners = candidates.filter(c => c.isWinner && c.votes > 0);

              return (
                <div key={constituency.id} className="constituency-card">
                  <div className="constituency-header">
                    <h3 className="constituency-name">
                      <span className="constituency-icon">🏛️</span>
                      {constituency.name}
                    </h3>
                    <div className="total-votes">
                      <span className="votes-label">Total Votes:</span>
                      <span className="votes-count">{totalVotes}</span>
                    </div>
                  </div>

                  <div className="constituency-body">
                    {totalVotes === 0 ? (
                      <div className="no-votes-card">
                        <div className="no-votes-icon">🛑</div>
                        <p className="no-votes-text">No votes cast in this constituency</p>
                      </div>
                    ) : (
                      <>
                        {winners.length > 1 && (
                          <div className="draw-banner">
                            <span className="draw-icon">⚖️</span>
                            It's a draw between the following candidates
                          </div>
                        )}
                        <div className="candidates-results">
                          {candidates.map((c, index) => {
                            const votePercentage = totalVotes > 0 
                              ? ((c.votes / totalVotes) * 100).toFixed(1) 
                              : 0;

                            return (
                              <div
                                key={index}
                                className={`candidate-result-card ${
                                  c.isWinner
                                    ? (winners.length > 1 ? "draw" : "winner")
                                    : "participant"
                                }`}
                              >
                                <div className="result-badge">
                                  {c.isWinner
                                    ? winners.length > 1
                                      ? "🤝"
                                      : "🏆"
                                    : "👤"}
                                </div>
                                <div className="candidate-result-info">
                                  <h4 className="candidate-result-name">{c.name}</h4>
                                  <p className="candidate-result-party">{c.party_name}</p>
                                  <div className="votes-info">
                                    <span className="votes-number">{c.votes} votes</span>
                                    <span className="votes-percentage">({votePercentage}%)</span>
                                  </div>
                                  <div className="vote-bar">
                                    <div 
                                      className="vote-bar-fill" 
                                      style={{ width: `${votePercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
    </div>
  );
}

export default ResultsPage;
