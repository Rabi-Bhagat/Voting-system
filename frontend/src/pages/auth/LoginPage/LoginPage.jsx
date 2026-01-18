/**
 * LoginPage Component
 * Main login page for all user roles
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { USER_ROLES, ERROR_MESSAGES } from '../../../constants/messages';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();

  const [role, setRole] = useState(USER_ROLES.VOTER);
  const [formData, setFormData] = useState({});
  const [localError, setLocalError] = useState('');

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  /**
   * Handle role change
   */
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({});
    setLocalError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      const response = await login({ ...formData, role });
      if (response.redirect) {
        navigate(response.redirect);
      }
    } catch (err) {
      setLocalError(err.error || ERROR_MESSAGES.LOGIN_FAILED);
    }
  };

  /**
   * Get form fields based on role
   */
  const getFormFields = () => {
    switch (role) {
      case USER_ROLES.VOTER:
        return (
          <>
            <input
              name="voter_id"
              placeholder="Voter ID"
              required
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="first_name"
              placeholder="First Name"
              required
              onChange={handleChange}
              className={styles.input}
            />
            <input
              name="last_name"
              placeholder="Last Name"
              required
              onChange={handleChange}
              className={styles.input}
            />
          </>
        );
      case USER_ROLES.PARTY:
        return (
          <input
            name="party_id"
            placeholder="Party ID"
            required
            onChange={handleChange}
            className={styles.input}
          />
        );
      case USER_ROLES.CONSTITUENCY:
        return (
          <input
            name="constituency_id"
            placeholder="Constituency ID"
            required
            onChange={handleChange}
            className={styles.input}
          />
        );
      case USER_ROLES.ADMIN:
        return (
          <p className={styles.adminNote}>Enter Admin Password</p>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>🗳️ VOTING SYSTEM</h1>
        <h4 className={styles.subtitle}>SIGN IN TO CONTINUE</h4>

        {/* Role Switcher */}
        {role !== USER_ROLES.ADMIN && (
          <div className={styles.roleContainer}>
            <div className={styles.roleTabs}>
              {[USER_ROLES.VOTER, USER_ROLES.PARTY, USER_ROLES.CONSTITUENCY].map((r) => (
                <button
                  key={r}
                  className={`${styles.roleTab} ${role === r ? styles.active : ''}`}
                  onClick={() => handleRoleChange(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {getFormFields()}

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Error Messages */}
          {(localError || authError) && (
            <div className={styles.error}>
              {localError || authError}
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {role !== USER_ROLES.ADMIN ? (
            <>
              <button
                onClick={() => handleRoleChange(USER_ROLES.ADMIN)}
                className={styles.secondaryButton}
              >
                Admin Login
              </button>
              <button
                onClick={() => navigate('/results')}
                className={styles.secondaryButton}
              >
                View Results
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRoleChange(USER_ROLES.VOTER)}
              className={styles.secondaryButton}
            >
              Back to User Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
