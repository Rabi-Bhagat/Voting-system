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
    </div>
  );
}

export default ResultsPage;
