// Admin configuration
// In production, use environment variables and proper password hashing

module.exports = {
  adminCredentials: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123"
  }
};
