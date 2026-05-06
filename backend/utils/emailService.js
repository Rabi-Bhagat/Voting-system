const nodemailer = require('nodemailer');

// Configure transporter
// For Gmail, you MUST use an "App Password" (https://myaccount.google.com/apppasswords)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_PASS  // Your Gmail App Password
    }
});

const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Premium Voting System" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Verification OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #00ff88; text-align: center;">Identity Verification</h2>
                <p>Hello,</p>
                <p>You have requested a one-time password (OTP) for the Voting Management System. Please use the following code to complete your verification:</p>
                <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #1a1a1a; letter-spacing: 5px;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Premium Voting Management System. Secure & Transparent.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendOTPEmail };
