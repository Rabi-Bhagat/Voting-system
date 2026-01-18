/**
 * useFetch Hook
 * Custom hook for fetching data
 */

import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Fetch data
   */
  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err.error || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  /**
   * Fetch on mount
   */
  useEffect(() => {
    fetch();
  }, dependencies);

  /**
   * Refetch data
   */
  const refetch = useCallback(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useFetch;
