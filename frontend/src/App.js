// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import AdminPage from "./pages/AdminPage";
import VoterDashboard from "./pages/VoterDashboard";
import PartyPage from "./pages/PartyPage";

import EditProfile from "./pages/EditProfile";
import BallotPaper from "./pages/BallotPaper";
import ResultsPage from "./pages/ResultsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/voter_dashboard" element={<VoterDashboard />} />
        <Route path="/candidate_dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate-profile/:candidate_id" element={<CandidateProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/vote" element={<BallotPaper />} />
        <Route path="/party" element={<PartyPage />} />

        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;