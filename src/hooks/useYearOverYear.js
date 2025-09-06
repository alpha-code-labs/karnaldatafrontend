import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useYearOverYear = (commodity, grade) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchYearOverYear = async () => {
    if (!commodity) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ commodity });
      if (grade) params.append('grade', grade);

      const response = await apiService.makeRequest(`/prices/year-over-year?${params}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch year-over-year data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearOverYear();
  }, [commodity, grade]);

  return { data, loading, error, refetch: fetchYearOverYear };
};