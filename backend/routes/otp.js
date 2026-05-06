const express = require('express');
const router = express.Router();
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Route: Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = generateOTP();

    try {
        // Save to DB
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send Email
        const sent = await sendOTPEmail(email, otp);
        if (sent) {
            res.json({ success: true, message: 'OTP sent to your email' });
        } else {
            res.status(500).json({ error: 'Failed to send OTP email' });
        }
    } catch (error) {
        console.error('OTP Send Route Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route: Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    try {
        const record = await OTP.findOne({ email, otp });
        if (record) {
            // Delete after verification
            await OTP.deleteOne({ _id: record._id });
            res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ error: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error('OTP Verify Route Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
