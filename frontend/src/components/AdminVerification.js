import React, { useState } from 'react';
import { useVerification } from '../hooks/useVerification';
import UserCard from './UserCard';
import ProfileModal from './ProfileModal';
import '../styles/admin_verification.css';

/**
 * AdminVerification Component
 * Main component for admin verification system
 * Displays users in tabs (Voters, Candidates, Parties) with verification capabilities
 */
const AdminVerification = () => {
  // Use custom hook for verification logic
  const {
    loading,
    error,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    verifyUser,
    getFilteredUsers,
  } = useVerification();

  // Local state for modal and verification
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState(null);

  /**
   * Handle view profile button click
   */
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  /**
   * Handle verify button click
   */
  const handleVerify = async (userId) => {
    setVerifyingUserId(userId);
    const success = await verifyUser(userId, activeTab);
    if (success) {
      // Close modal if it's open and the verified user is displayed
      if (isModalOpen && selectedUser?.id === userId) {
        setIsModalOpen(false);
      }
    }
    setVerifyingUserId(null);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Get filtered users based on active tab and filter
  const filteredUsers = getFilteredUsers();

  // Get tab label with user count
  const getTabLabel = (tabName) => {
    const counts = {
      voters: 'Voters',
      candidates: 'Candidates',
      parties: 'Parties',
    };
    return counts[tabName] || tabName;
  };

  return (
    <div className="admin-verification-container">
      {/* Header Section */}
      <div className="verification-header">
        <h1 className="verification-title">Admin Verification System</h1>
        <p className="verification-subtitle">
          Manage and verify voters, candidates, and parties
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tabs-container">
        <div className="tabs-navigation">
          {['voters', 'candidates', 'parties'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              title={`View ${tab}`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <label htmlFor="status-filter" className="filter-label">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="verified">✅ Verified</option>
            <option value="pending">⏳ Pending</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading {activeTab}...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p className="empty-text">
            No {activeTab} found with the selected filter.
          </p>
        </div>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length > 0 && (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              userType={activeTab}
              onViewProfile={handleViewProfile}
              onVerify={handleVerify}
              isVerifying={verifyingUserId === user.id}
            />
          ))}
        </div>
      )}

      {/* Results Counter */}
      {!loading && filteredUsers.length > 0 && (
        <div className="results-counter">
          <p>
            Showing <strong>{filteredUsers.length}</strong> {activeTab}
            {filterStatus !== 'all' && ` (${filterStatus})`}
          </p>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        user={selectedUser}
        userType={activeTab}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AdminVerification;
