// src/pages/VoterDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, BarChart3, Clock, 
  MapPin, Phone, User, LogOut, 
  Vote, Edit3, Shield, Activity, AlertCircle,
  Bell, Info, AlertTriangle, Check, X
} from 'lucide-react';
import BiometricModal from '../components/BiometricModal';
import '../styles/voter_dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

function VoterDashboard() {
  const [voter, setVoter] = useState(null);
  const [stats, setStats] = useState({ totalVoters: 0, votedCount: 0 });
  const [electionStatus, setElectionStatus] = useState({ isActive: false, message: "Checking status..." });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBiometric, setShowBiometric] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const stored = localStorage.getItem("voterInfo");
    if (stored) {
      const { voter_id } = JSON.parse(stored);
      const token = localStorage.getItem("token");
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      axios.get(`${API_BASE}/voter/${voter_id}`, headers)
        .then(res => setVoter(res.data))
        .catch(() => setVoter(null));

      // Fetch specific election status for this voter
      axios.get(`${API_BASE}/voter/election-status/${voter_id}`, headers)
        .then(res => setElectionStatus(res.data))
        .catch(err => console.log("Election status check failed"));

      // Fetch voting statistics
      axios.get(`${API_BASE}/admin/election-status`, headers)
        .then(res => {
          if (res.data) {
            setStats({
              totalVoters: res.data.totalVoters || 0,
              votedCount: res.data.votedCount || 0
            });
          }
        })
        .catch(err => console.log("Stats not available"));
      // Fetch notifications
      axios.get(`${API_BASE}/notifications/voter/${voter_id}?constituency=${JSON.parse(stored).constituency}`, headers)
        .then(res => setNotifications(res.data))
        .catch(err => console.log("Failed to fetch notifications"));
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const voter_id = JSON.parse(localStorage.getItem("voterInfo")).voter_id;
      await axios.post(`${API_BASE}/notifications/${notificationId}/read`, { userId: voter_id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.log("Failed to mark notification as read");
    }
  };

  if (!voter) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  const votingPercentage = stats.totalVoters > 0 
    ? ((stats.votedCount / stats.totalVoters) * 100).toFixed(1) 
    : 0;

  return (
    <div className="dashboard-wrapper">
      <BiometricModal 
        isOpen={showBiometric} 
        onSuccess={() => navigate("/vote")} 
        onCancel={() => setShowBiometric(false)} 
        type="voting authorization" 
      />
      
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">
            <Vote size={32} color="#00ff88" />
          </div>
          <h1 className="navbar-title">E-Voting Portal</h1>
        </div>
        
        <div className="navbar-center">
            <div className={`live-status-pill ${electionStatus.isActive ? 'active' : 'inactive'}`}>
                <span className="pulse-dot"></span>
                <span>{electionStatus.isActive ? 'ELECTION ACTIVE' : 'NO ACTIVE ELECTION'}</span>
            </div>
            <div className="time-display">
                <Clock size={14} />
                <span>{currentTime.toLocaleTimeString()}</span>
            </div>
        </div>

        <div className="navbar-actions">
            <div className="notification-wrapper">
                <button 
                    className={`nav-icon-btn ${notifications.length > 0 ? 'has-unread' : ''}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <Bell size={20} />
                    {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
                </button>

                {showNotifications && (
                    <div className="notification-dropdown glass-panel">
                        <div className="dropdown-header">
                            <h3>Notifications</h3>
                            <button className="close-dropdown" onClick={() => setShowNotifications(false)}><X size={16}/></button>
                        </div>
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-notifications">No new notifications</div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif._id} className={`notification-item ${notif.priority}`}>
                                        <div className="notif-icon">
                                            {notif.type === 'election' ? <Vote size={16}/> : <Info size={16}/>}
                                        </div>
                                        <div className="notif-content">
                                            <h4>{notif.title}</h4>
                                            <p>{notif.message}</p>
                                            <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button className="mark-read" onClick={() => markAsRead(notif._id)}><Check size={14}/></button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("voterInfo");
                localStorage.removeItem("token");
                navigate("/"); 
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="welcome-banner">
          <div className="welcome-info">
            <h1 className="welcome-text">Greetings, {voter.first_name}!</h1>
            <p className="welcome-subtext">Empowering democracy through secure, digital participation.</p>
          </div>
          <div className="banner-stats">
             <div className="quick-stat">
                <Shield size={20} color="#00ff88" />
                <span>Verified Account</span>
             </div>
          </div>
        </div>

        <div className="stats-cards-grid">
          <div className="glass-stat-card">
            <div className="stat-card-icon blue">
              <Users size={24} />
            </div>
            <div className="stat-card-data">
              <h3>{stats.totalVoters}</h3>
              <p>Registered Voters</p>
            </div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="stat-card-data">
              <h3>{stats.votedCount}</h3>
              <p>Total Votes Cast</p>
            </div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-icon purple">
              <BarChart3 size={24} />
            </div>
            <div className="stat-card-data">
              <h3>{votingPercentage}%</h3>
              <p>Current Turnout</p>
            </div>
          </div>

          <div className="glass-stat-card">
            <div className="stat-card-icon gold">
              <Activity size={24} />
            </div>
            <div className="stat-card-data">
              <h3>{voter.has_voted ? "Recorded" : "Pending"}</h3>
              <p>Your Status</p>
            </div>
          </div>
        </div>

        <div className="election-action-card glass-panel">
            <div className="election-info">
                <div className="info-header">
                    <Activity size={24} className="accent-icon" />
                    <h2>Active Election Status</h2>
                </div>
                {electionStatus.isActive ? (
                    <div className="status-content">
                        <div className="election-details">
                            <h3>{electionStatus.electionTitle}</h3>
                            <p className="constituency-tag">Constituency: {voter.constituency_name || (voter.constituency && voter.constituency.name) || voter.constituency || 'All'}</p>
                            <p className="timer-text">Ends: {new Date(electionStatus.endDate).toLocaleString()}</p>
                        </div>
                        
                        {!electionStatus.isParticipating ? (
                            <div className="warning-box">
                                <AlertCircle size={20} />
                                <p>Your constituency is not participating in this election.</p>
                            </div>
                        ) : electionStatus.hasVoted ? (
                            <div className="success-box">
                                <CheckCircle size={20} />
                                <p>Your vote has been securely recorded. Thank you for participating!</p>
                            </div>
                        ) : (
                            <button className="premium-btn vote-now-btn" onClick={() => setShowBiometric(true)}>
                                <Vote size={20} />
                                Cast Your Vote Now
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="no-election-content">
                        <p>There are no active elections at this time. We will notify you when the next voting session begins.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="dashboard-main-grid">
          <div className="profile-glass-section">
            <div className="section-header">
               <User size={20} />
               <h2>Personal Identity</h2>
            </div>
            
            <div className="profile-identity">
              <div className="avatar-container">
                <div className="initials-circle">
                   {voter.first_name?.charAt(0)}{voter.last_name?.charAt(0)}
                </div>
                {voter.has_voted && <div className="voted-check"><CheckCircle size={16} /></div>}
              </div>
              <div className="identity-text">
                <h2 className="voter-full-name">{voter.first_name} {voter.last_name}</h2>
                <div className="voter-id-tag">ID: {voter.voter_id}</div>
              </div>
            </div>

            <div className="voter-details-grid">
              <div className="detail-item">
                <MapPin size={18} className="detail-icon" />
                <div className="detail-content">
                  <label>Constituency</label>
                  <span>{voter.constituency ? (voter.constituency.name || voter.constituency) : "Unassigned"}</span>
                </div>
              </div>
              
              <div className="detail-item">
                <Phone size={18} className="detail-icon" />
                <div className="detail-content">
                  <label>Phone Contact</label>
                  <span>{voter.phone || "N/A"}</span>
                </div>
              </div>

              <div className="detail-item">
                <Activity size={18} className="detail-icon" />
                <div className="detail-content">
                  <label>Voting Right</label>
                  <span className={voter.has_voted ? "text-voted" : "text-pending"}>
                    {voter.has_voted ? "Exercised" : "Available"}
                  </span>
                </div>
              </div>
            </div>

            <button className="edit-profile-action" onClick={() => navigate("/edit-profile")}>
              <Edit3 size={16} />
              Update Information
            </button>
          </div>

          <div className="vote-action-section">
            <div className="vote-card-content">
              <div className="vote-illustration">
                <Vote size={80} strokeWidth={1} />
              </div>
              <h2 className="vote-cta-title">Participate in Election</h2>
              <p className="vote-cta-desc">
                {voter.has_voted 
                  ? "Your contribution to the democratic process has been recorded. Thank you for voting!" 
                  : "Your constituency is currently live. Cast your secure digital ballot now."}
              </p>
              
              <div className="action-button-container">
                {voter.has_voted ? (
                  <div className="voted-confirmation">
                    <CheckCircle size={20} />
                    <span>Ballot Successfully Submitted</span>
                  </div>
                ) : (
                  <button className="primary-vote-btn" onClick={() => setShowBiometric(true)}>
                    <span>Launch Ballot</span>
                    <Vote size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoterDashboard;
