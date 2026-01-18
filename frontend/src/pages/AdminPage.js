// src/pages/AdminPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal"; 
import "../styles/admin_page.css";

// ✅ API base set using env var if present, else default to localhost
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function AdminPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalError, setModalError] = useState("");
  
  // Verification section states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationTab, setVerificationTab] = useState("voters"); // voters, candidates, parties
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const resetVotes = async () => {
    setLoading(true);
    setMessage("");
    try {
      // await axios.post("http://localhost:5000/admin/reset-votes");
      await axios.post(`${API_BASE}/admin/reset-votes`);
      setMessage("✅ All votes have been reset successfully.");
    } catch (err) {
      setMessage("❌ Failed to reset votes.");
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    setLoading(true);
    setMessage("");
    try {
      // await axios.post("http://localhost:5000/admin/publish-results");
      await axios.post(`${API_BASE}/admin/publish-results`);
      setMessage("✅ Results published successfully. Redirecting...");
      setTimeout(() => {
        window.location.href = "/results";
      }, 1500);
    } catch (err) {
      setMessage("❌ Failed to publish results.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminInfo");
    window.location.href = "/";
  };

  // ============================================
  // VERIFICATION SECTION FUNCTIONS
  // ============================================

  const fetchVerificationData = async (tab) => {
    setVerificationLoading(true);
    try {
      if (tab === "voters") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/voters`);
        setVoters(response.data.voters || []);
      } else if (tab === "candidates") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/candidates`);
        setCandidates(response.data.candidates || []);
      } else if (tab === "parties") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/parties`);
        setParties(response.data.parties || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setMessage("❌ Failed to fetch data");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setVerificationTab(tab);
    setSelectedProfile(null);
    fetchVerificationData(tab);
  };

  const viewProfile = (profile, type) => {
    setSelectedProfile({ ...profile, type });
  };

  const verifyUser = async (userId, userType) => {
    setVerificationLoading(true);
    try {
      let endpoint = "";
      if (userType === "voter") {
        endpoint = `/admin/verify/voter/${userId}`;
      } else if (userType === "candidate") {
        endpoint = `/admin/verify/candidate/${userId}`;
      } else if (userType === "party") {
        endpoint = `/admin/verify/party/${userId}`;
      }

      await axios.put(`${API_BASE}${endpoint}`, { is_verified: true });
      setMessage(`✅ ${userType.charAt(0).toUpperCase() + userType.slice(1)} verified successfully!`);
      
      // Refresh the data
      fetchVerificationData(verificationTab);
      setSelectedProfile(null);
    } catch (err) {
      console.error("Error verifying user:", err);
      setMessage(`❌ Failed to verify ${userType}`);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setFormData({});
    setMessage("");
    setModalError(""); // clear modal errors on open
  };

  const handleModalClose = () => {
    setModalType(null);
    setFormData({});
    setModalError("");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModalSubmit = async () => {
    const endpoints = {
      voter: "add-voter",
      candidate: "add-candidate",
      party: "add-party",
      constituency: "add-constituency"
    };

    const requiredFields = {
      voter: ["voter_id", "first_name", "last_name", "password", "constituency"],
      candidate: ["candidate_id", "name", "party_id", "constituency"],
      party: ["party_id", "name", "password"],
      constituency: ["constituency_id", "name", "password"]
    };

    const missingFields = requiredFields[modalType].filter(
      (field) => !formData[field]
    );

    if (missingFields.length) {
      setModalError(`Please fill all fields. Missing: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    setMessage("");
    setModalError("");
    try {
      // await axios.post(`http://localhost:5000/admin/${endpoints[modalType]}`, formData);
      await axios.post(`${API_BASE}/admin/${endpoints[modalType]}`, formData);
      setMessage(`✅ ${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully.`);
      handleModalClose();
    } catch (err) {
      setModalError(`❌ Failed to add ${modalType}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="button-container">
        <button onClick={resetVotes} disabled={loading} className="admin-button">Reset All Votes</button>
        <button onClick={publishResults} disabled={loading} className="admin-button">Publish Results</button>
        <button onClick={() => handleModalOpen("voter")} className="admin-button">Add Voter</button>
        <button onClick={() => handleModalOpen("party")} className="admin-button">Add Party</button>
        <button onClick={() => handleModalOpen("candidate")} className="admin-button">Add Candidate</button>
        <button onClick={() => handleModalOpen("constituency")} className="admin-button">Add Constituency</button>
        <button onClick={() => setShowVerification(!showVerification)} className="admin-button verify-button">
          {showVerification ? "Hide Verification" : "View & Verify Users"}
        </button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      {/* ============================================
          VERIFICATION SECTION
          ============================================ */}
      {showVerification && (
        <div className="verification-section">
          <h2 className="verification-title">👁️ User Verification & Insights</h2>
          
          {/* Tab Navigation */}
          <div className="verification-tabs">
            <button 
              className={`tab-button ${verificationTab === "voters" ? "active" : ""}`}
              onClick={() => handleTabChange("voters")}
            >
              👥 Voters
            </button>
            <button 
              className={`tab-button ${verificationTab === "candidates" ? "active" : ""}`}
              onClick={() => handleTabChange("candidates")}
            >
              🎤 Candidates
            </button>
            <button 
              className={`tab-button ${verificationTab === "parties" ? "active" : ""}`}
              onClick={() => handleTabChange("parties")}
            >
              🏛️ Parties
            </button>
          </div>

          {/* Loading State */}
          {verificationLoading && <p className="loading-text">Loading data...</p>}

          {/* Voters Tab */}
          {verificationTab === "voters" && !verificationLoading && (
            <div className="users-list">
              <h3 className="users-count">Total Voters: {voters.length}</h3>
              <div className="users-grid">
                {voters.map((voter) => (
                  <div key={voter.voter_id} className={`user-card ${voter.is_verified ? "verified" : "pending"}`}>
                    <div className="user-header">
                      <h4>{voter.full_name}</h4>
                      <span className={`verification-badge ${voter.is_verified ? "verified" : "pending"}`}>
                        {voter.is_verified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </div>
                    <div className="user-info">
                      <p><strong>ID:</strong> {voter.voter_id}</p>
                      <p><strong>Email:</strong> {voter.email || "N/A"}</p>
                      <p><strong>Gmail:</strong> {voter.gmail_id || "N/A"}</p>
                      <p><strong>Phone:</strong> {voter.phone}</p>
                      <p><strong>Constituency:</strong> {voter.constituency_name}</p>
                      <p><strong>Status:</strong> {voter.status}</p>
                      <p><strong>Voted:</strong> {voter.has_voted ? "Yes" : "No"}</p>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="view-btn"
                        onClick={() => viewProfile(voter, "voter")}
                      >
                        View Profile
                      </button>
                      {!voter.is_verified && (
                        <button 
                          className="verify-btn"
                          onClick={() => verifyUser(voter.voter_id, "voter")}
                          disabled={verificationLoading}
                        >
                          ✅ Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Candidates Tab */}
          {verificationTab === "candidates" && !verificationLoading && (
            <div className="users-list">
              <h3 className="users-count">Total Candidates: {candidates.length}</h3>
              <div className="users-grid">
                {candidates.map((candidate) => (
                  <div key={candidate.candidate_id} className={`user-card ${candidate.is_verified ? "verified" : "pending"}`}>
                    <div className="user-header">
                      <h4>{candidate.name}</h4>
                      <span className={`verification-badge ${candidate.is_verified ? "verified" : "pending"}`}>
                        {candidate.is_verified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </div>
                    <div className="user-info">
                      <p><strong>ID:</strong> {candidate.candidate_id}</p>
                      <p><strong>Party:</strong> {candidate.party_name} {candidate.party_symbol}</p>
                      <p><strong>Constituency:</strong> {candidate.constituency_name}</p>
                      <p><strong>Email:</strong> {candidate.email || "N/A"}</p>
                      <p><strong>Gmail:</strong> {candidate.gmail_id || "N/A"}</p>
                      <p><strong>Education:</strong> {candidate.education}</p>
                      <p><strong>Votes:</strong> {candidate.votes}</p>
                      <p><strong>Status:</strong> {candidate.status}</p>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="view-btn"
                        onClick={() => viewProfile(candidate, "candidate")}
                      >
                        View Profile
                      </button>
                      {!candidate.is_verified && (
                        <button 
                          className="verify-btn"
                          onClick={() => verifyUser(candidate.candidate_id, "candidate")}
                          disabled={verificationLoading}
                        >
                          ✅ Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parties Tab */}
          {verificationTab === "parties" && !verificationLoading && (
            <div className="users-list">
              <h3 className="users-count">Total Parties: {parties.length}</h3>
              <div className="users-grid">
                {parties.map((party) => (
                  <div key={party.party_id} className={`user-card ${party.is_verified ? "verified" : "pending"}`}>
                    <div className="user

export default AdminPage;
