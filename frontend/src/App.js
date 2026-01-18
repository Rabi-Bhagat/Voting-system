<<<<<<< HEAD
/**
 * App Component
 * Main application component with routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ResultsPage } from './pages/results/ResultsPage';
import './App.css';

/**
 * Main App Component
 */
=======
// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import AdminPage from "./pages/AdminPage";
import VoterDashboard from "./pages/VoterDashboard";
import PartyPage from "./pages/PartyPage";

import EditProfile from "./pages/EditProfile";
import EditCandidateProfile from "./pages/EditCandidateProfile";
import BallotPaper from "./pages/BallotPaper";
import ResultsPage from "./pages/ResultsPage";
import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";

>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
function App() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Results Routes */}
        <Route path="/results" element={<ResultsPage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
=======
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/voter_dashboard" element={<VoterDashboard />} />
        <Route path="/candidate_dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate-profile/:candidate_id" element={<CandidateProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/edit-candidate-profile" element={<EditCandidateProfile />} />
        <Route path="/vote" element={<BallotPaper />} />
        <Route path="/party" element={<PartyPage />} />

        <Route path="/results" element={<ResultsPage />} />
>>>>>>> de1eb099c1c79e86bfb60c7b38aab150f1945dd7
      </Routes>
    </Router>
  );
}

export default App;