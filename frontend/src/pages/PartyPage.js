import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/party.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function PartyPage() {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("partyInfo");
    if (stored) {
      const { party_id } = JSON.parse(stored);

      // axios.get(`http://localhost:5000/party/${party_id}`)
      axios.get(`${API_BASE}/party/${party_id}`)
        .then((res) => {
          setParty(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching party info:", err);
          setParty(null);
          setLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("partyInfo");
    navigate("/");
  };

  // const handleEdit = () => {
  //   navigate("/edit-candidates");
  // };

  if (loading) return <div>Loading party info...</div>;
  if (!party) return <div>Party not found or error loading data.</div>;

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🏛️</span>
          <h1 className="navbar-title">Party Dashboard</h1>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          <span className="btn-icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome, {party.name}! 🎉</h1>
            <p className="welcome-subtitle">Manage your party and view your candidates</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{party.candidates?.length || 0}</div>
              <div className="stat-label">Total Candidates</div>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">
                {party.candidates?.filter(c => c.approved).length || 0}
              </div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">
                {party.candidates?.filter(c => !c.approved).length || 0}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="title-icon">🏛️</span>
              Party Information
            </h2>
          </div>
          <div className="profile-body">
            <div className="party-info-section">
              <div className="party-logo">
                {party.name.charAt(0)}
              </div>
              <div className="party-details">
                <h3 className="party-name">{party.name}</h3>
                <p className="party-id">Party ID: {party.party_id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="candidates-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="title-icon">👥</span>
              Our Candidates ({party.candidates?.length || 0})
            </h2>
          </div>
          <div className="candidates-body">
            {party.candidates && party.candidates.length > 0 ? (
              <div className="candidates-grid">
                {party.candidates.map((candidate) => (
                  <div key={candidate.candidate_id} className="candidate-card">
                    <div className="candidate-avatar">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="candidate-info">
                      <h4 className="candidate-name">{candidate.name}</h4>
                      <p className="candidate-id">ID: {candidate.candidate_id}</p>
                      <p className="candidate-constituency">
                        <span className="constituency-icon">🏛️</span>
                        {candidate.constituency}
                      </p>
                      <span className={`candidate-status ${candidate.approved ? 'approved' : 'pending'}`}>
                        {candidate.approved ? "✅ Approved" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No candidates registered yet</p>
                <p className="empty-subtext">Candidates will appear here once they register</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartyPage;
