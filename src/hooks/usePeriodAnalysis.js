import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const usePeriodAnalysis = (commodity, startDate, endDate, grade) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPeriodAnalysis = async () => {
    if (!commodity) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ commodity });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (grade) params.append('grade', grade);

      const response = await apiService.makeRequest(`/prices/period-analysis?${params}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch period analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodAnalysis();
  }, [commodity, startDate, endDate, grade]);  // <- Added startDate, endDate dependencies

  return { data, loading, error, refetch: fetchPeriodAnalysis };
};