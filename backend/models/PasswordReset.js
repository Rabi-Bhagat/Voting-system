const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  user_type: { type: String, enum: ["voter", "admin", "party", "candidate"], required: true },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  otp_expiry: { type: Date, required: true },
  is_used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) } // 15 minutes
});

// Auto-delete expired OTPs
PasswordResetSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
