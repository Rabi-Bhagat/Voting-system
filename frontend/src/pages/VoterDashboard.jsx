// src/pages/VoterDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/voter_dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function VoterDashboard() {
  const [voter, setVoter] = useState(null);
  const [stats, setStats] = useState({ totalVoters: 0, votedCount: 0 });
  const navigate = useNavigate(); 

  useEffect(() => {
    const stored = localStorage.getItem("voterInfo");
    if (stored) {
      const { voter_id } = JSON.parse(stored);

      axios.get(`${API_BASE}/voter/${voter_id}`)
        .then(res => setVoter(res.data))
        .catch(() => setVoter(null));

      // Fetch voting statistics
      axios.get(`${API_BASE}/admin/election-status`)
        .then(res => {
          if (res.data) {
            setStats({
              totalVoters: res.data.totalVoters || 0,
              votedCount: res.data.votedCount || 0
            });
          }
        })
        .catch(err => console.log("Stats not available"));
    }
  }, []);

  if (!voter) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  const votingPercentage = stats.totalVoters > 0 
    ? ((stats.votedCount / stats.totalVoters) * 100).toFixed(1) 
    : 0;

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🗳️</span>
          <h1 className="navbar-title">Online Voting System</h1>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("voterInfo");
            navigate("/"); 
          }}
        >
          <span className="btn-icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome Back, {voter.first_name}! 👋</h1>
            <p className="welcome-subtitle">Your voice matters. Make it count in shaping our future!</p>
          </div>
          <div className="welcome-decoration">
            <div className="decoration-circle"></div>
            <div className="decoration-circle"></div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalVoters}</div>
              <div className="stat-label">Registered Voters</div>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.votedCount}</div>
              <div className="stat-label">Votes Cast</div>
            </div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{votingPercentage}%</div>
              <div className="stat-label">Turnout Rate</div>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">{voter.has_voted ? "✓" : "⏳"}</div>
            <div className="stat-content">
              <div className="stat-value">{voter.has_voted ? "Voted" : "Pending"}</div>
              <div className="stat-label">Your Status</div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="title-icon">👤</span>
                Your Profile
              </h2>
            </div>
            <div className="profile-body">
              <div className="profile-avatar-section">
                <div className="avatar-wrapper">
                  <img
                    src="https://cdn.jsdelivr.net/npm/bootstrap-icons/icons/person-circle.svg"
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <div className="avatar-badge">{voter.has_voted ? "✓" : "!"}</div>
                </div>
                <div className="avatar-info">
                  <h3 className="voter-name">{voter.first_name} {voter.last_name}</h3>
                  <p className="voter-id">ID: {voter.voter_id}</p>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon">🏛️</div>
                  <div className="info-details">
                    <div className="info-label">Constituency</div>
                    <div className="info-value">
                      {voter.constituency ? (voter.constituency.name || voter.constituency) : "Not assigned"}
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">📱</div>
                  <div className="info-details">
                    <div className="info-label">Phone Number</div>
                    <div className="info-value">{voter.phone || "Not provided"}</div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <div className="info-details">
                    <div className="info-label">Address</div>
                    <div className="info-value">{voter.address || "Not provided"}</div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">🎯</div>
                  <div className="info-details">
                    <div className="info-label">Voting Status</div>
                    <div className="info-value">
                      <span className={voter.has_voted ? "status-voted" : "status-pending"}>
                        {voter.has_voted ? "✅ Voted" : "⏳ Not Voted"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className="btn btn-edit"
                  onClick={() => navigate("/edit-profile")}
                >
                  <span className="btn-icon">✏️</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="voting-card">
            <div className="voting-card-inner">
              <div className="voting-icon-large">🗳️</div>
              <h2 className="voting-title">Cast Your Vote</h2>
              <p className="voting-description">
                {voter.has_voted 
                  ? "Thank you for participating! You have successfully cast your vote." 
                  : "Ready to make your voice heard? Click below to view candidates and cast your vote."}
              </p>
              <div className="voting-status-badge">
                {voter.has_voted ? (
                  <span className="badge-success">✓ Vote Recorded</span>
                ) : (
                  <span className="badge-pending">⏳ Vote Pending</span>
                )}
              </div>
              <button
                className={`btn btn-vote ${voter.has_voted ? 'btn-disabled' : ''}`}
                onClick={() => navigate("/vote")}
                disabled={voter.has_voted}
              >
                {voter.has_voted ? (
                  <>
                    <span className="btn-icon">✓</span>
                    Already Voted
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🗳️</span>
                    Vote Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoterDashboard;
