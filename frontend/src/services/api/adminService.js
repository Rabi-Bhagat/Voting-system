/**
 * Admin Service
 * Handles all admin-related API calls
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

const adminService = {
  /**
   * Get all voters
   */
  getVoters: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_VOTERS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all candidates
   */
  getCandidates: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_CANDIDATES);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all parties
   */
  getParties: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_PARTIES);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get dashboard summary
   */
  getSummary: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_SUMMARY);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify voter
   */
  verifyVoter: async (voterId) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.VERIFY_VOTER}/${voterId}`, {
        is_verified: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify candidate
   */
  verifyCandidate: async (candidateId) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.VERIFY_CANDIDATE}/${candidateId}`, {
        is_verified: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify party
   */
  verifyParty: async (partyId) => {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.VERIFY_PARTY}/${partyId}`, {
        is_verified: true,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Add voter
   */
  addVoter: async (voterData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ADD_VOTER, voterData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Add candidate
   */
  addCandidate: async (candidateData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ADD_CANDIDATE, candidateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Add party
   */
  addParty: async (partyData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.ADD_PARTY, partyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset all votes
   */
  resetVotes: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.RESET_VOTES);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Publish results
   */
  publishResults: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.PUBLISH_RESULTS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default adminService;
