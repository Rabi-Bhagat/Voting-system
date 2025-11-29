import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/editProfile.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function EditCandidateProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    candidate_id: "",
    name: "",
    age: "",
    education: "",
    experience: "",
    background: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("candidateInfo");
    if (stored) {
      const { candidate_id } = JSON.parse(stored);
      axios.get(`${API_BASE}/candidate/${candidate_id}`)
        .then((res) => {
          const candidate = res.data;
          setForm((prev) => ({
            ...prev,
            candidate_id: candidate.candidate_id,
            name: candidate.name,
            age: candidate.age || "",
            education: candidate.education || "",
            experience: candidate.experience || "",
            background: candidate.background || "",
          }));
        })
        .catch(() => setError("Error loading profile."));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const updateData = {
      age: form.age || null,
      education: form.education,
      experience: form.experience,
      background: form.background,
    };

    if (form.password) {
      updateData.password = form.password;
    }

    try {
      await axios.put(`${API_BASE}/candidate/${form.candidate_id}`, updateData);
      setMessage("Profile updated successfully!");
      
      // Update localStorage
      const stored = localStorage.getItem("candidateInfo");
      if (stored) {
        const candidateInfo = JSON.parse(stored);
        localStorage.setItem("candidateInfo", JSON.stringify({
          ...candidateInfo,
          ...updateData
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error updating profile.");
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h3 className="text-center mb-3 edit-head">Edit Your Candidate Profile</h3>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Candidate ID</label>
            <input type="text" className="form-control" value={form.candidate_id} readOnly />
          </div>

          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-control" value={form.name} readOnly />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              className="form-control"
              name="age"
              value={form.age}
              onChange={handleChange}
              min="18"
              max="100"
            />
          </div>

          <div className="form-group">
            <label>Education</label>
            <textarea
              className="form-control"
              name="education"
              value={form.education}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your educational background"
            />
          </div>

          <div className="form-group">
            <label>Experience</label>
            <textarea
              className="form-control"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              rows="3"
              placeholder="Enter your political experience"
            />
          </div>

          <div className="form-group">
            <label>Background</label>
            <textarea
              className="form-control"
              name="background"
              value={form.background}
              onChange={handleChange}
              rows="4"
              placeholder="Enter your background information"
            />
          </div>

          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>

          <div className="button-group mt-4">
            <button type="submit" className="custom-save-button mx-2">
              Save Changes
            </button>
            <button
              type="button"
              className="custom-back-button mx-2"
              onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCandidateProfile;
