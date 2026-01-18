/**
 * API Endpoints
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
  },

  // Admin
  ADMIN: {
    DASHBOARD_VOTERS: '/admin-dashboard/voters',
    DASHBOARD_CANDIDATES: '/admin-dashboard/candidates',
    DASHBOARD_PARTIES: '/admin-dashboard/parties',
    DASHBOARD_SUMMARY: '/admin-dashboard/summary',
    VERIFY_VOTER: '/admin/verify/voter',
    VERIFY_CANDIDATE: '/admin/verify/candidate',
    VERIFY_PARTY: '/admin/verify/party',
    ADD_VOTER: '/admin/add-voter',
    ADD_CANDIDATE: '/admin/add-candidate',
    ADD_PARTY: '/admin/add-party',
    RESET_VOTES: '/admin/reset-votes',
    PUBLISH_RESULTS: '/admin/publish-results',
  },

  // Voter
  VOTER: {
    PROFILE: '/voter/profile',
    BALLOT: '/voter/ballot',
    VOTE: '/voter/vote',
    HISTORY: '/voter/history',
  },

  // Candidate
  CANDIDATE: {
    PROFILE: '/candidates/profile',
    BY_CONSTITUENCY: '/candidates',
  },

  // Party
  PARTY: {
    PROFILE: '/party/profile',
  },

  // Results
  RESULTS: {
    GET: '/admin/results',
    PUBLISH: '/admin/publish-results',
  },

  // Health
  HEALTH: '/health',
  DB_STATUS: '/db-status',
};
