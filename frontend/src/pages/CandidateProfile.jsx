import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/candidate_profile.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function CandidateProfile() {
  const { candidate_id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/candidate/${candidate_id}`)
      .then(res => setCandidate(res.data))
      .catch(err => console.error("Error fetching candidate:", err));
  }, [candidate_id]);

  if (!candidate) return <div className="loading">Loading candidate profile...</div>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="candidate-profile-card">
        <div className="profile-header">
          <h1>{candidate.name}</h1>
          <p className="party-name">{candidate.party_name}</p>
        </div>

        <div className="profile-section">
          <h3>📋 Basic Information</h3>
          <p><strong>Candidate ID:</strong> {candidate.candidate_id}</p>
          <p><strong>Age:</strong> {candidate.age || "Not specified"}</p>
          <p><strong>Status:</strong> {candidate.approved ? "✅ Approved Candidate" : "⏳ Pending Approval"}</p>
        </div>

        <div className="profile-section">
          <h3>🎓 Education</h3>
          <p>{candidate.education || "Not specified"}</p>
        </div>

        <div className="profile-section">
          <h3>💼 Experience</h3>
          <p>{candidate.experience || "Not specified"}</p>
        </div>

        <div className="profile-section">
          <h3>📖 Background</h3>
          <p>{candidate.background || "Not specified"}</p>
        </div>

        <div className="profile-section">
          <h3>📊 Current Votes</h3>
          <p className="vote-count">{candidate.votes}</p>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
