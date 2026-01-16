import React, { useState } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import VerificationSection from "../components/VerificationSection";
import "../styles/admin_page.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * AdminPage Component
 * Main admin dashboard with voting controls and user verification
 */
function AdminPage() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalError, setModalError] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const handleMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const resetVotes = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/admin/reset-votes`);
      handleMessage("✅ All votes have been reset successfully.", "success");
    } catch (err) {
      handleMessage("❌ Failed to reset votes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/admin/publish-results`);
      handleMessage("✅ Results published successfully. Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/results";
      }, 1500);
    } catch (err) {
      handleMessage("❌ Failed to publish results.", "error");
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
    setModalError("");
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
      constituency: "add-constituency",
    };

    const requiredFields = {
      voter: ["voter_id", "first_name", "last_name", "password", "constituency"],
      candidate: ["candidate_id", "name", "party_id", "constituency"],
      party: ["party_id", "name", "password"],
      constituency: ["constituency_id", "name", "password"],
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
      await axios.post(`${API_BASE}/admin/${endpoints[modalType]}`, formData);
      handleMessage(
        `✅ ${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully.`,
        "success"
      );
      handleModalClose();
    } catch (err) {
      setModalError(`❌ Failed to add ${modalType}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">🗳️ Admin Dashboard</h1>

        {/* Main Controls */}
        <div className="button-container">
          <button
            onClick={resetVotes}
            disabled={loading}
            className="admin-button btn-reset"
          >
            🔄 Reset All Votes
          </button>
          <button
            onClick={publishResults}
            disabled={loading}
            className="admin-button btn-publish"
          >
            📊 Publish Results
          </button>
          <button
            onClick={() => handleModalOpen("voter")}
            className="admin-button btn-add"
          >
            ➕ Add Voter
          </button>
          <button
            onClick={() => handleModalOpen("party")}
            className="admin-button btn-add"
          >
            ➕ Add Party
          </button>
          <button
            onClick={() => handleModalOpen("candidate")}
            className="admin-button btn-add"
          >
            ➕ Add Candidate
          </button>
          <button
            onClick={() => handleModalOpen("constituency")}
            className="admin-button btn-add"
          >
            ➕ Add Constituency
          </button>
          <button
            onClick={() => setShowVerification(!showVerification)}
            className="admin-button btn-verify"
          >
            {showVerification ? "👁️ Hide Verification" : "👁️ View & Verify Users"}
          </button>
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`admin-message message-${messageType}`}>
            {message}
          </div>
        )}

        {/* Modal */}
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

      {/* Verification Section */}
      {showVerification && (
        <div className="admin-container verification-container">
          <VerificationSection onMessage={handleMessage} />
        </div>
      )}
    </div>
  );
}

export default AdminPage;
