import React, { useState } from 'react';
import axios from 'axios';
import './styles/login.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function Login() {
  const [role, setRole] = useState("voter");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

<<<<<<< HEAD
    try {
      // const res = await axios.post("http://localhost:5000/login", { ...formData, role });
      const res = await axios.post(`${API_BASE}/login`, { ...formData, role }); 
=======
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

      const res = await axios.post(`${API_BASE}/login`, loginData); 
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7

      if (res.data.success) {
        if (role === "voter" && res.data.voter) {
          localStorage.setItem("voterInfo", JSON.stringify(res.data.voter));
<<<<<<< HEAD
        } else if (role === "party" && res.data.party) {
          localStorage.setItem("partyInfo", JSON.stringify(res.data.party));
        } else if (role === "constituency" && res.data.constituency) {
          localStorage.setItem("constituencyInfo", JSON.stringify(res.data.constituency));
=======
        } else if (role === "candidate" && res.data.candidate) {
          localStorage.setItem("candidateInfo", JSON.stringify(res.data.candidate));
        } else if (role === "party" && res.data.party) {
          localStorage.setItem("partyInfo", JSON.stringify(res.data.party));
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
        } else if (role === "admin" && res.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(res.data.admin));
        }

        window.location.href = res.data.redirect;
      }
    } catch (err) {
<<<<<<< HEAD
=======
      console.error("Login error:", err);
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="login-card">
<<<<<<< HEAD
        <h1 className="text-center mb-4">VOTING SYSTEM</h1>
=======
        <h1 className="text-center mb-4">ONLINE VOTING SYSTEM</h1>
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
        <h4 className="text-center mb-4">SIGN IN TO CONTINUE</h4>

        {/* Role Switcher */}
        {role !== "admin" && (
          <div className="role-container">
            <ul className="nav nav-pills mb-3">
<<<<<<< HEAD
              {["voter", "party", "constituency"].map(r => (
=======
              {["voter", "candidate", "party"].map(r => (
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
                <li className="nav-item" key={r}>
                  <button
                    className={`nav-link ${role === r ? "active" : ""}`}
                    onClick={() => {
                      setRole(r);
                      setFormData({});
                      setError("");
                    }}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Login Form */}
        <div className="tab-content mt-4">
          <form onSubmit={handleSubmit}>
            {role === "voter" && (
              <>
<<<<<<< HEAD
                <input name="voter_id" placeholder="Voter ID" required onChange={handleChange} />
                <input name="first_name" placeholder="First Name" required onChange={handleChange} />
                <input name="last_name" placeholder="Last Name" required onChange={handleChange} />
=======
                <label className="input-label">Voter ID</label>
                <input 
                  name="voter_id" 
                  placeholder="Enter your Voter ID" 
                  required 
                  onChange={handleChange}
                  value={formData.voter_id || ""}
                />
                
                <label className="input-label">First Name</label>
                <input 
                  name="first_name" 
                  placeholder="Enter your first name" 
                  required 
                  onChange={handleChange}
                  value={formData.first_name || ""}
                />
                
                <label className="input-label">Last Name</label>
                <input 
                  name="last_name" 
                  placeholder="Enter your last name" 
                  required 
                  onChange={handleChange}
                  value={formData.last_name || ""}
                />
              </>
            )}

            {role === "candidate" && (
              <>
                <label className="input-label">Candidate ID</label>
                <input 
                  name="candidate_id" 
                  placeholder="Enter Candidate ID" 
                  required 
                  onChange={handleChange}
                  value={formData.candidate_id || ""}
                />
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
              </>
            )}

            {role === "party" && (
<<<<<<< HEAD
              <input name="party_id" placeholder="Party ID" required onChange={handleChange} />
            )}

            {role === "constituency" && (
              <input name="constituency_id" placeholder="Constituency ID" required onChange={handleChange} />
            )}

            {role === "admin" && (
              <p className="text-muted text-center mb-2">Enter Admin Password</p>
            )}

            <input
              className='admin-password1'
              name="password"
              type="password"
              placeholder="Password"
              required
              onChange={handleChange}
=======
              <>
                <label className="input-label">Party ID</label>
                <input 
                  name="party_id" 
                  placeholder="Enter Party ID" 
                  required 
                  onChange={handleChange}
                  value={formData.party_id || ""}
                />
              </>
            )}



            {role === "admin" && (
              <>
                <p className="admin-info" style={{ 
                  background: '#f0f0f0', 
                  padding: '10px', 
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>🔐 Admin Access</p>
                <label className="input-label">Username</label>
                <input 
                  name="username" 
                  placeholder="Enter admin username (default: admin)" 
                  onChange={handleChange}
                  value={formData.username !== undefined ? formData.username : "admin"}
                />
              </>
            )}

            <label className="input-label">Password</label>
            <input
              className='password-input'
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              onChange={handleChange}
              value={formData.password || ""}
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
            />

            <button
              type="submit"
<<<<<<< HEAD
              className="btn btn-primary mr-70 w-20 mt-2 px-3 py-2 text-sm w-50 mx-auto d-block"
            >
              Login
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
=======
              className="btn btn-primary login-button"
            >
              {role === "admin" ? "Login as Admin" : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>

            {error && <div className="alert alert-danger mt-3">❌ {error}</div>}
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
          </form>
        </div>

        {/* Action Buttons */}
        <div className="button-group mt-3">
          {role !== "admin" ? (
            <>
<<<<<<< HEAD
=======
              <div className="register-link text-center mb-3">
                <p style={{ color: '#666', marginBottom: '10px' }}>Don't have an account?</p>
                <button
                  onClick={() => window.location.href = "/register"}
                  className="btn btn-success"
                  style={{ 
                    padding: '10px 30px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    marginBottom: '15px'
                  }}
                >
                  📝 Register Here
                </button>
              </div>
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
              <div className="admin-btn">
                <button
                  onClick={() => {
                    setRole("admin");
                    setFormData({});
                    setError("");
                  }}
                  className="btn"
                >
<<<<<<< HEAD
                  Admin Login
=======
                  🔐 Admin Login
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
                </button>
              </div>
              <div className="view-results-btn">
                <button onClick={() => window.location.href = "/results"} className="btn">
<<<<<<< HEAD
                  View Results
=======
                  📊 View Results
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
                </button>
              </div>
            </>
          ) : (
            <div className="admin-back-button text-center">
              <button
                onClick={() => {
                  setRole("voter");
                  setFormData({});
                  setError("");
                }}
                className="btn btn-secondary"
              >
<<<<<<< HEAD
                Back to User Login
=======
                ← Back to User Login
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
