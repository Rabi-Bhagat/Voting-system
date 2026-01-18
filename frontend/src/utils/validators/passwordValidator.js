/**
 * Password Validator Functions
 */

/**
 * Validate password strength
 * Minimum 6 characters
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate password is not empty
 */
export const isPasswordRequired = (password) => {
  return password && password.trim().length > 0;
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password1, password2) => {
  return password1 === password2;
};
