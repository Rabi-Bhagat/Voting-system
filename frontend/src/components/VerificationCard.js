import React from "react";
import "../styles/components/verification-card.css";

/**
 * VerificationCard Component
 * Displays user information with verification status and actions
 */
const VerificationCard = ({ user, userType, onViewProfile, onVerify, isVerifying }) => {
  const getVerificationStatus = (isVerified) => {
    return isVerified ? (
      <span className="badge badge-verified">✅ Verified</span>
    ) : (
      <span className="badge badge-pending">⏳ Pending</span>
    );
  };

  const renderUserInfo = () => {
    switch (userType) {
      case "voter":
        return (
          <>
            <p><strong>ID:</strong> {user.voter_id}</p>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Gmail:</strong> {user.gmail_id || "N/A"}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Constituency:</strong> {user.constituency_name}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <p><strong>Voted:</strong> {user.has_voted ? "✅ Yes" : "❌ No"}</p>
          </>
        );
      case "candidate":
        return (
          <>
            <p><strong>ID:</strong> {user.candidate_id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Party:</strong> {user.party_name} {user.party_symbol}</p>
            <p><strong>Constituency:</strong> {user.constituency_name}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Gmail:</strong> {user.gmail_id || "N/A"}</p>
            <p><strong>Education:</strong> {user.education}</p>
            <p><strong>Experience:</strong> {user.experience}</p>
            <p><strong>Votes:</strong> {user.votes}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </>
        );
      case "party":
        return (
          <>
            <p><strong>ID:</strong> {user.party_id}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Gmail:</strong> {user.gmail_id || "N/A"}</p>
            <p><strong>Symbol:</strong> {user.symbol}</p>
            <p><strong>Candidates:</strong> {user.total_candidates}</p>
            <p><strong>Total Votes:</strong> {user.total_votes}</p>
            <p><strong>Founded:</strong> {user.founded_year}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`verification-card ${user.is_verified ? "verified" : "pending"}`}>
      <div className="card-header">
        <h4 className="card-title">
          {userType === "voter" && user.full_name}
          {userType === "candidate" && user.name}
          {userType === "party" && user.name}
        </h4>
        {getVerificationStatus(user.is_verified)}
      </div>

      <div className="card-body">
        {renderUserInfo()}
      </div>

      <div className="card-footer">
        <button
          className="btn btn-primary btn-view"
          onClick={() => onViewProfile(user, userType)}
        >
          👁️ View Profile
        </button>
        {!user.is_verified && (
          <button
            className="btn btn-success btn-verify"
            onClick={() => onVerify(user, userType)}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "✅ Verify"}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationCard;
