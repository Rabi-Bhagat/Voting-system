// src/components/Modal.js
<<<<<<< HEAD
import React from "react";
import "../styles/modal.css";

function Modal({ type, onClose, onSubmit, onChange, formData, loading, modalError }) {
  const requiredFields = {
    voter: ["voter_id", "first_name", "last_name", "password", "constituency"],
    candidate: ["candidate_id", "name", "party_id", "constituency"],
=======
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/modal.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Modal({ type, onClose, onSubmit, onChange, formData, loading, modalError }) {
  const [parties, setParties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);

  useEffect(() => {
    // Fetch parties and constituencies for candidate form
    if (type === "candidate") {
      const fetchData = async () => {
        try {
          const [partiesRes, constRes] = await Promise.all([
            axios.get(`${API_BASE}/admin/parties`),
            axios.get(`${API_BASE}/admin/constituencies`)
          ]);
          setParties(partiesRes.data || []);
          setConstituencies(constRes.data || []);
        } catch (err) {
          console.error("Failed to fetch data:", err);
        }
      };
      fetchData();
    }
  }, [type]);

  const requiredFields = {
    voter: ["voter_id", "first_name", "last_name", "password", "phone", "address"],
    candidate: ["candidate_id", "name", "password", "party_id", "constituency", "age", "education", "experience", "background"],
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
    party: ["party_id", "name", "password"],
    constituency: ["constituency_id", "name", "password"]
  };

  const fields = requiredFields[type] || [];

<<<<<<< HEAD
=======
  const renderField = (field) => {
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

    // Render dropdown for constituency
    if (field === "constituency" && type === "candidate") {
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

    // Render textarea for background, education, experience, address
    if (field === "background" || field === "education" || field === "experience" || field === "address") {
      return (
        <textarea
          key={field}
          name={field}
          placeholder={field.replace(/_/g, " ").toUpperCase()}
          value={formData[field] || ""}
          onChange={onChange}
          className="modal-input"
          disabled={loading}
          rows="3"
          required={field === "address" && type === "voter"}
        />
      );
    }

    // Render number input for age
    if (field === "age") {
      return (
        <input
          key={field}
          type="number"
          name={field}
          placeholder="Age"
          value={formData[field] || ""}
          onChange={onChange}
          className="modal-input"
          disabled={loading}
          min="18"
          max="100"
        />
      );
    }

    // Render phone input
    if (field === "phone") {
      return (
        <input
          key={field}
          type="tel"
          name={field}
          placeholder="Phone Number"
          value={formData[field] || ""}
          onChange={onChange}
          className="modal-input"
          disabled={loading}
          required
        />
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
        required={!["age", "education", "experience", "background"].includes(field)}
      />
    );
  };

>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
<<<<<<< HEAD
        {fields.map((field) => (
          <input
            key={field}
            type={field.toLowerCase().includes("password") ? "password" : "text"}
            name={field}
            placeholder={field.replace(/_/g, " ")}
            value={formData[field] || ""}
            onChange={onChange}
            className="modal-input"
            disabled={loading}
          />
        ))}
=======
        {fields.map(field => renderField(field))}
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7

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