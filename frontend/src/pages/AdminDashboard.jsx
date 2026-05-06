import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import '../styles/admin_dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [votingStats, setVotingStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  
  // Modal State
  const [modalType, setModalType] = useState(null);
  const [modalFormData, setModalFormData] = useState({});
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchVotingStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };
      
      const [dashResult, statsResult, logsResult] = await Promise.allSettled([
        axios.get(`${API_BASE}/analytics/dashboard`, headers),
        axios.get(`${API_BASE}/analytics/voting-stats`, headers),
        axios.get(`${API_BASE}/audit/recent?limit=10`, headers)
      ]);
      
      if (dashResult.status === 'fulfilled') {
        setDashboardData(dashResult.value.data);
      } else {
        console.error('Dashboard analytics failed:', dashResult.reason);
      }

      if (statsResult.status === 'fulfilled') {
        setVotingStats(statsResult.value.data);
      } else {
        console.error('Voting stats failed:', statsResult.reason);
      }

      if (logsResult.status === 'fulfilled') {
        setRecentLogs(logsResult.value.data);
      } else {
        console.error('Audit logs failed:', logsResult.reason);
      }
      
      if (dashResult.status === 'rejected' && statsResult.status === 'rejected' && logsResult.status === 'rejected') {
        setMessage('Failed to load dashboard data. Please check backend connection.');
      }
    } catch (error) {
      console.error('Unexpected error fetching dashboard data:', error);
      setMessage('Unexpected error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotingStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/analytics/voting-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVotingStats(res.data);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalFormData({});
    setModalError('');
  };

  const handleModalClose = () => {
    setModalType(null);
    setModalFormData({});
    setModalError('');
  };

  const handleModalInputChange = (e) => {
    setModalFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModalSubmit = async () => {
    const endpoints = {
      voter: "add-voter",
      candidate: "add-candidate",
      party: "add-party",
      constituency: "add-constituency",
    };

    const requiredFields = {
      voter: ["voter_id", "first_name", "last_name", "password"],
      candidate: ["candidate_id", "name", "password", "party_id"],
      party: ["party_id", "name", "password"],
      constituency: ["constituency_id", "name", "password"],
    };

    const missingFields = requiredFields[modalType].filter(
      (field) => !modalFormData[field],
    );

    if (missingFields.length) {
      setModalError(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setModalLoading(true);
    setModalError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/admin/${endpoints[modalType]}`, modalFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`✅ ${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully.`);
      setTimeout(() => setMessage(''), 5000);
      handleModalClose();
      fetchDashboardData(); // Refresh stats
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || `Failed to add ${modalType}`;
      setModalError(`❌ ${errorMsg}`);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="nav-icon">⚙️</span>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="nav-actions">
          <div className="admin-profile-compact" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '15px' }}>
            <div className="initials-avatar" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
              AD
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Admin</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin')}>
            Manage System
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="alert alert-info">{message}</div>}

      {/* Quick Stats Cards */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData?.overview?.total_voters || 0}</span>
            <span className="stat-label">Total Voters</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData?.overview?.verified_voters || 0}</span>
            <span className="stat-label">Verified Voters</span>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">🗳️</div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData?.voting?.votes_cast || 0}</span>
            <span className="stat-label">Votes Cast</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{dashboardData?.voting?.turnout_percentage || 0}%</span>
            <span className="stat-label">Turnout</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'elections' ? 'active' : ''}`}
          onClick={() => setActiveTab('elections')}
        >
          🗓️ Elections
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit Logs
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="section-grid">
              {/* Active Election Status */}
              <div className="section-card">
                <h3>🗳️ Election Status</h3>
                {dashboardData?.active_election ? (
                  <div className="election-status active">
                    <div className="status-badge">ACTIVE</div>
                    <h4>{dashboardData.active_election.title}</h4>
                    <p>Started: {new Date(dashboardData.active_election.start_date).toLocaleDateString()}</p>
                    <p>Ends: {new Date(dashboardData.active_election.end_date).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <div className="election-status inactive">
                    <div className="status-badge inactive">NO ACTIVE ELECTION</div>
                    <p>No election is currently in progress</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab('elections')}>
                      Schedule Election
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="section-card">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions">
                  <button className="action-btn" onClick={() => handleModalOpen('voter')}>
                    ➕ Add Voter
                  </button>
                  <button className="action-btn" onClick={() => handleModalOpen('candidate')}>
                    ➕ Add Candidate
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('elections')}>
                    📅 Schedule Election
                  </button>
                  <button className="action-btn" onClick={() => navigate('/admin')}>
                    👥 Manage Users
                  </button>
                </div>
              </div>

              {/* System Stats */}
              <div className="section-card">
                <h3>📊 System Overview</h3>
                <div className="system-stats">
                  <div className="stat-row">
                    <span>Total Candidates:</span>
                    <span className="value">{dashboardData?.overview?.total_candidates || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span>Approved Candidates:</span>
                    <span className="value">{dashboardData?.overview?.approved_candidates || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span>Total Parties:</span>
                    <span className="value">{dashboardData?.overview?.total_parties || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span>Constituencies:</span>
                    <span className="value">{dashboardData?.overview?.total_constituencies || 0}</span>
                  </div>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="section-card">
                <h3>📈 Voting Progress</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${dashboardData?.voting?.turnout_percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    <span>{dashboardData?.voting?.votes_cast || 0} voted</span>
                    <span>{dashboardData?.voting?.votes_remaining || 0} remaining</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="section-card full-width">
              <h3>📋 Recent Activity</h3>
              <div className="activity-list">
                {recentLogs.length > 0 ? (
                  recentLogs.map((log, index) => (
                    <div key={index} className={`activity-item ${log.severity}`}>
                      <span className="activity-action">{log.action}</span>
                      <span className="activity-user">{log.performed_by}</span>
                      <span className="activity-time">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'elections' && (
          <ElectionManagement />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection votingStats={votingStats} />
        )}

        {activeTab === 'audit' && (
          <AuditLogsSection />
        )}
      </div>

      {/* Global Modal for Adding Users/Entities */}
      {modalType && (
        <Modal
          type={modalType}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onChange={handleModalInputChange}
          formData={modalFormData}
          loading={modalLoading}
          modalError={modalError}
        />
      )}
    </div>
  );
}

// Election Management Component
function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [availableConstituencies, setAvailableConstituencies] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    constituencies: [],
    candidates: [],
    parties: []
  });
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [availableParties, setAvailableParties] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchElections();
    fetchConstituencies();
    fetchCandidates();
    fetchParties();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_BASE}/election`);
      setElections(res.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

  const fetchConstituencies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/constituencies`);
      setAvailableConstituencies(res.data || []);
    } catch (error) {
      console.error('Error fetching constituencies:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/candidates`);
      setAvailableCandidates(res.data?.filter(c => c.approved) || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchParties = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/all-parties`);
      setAvailableParties(res.data?.filter(p => p.approved) || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (formData.constituencies.length === 0) {
      setMessage('Please select at least one constituency');
      return;
    }
    try {
      await axios.post(`${API_BASE}/election/create`, formData);
      setMessage('Election created successfully!');
      setShowCreateForm(false);
      fetchElections();
      setFormData({ title: '', description: '', start_date: '', end_date: '', constituencies: [], candidates: [], parties: [] });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to create election');
    }
  };

  const handleStartElection = async (electionId) => {
    try {
      await axios.post(`${API_BASE}/election/${electionId}/start`);
      setMessage('Election started!');
      fetchElections();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to start election');
    }
  };

  const handleEndElection = async (electionId) => {
    try {
      await axios.post(`${API_BASE}/election/${electionId}/end`);
      setMessage('Election ended!');
      fetchElections();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to end election');
    }
  };

  return (
    <div className="election-management">
      <div className="section-header">
        <h2>🗓️ Election Management</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ Create Election'}
        </button>
      </div>

      {message && <div className="alert">{message}</div>}

      {showCreateForm && (
        <div className="create-form-card">
          <h3>Create New Election</h3>
          <form onSubmit={handleCreateElection}>
            <div className="form-group">
              <label>Election Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., General Election 2024"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the election"
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Participating Constituencies *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, constituencies: availableConstituencies.map(c => c.constituency_id) })}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, constituencies: [] })}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="constituency-checkboxes" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {availableConstituencies.length > 0 ? availableConstituencies.map(c => (
                  <label key={c.constituency_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f4f8', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.constituencies.includes(c.constituency_id)}
                      onChange={(e) => {
                        const newConst = e.target.checked 
                          ? [...formData.constituencies, c.constituency_id]
                          : formData.constituencies.filter(id => id !== c.constituency_id);
                        setFormData({ ...formData, constituencies: newConst });
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: '600', color: '#2d3748' }}>{c.name}</span>
                      <span style={{ fontSize: '10px', color: '#718096' }}>{c.voter_count || 0} Voters</span>
                    </div>
                  </label>
                )) : <span style={{color: '#64748b', fontSize: '14px'}}>No constituencies found. Add some first!</span>}
              </div>
              {formData.constituencies.length > 0 && (
                <div style={{ marginTop: '12px', padding: '10px 15px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>📊 Total Voters Enabled:</span>
                   <span style={{ fontSize: '15px', color: '#1e3a8a', fontWeight: '800' }}>
                     {availableConstituencies
                       .filter(c => formData.constituencies.includes(c.constituency_id))
                       .reduce((acc, curr) => acc + (curr.voter_count || 0), 0)}
                   </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Select Participating Parties</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, parties: availableParties.map(p => p.party_id) })}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, parties: [] })}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="constituency-checkboxes" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {availableParties.map(p => (
                  <label key={p.party_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.parties.includes(p.party_id)}
                      onChange={(e) => {
                        const newParties = e.target.checked 
                          ? [...formData.parties, p.party_id]
                          : formData.parties.filter(id => id !== p.party_id);
                        setFormData({ ...formData, parties: newParties });
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Select Approved Candidates</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, candidates: availableCandidates.map(c => c.candidate_id) })}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn-tiny"
                    onClick={() => setFormData({ ...formData, candidates: [] })}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="constituency-checkboxes" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {availableCandidates.map(c => (
                  <label key={c.candidate_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 136, 0.1)', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(0, 255, 136, 0.2)', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.candidates.includes(c.candidate_id)}
                      onChange={(e) => {
                        const newCandidates = e.target.checked 
                          ? [...formData.candidates, c.candidate_id]
                          : formData.candidates.filter(id => id !== c.candidate_id);
                        setFormData({ ...formData, candidates: newCandidates });
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Create Election</button>
          </form>
        </div>
      )}

      <div className="elections-list">
        {elections.length > 0 ? (
          elections.map((election) => (
            <div key={election.election_id} className={`election-card ${election.status}`}>
              <div className="election-header">
                <h4>{election.title}</h4>
                <span className={`status-badge ${election.status}`}>{election.status.toUpperCase()}</span>
              </div>
              <p className="election-desc">{election.description}</p>
              <div className="election-dates">
                <span>📅 Start: {new Date(election.start_date).toLocaleString()}</span>
                <span>📅 End: {new Date(election.end_date).toLocaleString()}</span>
              </div>
              <div className="election-actions">
                {election.status === 'scheduled' && (
                  <button className="btn btn-success" onClick={() => handleStartElection(election.election_id)}>
                    ▶️ Start Now
                  </button>
                )}
                {election.status === 'active' && (
                  <button className="btn btn-warning" onClick={() => handleEndElection(election.election_id)}>
                    ⏹️ End Election
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No elections created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Section Component
function AnalyticsSection({ votingStats }) {
  const [constituencySummary, setConstituencySummary] = useState([]);
  const [partyVotes, setPartyVotes] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [constRes, partyRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics/constituency-summary`),
        axios.get(`${API_BASE}/analytics/party-votes`)
      ]);
      setConstituencySummary(constRes.data);
      setPartyVotes(partyRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="analytics-section">
      <h2>📈 Real-Time Analytics</h2>
      
      {/* Voting Stats */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>🗳️ Voting Statistics</h3>
          <div className="big-stats">
            <div className="big-stat">
              <span className="value">{votingStats?.votes_cast || 0}</span>
              <span className="label">Votes Cast</span>
            </div>
            <div className="big-stat">
              <span className="value">{votingStats?.turnout_percentage || 0}%</span>
              <span className="label">Turnout</span>
            </div>
            <div className="big-stat">
              <span className="value">{votingStats?.votes_remaining || 0}</span>
              <span className="label">Remaining</span>
            </div>
          </div>
          <p className="last-updated">
            Last updated: {votingStats?.last_updated ? new Date(votingStats.last_updated).toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="analytics-card">
          <h3>🏛️ Party-wise Votes</h3>
          <div className="party-list">
            {partyVotes?.parties?.map((party, index) => (
              <div key={index} className="party-row">
                <span className="party-name">{party.name}</span>
                <div className="party-bar">
                  <div 
                    className="party-fill" 
                    style={{ width: `${party.percentage}%`, backgroundColor: party.color || '#667eea' }}
                  ></div>
                </div>
                <span className="party-votes">{party.votes} ({party.percentage}%)</span>
              </div>
            )) || <p>No data</p>}
          </div>
        </div>
      </div>

      {/* Constituency Summary */}
      <div className="analytics-card full-width">
        <h3>🏛️ Constituency-wise Summary</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Constituency</th>
              <th>Total Voters</th>
              <th>Votes Cast</th>
              <th>Turnout</th>
              <th>Leading Candidate</th>
            </tr>
          </thead>
          <tbody>
            {constituencySummary.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.total_voters}</td>
                <td>{item.votes_cast}</td>
                <td>
                  <span className={`turnout-badge ${parseFloat(item.turnout) > 50 ? 'high' : 'low'}`}>
                    {item.turnout}%
                  </span>
                </td>
                <td>{item.leading?.name || 'N/A'} ({item.leading?.votes || 0})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Audit Logs Section Component
function AuditLogsSection() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ action: '', severity: '' });
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        ...filters
      });
      const res = await axios.get(`${API_BASE}/audit?${params}`);
      setLogs(res.data.logs);
      setPagination(prev => ({ ...prev, total_pages: res.data.pagination.total_pages }));
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/audit/export?format=csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="audit-section">
      <div className="section-header">
        <h2>📋 Audit Logs</h2>
        <button className="btn btn-secondary" onClick={exportLogs}>
          📥 Export CSV
        </button>
      </div>

      <div className="filters">
        <select 
          value={filters.severity} 
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="">All Severity</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className={log.severity}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td><span className="action-badge">{log.action}</span></td>
              <td>{log.performed_by}</td>
              <td>{log.user_role}</td>
              <td><span className={`status-badge ${log.status}`}>{log.status}</span></td>
              <td><span className={`severity-badge ${log.severity}`}>{log.severity}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.total_pages}</span>
        <button 
          disabled={pagination.page >= pagination.total_pages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
