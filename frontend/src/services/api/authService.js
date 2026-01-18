/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.id - User ID
 * @param {string} credentials.password - User password
 * @param {string} credentials.role - User role (voter, admin, party, constituency)
 * @returns {Promise} Login response
 */
const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  logout: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('authToken');
      localStorage.removeItem('voterInfo');
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('partyInfo');
      localStorage.removeItem('constituencyInfo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user info from localStorage
   * @returns {Object} User info
   */
  getCurrentUser: () => {
    const voterInfo = localStorage.getItem('voterInfo');
    const adminInfo = localStorage.getItem('adminInfo');
    const partyInfo = localStorage.getItem('partyInfo');
    const constituencyInfo = localStorage.getItem('constituencyInfo');

    if (voterInfo) return { ...JSON.parse(voterInfo), role: 'voter' };
    if (adminInfo) return { ...JSON.parse(adminInfo), role: 'admin' };
    if (partyInfo) return { ...JSON.parse(partyInfo), role: 'party' };
    if (constituencyInfo) return { ...JSON.parse(constituencyInfo), role: 'constituency' };

    return null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    return authService.getCurrentUser() !== null;
  },
};

export default authService;
