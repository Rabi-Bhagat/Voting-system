import { useState, useEffect } from 'react';

/**
 * Custom hook for managing verification logic
 * Handles fetching users, verifying users, and managing state
 */
export const useVerification = () => {
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('voters');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'verified', 'pending'

  /**
   * Fetch users from the admin dashboard endpoint
   */
  const fetchUsers = async (userType) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin-dashboard/${userType}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${userType}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${userType}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all user types on component mount
   */
  useEffect(() => {
    const loadAllUsers = async () => {
      setLoading(true);
      const [votersData, candidatesData, partiesData] = await Promise.all([
        fetchUsers('voters'),
        fetchUsers('candidates'),
        fetchUsers('parties'),
      ]);
      
      setVoters(votersData);
      setCandidates(candidatesData);
      setParties(partiesData);
      setLoading(false);
    };

    loadAllUsers();
  }, []);

  /**
   * Verify a user by ID
   */
  const verifyUser = async (userId, userType) => {
    try {
      const response = await fetch(`/api/admin-dashboard/${userType}/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify user');
      }

      // Update local state
      const updateState = (prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, verified: true } : user
        );

      if (userType === 'voters') {
        setVoters(updateState);
      } else if (userType === 'candidates') {
        setCandidates(updateState);
      } else if (userType === 'parties') {
        setParties(updateState);
      }

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error verifying user:', err);
      return false;
    }
  };

  /**
   * Get filtered users based on active tab and filter status
   */
  const getFilteredUsers = () => {
    let users = [];
    
    if (activeTab === 'voters') {
      users = voters;
    } else if (activeTab === 'candidates') {
      users = candidates;
    } else if (activeTab === 'parties') {
      users = parties;
    }

    if (filterStatus === 'verified') {
      return users.filter((user) => user.verified);
    } else if (filterStatus === 'pending') {
      return users.filter((user) => !user.verified);
    }

    return users;
  };

  return {
    voters,
    candidates,
    parties,
    loading,
    error,
    activeTab,
    setActiveTab,
    filterStatus,
    setFilterStatus,
    verifyUser,
    getFilteredUsers,
    refreshUsers: () => {
      const loadAllUsers = async () => {
        setLoading(true);
        const [votersData, candidatesData, partiesData] = await Promise.all([
          fetchUsers('voters'),
          fetchUsers('candidates'),
          fetchUsers('parties'),
        ]);
        
        setVoters(votersData);
        setCandidates(candidatesData);
        setParties(partiesData);
        setLoading(false);
      };
      loadAllUsers();
    },
  };
};
