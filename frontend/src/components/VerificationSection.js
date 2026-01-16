import React, { useState, useEffect } from "react";
import axios from "axios";
import VerificationCard from "./VerificationCard";
import ProfileModal from "./ProfileModal";
import "../styles/components/verification-section.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * VerificationSection Component
 * Main component for viewing and verifying users
 */
const VerificationSection = ({ onMessage }) => {
  const [activeTab, setActiveTab] = useState("voters");
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data when tab changes
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "voters") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/voters`);
        setVoters(response.data.voters || []);
      } else if (tab === "candidates") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/candidates`);
        setCandidates(response.data.candidates || []);
      } else if (tab === "parties") {
        const response = await axios.get(`${API_BASE}/admin-dashboard/parties`);
        setParties(response.data.parties || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      onMessage("❌ Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (user, userType) => {
    setVerifying(true);
    try {
      let endpoint = "";
      let userId = "";

      if (userType === "voter") {
        endpoint = `/admin/verify/voter/${user.voter_id}`;
        userId = user.voter_id;
      } else if (userType === "candidate") {
        endpoint = `/admin/verify/candidate/${user.candidate_id}`;
        userId = user.candidate_id;
      } else if (userType === "party") {
        endpoint = `/admin/verify/party/${user.party_id}`;
        userId = user.party_id;
      }

      await axios.put(`${API_BASE}${endpoint}`, { is_verified: true });
      onMessage(`✅ ${userType.charAt(0).toUpperCase() + userType.slice(1)} verified successfully!`, "success");

      // Refresh data
      fetchData(activeTab);
      setSelectedProfile(null);
    } catch (err) {
      console.error("Error verifying user:", err);
      onMessage(`❌ Failed to verify ${userType}`, "error");
    } finally {
      setVerifying(false);
    }
  };

  const getFilteredData = () => {
    const search = searchTerm.toLowerCase();
    if (activeTab === "voters") {
      return voters.filter(
        (v) =>
          v.full_name.toLowerCase().includes(search) ||
          v.voter_id.toLowerCase().includes(search) ||
          v.email?.toLowerCase().includes(search)
      );
    } else if (activeTab === "candidates") {
      return candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.candidate_id.toLowerCase().includes(search) ||
          c.party_name.toLowerCase().includes(search)
      );
    } else if (activeTab === "parties") {
      return parties.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.party_id.toLowerCase().includes(search)
      );
    }
    return [];
  };

  const getStats = () => {
    const data =
      activeTab === "voters"
        ? voters
        : activeTab === "candidates"
        ? candidates
        : parties;

    return {
      total: data.length,
      verified: data.filter((item) => item.is_verified).length,
      pending: data.filter((item) => !item.is_verified).length,
    };
  };

  const stats = getStats();
  const filteredData = getFilteredData();

  return (
    <div className="verification-section">
      <div className="section-header">
        <h2 className="section-title">👁️ User Verification & Insights</h2>
        <p className="section-subtitle">View and verify all users in the system</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "voters" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("voters");
            setSearchTerm("");
          }}
        >
          👥 Voters
          <span className="tab-count">{voters.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("candidates");
            setSearchTerm("");
          }}
        >
          🎤 Candidates
          <span className="tab-count">{candidates.length}</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "parties" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("parties");
            setSearchTerm("");
          }}
        >
          🏛️ Parties
          <span className="tab-count">{parties.length}</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card verified">
          <div className="stat-label">✅ Verified</div>
          <div className="stat-value">{stats.verified}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">⏳ Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && <div className="loading-spinner">Loading data...</div>}

      {/* Users Grid */}
      {!loading && (
        <div className="users-grid">
          {filteredData.length > 0 ? (
            filteredData.map((user) => (
              <VerificationCard
                key={
                  activeTab === "voters"
                    ? user.voter_id
                    : activeTab === "candidates"
                    ? user.candidate_id
                    : user.party_id
                }
                user={user}
                userType={activeTab.slice(0, -1)} // voters -> voter, candidates -> candidate, parties -> party
                onViewProfile={(profile, type) => setSelectedProfile({ profile, type })}
                onVerify={handleVerify}
                isVerifying={verifying}
              />
            ))
          ) : (
            <div className="no-results">
              <p>No {activeTab} found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile.profile}
          userType={selectedProfile.type}
          onClose={() => setSelectedProfile(null)}
          onVerify={handleVerify}
          isVerifying={verifying}
        />
      )}
    </div>
  );
};

export default VerificationSection;
