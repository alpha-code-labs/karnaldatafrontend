import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useAdvancedAnalytics = (startDate, endDate, grade) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (grade) params.append('grade', grade);

      const response = await apiService.makeRequest(`/prices/advanced-analytics?${params}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch advanced analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [startDate, endDate, grade]);

  return { data, loading, error, refetch: fetchAdvancedAnalytics };
};