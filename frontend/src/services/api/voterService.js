/**
 * Voter Service
 * Handles all voter-related API calls
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

const voterService = {
  /**
   * Get voter profile
   */
  getProfile: async (voterId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.VOTER.PROFILE}/${voterId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get voting ballot
   */
  getBallot: async (voterId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.VOTER.BALLOT}/${voterId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cast vote
   */
  castVote: async (voterId, candidateId) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.VOTER.VOTE, {
        voter_id: voterId,
        candidate_id: candidateId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get voting history
   */
  getHistory: async (voterId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.VOTER.HISTORY}/${voterId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default voterService;
