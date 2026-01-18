/**
 * Email Validator Functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Gmail format
 */
export const isValidGmail = (email) => {
  return isValidEmail(email) && email.endsWith('@gmail.com');
};

/**
 * Validate email is not empty
 */
export const isEmailRequired = (email) => {
  return email && email.trim().length > 0;
};
