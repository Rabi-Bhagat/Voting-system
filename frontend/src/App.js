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
function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Results Routes */}
        <Route path="/results" element={<ResultsPage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;