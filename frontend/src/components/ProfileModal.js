import React from "react";
import "../styles/components/profile-modal.css";

/**
 * ProfileModal Component
 * Displays detailed user profile with verification option
 */
const ProfileModal = ({ profile, userType, onClose, onVerify, isVerifying }) => {
  if (!profile) return null;

  const renderProfileDetails = () => {
    switch (userType) {
      case "voter":
        return (
          <div className="profile-sections">
            <section className="profile-section">
              <h3>👤 Personal Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Voter ID:</label>
                  <span>{profile.voter_id}</span>
                </div>
                <div className="detail-item">
                  <label>Full Name:</label>
                  <span>{profile.full_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{profile.email || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Gmail:</label>
                  <span>{profile.gmail_id || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{profile.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Age:</label>
                  <span>{profile.age}</span>
                </div>
                <div className="detail-item">
                  <label>Gender:</label>
                  <span>{profile.gender}</span>
                </div>
                <div className="detail-item">
                  <label>Address:</label>
                  <span>{profile.address}</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>🗳️ Voting Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Constituency:</label>
                  <span>{profile.constituency_name}</span>
                </div>
                <div className="detail-item">
                  <label>Has Voted:</label>
                  <span className={profile.has_voted ? "status-yes" : "status-no"}>
                    {profile.has_voted ? "✅ Yes" : "❌ No"}
                  </span>
                </div>
                {profile.has_voted && (
                  <>
                    <div className="detail-item">
                      <label>Voted For:</label>
                      <span>{profile.voted_candidate_id || "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <label>Vote Time:</label>
                      <span>{new Date(profile.vote_timestamp).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="profile-section">
              <h3>✔️ Verification Status</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Verified:</label>
                  <span className={profile.is_verified ? "status-verified" : "status-pending"}>
                    {profile.is_verified ? "✅ Verified" : "⏳ Pending"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={profile.is_active ? "status-active" : "status-inactive"}>
                    {profile.is_active ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>📅 Activity</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Registered:</label>
                  <span>{new Date(profile.registration_date).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Login:</label>
                  <span>{profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}</span>
                </div>
              </div>
            </section>
          </div>
        );

      case "candidate":
        return (
          <div className="profile-sections">
            <section className="profile-section">
              <h3>🎤 Candidate Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Candidate ID:</label>
                  <span>{profile.candidate_id}</span>
                </div>
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{profile.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{profile.email || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Gmail:</label>
                  <span>{profile.gmail_id || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Age:</label>
                  <span>{profile.age}</span>
                </div>
                <div className="detail-item">
                  <label>Education:</label>
                  <span>{profile.education}</span>
                </div>
                <div className="detail-item">
                  <label>Experience:</label>
                  <span>{profile.experience}</span>
                </div>
                <div className="detail-item">
                  <label>Bio:</label>
                  <span>{profile.bio}</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>🏛️ Party & Constituency</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Party:</label>
                  <span>{profile.party_name} {profile.party_symbol}</span>
                </div>
                <div className="detail-item">
                  <label>Party Color:</label>
                  <span>
                    <div className="color-box" style={{ backgroundColor: profile.party_color }}></div>
                    {profile.party_color}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Constituency:</label>
                  <span>{profile.constituency_name}</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>🗳️ Voting Performance</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Total Votes:</label>
                  <span className="votes-count">{profile.votes}</span>
                </div>
                <div className="detail-item">
                  <label>Vote Percentage:</label>
                  <span>{profile.vote_percentage}%</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>✔️ Verification Status</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Verified:</label>
                  <span className={profile.is_verified ? "status-verified" : "status-pending"}>
                    {profile.is_verified ? "✅ Verified" : "⏳ Pending"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={profile.is_active ? "status-active" : "status-inactive"}>
                    {profile.is_active ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>📅 Activity</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Registered:</label>
                  <span>{new Date(profile.registration_date).toLocaleString()}</span>
                </div>
              </div>
            </section>
          </div>
        );

      case "party":
        return (
          <div className="profile-sections">
            <section className="profile-section">
              <h3>🏛️ Party Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Party ID:</label>
                  <span>{profile.party_id}</span>
                </div>
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{profile.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{profile.email || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Gmail:</label>
                  <span>{profile.gmail_id || "Not provided"}</span>
                </div>
                <div className="detail-item">
                  <label>Symbol:</label>
                  <span>{profile.symbol}</span>
                </div>
                <div className="detail-item">
                  <label>Color:</label>
                  <span>
                    <div className="color-box" style={{ backgroundColor: profile.color }}></div>
                    {profile.color}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Founded Year:</label>
                  <span>{profile.founded_year}</span>
                </div>
                <div className="detail-item">
                  <label>Description:</label>
                  <span>{profile.description}</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>📊 Statistics</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Total Candidates:</label>
                  <span className="stat-count">{profile.total_candidates}</span>
                </div>
                <div className="detail-item">
                  <label>Total Votes:</label>
                  <span className="stat-count">{profile.total_votes}</span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>✔️ Verification Status</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Verified:</label>
                  <span className={profile.is_verified ? "status-verified" : "status-pending"}>
                    {profile.is_verified ? "✅ Verified" : "⏳ Pending"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={profile.is_active ? "status-active" : "status-inactive"}>
                    {profile.is_active ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <h3>📅 Activity</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Registered:</label>
                  <span>{new Date(profile.registration_date).toLocaleString()}</span>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Detailed Profile</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {renderProfileDetails()}
        </div>

        <div className="modal-footer">
          {!profile.is_verified && (
            <button
              className="btn btn-success btn-lg"
              onClick={() => onVerify(profile, userType)}
              disabled={isVerifying}
            >
              {isVerifying ? "⏳ Verifying..." : "✅ Verify This User"}
            </button>
          )}
          <button className="btn btn-secondary btn-lg" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
