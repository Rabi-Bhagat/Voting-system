import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Container, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; 
import '../styles/ballotPaper.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

const BallotPaper = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [voter, setVoter] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("voterInfo");
    if (stored) {
      const { voter_id } = JSON.parse(stored);
      fetchBallotData(voter_id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setFilteredCandidates(
      candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.party_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, candidates]);

  const fetchBallotData = async (voter_id) => {
    try {
      const res = await axios.get(`${API_BASE}/voter/ballot/${voter_id}`); 
      setCandidates(res.data.candidates);
      setVoter(res.data.voter);
      setLoading(false);
    } catch (err) {
      setMessage("Error fetching ballot data.");
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  const handleVoteClick = (candidate, isNota = false) => {
    if (isNota) {
      setSelectedCandidate({ 
        candidate_id: "NOTA", 
        name: "None of the Above", 
        party_name: "N/A" 
      });
    } else {
      setSelectedCandidate(candidate);
    }
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (!voter?.voter_id || !selectedCandidate) return;

    try {
      const res = await axios.post(`${API_BASE}/voter/vote`, { 
        voter_id: voter.voter_id,
        candidate_id: selectedCandidate.candidate_id,
      });
      
      setShowConfirm(false);
      setMessage(res.data.message);
      
      setVoter({
        ...voter,
        has_voted: true,
        voted_candidate_id: selectedCandidate.candidate_id,
      });
      
      if (res.data.receipt) {
        setTimeout(() => {
          navigate('/vote-receipt', { 
            state: { receipt: res.data.receipt }
          });
        }, 1500);
      }
    } catch (err) {
      console.error("Vote error:", err);
      // Wait a moment before closing so user sees error if any? 
      // Actually keeping modal open might be better if error, but for now just close and show toast
      setShowConfirm(false); 
      setMessage(err.response?.data?.error || "Voting failed.");
    }
  };

  if (loading) {
    return (
      <div className="ballot-loading">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3 text-white">Loading Ballot Paper...</h3>
      </div>
    );
  }

  return (
    <div className="ballot-wrapper">
      <Container className="py-5">
        <div className="ballot-header">
          <div className="header-content">
            <h1 className="ballot-title">🗳️ Official Ballot Paper</h1>
            <p className="ballot-subtitle">
              Constituency: <strong>{voter?.constituency_name || voter?.constituency}</strong>
            </p>
          </div>
          <Button 
            className="btn-back" 
            onClick={() => navigate("/voter_dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>

        {message && (
          <div className={`alert-box ${message.includes("failed") || message.includes("Error") ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <div className="search-bar-container">
          <Form.Control
            type="text"
            placeholder="🔍 Search candidate or party..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="candidates-grid">
          {filteredCandidates.map((candidate) => {
            const isSelected = voter?.has_voted && voter?.voted_candidate_id === candidate.candidate_id;
            const isOtherVoted = voter?.has_voted && !isSelected;

            return (
              <div 
                key={candidate.candidate_id} 
                className={`candidate-card ${isSelected ? 'voted-for' : ''} ${isOtherVoted ? 'disabled' : ''}`}
              >
                <div className="card-top-accent"></div>
                <div className="candidate-avatar">
                  {candidate.name.charAt(0)}
                </div>
                <div className="candidate-info">
                  <h3 className="candidate-name">{candidate.name}</h3>
                  <div className="party-badge">
                    {candidate.party_name}
                  </div>
                  <Button 
                    variant="link" 
                    className="view-profile-link"
                    onClick={() => navigate(`/candidate-profile/${candidate.candidate_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
                
                <div className="card-actions">
                  {isSelected ? (
                    <button className="vote-btn voted" disabled>
                      ✅ Voted
                    </button>
                  ) : (
                    <button 
                      className="vote-btn" 
                      onClick={() => handleVoteClick(candidate)}
                      disabled={isOtherVoted}
                    >
                      Vote
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* NOTA Option */}
          <div className={`candidate-card nota-card ${voter?.voted_candidate_id === "NOTA" ? 'voted-for' : ''} ${voter?.has_voted && voter?.voted_candidate_id !== "NOTA" ? 'disabled' : ''}`}>
            <div className="card-top-accent nota"></div>
            <div className="candidate-avatar nota-avatar">
              🚫
            </div>
            <div className="candidate-info">
              <h3 className="candidate-name">None of the Above</h3>
              <div className="party-badge nota-badge">
                NOTA
              </div>
              <p className="nota-desc">I do not wish to vote for any of the above candidates</p>
            </div>
            
            <div className="card-actions">
              {voter?.voted_candidate_id === "NOTA" ? (
                <button className="vote-btn voted" disabled>
                   ✅ Selected
                </button>
              ) : (
                <button 
                  className="vote-btn nota-btn" 
                  onClick={() => handleVoteClick(null, true)}
                  disabled={voter?.has_voted}
                >
                  Vote NOTA
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered className="vote-confirm-modal">
          <Modal.Header closeButton>
            <Modal.Title>Confirm Your Vote</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="confirm-icon">🗳️</div>
            <p>You are about to cast your vote for:</p>
            <h3>{selectedCandidate?.name}</h3>
            {selectedCandidate?.party_name !== "N/A" && (
              <p className="text-muted">Party: {selectedCandidate?.party_name}</p>
            )}
            <div className="alert alert-warning mt-3">
              <small>⚠️ This action cannot be undone. Please confirm your choice.</small>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmVote} className="confirm-vote-btn">
              Confirm & Vote
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default BallotPaper;
