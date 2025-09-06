import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useSeasonalPatterns = (commodity, grade) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSeasonalPatterns = useCallback(async () => {
    if (!commodity) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ commodity });
      if (grade) params.append('grade', grade);

      const response = await apiService.makeRequest(`/prices/seasonal?${params}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch seasonal patterns:', err);
    } finally {
      setLoading(false);
    }
  }, [commodity, grade]);

  useEffect(() => {
    fetchSeasonalPatterns();
  }, [fetchSeasonalPatterns]);

  return { data, loading, error, refetch: fetchSeasonalPatterns };
};
