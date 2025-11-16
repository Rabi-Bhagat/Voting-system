import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/constituency.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function ConstituencyAdmin() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [constituencyId, setConstituencyId] = useState("");
  const [constituencyName, setConstituencyName] = useState("");

  const fetchCandidates = (id) => {
    // axios.get(`http://localhost:5000/candidates/${id}`)
    axios.get(`${API_BASE}/candidates/${id}`)
      .then((res) => {
        setCandidates(res.data);
      })
      .catch((err) => {
        console.error("Error fetching candidates:", err);
      });
  };

  const fetchConstituencyName = (id) => {
    // axios.get(`http://localhost:5000/constituency/${id}`)
    axios.get(`${API_BASE}/constituency/${id}`)
      .then((res) => {
        console.log("Fetched constituency:", res.data);
        setConstituencyName(res.data.name);
      })
      .catch((err) => {
        console.error("Error fetching constituency name:", err);
      });
  };

  useEffect(() => {
    const constituencyInfo = JSON.parse(localStorage.getItem("constituencyInfo"));
    if (!constituencyInfo) {
      navigate("/");
      return;
    }

    const id = constituencyInfo.constituency_id;
    setConstituencyId(id);
    fetchCandidates(id);
    fetchConstituencyName(id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("constituencyInfo");
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-light justify-content-between">
        <h1 className="navbar-title">Online Voting System</h1>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="profile-container d-flex mt-4 p-3 bg-white rounded shadow align-items-center">
        <img
          src="https://cdn.jsdelivr.net/npm/bootstrap-icons/icons/person-circle.svg"
          alt="Profile Icon"
          style={{ width: 150, height: 150 }}
        />
        <div className="ms-5">
          <h3 className="mb-3">{constituencyName} Admin</h3>
          <p><strong>Constituency ID:</strong> {constituencyId}</p>
          <p><strong>Constituency Name:</strong> {constituencyName}</p>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-white sub-head">
          Candidates in {constituencyName ? `${constituencyName} (${constituencyId})` : constituencyId}
        </h4>
        <table className="table table-bordered table-striped mt-3 rounded-table">
          <thead className="table-dark">
            <tr className="sub-head">
              <th>#</th>
              <th>Candidate ID</th>
              <th>Candidate Name</th>
              <th>Party Name</th>
              <th>Votes</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No candidates found</td>
              </tr>
            ) : (
              candidates.map((candidate, index) => (
                <tr key={candidate.candidate_id}>
                  <td>{index + 1}</td>
                  <td>{candidate.candidate_id}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.party_name}</td>
                  <td>{candidate.votes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConstituencyAdmin;
