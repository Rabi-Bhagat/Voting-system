import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/vote_receipt.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function VoteReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const receipt = location.state?.receipt;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) return;
    
    try {
      setVerifying(true);
      const res = await axios.post(`${API_BASE}/voter/verify-receipt`, {
        verification_code: verificationCode
      });
      setVerificationResult(res.data);
    } catch (error) {
      setVerificationResult({
        valid: false,
        message: error.response?.data?.error || 'Verification failed'
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Vote Cast Successfully!</h1>
          <p>Your vote has been securely recorded</p>
        </div>

        {/* Receipt Card */}
        {receipt && (
          <div className="receipt-card">
            <div className="receipt-header">
              <span className="receipt-badge">🗳️ VOTE RECEIPT</span>
              <span className="timestamp">{new Date().toLocaleString()}</span>
            </div>

            <div className="receipt-body">
              <div className="receipt-field">
                <label>Receipt ID</label>
                <div className="field-value">
                  <span>{receipt.receipt_id}</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(receipt.receipt_id)}
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="receipt-field highlight">
                <label>Verification Code</label>
                <div className="field-value verification-code">
                  <span>{receipt.verification_code}</span>
                  <button 
                    className="copy-btn" 
                    onClick={() => copyToClipboard(receipt.verification_code)}
                  >
                    📋
                  </button>
                </div>
                <p className="field-hint">
                  Save this code to verify your vote was counted
                </p>
              </div>

              <div className="qr-placeholder">
                <div className="qr-box">
                  <span>📱</span>
                  <p>QR Code</p>
                  <small>{receipt.verification_code}</small>
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <p>🔒 Your vote is anonymous and secure</p>
              <p>This receipt does not reveal your vote choice</p>
            </div>
          </div>
        )}

        {/* Verify Section */}
        <div className="verify-section">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowVerify(!showVerify)}
          >
            {showVerify ? 'Hide Verification' : '🔍 Verify a Vote'}
          </button>

          {showVerify && (
            <div className="verify-form">
              <h3>Verify Vote Receipt</h3>
              <p>Enter your verification code to confirm your vote was recorded</p>
              
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-character code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleVerify}
                  disabled={verifying || verificationCode.length !== 6}
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {verificationResult && (
                <div className={`verification-result ${verificationResult.valid ? 'success' : 'error'}`}>
                  {verificationResult.valid ? (
                    <>
                      <div className="result-icon">✓</div>
                      <h4>Vote Verified!</h4>
                      <p>{verificationResult.message}</p>
                      {verificationResult.receipt && (
                        <div className="result-details">
                          <p><strong>Receipt ID:</strong> {verificationResult.receipt.receipt_id}</p>
                          <p><strong>Timestamp:</strong> {new Date(verificationResult.receipt.timestamp).toLocaleString()}</p>
                          <p><strong>Constituency:</strong> {verificationResult.receipt.constituency}</p>
                          <p><strong>Vote Hash:</strong> {verificationResult.receipt.vote_hash}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="result-icon error">✗</div>
                      <h4>Verification Failed</h4>
                      <p>{verificationResult.message}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/voter-dashboard')}
          >
            ← Back to Dashboard
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            🖨️ Print Receipt
          </button>
        </div>

        {/* Security Info */}
        <div className="security-info">
          <h4>🔒 About Vote Security</h4>
          <ul>
            <li>Your vote is encrypted and stored anonymously</li>
            <li>The verification code proves your vote was counted without revealing your choice</li>
            <li>Each vote is assigned a unique cryptographic hash</li>
            <li>Vote records cannot be traced back to individual voters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VoteReceipt;
