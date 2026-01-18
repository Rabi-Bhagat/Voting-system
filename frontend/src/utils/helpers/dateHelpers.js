/**
 * Date Helper Functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get days difference between two dates
 */
export const getDaysDifference = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};
