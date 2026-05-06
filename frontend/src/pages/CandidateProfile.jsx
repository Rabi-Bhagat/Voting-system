import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { User, Award, BookOpen, Briefcase, BarChart3, ArrowLeft, ShieldCheck } from 'lucide-react';
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

  if (!candidate) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading candidate profile...</p>
    </div>
  );

  return (
    <div className="profile-page-wrapper">
      <div className="profile-background">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <div className="profile-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back to Ballot
        </button>

        <div className="profile-glass-card">
          <div className="profile-hero">
            <div className="hero-avatar">
              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hero-content">
              <h1>{candidate.name}</h1>
              <div className="party-badge-large">{candidate.party_name}</div>
              {candidate.approved && (
                <div className="verified-badge">
                  <ShieldCheck size={16} /> Verified Candidate
                </div>
              )}
            </div>
          </div>

          <div className="profile-sections-grid">
            <div className="section-card">
              <div className="section-header">
                <User size={20} className="section-icon" />
                <h3>Personal Info</h3>
              </div>
              <div className="section-body">
                <div className="info-item">
                  <span className="label">Candidate ID</span>
                  <span className="value">{candidate.candidate_id}</span>
                </div>
                <div className="info-item">
                  <span className="label">Age</span>
                  <span className="value">{candidate.age || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Constituency</span>
                  <span className="value">{candidate.constituency}</span>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <BookOpen size={20} className="section-icon" />
                <h3>Education</h3>
              </div>
              <div className="section-body">
                <p>{candidate.education || "Educational background not provided."}</p>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <Briefcase size={20} className="section-icon" />
                <h3>Experience</h3>
              </div>
              <div className="section-body">
                <p>{candidate.experience || "Professional and political experience not provided."}</p>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <Award size={20} className="section-icon" />
                <h3>Vision & Background</h3>
              </div>
              <div className="section-body">
                <p>{candidate.background || "Candidate background and vision statement not provided."}</p>
              </div>
            </div>
          </div>

          <div className="stats-footer">
            <div className="stat-item">
              <BarChart3 size={24} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{candidate.votes || 0}</span>
                <span className="stat-label">Verified Votes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
