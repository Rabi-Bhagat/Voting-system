import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mail, ShieldCheck, RefreshCcw, X } from 'lucide-react';
import '../styles/otp_modal.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const OTPModal = ({ email, onVerify, onCancel }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move focus to next input
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE}/auth/otp/verify-otp`, { email, otp: fullOtp });
            if (res.data.success) {
                onVerify();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
            // Reset OTP on failure
            setOtp(['', '', '', '', '', '']);
            inputRefs[0].current.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        
        setLoading(true);
        try {
            await axios.post(`${API_BASE}/auth/otp/send-otp`, { email });
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setError('');
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-overlay">
            <div className="otp-modal glass-panel">
                <button className="close-btn" onClick={onCancel}><X size={20} /></button>
                
                <div className="otp-header">
                    <div className="icon-badge">
                        <Mail className="glow-icon" size={32} />
                    </div>
                    <h2>Verify Your Email</h2>
                    <p>We've sent a 6-digit security code to <br/><strong>{email}</strong></p>
                </div>

                <div className="otp-inputs">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="otp-field"
                            disabled={loading}
                        />
                    ))}
                </div>

                {error && <div className="otp-error">❌ {error}</div>}

                <button 
                    className="premium-btn verify-btn" 
                    onClick={handleVerify}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : <><ShieldCheck size={20} /> Verify & Continue</>}
                </button>

                <div className="otp-footer">
                    {canResend ? (
                        <button className="resend-link" onClick={handleResend} disabled={loading}>
                            <RefreshCcw size={14} /> Resend OTP
                        </button>
                    ) : (
                        <span className="timer-text">Resend in {timer}s</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
