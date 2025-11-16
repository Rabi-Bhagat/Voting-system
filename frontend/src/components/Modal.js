// src/components/Modal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/modal.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Modal({ type, onClose, onSubmit, onChange, formData, loading, modalError }) {
  const [constituencies, setConstituencies] = useState([]);
  const [parties, setParties] = useState([]);

  useEffect(() => {
    // Fetch constituencies for voter and candidate forms
    if (type === "voter" || type === "candidate") {
      axios.get(`${API_BASE}/constituency`)
        .then(res => setConstituencies(res.data))
        .catch(err => console.error("Error fetching constituencies:", err));
    }

    // Fetch parties for candidate form
    if (type === "candidate") {
      axios.get(`${API_BASE}/test-voters`)
        .then(res => {
          // Extract parties from the response or fetch from a parties endpoint
          // For now, we'll use hardcoded parties
          setParties([
            { party_id: "P001", name: "Democratic Party" },
            { party_id: "P002", name: "Republican Front" },
            { party_id: "P003", name: "Green Alliance" }
          ]);
        })
        .catch(err => console.error("Error fetching parties:", err));
    }
  }, [type]);

  const requiredFields = {
    voter: ["voter_id", "first_name", "last_name", "password"],
    candidate: ["candidate_id", "name", "party_id"],
    party: ["party_id", "name", "password"],
    constituency: ["constituency_id", "name", "password"]
  };

  const fields = requiredFields[type] || [];

  const renderField = (field) => {
    // Render dropdown for constituency
    if (field === "constituency" && (type === "voter" || type === "candidate")) {
      return (
        <select
          key={field}
          name={field}
          value={formData[field] || ""}
          onChange={onChange}
          className="modal-input"
          disabled={loading}
          required
        >
          <option value="">Select Constituency</option>
          {constituencies.map(constituency => (
            <option key={constituency.constituency_id} value={constituency.constituency_id}>
              {constituency.name} ({constituency.constituency_id})
            </option>
          ))}
        </select>
      );
    }

    // Render dropdown for party
    if (field === "party_id" && type === "candidate") {
      return (
        <select
          key={field}
          name={field}
          value={formData[field] || ""}
          onChange={onChange}
          className="modal-input"
          disabled={loading}
          required
        >
          <option value="">Select Party</option>
          {parties.map(party => (
            <option key={party.party_id} value={party.party_id}>
              {party.name} ({party.party_id})
            </option>
          ))}
        </select>
      );
    }

    // Render regular input for other fields
    return (
      <input
        key={field}
        type={field.toLowerCase().includes("password") ? "password" : "text"}
        name={field}
        placeholder={field.replace(/_/g, " ").toUpperCase()}
        value={formData[field] || ""}
        onChange={onChange}
        className="modal-input"
        disabled={loading}
        required
      />
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        {fields.map(field => renderField(field))}

        {/* Show error message inside modal */}
        {modalError && <p className="modal-error-message">{modalError}</p>}

        <div className="modal-buttons">
          <button
            onClick={onSubmit}
            className="modal-submit-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            className="modal-cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;