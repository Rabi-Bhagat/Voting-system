import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle } from 'lucide-react';
import '../styles/biometric.css';

const BiometricModal = ({ isOpen, onSuccess, onCancel, type = "login" }) => {
  const [status, setStatus] = useState('scanning'); // scanning, success

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      
      // Simulate biometric scan delay (2.5 seconds)
      const timer = setTimeout(() => {
        setStatus('success');
        
        // Wait a bit after success to show the green checkmark before completing
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="biometric-overlay">
      <div className="biometric-modal">
        <div className={`scanner-container ${status}`}>
          <Fingerprint className="fingerprint-icon" />
          <div className="laser"></div>
          {status === 'success' && (
            <CheckCircle className="success-mark" size={60} />
          )}
        </div>
        
        <h3 className="status-text">
          {status === 'scanning' ? 'Verifying Identity...' : 'Identity Verified!'}
        </h3>
        <p className="status-subtext">
          {status === 'scanning' 
            ? 'Please keep your finger on the scanner' 
            : `Authorizing ${type}...`}
        </p>

        {status === 'scanning' && (
          <button 
            className="btn btn-outline-danger mt-4 btn-sm"
            onClick={onCancel}
            style={{ borderRadius: '20px', padding: '5px 20px' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BiometricModal;
