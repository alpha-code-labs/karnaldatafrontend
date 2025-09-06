const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getLatestPrices(commodity) {
    return this.makeRequest(`/prices/latest?commodity=${commodity}`);
  }

  async getHistoricalTrends(commodity, startDate, endDate, grade) {
    const params = new URLSearchParams({ commodity });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/historical?${params}`);
  }

  async getMonthlyAverages(commodity, startDate, endDate, grade) {
    const params = new URLSearchParams({ commodity });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/monthly?${params}`);
  }

  async getPriceRecords(commodity, startDate, endDate, grade) {
    const params = new URLSearchParams({ commodity });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/records?${params}`);
  }

  async getSeasonalPatterns(commodity, grade) {
    const params = new URLSearchParams({ commodity });
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/seasonal?${params}`);
  }

  async getYearOverYear(commodity, grade) {
    const params = new URLSearchParams({ commodity });
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/year-over-year?${params}`);
  }

  async getPeriodAnalysis(commodity, grade) {
    const params = new URLSearchParams({ commodity });
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/period-analysis?${params}`);
  }

  async getAdvancedAnalytics(startDate, endDate, grade) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (grade) params.append('grade', grade);
    
    return this.makeRequest(`/prices/advanced-analytics?${params}`);
  }

  async getHealthCheck() {
    return this.makeRequest('/prices/health');
  }
}

const apiService = new ApiService();
export default apiService;