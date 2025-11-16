// src/components/Modal.js
import React, { useState, useEffect } from "react";
import "../styles/modal.css";

function Modal({ type, onClose, onSubmit, onChange, formData, loading, modalError }) {
  const [parties, setParties] = useState([]);

  useEffect(() => {
    // Fetch parties for candidate form
    if (type === "candidate") {
      // Hardcoded parties for now
      setParties([
        { party_id: "P001", name: "Democratic Party" },
        { party_id: "P002", name: "Republican Front" },
        { party_id: "P003", name: "Green Alliance" }
      ]);
    }
  }, [type]);

  const requiredFields = {
    voter: ["voter_id", "first_name", "last_name", "password"],
    candidate: ["candidate_id", "name", "password", "party_id", "age", "education", "experience", "background"],
    party: ["party_id", "name", "password"],
    constituency: ["constituency_id", "name", "password"]
  };

  const fields = requiredFields[type] || [];

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

    // Render textarea for background field
    if (field === "background" || field === "education" || field === "experience") {
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