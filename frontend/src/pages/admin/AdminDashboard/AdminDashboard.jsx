/**
 * AdminDashboard Component
 * Main admin dashboard page
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/api/adminService';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../constants/messages';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Display message
   */
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  /**
   * Reset all votes
   */
  const handleResetVotes = async () => {
    if (!window.confirm('Are you sure you want to reset all votes?')) return;

    setLoading(true);
    try {
      await adminService.resetVotes();
      showMessage(SUCCESS_MESSAGES.VERIFICATION_SUCCESS, 'success');
    } catch (err) {
      showMessage(err.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Publish results
   */
  const handlePublishResults = async () => {
    if (!window.confirm('Are you sure you want to publish results?')) return;

    setLoading(true);
    try {
      await adminService.publishResults();
      showMessage(SUCCESS_MESSAGES.VERIFICATION_SUCCESS, 'success');
      setTimeout(() => navigate('/results'), 1500);
    } catch (err) {
      showMessage(err.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <h1 className={styles.title}>🗳️ Admin Dashboard</h1>

        {/* Action Buttons */}
        <div className={styles.buttonGrid}>
          <button
            onClick={handleResetVotes}
            disabled={loading}
            className={`${styles.button} ${styles.reset}`}
          >
            🔄 Reset All Votes
          </button>
          <button
            onClick={handlePublishResults}
            disabled={loading}
            className={`${styles.button} ${styles.publish}`}
          >
            📊 Publish Results
          </button>
          <button
            onClick={() => navigate('/admin/verify')}
            className={`${styles.button} ${styles.verify}`}
          >
            👁️ View & Verify Users
          </button>
          <button
            onClick={handleLogout}
            className={`${styles.button} ${styles.logout}`}
          >
            🚪 Logout
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
