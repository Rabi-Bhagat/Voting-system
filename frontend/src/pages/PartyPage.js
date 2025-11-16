import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/party.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function PartyPage() {
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("partyInfo");
    if (stored) {
      const { party_id } = JSON.parse(stored);

      // axios.get(`http://localhost:5000/party/${party_id}`)
      axios.get(`${API_BASE}/party/${party_id}`)
        .then((res) => {
          setParty(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching party info:", err);
          setParty(null);
          setLoading(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("partyInfo");
    navigate("/");
  };

  // const handleEdit = () => {
  //   navigate("/edit-candidates");
  // };

  if (loading) return <div>Loading party info...</div>;
  if (!party) return <div>Party not found or error loading data.</div>;

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-light justify-content-between">
        <h1 className="navbar-title">Online Voting System</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <h1 className="text-center mt-4">Welcome, {party.name}!</h1>

      <div className="profile-container d-flex mt-4 p-3 bg-white rounded shadow">
        <img
          src="https://cdn.jsdelivr.net/npm/bootstrap-icons/icons/person-circle.svg"
          alt="Profile Icon"
          style={{ width: 150, height: 150 }}
        />
        <div className="ms-5">
          <p><strong>Party ID:</strong> {party.party_id}</p>
          <p><strong>Name:</strong> {party.name}</p>
          {/* <button className="btn btn-primary mt-2" onClick={handleEdit}>
            Edit Candidates
          </button> */}
        </div>
      </div>

      {/* Candidate Table */}
      <div className="mt-5">
        <h3 className="mb-3 text-white sub-head">Candidates from {party.name}</h3>
        {party.candidates && party.candidates.length > 0 ? (
          <table className="table table-bordered table-striped rounded-table">
            <thead className="table-dark">
              <tr className="sub-head">
                <th>Candidate ID</th>
                <th>Name</th>
                <th>Constituency</th>
              </tr>
            </thead>
            <tbody>
              {party.candidates.map((candidate) => (
                <tr key={candidate.candidate_id}>
                  <td>{candidate.candidate_id}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.constituency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No candidates have been registered for this party yet.</p>
        )}
      </div>
    </div>
  );
}

export default PartyPage;
