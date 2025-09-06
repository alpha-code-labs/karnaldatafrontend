import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useHistoricalTrends = (commodity, startDate, endDate, grade) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistoricalTrends = async () => {
    if (!commodity) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ commodity });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (grade) params.append('grade', grade);

      const response = await apiService.makeRequest(`/prices/historical?${params}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch historical trends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalTrends();
  }, [commodity, startDate, endDate, grade]);

  return { data, loading, error, refetch: fetchHistoricalTrends };
};