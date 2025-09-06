import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LatestPrices from './components/reports/basic/LatestPrices';
import HistoricalTrends from './components/reports/basic/HistoricalTrends';
import MonthlyAverages from './components/reports/basic/MonthlyAverages';
import PriceRecords from './components/reports/basic/PriceRecords';
import SeasonalPatterns from './components/reports/time/SeasonalPatterns';
import YearOverYear from './components/reports/time/YearOverYear';
import PeriodToPeriod from './components/reports/time/PeriodToPeriod';
import AdvancedAnalytics from './components/reports/advanced/AdvancedAnalytics';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Basic Price Reports */}
            <Route path="/basic/latest-prices" element={<LatestPrices />} />
            <Route path="/basic/historical-trends" element={<HistoricalTrends />} />
            <Route path="/basic/monthly-averages" element={<MonthlyAverages />} />
            <Route path="/basic/price-records" element={<PriceRecords />} />
            
            {/* Time Analysis Reports */}
            <Route path="/time/seasonal-patterns" element={<SeasonalPatterns />} />
            <Route path="/time/year-over-year" element={<YearOverYear />} />
            <Route path="/time/period-to-period" element={<PeriodToPeriod />} />
            
            {/* Advanced Analytics */}
            <Route path="/advanced/analytics" element={<AdvancedAnalytics />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;