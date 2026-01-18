/**
 * Application Messages
 * Centralized error and success messages
 */

export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please try again.',
  VERIFICATION_FAILED: 'Verification failed. Please try again.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  VERIFICATION_SUCCESS: 'User verified successfully!',
  VOTE_CAST_SUCCESS: 'Your vote has been cast successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
};

export const USER_ROLES = {
  VOTER: 'voter',
  ADMIN: 'admin',
  PARTY: 'party',
  CONSTITUENCY: 'constituency',
};
