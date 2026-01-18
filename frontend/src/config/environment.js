/**
 * Environment Configuration
 * Centralized configuration for API and app settings
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const APP_CONFIG = {
  appName: 'Online Voting System',
  version: '2.1',
  environment: process.env.NODE_ENV || 'development',
};

export const API_TIMEOUT = 30000; // 30 seconds
