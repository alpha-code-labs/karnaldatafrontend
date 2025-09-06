import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useLatestPrices = (commodity) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLatestPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getLatestPrices(commodity);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch latest prices:', err);
    } finally {
      setLoading(false);
    }
  }, [commodity]);

  useEffect(() => {
    if (!commodity) return;
    fetchLatestPrices();
  }, [commodity, fetchLatestPrices]);

  return { data, loading, error, refetch: fetchLatestPrices };
};
