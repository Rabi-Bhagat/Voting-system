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
      voter: ["voter_id", "first_name", "last_name", "password"],
      candidate: ["candidate_id", "name", "password", "party_id", "age", "education", "experience", "background"],
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
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="button-container">
        <button onClick={resetVotes} disabled={loading} className="admin-button">Reset All Votes</button>
        <button onClick={publishResults} disabled={loading} className="admin-button">Publish Results</button>
        <button onClick={() => handleModalOpen("voter")} className="admin-button">Add Voter</button>
        <button onClick={() => handleModalOpen("party")} className="admin-button">Add Party</button>
        <button onClick={() => handleModalOpen("candidate")} className="admin-button">Add Candidate</button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      {modalType && (
        <Modal
          type={modalType}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onChange={handleInputChange}
          formData={formData}
          loading={loading}
          modalError={modalError}  // pass modalError here
        />
      )}
    </div>
  );
}

export default AdminPage;
