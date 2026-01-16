const express = require("express");
const router = express.Router();
const Voter = require("../models/Voter");
const Candidate = require("../models/Candidate");
const Party = require("../models/Party");
const PasswordReset = require("../models/PasswordReset");

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /password-recovery/request-otp - Request OTP for password reset
router.post("/request-otp", async (req, res) => {
  const { user_id, user_type, email } = req.body;

  if (!user_id || !user_type || !email) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["user_id", "user_type", "email"]
    });
  }

  if (!["voter", "admin", "party", "candidate"].includes(user_type)) {
    return res.status(400).json({
      error: "Invalid user_type. Must be: voter, admin, party, or candidate"
    });
  }

  try {
    // Verify user exists and email matches
    let user = null;
    if (user_type === "voter") {
      user = await Voter.findOne({ voter_id: user_id });
    } else if (user_type === "candidate") {
      user = await Candidate.findOne({ candidate_id: user_id });
    } else if (user_type === "party") {
      user = await Party.findOne({ party_id: user_id });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email !== email && user.gmail_id !== email) {
      return res.status(400).json({
        error: "Email does not match registered email or Gmail"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to database
    await PasswordReset.create({
      user_id,
      user_type,
      email,
      otp,
      otp_expiry
    });

    // In production, send OTP via email service (SendGrid, Nodemailer, etc.)
    // For now, return OTP (remove in production)
    res.json({
      success: true,
      message: "OTP sent to your email",
      otp: otp, // Remove in production
      expires_in: "15 minutes",
      note: "In production, OTP will be sent via email service"
    });
  } catch (err) {
    console.error("Error requesting OTP:", err);
    res.status(500).json({
      error: "Failed to request OTP",
      details: err.message
    });
  }
});

// POST /password-recovery/verify-otp - Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { user_id, user_type, otp } = req.body;

  if (!user_id || !user_type || !otp) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["user_id", "user_type", "otp"]
    });
  }

  try {
    // Find OTP record
    const resetRecord = await PasswordReset.findOne({
      user_id,
      user_type,
      otp,
      is_used: false
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > resetRecord.otp_expiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Mark OTP as used
    resetRecord.is_used = true;
    await resetRecord.save();

    res.json({
      success: true,
      message: "OTP verified successfully",
      reset_token: resetRecord._id.toString()
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({
      error: "Failed to verify OTP",
      details: err.message
    });
  }
});

// POST /password-recovery/reset-password - Reset password with OTP
router.post("/reset-password", async (req, res) => {
  const { user_id, user_type, reset_token, new_password } = req.body;

  if (!user_id || !user_type || !reset_token || !new_password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["user_id", "user_type", "reset_token", "new_password"]
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters"
    });
  }

  try {
    // Verify reset token
    const resetRecord = await PasswordReset.findById(reset_token);

    if (!resetRecord || resetRecord.is_used) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (resetRecord.user_id !== user_id || resetRecord.user_type !== user_type) {
      return res.status(400).json({ error: "Token does not match user" });
    }

    // Update password
    let user = null;
    if (user_type === "voter") {
      user = await Voter.findOne({ voter_id: user_id });
    } else if (user_type === "candidate") {
      user = await Candidate.findOne({ candidate_id: user_id });
    } else if (user_type === "party") {
      user = await Party.findOne({ party_id: user_id });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = new_password;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({
      error: "Failed to reset password",
      details: err.message
    });
  }
});

module.exports = router;
