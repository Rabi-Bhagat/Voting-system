/**
 * ResultsPage Component
 * Display election results
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/api/adminService';
import { ERROR_MESSAGES } from '../../../constants/messages';
import styles from './ResultsPage.module.css';

export function ResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetch results on mount
   */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await adminService.getSummary();
        setResults(data);
      } catch (err) {
        setError(err.error || ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.resultsCard}>
        <h1 className={styles.title}>📊 Election Results</h1>

        {results && (
          <div className={styles.statsGrid}>
            {/* Voters Stats */}
            <div className={styles.statCard}>
              <h3>👥 Voters</h3>
              <div className={styles.statItem}>
                <span>Total:</span>
                <strong>{results.summary?.total_voters || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Voted:</span>
                <strong>{results.summary?.voted_voters || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Turnout:</span>
                <strong>{results.summary?.voter_turnout || 0}%</strong>
              </div>
            </div>

            {/* Candidates Stats */}
            <div className={styles.statCard}>
              <h3>🎤 Candidates</h3>
              <div className={styles.statItem}>
                <span>Total:</span>
                <strong>{results.candidates_summary?.total_candidates || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Verified:</span>
                <strong>{results.candidates_summary?.verified_candidates || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Active:</span>
                <strong>{results.candidates_summary?.active_candidates || 0}</strong>
              </div>
            </div>

            {/* Parties Stats */}
            <div className={styles.statCard}>
              <h3>🏛️ Parties</h3>
              <div className={styles.statItem}>
                <span>Total:</span>
                <strong>{results.parties_summary?.total_parties || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Verified:</span>
                <strong>{results.parties_summary?.verified_parties || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Active:</span>
                <strong>{results.parties_summary?.active_parties || 0}</strong>
              </div>
            </div>

            {/* Voting Stats */}
            <div className={styles.statCard}>
              <h3>🗳️ Voting</h3>
              <div className={styles.statItem}>
                <span>Total Votes:</span>
                <strong>{results.voting_summary?.total_votes_cast || 0}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Avg per Candidate:</span>
                <strong>{results.voting_summary?.average_votes_per_candidate || 0}</strong>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/')} className={styles.backButton}>
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;
