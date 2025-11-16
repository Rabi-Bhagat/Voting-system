import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; 
import '../styles/ballotPaper.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

const BallotPaper = () => {
  const [candidates, setCandidates] = useState([]);
  const [voter, setVoter] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // initialize navigation

  useEffect(() => {
    const stored = localStorage.getItem("voterInfo");
    if (stored) {
      const { voter_id } = JSON.parse(stored);

      const fetchBallotData = async () => {
        try {
          // const res = await axios.get(`http://localhost:5000/voter/ballot/${voter_id}`);
          const res = await axios.get(`${API_BASE}/voter/ballot/${voter_id}`); 
          setCandidates(res.data.candidates);
          setVoter(res.data.voter);
        } catch (err) {
          setMessage("Error fetching ballot data.");
          console.error("Fetch Error:", err);
        }
      };

      fetchBallotData();
    }
  }, []);

  const handleVote = async (candidate_id) => {
    if (!voter?.voter_id) {
      setMessage("Voter ID missing. Cannot vote.");
      return;
    }

    try {
      // const res = await axios.post("http://localhost:5000/voter/vote", {
      const res = await axios.post(`${API_BASE}/voter/vote`, { 
        voter_id: voter.voter_id,
        candidate_id,
      });
      setMessage(res.data.message);
      setVoter({
        ...voter,
        has_voted: true,
        voted_candidate_id: candidate_id,
      });
    } catch (err) {
      console.error("Vote error:", err);
      setMessage(err.response?.data?.error || "Voting failed.");
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white edit-head">Ballot Paper</h2>
        <Button variant="outline-primary" onClick={() => navigate("/voter_dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      {message && <Alert variant="info">{message}</Alert>}

      <Row>
        {candidates.map((candidate) => (
          <Col md={4} key={candidate.candidate_id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{candidate.name}</Card.Title>
                <Card.Text>Party: {candidate.party_name}</Card.Text>
                {voter?.has_voted ? (
                  voter.voted_candidate_id === candidate.candidate_id ? (
                    <Button variant="success" disabled>
                      You voted for this candidate
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled>
                      Vote
                    </Button>
                  )
                ) : (
                  <Button onClick={() => handleVote(candidate.candidate_id)}>
                    Vote
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}

        {/* NOTA Option */}
        <Col md={4} className="mb-4">
          <Card bg="light">
            <Card.Body>
              <Card.Title>None of the Above </Card.Title>
              <Card.Text>(NOTA)</Card.Text>
              {voter?.has_voted ? (
                voter.voted_candidate_id === "NOTA" ? (
                  <Button variant="success" disabled>
                    You selected NOTA
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Vote
                  </Button>
                )
              ) : (
                <Button variant="warning" onClick={() => handleVote("NOTA")}>
                  Vote NOTA
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BallotPaper;
