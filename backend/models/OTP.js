const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    enum: ['voter', 'candidate', 'party', 'admin'],
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['login', 'vote', 'reset_password', 'verify_account'],
    required: true
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  is_used: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  max_attempts: {
    type: Number,
    default: 3
  },
  expires_at: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
otpSchema.index({ user_id: 1, purpose: 1 });
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create OTP for a user
otpSchema.statics.createOTP = async function(userId, userType, purpose, contactInfo) {
  // Invalidate any existing OTPs for this user and purpose
  await this.updateMany(
    { user_id: userId, purpose: purpose, is_used: false },
    { is_used: true }
  );
  
  const otp = new this({
    user_id: userId,
    user_type: userType,
    otp: this.generateOTP(),
    purpose: purpose,
    email: contactInfo.email || null,
    phone: contactInfo.phone || null,
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
  
  await otp.save();
  return otp;
};

// Verify OTP
otpSchema.statics.verifyOTP = async function(userId, purpose, otpCode) {
  const otpRecord = await this.findOne({
    user_id: userId,
    purpose: purpose,
    is_used: false,
    expires_at: { $gt: new Date() }
  }).sort({ createdAt: -1 });
  
  if (!otpRecord) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (otpRecord.attempts >= otpRecord.max_attempts) {
    return { valid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
  }
  
  if (otpRecord.otp !== otpCode) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return { valid: false, message: `Invalid OTP. ${otpRecord.max_attempts - otpRecord.attempts} attempts remaining.` };
  }
  
  // Mark OTP as used
  otpRecord.is_used = true;
  await otpRecord.save();
  
  return { valid: true, message: 'OTP verified successfully' };
};

// Check if user has valid OTP
otpSchema.statics.hasValidOTP = async function(userId, purpose) {
  const count = await this.countDocuments({
    user_id: userId,
    purpose: purpose,
    is_used: false,
    expires_at: { $gt: new Date() }
  });
  return count > 0;
};

module.exports = mongoose.model('OTP', otpSchema);
