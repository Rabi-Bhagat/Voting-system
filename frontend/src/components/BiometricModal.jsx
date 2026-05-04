import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, CheckCircle, ScanFace } from 'lucide-react';
import '../styles/biometric.css';

const BiometricModal = ({ isOpen, onSuccess, onCancel, type = "login" }) => {
  // States: 'face-scanning', 'face-success', 'finger-scanning', 'finger-success'
  const [status, setStatus] = useState('face-scanning');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize webcam when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('face-scanning');
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isOpen]);

  // Handle phase transitions
  useEffect(() => {
    // Phase transitions are now manual
  }, [status, onSuccess]);

  const handleManualFingerVerify = () => {
    setStatus('finger-success');
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleManualFaceVerify = () => {
    setStatus('face-success');
    stopWebcam();
    setTimeout(() => {
      setStatus('finger-scanning');
    }, 1500);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      // Fallback: Just skip to face-success if webcam fails
      setStatus('face-success');
      setTimeout(() => setStatus('finger-scanning'), 1500);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="biometric-overlay">
      <div className="biometric-modal">
        
        {/* Face Phase */}
        {(status === 'face-scanning' || status === 'face-success') && (
          <>
            <div className={`camera-container ${status === 'face-success' ? 'success' : ''}`}>
              {status === 'face-scanning' ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
                  <div className="face-overlay">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="face-laser"></div>
                  </div>
                </>
              ) : (
                <div className="success-icon-container">
                  <CheckCircle className="success-mark" size={80} />
                </div>
              )}
            </div>
            
            <h3 className="status-text">
              {status === 'face-scanning' ? 'Scanning Facial Biometrics...' : 'Face Verified!'}
            </h3>
            <p className="status-subtext">
              {status === 'face-scanning' 
                ? 'Please look directly at the camera' 
                : 'Initiating fingerprint scan...'}
            </p>
          </>
        )}

        {/* Fingerprint Phase */}
        {(status === 'finger-scanning' || status === 'finger-success') && (
          <>
            <div className={`scanner-container ${status === 'finger-success' ? 'success' : 'scanning'}`}>
              <Fingerprint className="fingerprint-icon" />
              <div className="laser"></div>
              {status === 'finger-success' && (
                <CheckCircle className="success-mark" size={60} />
              )}
            </div>
            
            <h3 className="status-text">
              {status === 'finger-scanning' ? 'Verifying Fingerprint...' : 'Identity Verified!'}
            </h3>
            <p className="status-subtext">
              {status === 'finger-scanning' 
                ? 'Please keep your finger on the scanner' 
                : `Authorizing ${type}...`}
            </p>
          </>
        )}

        {(status === 'face-scanning' || status === 'finger-scanning') && (
          <div className="button-group">
            {status === 'face-scanning' && (
              <button 
                className="btn btn-success mt-4 btn-sm verify-btn"
                onClick={handleManualFaceVerify}
                style={{ marginRight: '10px' }}
              >
                Verify Face manually
              </button>
            )}
            {status === 'finger-scanning' && (
              <button 
                className="btn btn-success mt-4 btn-sm verify-btn"
                onClick={handleManualFingerVerify}
                style={{ marginRight: '10px' }}
              >
                Verify Fingerprint manually
              </button>
            )}
            <button 
              className="btn btn-outline-danger mt-4 btn-sm cancel-btn"
              onClick={onCancel}
            >
              Cancel Authentication
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiometricModal;
