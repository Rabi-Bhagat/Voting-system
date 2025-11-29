import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/candidate_dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [voters, setVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("candidateInfo");
    if (stored) {
      const { candidate_id } = JSON.parse(stored);

      axios.get(`${API_BASE}/candidate/${candidate_id}`)
        .then(res => setCandidate(res.data))
        .catch(() => setCandidate(null));

      axios.get(`${API_BASE}/candidate/voters/list`)
        .then(res => setVoters(res.data))
        .catch(err => console.error("Error fetching voters:", err));
    }
  }, []);

  if (!candidate) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  const votedCount = voters.filter(v => v.has_voted).length;
  const votingPercentage = voters.length > 0 ? ((votedCount / voters.length) * 100).toFixed(1) : 0;

  const filteredVoters = voters.filter(voter =>
    voter.voter_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${voter.first_name} ${voter.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🎯</span>
          <h1 className="navbar-title">Candidate Dashboard</h1>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("candidateInfo");
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
            <h1 className="welcome-title">Welcome, {candidate.name}! 🎖️</h1>
            <p className="welcome-subtitle">Track your campaign progress and voter engagement</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">🗳️</div>
            <div className="stat-content">
              <div className="stat-value">{candidate.votes}</div>
              <div className="stat-label">Total Votes</div>
            </div>
          </div>
          <div className="stat-card stat-success">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{voters.length}</div>
              <div className="stat-label">Registered Voters</div>
            </div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{votedCount}</div>
              <div className="stat-label">Votes Cast</div>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{votingPercentage}%</div>
              <div className="stat-label">Turnout Rate</div>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="title-icon">👤</span>
              Your Profile
            </h2>
          </div>
          <div className="profile-body">
            <div className="profile-grid">
              <div className="profile-main">
                <div className="avatar-section">
                  <div className="avatar-wrapper">
                    <div className="candidate-avatar">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="avatar-badge">
                      {candidate.approved ? "✓" : "⏳"}
                    </div>
                  </div>
                  <div className="candidate-info">
                    <h3 className="candidate-name">{candidate.name}</h3>
                    <p className="candidate-party">{candidate.party_name}</p>
                    <span className={`status-badge ${candidate.approved ? 'status-approved' : 'status-pending'}`}>
                      {candidate.approved ? "✅ Approved" : "⏳ Pending Approval"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <div className="info-icon">🆔</div>
                  <div className="info-details">
                    <div className="info-label">Candidate ID</div>
                    <div className="info-value">{candidate.candidate_id}</div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">🎂</div>
                  <div className="info-details">
                    <div className="info-label">Age</div>
                    <div className="info-value">{candidate.age || "Not specified"}</div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">🎓</div>
                  <div className="info-details">
                    <div className="info-label">Education</div>
                    <div className="info-value">{candidate.education || "Not specified"}</div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">💼</div>
                  <div className="info-details">
                    <div className="info-label">Experience</div>
                    <div className="info-value">{candidate.experience || "Not specified"}</div>
                  </div>
                </div>
              </div>

              {candidate.background && (
                <div className="background-section">
                  <h4 className="section-title">📝 Background</h4>
                  <p className="background-text">{candidate.background}</p>
                </div>
              )}

              <div className="profile-actions">
                <button
                  className="btn btn-edit"
                  onClick={() => navigate("/edit-candidate-profile")}
                >
                  <span className="btn-icon">✏️</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="voters-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="title-icon">👥</span>
              Registered Voters ({filteredVoters.length})
            </h2>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search voters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="table-container">
            {filteredVoters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">No voters found</p>
              </div>
            ) : (
              <table className="voters-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Voter ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoters.map((voter, index) => (
                    <tr key={voter.voter_id}>
                      <td>{index + 1}</td>
                      <td className="voter-id">{voter.voter_id}</td>
                      <td className="voter-name">{voter.first_name} {voter.last_name}</td>
                      <td>{voter.phone || "N/A"}</td>
                      <td>
                        <span className={`vote-badge ${voter.has_voted ? 'voted' : 'not-voted'}`}>
                          {voter.has_voted ? "✅ Voted" : "⏳ Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
