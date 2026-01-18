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
<<<<<<< HEAD
  
  // Verification section states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationTab, setVerificationTab] = useState("voters"); // voters, candidates, parties
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
=======
  const [showManagement, setShowManagement] = useState(false);
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7

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

<<<<<<< HEAD
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
=======
  const fetchAllUsers = async () => {
    setLoading(true);
    setMessage("");
    try {
      console.log("Fetching all users from:", API_BASE);
      
      // Fetch voters
      const votersRes = await axios.get(`${API_BASE}/admin/voters`);
      console.log("Voters response:", votersRes.data);
      
      // Fetch candidates
      const candidatesRes = await axios.get(`${API_BASE}/admin/candidates`);
      console.log("Candidates response:", candidatesRes.data);
      
      // Fetch parties
      const partiesRes = await axios.get(`${API_BASE}/admin/all-parties`);
      console.log("Parties response:", partiesRes.data);
      
      setVoters(votersRes.data || []);
      setCandidates(candidatesRes.data || []);
      setParties(partiesRes.data || []);
      
      console.log("State updated - Voters:", votersRes.data.length, "Candidates:", candidatesRes.data.length, "Parties:", partiesRes.data.length);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      console.error("Error details:", err.response?.data || err.message);
      setMessage(`❌ Failed to load user data: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when management section is opened
  useEffect(() => {
    if (showManagement) {
      fetchAllUsers();
    }
  }, [showManagement]);

  const handleApproveCandidate = async (candidate_id) => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      const admin_username = adminInfo.username || "admin";
      await axios.post(`${API_BASE}/admin/approve-candidate`, { candidate_id, admin_username });
      setMessage("✅ Candidate approved successfully!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to approve candidate.");
    }
  };

  const handleRejectCandidate = async (candidate_id) => {
    try {
      await axios.post(`${API_BASE}/admin/reject-candidate`, { candidate_id });
      setMessage("✅ Candidate approval removed!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to reject candidate.");
    }
  };

  const handleDeleteVoter = async (voter_id) => {
    if (!window.confirm(`Are you sure you want to delete voter ${voter_id}?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/voter/${voter_id}`);
      setMessage("✅ Voter deleted successfully!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to delete voter.");
    }
  };

  const handleDeleteCandidate = async (candidate_id) => {
    if (!window.confirm(`Are you sure you want to delete candidate ${candidate_id}?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/candidate/${candidate_id}`);
      setMessage("✅ Candidate deleted successfully!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to delete candidate.");
    }
  };

  const handleDeleteParty = async (party_id) => {
    if (!window.confirm(`Are you sure you want to delete party ${party_id}?`)) return;
    try {
      await axios.delete(`${API_BASE}/admin/party/${party_id}`);
      setMessage("✅ Party deleted successfully!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to delete party.");
    }
  };

  const handleVerifyVoter = async (voter_id, verified) => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      const admin_username = adminInfo.username || "admin";
      await axios.post(`${API_BASE}/admin/verify-voter`, { voter_id, verified, admin_username });
      setMessage(verified ? "✅ Voter verified successfully!" : "✅ Voter verification removed!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to update voter verification.");
    }
  };

  const handleApproveParty = async (party_id) => {
    try {
      const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");
      const admin_username = adminInfo.username || "admin";
      await axios.post(`${API_BASE}/admin/approve-party`, { party_id, admin_username });
      setMessage("✅ Party approved successfully!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to approve party.");
    }
  };

  const handleRejectParty = async (party_id) => {
    try {
      await axios.post(`${API_BASE}/admin/reject-party`, { party_id });
      setMessage("✅ Party approval removed!");
      fetchAllUsers();
    } catch (err) {
      setMessage("❌ Failed to reject party.");
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
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
<<<<<<< HEAD
      voter: ["voter_id", "first_name", "last_name", "password", "constituency"],
      candidate: ["candidate_id", "name", "party_id", "constituency"],
      party: ["party_id", "name", "password"],
      constituency: ["constituency_id", "name", "password"]
=======
      voter: ["voter_id", "first_name", "last_name", "password", "phone", "address"],
      candidate: ["candidate_id", "name", "password", "party_id", "constituency"],
      party: ["party_id", "name", "password"]
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
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
<<<<<<< HEAD
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
=======
    <div className="dashboard-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">⚙️</span>
          <h1 className="navbar-title">Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          <span className="btn-icon">🚪</span>
          Logout
        </button>
      </nav>

      <div className="dashboard-container">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">Admin Control Panel 🛡️</h1>
            <p className="welcome-subtitle">Manage elections, voters, parties, and candidates</p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {!showManagement ? (
          <div className="actions-grid">
            <div className="action-card action-danger">
              <div className="action-icon">🔄</div>
              <h3 className="action-title">Reset Votes</h3>
              <p className="action-description">Clear all votes and restart the election</p>
              <button onClick={resetVotes} disabled={loading} className="btn btn-action">
                {loading ? "Processing..." : "Reset All Votes"}
              </button>
            </div>

            <div className="action-card action-success">
              <div className="action-icon">📊</div>
              <h3 className="action-title">Publish Results</h3>
              <p className="action-description">Make election results public</p>
              <button onClick={publishResults} disabled={loading} className="btn btn-action">
                {loading ? "Publishing..." : "Publish Results"}
              </button>
            </div>

            <div className="action-card action-primary">
              <div className="action-icon">👥</div>
              <h3 className="action-title">Add Voter</h3>
              <p className="action-description">Register a new voter in the system</p>
              <button onClick={() => handleModalOpen("voter")} className="btn btn-action">
                Add Voter
              </button>
            </div>

            <div className="action-card action-info">
              <div className="action-icon">🏛️</div>
              <h3 className="action-title">Add Party</h3>
              <p className="action-description">Register a new political party</p>
              <button onClick={() => handleModalOpen("party")} className="btn btn-action">
                Add Party
              </button>
            </div>

            <div className="action-card action-warning">
              <div className="action-icon">🎯</div>
              <h3 className="action-title">Add Candidate</h3>
              <p className="action-description">Register a new candidate</p>
              <button onClick={() => handleModalOpen("candidate")} className="btn btn-action">
                Add Candidate
              </button>
            </div>

            <div className="action-card action-manage">
              <div className="action-icon">⚙️</div>
              <h3 className="action-title">Manage Users</h3>
              <p className="action-description">View and manage all voters, candidates, and parties</p>
              <button 
                onClick={() => {
                  setShowManagement(true);
                  fetchAllUsers();
                }} 
                className="btn btn-action"
              >
                Manage Users
              </button>
            </div>
          </div>
        ) : (
          <div className="management-section">
            <div className="management-header">
              <h2 className="management-title">User Management</h2>
              <button 
                onClick={() => setShowManagement(false)} 
                className="btn btn-back-manage"
              >
                ← Back to Dashboard
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading user data...</p>
              </div>
            ) : (
              <>
            {/* Candidates Section */}
            <div className="management-card">
              <h3 className="section-title">
                <span className="section-icon">🎯</span>
                Candidates ({candidates.length})
              </h3>
              <div className="table-responsive">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Party ID</th>
                      <th>Party Name</th>
                      <th>Constituency ID</th>
                      <th>Constituency Name</th>
                      <th>Age</th>
                      <th>Education</th>
                      <th>Experience</th>
                      <th>Background</th>
                      <th>Status</th>
                      <th>Approved By</th>
                      <th>Approved At</th>
                      <th>Votes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan="15" className="empty-cell">No candidates found</td>
                      </tr>
                    ) : (
                      candidates.map((candidate) => (
                        <tr key={candidate.candidate_id}>
                          <td className="id-cell">{candidate.candidate_id}</td>
                          <td className="name-cell">{candidate.name}</td>
                          <td className="id-cell">{candidate.party_id || "N/A"}</td>
                          <td>{candidate.party_name || "N/A"}</td>
                          <td className="id-cell">{candidate.constituency || "N/A"}</td>
                          <td>{candidate.constituency_name || "N/A"}</td>
                          <td>{candidate.age || "N/A"}</td>
                          <td className="truncate-cell" title={candidate.education}>
                            {candidate.education ? 
                              (candidate.education.length > 40 ? 
                                candidate.education.substring(0, 40) + "..." : 
                                candidate.education) 
                              : "N/A"}
                          </td>
                          <td className="truncate-cell" title={candidate.experience}>
                            {candidate.experience ? 
                              (candidate.experience.length > 40 ? 
                                candidate.experience.substring(0, 40) + "..." : 
                                candidate.experience) 
                              : "N/A"}
                          </td>
                          <td className="truncate-cell" title={candidate.background}>
                            {candidate.background ? 
                              (candidate.background.length > 40 ? 
                                candidate.background.substring(0, 40) + "..." : 
                                candidate.background) 
                              : "N/A"}
                          </td>
                          <td>
                            <span className={`status-badge ${candidate.approved ? 'approved' : 'pending'}`}>
                              {candidate.approved ? "✅ Approved" : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="admin-cell">{candidate.approved_by || "N/A"}</td>
                          <td className="date-cell">
                            {candidate.approved_at ? 
                              new Date(candidate.approved_at).toLocaleDateString() + " " + 
                              new Date(candidate.approved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : "N/A"}
                          </td>
                          <td className="votes-cell">{candidate.votes}</td>
                          <td className="actions-cell">
                            {!candidate.approved ? (
                              <button 
                                onClick={() => handleApproveCandidate(candidate.candidate_id)}
                                className="btn-approve"
                                title="Approve candidate"
                              >
                                ✓
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRejectCandidate(candidate.candidate_id)}
                                className="btn-reject"
                                title="Revoke approval"
                              >
                                ✗
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteCandidate(candidate.candidate_id)}
                              className="btn-delete"
                              title="Delete candidate"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Voters Section */}
            <div className="management-card">
              <h3 className="section-title">
                <span className="section-icon">👥</span>
                Voters ({voters.length})
              </h3>
              <div className="table-responsive">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Voter ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Constituency ID</th>
                      <th>Verified</th>
                      <th>Verified By</th>
                      <th>Verified At</th>
                      <th>Has Voted</th>
                      <th>Voted For</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="empty-cell">No voters found</td>
                      </tr>
                    ) : (
                      voters.map((voter) => (
                        <tr key={voter.voter_id}>
                          <td className="id-cell">{voter.voter_id}</td>
                          <td className="name-cell">{voter.first_name}</td>
                          <td className="name-cell">{voter.last_name}</td>
                          <td>{voter.phone || "N/A"}</td>
                          <td className="truncate-cell" title={voter.address}>
                            {voter.address ? 
                              (voter.address.length > 30 ? 
                                voter.address.substring(0, 30) + "..." : 
                                voter.address) 
                              : "N/A"}
                          </td>
                          <td className="id-cell">{voter.constituency || "Not assigned"}</td>
                          <td>
                            <span className={`status-badge ${voter.verified !== false ? 'verified' : 'unverified'}`}>
                              {voter.verified !== false ? "✅ Official" : "⚠️ Unverified"}
                            </span>
                          </td>
                          <td className="admin-cell">{voter.verified_by || "N/A"}</td>
                          <td className="date-cell">
                            {voter.verified_at ? 
                              new Date(voter.verified_at).toLocaleDateString() + " " + 
                              new Date(voter.verified_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : "N/A"}
                          </td>
                          <td>
                            <span className={`status-badge ${voter.has_voted ? 'voted' : 'not-voted'}`}>
                              {voter.has_voted ? "✅ Yes" : "❌ No"}
                            </span>
                          </td>
                          <td className="id-cell">{voter.voted_candidate_id || "N/A"}</td>
                          <td className="actions-cell">
                            {voter.verified !== false ? (
                              <button 
                                onClick={() => handleVerifyVoter(voter.voter_id, false)}
                                className="btn-reject"
                                title="Mark as unverified"
                              >
                                ✗
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleVerifyVoter(voter.voter_id, true)}
                                className="btn-approve"
                                title="Mark as official"
                              >
                                ✓
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteVoter(voter.voter_id)}
                              className="btn-delete"
                              title="Delete voter"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parties Section */}
            <div className="management-card">
              <h3 className="section-title">
                <span className="section-icon">🏛️</span>
                Parties ({parties.length})
              </h3>
              <div className="table-responsive">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Party ID</th>
                      <th>Party Name</th>
                      <th>Status</th>
                      <th>Approved By</th>
                      <th>Approved At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-cell">No parties found</td>
                      </tr>
                    ) : (
                      parties.map((party) => (
                        <tr key={party.party_id}>
                          <td className="id-cell">{party.party_id}</td>
                          <td className="name-cell">{party.name}</td>
                          <td>
                            <span className={`status-badge ${party.approved !== false ? 'approved' : 'pending'}`}>
                              {party.approved !== false ? "✅ Approved" : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="admin-cell">{party.approved_by || "N/A"}</td>
                          <td className="date-cell">
                            {party.approved_at ? 
                              new Date(party.approved_at).toLocaleDateString() + " " + 
                              new Date(party.approved_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                              : "N/A"}
                          </td>
                          <td className="actions-cell">
                            {party.approved !== false ? (
                              <button 
                                onClick={() => handleRejectParty(party.party_id)}
                                className="btn-reject"
                                title="Revoke approval"
                              >
                                ✗
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleApproveParty(party.party_id)}
                                className="btn-approve"
                                title="Approve party"
                              >
                                ✓
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteParty(party.party_id)}
                              className="btn-delete"
                              title="Delete party"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>

      {modalType && (
        <Modal
          type={modalType}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onChange={handleInputChange}
          formData={formData}
          loading={loading}
          modalError={modalError}
        />
      )}
    </div>
  );
}
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7

export default AdminPage;
