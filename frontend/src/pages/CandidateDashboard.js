import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/candidate_dashboard.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [voters, setVoters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("candidateInfo");
    if (stored) {
      const { candidate_id } = JSON.parse(stored);

      // Fetch candidate profile
      axios.get(`${API_BASE}/candidate/${candidate_id}`)
        .then(res => setCandidate(res.data))
        .catch(() => setCandidate(null));

      // Fetch voters list
      axios.get(`${API_BASE}/candidate/voters/list`)
        .then(res => setVoters(res.data))
        .catch(err => console.error("Error fetching voters:", err));
    }
  }, []);

  if (!candidate) return <div className="loading">Loading candidate info...</div>;

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-light justify-content-between">
        <h1 className="navbar-title">Candidate Dashboard</h1>
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.removeItem("candidateInfo");
            navigate("/");
          }}
        >
          Logout
        </button>
      </nav>

      <h1 className="welcome-title mt-4">Welcome, {candidate.name}!</h1>

      {/* Candidate Profile */}
      <div className="profile-container mt-4 p-3 bg-white rounded shadow">
        <h3>Your Profile</h3>
        <p><strong>Candidate ID:</strong> {candidate.candidate_id}</p>
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Party:</strong> {candidate.party_name}</p>
        <p><strong>Age:</strong> {candidate.age || "Not specified"}</p>
        <p><strong>Education:</strong> {candidate.education || "Not specified"}</p>
        <p><strong>Experience:</strong> {candidate.experience || "Not specified"}</p>
        <p><strong>Background:</strong> {candidate.background || "Not specified"}</p>
        <p><strong>Status:</strong> {candidate.approved ? "✅ Approved" : "⏳ Pending Approval"}</p>
        <p><strong>Votes:</strong> {candidate.votes}</p>
        
        <button
          className="btn btn-primary mt-2"
          onClick={() => navigate("/edit-candidate-profile")}
        >
          Edit Profile
        </button>
      </div>

      {/* Registered Voters List */}
      <div className="mt-5">
        <h3 className="text-white">Registered Voters ({voters.length})</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-striped mt-3 bg-white">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Voter ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Has Voted</th>
              </tr>
            </thead>
            <tbody>
              {voters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No voters registered yet</td>
                </tr>
              ) : (
                voters.map((voter, index) => (
                  <tr key={voter.voter_id}>
                    <td>{index + 1}</td>
                    <td>{voter.voter_id}</td>
                    <td>{voter.first_name} {voter.last_name}</td>
                    <td>{voter.phone || "N/A"}</td>
                    <td>{voter.has_voted ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;
