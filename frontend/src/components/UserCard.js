import React from 'react';
import '../styles/user_card.css';

/**
 * UserCard Component
 * Displays user information with verification status and action buttons
 * 
 * Props:
 * - user: User object containing id, name, email, verified, etc.
 * - userType: Type of user ('voters', 'candidates', 'parties')
 * - onViewProfile: Callback function when "View Profile" is clicked
 * - onVerify: Callback function when "Verify" button is clicked
 * - isVerifying: Boolean indicating if verification is in progress
 */
const UserCard = ({ user, userType, onViewProfile, onVerify, isVerifying }) => {
  // Determine the display name based on user type
  const getDisplayName = () => {
    if (userType === 'parties') {
      return user.partyName || user.name || 'Unknown Party';
    }
    return user.name || user.firstName + ' ' + user.lastName || 'Unknown User';
  };

  // Get verification status badge
  const getVerificationBadge = () => {
    if (user.verified) {
      return (
        <div className="verification-badge verified">
          <span className="badge-icon">✅</span>
          <span className="badge-text">Verified</span>
        </div>
      );
    }
    return (
      <div className="verification-badge pending">
        <span className="badge-icon">⏳</span>
        <span className="badge-text">Pending</span>
      </div>
    );
  };

  // Get user-specific info to display
  const getAdditionalInfo = () => {
    switch (userType) {
      case 'voters':
        return (
          <>
            <p className="user-info">
              <strong>Email:</strong> {user.email || 'N/A'}
            </p>
            <p className="user-info">
              <strong>Constituency:</strong> {user.constituency || 'N/A'}
            </p>
          </>
        );
      case 'candidates':
        return (
          <>
            <p className="user-info">
              <strong>Email:</strong> {user.email || 'N/A'}
            </p>
            <p className="user-info">
              <strong>Party:</strong> {user.party || 'N/A'}
            </p>
            <p className="user-info">
              <strong>Votes:</strong> {user.votes || 0}
            </p>
          </>
        );
      case 'parties':
        return (
          <>
            <p className="user-info">
              <strong>Email:</strong> {user.email || 'N/A'}
            </p>
            <p className="user-info">
              <strong>Members:</strong> {user.members || 0}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-card">
      {/* Header with name and verification badge */}
      <div className="card-header">
        <h3 className="user-name">{getDisplayName()}</h3>
        {getVerificationBadge()}
      </div>

      {/* User information */}
      <div className="card-body">
        {getAdditionalInfo()}
      </div>

      {/* Action buttons */}
      <div className="card-footer">
        <button
          className="btn btn-secondary"
          onClick={() => onViewProfile(user)}
          title="View detailed profile information"
        >
          View Profile
        </button>
        {!user.verified && (
          <button
            className="btn btn-primary"
            onClick={() => onVerify(user.id)}
            disabled={isVerifying}
            title="Mark user as verified"
          >
            {isVerifying ? 'Verifying...' : '✓ Verify'}
          </button>
        )}
        {user.verified && (
          <button
            className="btn btn-success"
            disabled
            title="User is already verified"
          >
            ✓ Verified
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
