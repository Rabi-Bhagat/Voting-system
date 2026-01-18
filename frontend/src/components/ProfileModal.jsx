import React from 'react';
import '../styles/profile_modal.css';

/**
 * ProfileModal Component
 * Displays detailed user profile information in a modal
 * 
 * Props:
 * - isOpen: Boolean indicating if modal is open
 * - user: User object containing detailed information
 * - userType: Type of user ('voters', 'candidates', 'parties')
 * - onClose: Callback function when modal is closed
 */
const ProfileModal = ({ isOpen, user, userType, onClose }) => {
  if (!isOpen || !user) {
    return null;
  }

  /**
   * Get detailed profile information based on user type
   */
  const getProfileDetails = () => {
    switch (userType) {
      case 'voters':
        return (
          <div className="profile-details">
            <div className="detail-row">
              <label>First Name:</label>
              <span>{user.firstName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Last Name:</label>
              <span>{user.lastName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Gmail:</label>
              <span>{user.gmail || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Phone:</label>
              <span>{user.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Constituency:</label>
              <span>{user.constituency || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Age:</label>
              <span>{user.age || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Gender:</label>
              <span>{user.gender || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Verification Status:</label>
              <span className={user.verified ? 'status-verified' : 'status-pending'}>
                {user.verified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className="detail-row">
              <label>Registration Date:</label>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        );

      case 'candidates':
        return (
          <div className="profile-details">
            <div className="detail-row">
              <label>First Name:</label>
              <span>{user.firstName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Last Name:</label>
              <span>{user.lastName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Phone:</label>
              <span>{user.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Party:</label>
              <span>{user.party || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Constituency:</label>
              <span>{user.constituency || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Total Votes:</label>
              <span className="votes-count">{user.votes || 0}</span>
            </div>
            <div className="detail-row">
              <label>Bio:</label>
              <span>{user.bio || 'No bio provided'}</span>
            </div>
            <div className="detail-row">
              <label>Verification Status:</label>
              <span className={user.verified ? 'status-verified' : 'status-pending'}>
                {user.verified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className="detail-row">
              <label>Registration Date:</label>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        );

      case 'parties':
        return (
          <div className="profile-details">
            <div className="detail-row">
              <label>Party Name:</label>
              <span>{user.partyName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Phone:</label>
              <span>{user.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Total Members:</label>
              <span className="members-count">{user.members || 0}</span>
            </div>
            <div className="detail-row">
              <label>Founded Year:</label>
              <span>{user.foundedYear || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Description:</label>
              <span>{user.description || 'No description provided'}</span>
            </div>
            <div className="detail-row">
              <label>Verification Status:</label>
              <span className={user.verified ? 'status-verified' : 'status-pending'}>
                {user.verified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            <div className="detail-row">
              <label>Registration Date:</label>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {userType === 'parties' ? user.partyName : `${user.firstName} ${user.lastName}`}
          </h2>
          <button className="modal-close" onClick={onClose} title="Close modal">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {getProfileDetails()}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
