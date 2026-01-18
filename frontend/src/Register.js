import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/register.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Register() {
  const [role, setRole] = useState("voter");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [constituencies, setConstituencies] = useState([]);
  const [parties, setParties] = useState([]);

  useEffect(() => {
    // Fetch constituencies and parties for dropdowns
    const fetchData = async () => {
      try {
        const [constRes, partyRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/constituencies`),
          axios.get(`${API_BASE}/admin/parties`)
        ]);
        setConstituencies(constRes.data || []);
        setParties(partyRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (role === "voter") {
      if (!formData.voter_id || !formData.first_name || !formData.last_name || 
          !formData.password || !formData.confirm_password || !formData.phone || !formData.address) {
        setError("Please fill all required fields");
        return;
      }
      
      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match");
        return;
      }
      
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    } else if (role === "candidate") {
      if (!formData.candidate_id || !formData.name || !formData.password || 
          !formData.confirm_password || !formData.party_id || !formData.constituency) {
        setError("Please fill all required fields");
        return;
      }
      
      if (formData.password !== formData.confirm_password) {
        setError("Passwords do not match");
        return;
      }
      
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    try {
      const endpoint = role === "voter" ? "/auth/register-voter" : "/auth/register-candidate";
      const res = await axios.post(`${API_BASE}${endpoint}`, formData);

      if (res.data.success) {
        setSuccess(res.data.message);
        setFormData({});
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="register-card">
        <h1 className="text-center mb-4">ONLINE VOTING SYSTEM</h1>
        <h4 className="text-center mb-4">CREATE NEW ACCOUNT</h4>

        {/* Role Switcher */}
        <div className="role-container">
          <ul className="nav nav-pills mb-3">
            {["voter", "candidate"].map(r => (
              <li className="nav-item" key={r}>
                <button
                  className={`nav-link ${role === r ? "active" : ""}`}
                  onClick={() => {
                    setRole(r);
                    setFormData({});
                    setError("");
                    setSuccess("");
                  }}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Registration Form */}
        <div className="tab-content mt-4">
          <form onSubmit={handleSubmit}>
            {role === "voter" && (
              <>
                <label className="input-label">Voter ID *</label>
                <input 
                  name="voter_id" 
                  placeholder="Enter unique Voter ID" 
                  required 
                  onChange={handleChange}
                  value={formData.voter_id || ""}
                />
                
                <label className="input-label">First Name *</label>
                <input 
                  name="first_name" 
                  placeholder="Enter your first name" 
                  required 
                  onChange={handleChange}
                  value={formData.first_name || ""}
                />
                
                <label className="input-label">Last Name *</label>
                <input 
                  name="last_name" 
                  placeholder="Enter your last name" 
                  required 
                  onChange={handleChange}
                  value={formData.last_name || ""}
                />

                <label className="input-label">Phone Number *</label>
                <input 
                  name="phone" 
                  type="tel"
                  placeholder="Enter your phone number" 
                  required 
                  onChange={handleChange}
                  value={formData.phone || ""}
                />

                <label className="input-label">Address *</label>
                <textarea 
                  name="address" 
                  placeholder="Enter your address" 
                  required 
                  onChange={handleChange}
                  value={formData.address || ""}
                  rows="3"
                />
              </>
            )}

            {role === "candidate" && (
              <>
                <label className="input-label">Candidate ID *</label>
                <input 
                  name="candidate_id" 
                  placeholder="Enter unique Candidate ID" 
                  required 
                  onChange={handleChange}
                  value={formData.candidate_id || ""}
                />

                <label className="input-label">Full Name *</label>
                <input 
                  name="name" 
                  placeholder="Enter your full name" 
                  required 
                  onChange={handleChange}
                  value={formData.name || ""}
                />

                <label className="input-label">Party *</label>
                <select 
                  name="party_id" 
                  required 
                  onChange={handleChange}
                  value={formData.party_id || ""}
                >
                  <option value="">Select Party</option>
                  {parties.map(p => (
                    <option key={p.party_id} value={p.party_id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <label className="input-label">Constituency *</label>
                <select 
                  name="constituency" 
                  required 
                  onChange={handleChange}
                  value={formData.constituency || ""}
                >
                  <option value="">Select Constituency</option>
                  {constituencies.map(c => (
                    <option key={c.constituency_id} value={c.constituency_id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <label className="input-label">Age</label>
                <input 
                  name="age" 
                  type="number"
                  placeholder="Enter your age" 
                  onChange={handleChange}
                  value={formData.age || ""}
                  min="18"
                />

                <label className="input-label">Education</label>
                <input 
                  name="education" 
                  placeholder="Enter your education background" 
                  onChange={handleChange}
                  value={formData.education || ""}
                />

                <label className="input-label">Experience</label>
                <textarea 
                  name="experience" 
                  placeholder="Enter your political experience" 
                  onChange={handleChange}
                  value={formData.experience || ""}
                  rows="3"
                />

                <label className="input-label">Background</label>
                <textarea 
                  name="background" 
                  placeholder="Enter your background information" 
                  onChange={handleChange}
                  value={formData.background || ""}
                  rows="3"
                />
              </>
            )}

            <label className="input-label">Password *</label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              required
              onChange={handleChange}
              value={formData.password || ""}
              minLength="6"
            />

            <label className="input-label">Confirm Password *</label>
            <input
              name="confirm_password"
              type="password"
              placeholder="Re-enter your password"
              required
              onChange={handleChange}
              value={formData.confirm_password || ""}
            />

            <button
              type="submit"
              className="btn btn-primary register-button"
            >
              Register as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>

            {error && <div className="alert alert-danger mt-3">❌ {error}</div>}
            {success && <div className="alert alert-success mt-3">✅ {success}</div>}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="button-group mt-3">
          <div className="text-center">
            <p>Already have an account?</p>
            <button
              onClick={() => window.location.href = "/"}
              className="btn btn-secondary"
            >
              Login Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
