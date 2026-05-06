import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BiometricModal from './components/BiometricModal';
import OTPModal from './components/OTPModal';
import './styles/register.css';
import './styles/otp_modal.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Register() {
  const [role, setRole] = useState("voter");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [constituencies, setConstituencies] = useState([]);
  const [parties, setParties] = useState([]);
  const [showOTP, setShowOTP] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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
      if (useOTP) {
        const email = formData.email || `${formData.voter_id || formData.candidate_id}@gmail.com`;
        setUserEmail(email);
        
        await axios.post(`${API_BASE}/auth/otp/send-otp`, { email });
        setShowOTP(true);
        return;
      }

      await finalizeRegistration();
    } catch (err) {
      console.error("Registration initiation error:", err);
      setError(err.response?.data?.error || "Failed to initiate registration");
    }
  };

  const finalizeRegistration = async () => {
    try {
      setShowOTP(false);
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
      console.error("Final registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
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
      {showOTP && (
        <OTPModal 
          email={userEmail}
          onVerify={finalizeRegistration}
          onCancel={() => setShowOTP(false)}
        />
      )}
      
      {/* Visual Left Panel */}
      <div className="login-visual-panel">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="visual-content">
          <h1 className="brand-title">Your Vote.<br/>Your Voice.</h1>
          <p className="brand-subtitle">
            Register for the upcoming General Elections. Secure your democratic right to choose your representatives. Every ballot shapes our nation's future.
          </p>
        </div>
      </div>

      {/* Form Right Panel */}
      <div className="login-form-panel">
        <div className="login-glass-card">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Register to get started</p>
          </div>

          {/* Role Switcher */}
          <div className="role-pills">
            {["voter", "candidate"].map(r => (
              <button
                key={r}
                className={`role-pill ${role === r ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setRole(r);
                  setFormData({});
                  setError("");
                  setSuccess("");
                }}
                type="button"
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {role === "voter" && (
              <>
                <div className="input-group">
                  <label className="input-label">Voter ID *</label>
                  <input 
                    className="modern-input"
                    name="voter_id" 
                    placeholder="Enter unique Voter ID" 
                    required 
                    onChange={handleChange}
                    value={formData.voter_id || ""}
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">First Name *</label>
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
                  <label className="input-label">Last Name *</label>
                  <input 
                    className="modern-input"
                    name="last_name" 
                    placeholder="Enter your last name" 
                    required 
                    onChange={handleChange}
                    value={formData.last_name || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input 
                    className="modern-input"
                    name="phone" 
                    type="tel"
                    placeholder="Enter your phone number" 
                    required 
                    onChange={handleChange}
                    value={formData.phone || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Address *</label>
                  <textarea 
                    className="modern-input"
                    name="address" 
                    placeholder="Enter your address" 
                    required 
                    onChange={handleChange}
                    value={formData.address || ""}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Constituency *</label>
                  <select 
                    className="modern-input"
                    name="constituency" 
                    required 
                    onChange={handleChange}
                    value={formData.constituency || ""}
                  >
                    <option value="">Select Constituency</option>
                    {constituencies.map(c => (
                      <option key={c.constituency_id} value={c.constituency_id}>
                        {c.name} ({c.constituency_id})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {role === "candidate" && (
              <>
                <div className="input-group">
                  <label className="input-label">Candidate ID *</label>
                  <input 
                    className="modern-input"
                    name="candidate_id" 
                    placeholder="Enter unique Candidate ID" 
                    required 
                    onChange={handleChange}
                    value={formData.candidate_id || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <input 
                    className="modern-input"
                    name="name" 
                    placeholder="Enter your full name" 
                    required 
                    onChange={handleChange}
                    value={formData.name || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Party *</label>
                  <select 
                    className="modern-input"
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
                </div>

                <div className="input-group">
                  <label className="input-label">Constituency *</label>
                  <select 
                    className="modern-input"
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
                </div>

                <div className="input-group">
                  <label className="input-label">Age</label>
                  <input 
                    className="modern-input"
                    name="age" 
                    type="number"
                    placeholder="Enter your age" 
                    onChange={handleChange}
                    value={formData.age || ""}
                    min="18"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Education</label>
                  <input 
                    className="modern-input"
                    name="education" 
                    placeholder="Enter your education background" 
                    onChange={handleChange}
                    value={formData.education || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Experience</label>
                  <textarea 
                    className="modern-input"
                    name="experience" 
                    placeholder="Enter your political experience" 
                    onChange={handleChange}
                    value={formData.experience || ""}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Background</label>
                  <textarea 
                    className="modern-input"
                    name="background" 
                    placeholder="Enter your background information" 
                    onChange={handleChange}
                    value={formData.background || ""}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Password *</label>
              <input
                className="modern-input"
                name="password"
                type="password"
                placeholder="Create a strong password"
                required
                onChange={handleChange}
                value={formData.password || ""}
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <input
                className="modern-input"
                name="confirm_password"
                type="password"
                placeholder="Re-enter your password"
                required
                onChange={handleChange}
                value={formData.confirm_password || ""}
              />
            </div>

            {/* Premium OTP Toggle */}
            <div className="premium-toggle-group">
              <label className="premium-switch">
                <input 
                  type="checkbox" 
                  checked={useOTP}
                  onChange={(e) => setUseOTP(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">Enable Premium Email OTP Verification</span>
            </div>

            {useOTP && (
              <div className="input-group fade-in">
                <label className="input-label">Verification Email *</label>
                <input 
                  className="modern-input"
                  name="email"
                  type="email"
                  placeholder="Enter your Gmail for OTP"
                  required={useOTP}
                  onChange={handleChange}
                  value={formData.email || ""}
                />
              </div>
            )}

            <button type="submit" className="btn-primary">
              Register as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>

            {error && <div className="alert alert-danger" style={{marginTop: '15px'}}>❌ {error}</div>}
            {success && <div className="alert alert-success" style={{marginTop: '15px'}}>✅ {success}</div>}
          </form>

          {/* Action Links */}
          <div className="action-links">
            <div className="divider">Already have an account?</div>
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="btn-outline"
            >
              Sign In Here
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
