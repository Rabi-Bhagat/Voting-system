// src/components/Modal.js
import React from "react";
import "../styles/modal.css";

function Modal({ type, onClose, onSubmit, onChange, formData, loading, modalError }) {
  const requiredFields = {
    voter: ["voter_id", "first_name", "last_name", "password", "constituency"],
    candidate: ["candidate_id", "name", "party_id", "constituency"],
    party: ["party_id", "name", "password"],
    constituency: ["constituency_id", "name", "password"]
  };

  const fields = requiredFields[type] || [];

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
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