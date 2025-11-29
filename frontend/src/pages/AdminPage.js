// src/pages/AdminPage.js
import React, { useState } from "react";
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
      voter: ["voter_id", "first_name", "last_name", "password", "phone", "address"],
      candidate: ["candidate_id", "name", "password", "party_id", "constituency"],
      party: ["party_id", "name", "password"]
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
        </div>
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

export default AdminPage;
