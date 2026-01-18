/**
 * useAuth Hook
 * Custom hook for authentication logic
 */

import { useState, useCallback } from 'react';
import authService from '../services/api/authService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';

export const useAuth = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Login user
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        // Store user info based on role
        if (credentials.role === 'voter' && response.voter) {
          localStorage.setItem('voterInfo', JSON.stringify(response.voter));
        } else if (credentials.role === 'admin' && response.admin) {
          localStorage.setItem('adminInfo', JSON.stringify(response.admin));
        } else if (credentials.role === 'party' && response.party) {
          localStorage.setItem('partyInfo', JSON.stringify(response.party));
        } else if (credentials.role === 'constituency' && response.constituency) {
          localStorage.setItem('constituencyInfo', JSON.stringify(response.constituency));
        }
        setUser(authService.getCurrentUser());
        return response;
      }
    } catch (err) {
      const errorMsg = err.error || ERROR_MESSAGES.LOGIN_FAILED;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError('');
    } catch (err) {
      setError(err.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};

export default useAuth;
