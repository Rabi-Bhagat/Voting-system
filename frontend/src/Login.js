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

    try {
      // const res = await axios.post("http://localhost:5000/login", { ...formData, role });
      const res = await axios.post(`${API_BASE}/login`, { ...formData, role }); 

      if (res.data.success) {
        if (role === "voter" && res.data.voter) {
          localStorage.setItem("voterInfo", JSON.stringify(res.data.voter));
        } else if (role === "party" && res.data.party) {
          localStorage.setItem("partyInfo", JSON.stringify(res.data.party));
        } else if (role === "constituency" && res.data.constituency) {
          localStorage.setItem("constituencyInfo", JSON.stringify(res.data.constituency));
        } else if (role === "admin" && res.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(res.data.admin));
        }

        window.location.href = res.data.redirect;
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="login-card">
        <h1 className="text-center mb-4">VOTING SYSTEM</h1>
        <h4 className="text-center mb-4">SIGN IN TO CONTINUE</h4>

        {/* Role Switcher */}
        {role !== "admin" && (
          <div className="role-container">
            <ul className="nav nav-pills mb-3">
              {["voter", "party", "constituency"].map(r => (
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
                <input name="voter_id" placeholder="Voter ID" required onChange={handleChange} />
                <input name="first_name" placeholder="First Name" required onChange={handleChange} />
                <input name="last_name" placeholder="Last Name" required onChange={handleChange} />
              </>
            )}

            {role === "party" && (
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
            />

            <button
              type="submit"
              className="btn btn-primary mr-70 w-20 mt-2 px-3 py-2 text-sm w-50 mx-auto d-block"
            >
              Login
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>

        {/* Action Buttons */}
        <div className="button-group mt-3">
          {role !== "admin" ? (
            <>
              <div className="admin-btn">
                <button
                  onClick={() => {
                    setRole("admin");
                    setFormData({});
                    setError("");
                  }}
                  className="btn"
                >
                  Admin Login
                </button>
              </div>
              <div className="view-results-btn">
                <button onClick={() => window.location.href = "/results"} className="btn">
                  View Results
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
                Back to User Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
