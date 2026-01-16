import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/verification-panel.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const VerificationPanel = () => {
  const [activeTab, setActiveTab] = useState("voters");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    setMessage("");
    try {
      let endpoint = "";
      if (tab === "voters") {
        endpoint = "/admin-dashboard/voters";
      } else if (tab === "candidates") {
        endpoint = "/admin-dashboard/candidates";
      } else if (tab === "parties") {
        endpoint = "/admin-dashboard/parties";
      }

      const response = await axios.get(`${API_BASE}${endpoint}`);
      
      if (tab === "voters") {
        setUsers(response.data.voters || []);
        setStats({
          total: response.data.total_voters,
          verified: response.data.verified_voters,
          pending: response.data.pending_voters,
          active: response.data.active_voters,
        });
      } else if (tab === "candidates") {
        setUsers(response.data.candidates || []);
        setStats({
          total: response.data.total_candidates,
          verified: response.data.verified_candidates,
          pending: response.data.pending_candidates,
          active: response.data.active_candidates,
        });
      } else if (tab === "parties") {
        setUsers(response.data.parties || []);
        setStats({
          total: response.data.total_parties,
          verified: response.data.verified_parties,
          pending: response.data.pending_parties,
          active: response.data.active_parties,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setMessage("❌ Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userId) => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "voters") {
        endpoint = `/admin/verify/voter/${userId}`;
      } else if (activeTab === "candidates") {
        endpoint = `/admin/verify/candidate/${userId}`;
      } else if (activeTab === "parties") {
        endpoint = `/admin/verify/party/${userId}`;
      }

      await axios.put(`${API_BASE}${endpoint}`, { is_verified: true });
      setMessage(`✅ ${activeTab.slice(0, -1)} verified successfully!`);
      
      // Refresh data
      fetchData(activeTab);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error verifying user:", err);
      setMessage(`❌ Failed to verify ${activeTab.slice(0, -1)}`);
    } finally {
      setLoading(false);
    }
  };

  const viewFullProfile = async (userId) => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "voters") {
        endpoint = `/admin-dashboard/voters/${userId}`;
      } else if (activeTab === "candidates") {
        endpoint = `/admin-dashboard/candidates/${userId}`;
      } else if (activeTab === "parties") {
        endpoint = `/admin-dashboard/parties/${userId}`;
      }

      const response = await axios.get(`${API_BASE}${endpoint}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage("❌ Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const getIdField = () => {
    if (activeTab === "voters") return "voter_id";
    if (activeTab === "candidates") return "candidate_id";
    return "party_id";
  };

  const getNameField = () => {
    if (activeTab === "voters") return "full_name";
    if (activeTab === "candidates") return "name";
    return "name";
  };

  return (
    <div className="verification-panel">
      <div className="verification-header">
        <h2>👁️ User Verification & Insights</h2>
        <p className="subtitle">View, analyze, and verify all users in the system</p>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{stats.total || 0}</span>
        </div>
        <div className="stat-card verified">
          <span className="stat-label">Verified ✅</span>
          <span className="stat-value">{stats.verified || 0}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending ⏳</span>
          <span className="stat-value">{stats.pending || 0}</span>
        </div>
        <div className="stat-card active">
          <span className="stat-label">Active</span>
          <span className="stat-value">{stats.active || 0}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "voters" ? "active" : ""}`}
          onClick={() => setActiveTab("voters")}
        >
          👥 Voters
        </button>
        <button
          className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          🎤 Candidates
        </button>
        <button
          className={`tab-btn ${activeTab === "parties" ? "active" : ""}`}
          onClick={() => setActiveTab("parties")}
        >
          🏛️ Parties
        </button>
      </div>

      {message && <div className="message-alert">{message}</div>}

      {/* Users List or Profile View */}
      {selectedUser ? (
        <ProfileView
          profile={selectedUser}
          tab={activeTab}
          onBack={() => setSelectedUser(null)}
          onVerify={() => {
            const idField = getIdField();
            verifyUser(selectedUser[idField] || selectedUser.voter_details?.[idField]);
          }}
          loading={loading}
        />
      ) : (
        <UsersList
          users={users}
          tab={activeTab}
          loading={loading}
          onViewProfile={viewFullProfile}
          onVerify={verifyUser}
          getIdField={getIdField}
          getNameField={getNameField}
        />
      )}
    </div>
  );
};

// Users List Component
const UsersList = ({ users, tab, loading, onViewProfile, onVerify, getIdField, getNameField }) => {
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (users.length === 0) {
    return <div className="empty-state">No {tab} found</div>;
  }

  return (
    <div className="users-grid">
      {users.map((user) => {
        const idField = getIdField();
        const nameField = getNameField();
        const userId = user[idField];
        const userName = user[nameField];
        const isVerified = user.is_verified;

        return (
          <div key={userId} className={`user-card ${isVerified ? "verified" : "pending"}`}>
            <div className="card-header">
              <h3>{userName}</h3>
              <span className={`badge ${isVerified ? "verified" : "pending"}`}>
                {isVerified ? "✅ Verified" : "⏳ Pending"}
              </span>
            </div>

            <div className="card-body">
              <div className="info-row">
                <span className="label">ID:</span>
                <span className="value">{userId}</span>
              </div>

              {tab === "voters" && (
                <>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{user.email || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Gmail:</span>
                    <span className="value">{user.gmail_id || "N/A"}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Constituency:</span>
                    <span className="value">{user.constituency_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Voted:</span>
                    <span className="value">{user.has_voted ? "✅ Yes" : "❌ No"}</span>
                  </div>
                </>
              )}

              {tab === "candidates" && (
                <>
                  <div className="info-row">
                    <span className="label">Party:</span>
                    <span className="value">{user.party_name} {user.party_symbol}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Constituency:</span>
                    <span className="value">{user.constituency_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Education:</span>
                    <span className="value">{user.education}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Votes:</span>
                    <span className="value">{user.votes}</span>
                  </div>
                </>
              )}

              {tab === "parties" && (
                <>
                  <div className="info-row">
                    <span className="label">Symbol:</span>
                    <span className="value">{user.symbol}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Candidates:</span>
                    <span className="value">{user.total_candidates}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Votes:</span>
                    <span className="value">{user.total_votes}</span>
                  </div>
                </>
              )}

              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value">{user.status}</span>
              </div>
            </div>

            <div className="card-footer">
              <button
                className="btn btn-primary"
                onClick={() => onViewProfile(userId)}
              >
                👁️ View Full Profile
              </button>
              {!isVerified && (
                <button
                  className="btn btn-success"
                  onClick={() => onVerify(userId)}
                >
                  ✅ Verify
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Profile View Component
const ProfileView = ({ profile, tab, onBack, onVerify, loading }) => {
  const isVerified = profile.is_verified || 
                     profile.voter_details?.is_verified ||
                     profile.candidate_details?.is_verified ||
                     profile.party_details?.is_verified;

  return (
    <div className="profile-view">
      <button className="btn-back" onClick={onBack}>← Back to List</button>

      <div className="profile-container">
        <div className="profile-header">
          <h2>
            {tab === "voters" && profile.voter_details?.full_name}
            {tab === "candidates" && profile.candidate_details?.name}
            {tab === "parties" && profile.party_details?.name}
          </h2>
          <span className={`badge large ${isVerified ? "verified" : "pending"}`}>
            {isVerified ? "✅ VERIFIED" : "⏳ PENDING VERIFICATION"}
          </span>
        </div>

        {tab === "voters" && <VoterProfileDetails profile={profile} />}
        {tab === "candidates" && <CandidateProfileDetails profile={profile} />}
        {tab === "parties" && <PartyProfileDetails profile={profile} />}

        {!isVerified && (
          <button
            className="btn btn-verify-large"
            onClick={onVerify}
            disabled={loading}
          >
            ✅ VERIFY THIS {tab.slice(0, -1).toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
};

// Voter Profile Details
const VoterProfileDetails = ({ profile }) => {
  const details = profile.voter_details;
  const constituency = profile.constituency_info;
  const voting = profile.voting_info;
  const verification = profile.verification_info;
  const status = profile.status_info;
  const activity = profile.activity_info;

  return (
    <div className="profile-sections">
      <Section title="👤 Personal Details">
        <DetailRow label="Full Name" value={details.full_name} />
        <DetailRow label="Email" value={details.email || "N/A"} />
        <DetailRow label="Gmail" value={details.gmail_id || "N/A"} />
        <DetailRow label="Phone" value={details.phone} />
        <DetailRow label="Address" value={details.address} />
        <DetailRow label="Age" value={details.age} />
        <DetailRow label="Gender" value={details.gender} />
      </Section>

      <Section title="🗳️ Constituency">
        <DetailRow label="Constituency ID" value={constituency.constituency_id} />
        <DetailRow label="Constituency Name" value={constituency.constituency_name} />
      </Section>

      <Section title="🗳️ Voting Information">
        <DetailRow label="Has Voted" value={voting.has_voted ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Voted Candidate" value={voting.voted_candidate_id || "N/A"} />
        <DetailRow label="Vote Timestamp" value={voting.vote_timestamp || "N/A"} />
      </Section>

      <Section title="✅ Verification Status">
        <DetailRow label="Verified" value={verification.is_verified ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={verification.verification_status} />
      </Section>

      <Section title="📊 Account Status">
        <DetailRow label="Active" value={status.is_active ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={status.status} />
      </Section>

      <Section title="📅 Activity">
        <DetailRow label="Created" value={new Date(activity.created_at).toLocaleString()} />
        <DetailRow label="Registered" value={new Date(activity.registration_date).toLocaleString()} />
        <DetailRow label="Last Login" value={activity.last_login ? new Date(activity.last_login).toLocaleString() : "Never"} />
      </Section>
    </div>
  );
};

// Candidate Profile Details
const CandidateProfileDetails = ({ profile }) => {
  const details = profile.candidate_details;
  const party = profile.party_info;
  const constituency = profile.constituency_info;
  const voting = profile.voting_info;
  const verification = profile.verification_info;
  const status = profile.status_info;
  const activity = profile.activity_info;

  return (
    <div className="profile-sections">
      <Section title="🎤 Candidate Details">
        <DetailRow label="Name" value={details.name} />
        <DetailRow label="Email" value={details.email || "N/A"} />
        <DetailRow label="Gmail" value={details.gmail_id || "N/A"} />
        <DetailRow label="Age" value={details.age} />
        <DetailRow label="Education" value={details.education} />
        <DetailRow label="Experience" value={details.experience} />
        <DetailRow label="Bio" value={details.bio} />
      </Section>

      <Section title="🏛️ Party Information">
        <DetailRow label="Party Name" value={party.party_name} />
        <DetailRow label="Party Symbol" value={party.party_symbol} />
        <DetailRow label="Party Color" value={party.party_color} />
        <DetailRow label="Description" value={party.party_description} />
      </Section>

      <Section title="🗳️ Constituency">
        <DetailRow label="Constituency ID" value={constituency.constituency_id} />
        <DetailRow label="Constituency Name" value={constituency.constituency_name} />
      </Section>

      <Section title="📊 Voting Statistics">
        <DetailRow label="Total Votes" value={voting.votes} />
        <DetailRow label="Vote Percentage" value={`${voting.vote_percentage}%`} />
      </Section>

      <Section title="✅ Verification Status">
        <DetailRow label="Verified" value={verification.is_verified ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={verification.verification_status} />
      </Section>

      <Section title="📊 Account Status">
        <DetailRow label="Active" value={status.is_active ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={status.status} />
      </Section>

      <Section title="📅 Activity">
        <DetailRow label="Created" value={new Date(activity.created_at).toLocaleString()} />
        <DetailRow label="Registered" value={new Date(activity.registration_date).toLocaleString()} />
      </Section>
    </div>
  );
};

// Party Profile Details
const PartyProfileDetails = ({ profile }) => {
  const details = profile.party_details;
  const stats = profile.statistics;
  const verification = profile.verification_info;
  const status = profile.status_info;
  const activity = profile.activity_info;
  const candidates = profile.candidates;

  return (
    <div className="profile-sections">
      <Section title="🏛️ Party Details">
        <DetailRow label="Party Name" value={details.name} />
        <DetailRow label="Email" value={details.email || "N/A"} />
        <DetailRow label="Gmail" value={details.gmail_id || "N/A"} />
        <DetailRow label="Symbol" value={details.symbol} />
        <DetailRow label="Color" value={details.color} />
        <DetailRow label="Description" value={details.description} />
        <DetailRow label="Founded Year" value={details.founded_year} />
      </Section>

      <Section title="📊 Statistics">
        <DetailRow label="Total Candidates" value={stats.total_candidates} />
        <DetailRow label="Total Votes" value={stats.total_votes} />
        <DetailRow label="Verified Candidates" value={stats.verified_candidates} />
        <DetailRow label="Active Candidates" value={stats.active_candidates} />
      </Section>

      <Section title="✅ Verification Status">
        <DetailRow label="Verified" value={verification.is_verified ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={verification.verification_status} />
      </Section>

      <Section title="📊 Account Status">
        <DetailRow label="Active" value={status.is_active ? "✅ Yes" : "❌ No"} />
        <DetailRow label="Status" value={status.status} />
      </Section>

      <Section title="📅 Activity">
        <DetailRow label="Created" value={new Date(activity.created_at).toLocaleString()} />
        <DetailRow label="Registered" value={new Date(activity.registration_date).toLocaleString()} />
      </Section>

      {candidates && candidates.length > 0 && (
        <Section title="🎤 Candidates in Party">
          <div className="candidates-list">
            {candidates.map((candidate) => (
              <div key={candidate.candidate_id} className="candidate-item">
                <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-info">
                  {candidate.constituency_name} • {candidate.votes} votes
                  {candidate.is_verified && <span className="verified-badge">✅</span>}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <div className="profile-section">
    <h3 className="section-title">{title}</h3>
    <div className="section-content">{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span className="detail-label">{label}:</span>
    <span className="detail-value">{value}</span>
  </div>
);

export default VerificationPanel;
