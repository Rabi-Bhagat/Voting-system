import React, { useState } from 'react';
import axios from 'axios';
import BiometricModal from './components/BiometricModal';
import './styles/login.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function Login() {
  const [role, setRole] = useState("voter");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [showBiometric, setShowBiometric] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields based on role
    if (role === "voter" && (!formData.voter_id || !formData.first_name || !formData.last_name || !formData.password)) {
      setError("Please fill all required fields");
      return;
    }
    if (role === "candidate" && (!formData.candidate_id || !formData.password)) {
      setError("Please fill all required fields");
      return;
    }
    if (role === "party" && (!formData.party_id || !formData.password)) {
      setError("Please fill all required fields");
      return;
    }
    if (role === "constituency" && (!formData.constituency_id || !formData.password)) {
      setError("Please fill all required fields");
      return;
    }
    if (role === "admin" && !formData.password) {
      setError("Please enter admin password");
      return;
    }

    try {
      // Prepare login data
      const loginData = { ...formData, role };
      
      // Ensure username is set for admin login
      if (role === "admin" && !loginData.username) {
        loginData.username = "admin";
      }

      // Instead of logging in immediately, show the biometric modal
      setPendingLoginData(loginData);
      setShowBiometric(true);
      
    } catch (err) {
      console.error("Preparation error:", err);
      setError("Failed to prepare login");
    }
  };

  const processLogin = async () => {
    try {
      setShowBiometric(false);
      const res = await axios.post(`${API_BASE}/login`, pendingLoginData); 

      if (res.data.success) {
        if (role === "voter" && res.data.voter) {
          localStorage.setItem("voterInfo", JSON.stringify(res.data.voter));
        } else if (role === "candidate" && res.data.candidate) {
          localStorage.setItem("candidateInfo", JSON.stringify(res.data.candidate));
        } else if (role === "party" && res.data.party) {
          localStorage.setItem("partyInfo", JSON.stringify(res.data.party));
        } else if (role === "constituency" && res.data.constituency) {
          localStorage.setItem("constituencyInfo", JSON.stringify(res.data.constituency));
        } else if (role === "admin" && res.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(res.data.admin));
          // Redirect admin to the new dashboard
          window.location.href = "/admin-dashboard";
          return;
        }

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        window.location.href = res.data.redirect;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleMouseMove = (e) => {
    const card = document.querySelector('.login-glass-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="login-container" onMouseMove={handleMouseMove}>
      <BiometricModal 
        isOpen={showBiometric} 
        onSuccess={processLogin} 
        onCancel={() => setShowBiometric(false)} 
        type="login" 
      />
      
      {/* Visual Left Panel */}
      <div className="login-visual-panel">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="visual-content">
          <h1 className="brand-title">National<br/>Election Portal.</h1>
          <p className="brand-subtitle">
            Access your secure voting dashboard. Review candidates, track election status, and cast your official ballot with end-to-end encryption.
          </p>
        </div>
      </div>

      {/* Form Right Panel */}
      <div className="login-form-panel">
        <div className="login-glass-card">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Role Switcher */}
          {role !== "admin" && (
            <div className="role-pills">
              {["voter", "candidate", "party", "constituency"].map(r => (
                <button
                  key={r}
                  className={`role-pill ${role === r ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setRole(r);
                    setFormData({});
                    setError("");
                  }}
                  type="button"
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {role === "voter" && (
              <>
                <div className="input-group">
                  <label className="input-label">Voter ID</label>
                  <input 
                    className="modern-input"
                    name="voter_id" 
                    placeholder="Enter your Voter ID" 
                    required 
                    onChange={handleChange}
                    value={formData.voter_id || ""}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input 
                    className="modern-input"
                    name="first_name" 
                    placeholder="Enter your first name" 
                    required 
                    onChange={handleChange}
                    value={formData.first_name || ""}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input 
                    className="modern-input"
                    name="last_name" 
                    placeholder="Enter your last name" 
                    required 
                    onChange={handleChange}
                    value={formData.last_name || ""}
                  />
                </div>
              </>
            )}

            {role === "candidate" && (
              <div className="input-group">
                <label className="input-label">Candidate ID</label>
                <input 
                  className="modern-input"
                  name="candidate_id" 
                  placeholder="Enter Candidate ID" 
                  required 
                  onChange={handleChange}
                  value={formData.candidate_id || ""}
                />
              </div>
            )}

            {role === "party" && (
              <div className="input-group">
                <label className="input-label">Party ID</label>
                <input 
                  className="modern-input"
                  name="party_id" 
                  placeholder="Enter Party ID" 
                  required 
                  onChange={handleChange}
                  value={formData.party_id || ""}
                />
              </div>
            )}

            {role === "constituency" && (
              <div className="input-group">
                <label className="input-label">Constituency ID</label>
                <input 
                  className="modern-input"
                  name="constituency_id" 
                  placeholder="Enter Constituency ID" 
                  required 
                  onChange={handleChange}
                  value={formData.constituency_id || ""}
                />
              </div>
            )}

            {role === "admin" && (
              <>
                <div className="admin-mode-banner">
                  <span>🔐</span> Administrator Access
                </div>
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input 
                    className="modern-input"
                    name="username" 
                    placeholder="Enter admin username (default: admin)" 
                    onChange={handleChange}
                    value={formData.username !== undefined ? formData.username : "admin"}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="modern-input"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                onChange={handleChange}
                value={formData.password || ""}
              />
            </div>

            <button type="submit" className="btn-primary">
              {role === "admin" ? "Authenticate as Admin" : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>

            {error && <div className="alert alert-danger" style={{marginTop: '15px'}}>❌ {error}</div>}
          </form>

          {/* Action Links */}
          <div className="action-links">
            {role !== "admin" ? (
              <>
                <div className="divider">New to the platform?</div>
                <button
                  type="button"
                  onClick={() => window.location.href = "/register"}
                  className="btn-outline"
                >
                  Create an Account
                </button>
                
                <div className="divider">Other Options</div>
                <button
                  type="button"
                  onClick={() => {
                    setRole("admin");
                    setFormData({});
                    setError("");
                  }}
                  className="btn-outline"
                  style={{borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24'}}
                >
                  🔐 Administrator Login
                </button>
                
                <button 
                  type="button"
                  onClick={() => window.location.href = "/results"} 
                  className="btn-outline"
                >
                  📊 View Public Results
                </button>
              </>
            ) : (
              <>
                <div className="divider">Not an administrator?</div>
                <button
                  type="button"
                  onClick={() => {
                    setRole("voter");
                    setFormData({});
                    setError("");
                  }}
                  className="btn-outline"
                >
                  ← Return to Standard Login
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
