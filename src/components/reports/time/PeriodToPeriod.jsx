import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { usePeriodAnalysis } from '../../../hooks/usePeriodAnalysis';

const GradeFilter = ({ selectedGrade, onGradeChange }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Grade</InputLabel>
      <Select
        value={selectedGrade || "all"}
        label="Grade"
        onChange={(e) => onGradeChange(e.target.value === "all" ? "" : e.target.value)}
      >
        <MenuItem value="all">All Grades</MenuItem>
        <MenuItem value="faq">FAQ</MenuItem>
        <MenuItem value="non-faq">Non-FAQ</MenuItem>
      </Select>
    </FormControl>
  );
};

const TimeRangeButtons = ({ onRangeSelect, selectedRange }) => {
  const ranges = [
    { label: '6 Months', months: 6 },
    { label: '1 Year', months: 12 },
    { label: '2 Years', months: 24 },
    { label: '3 Years', months: 36 },
    { label: 'All Time', months: null },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {ranges.map((range) => (
        <Button
          key={range.label}
          variant={selectedRange === range.months ? "contained" : "outlined"}
          size="small"
          onClick={() => onRangeSelect(range.months)}
          sx={{ textTransform: 'none' }}
        >
          {range.label}
        </Button>
      ))}
    </Box>
  );
};

const PeriodChangesChart = ({ data, commodity }) => {
  if (!data?.periodChanges) return null;

  const chartData = data.periodChanges.map(change => ({
    period: change.currentPeriod.split('-')[1] + '/' + change.currentPeriod.split('-')[0].slice(-2),
    change: change.absoluteChange,
    changeType: change.changeType
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Month-to-Month Price Changes - {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis label={{ value: 'Price Change (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`₹${value}`, 'Change']} />
              <Legend />
              <Bar 
                dataKey="change" 
                fill={(entry) => entry?.change > 0 ? '#4CAF50' : '#F44336'}
                name="Price Change"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const InsightsCards = ({ data }) => {
  if (!data?.insights) return null;

  const { largestIncreases, largestDecreases, averageMonthlyChange } = data.insights;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Largest Increases
            </Typography>
            {largestIncreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.currentPeriod}
                  </Typography>
                  <Chip 
                    label={`+₹${change.absoluteChange}`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error.main">
              Largest Decreases
            </Typography>
            {largestDecreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.currentPeriod}
                  </Typography>
                  <Chip 
                    label={`₹${change.absoluteChange}`} 
                    color="error" 
                    size="small" 
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="info.main">
              Average Monthly Change
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h4" color="info.main">
                ₹{averageMonthlyChange}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average absolute change per month
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const PeriodToPeriod = () => {
  const { selectedCommodity, dateRange } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  const prevDateRange = useRef(dateRange);
  useEffect(() => {
    const dateRangeChanged = 
      prevDateRange.current?.startDate?.getTime() !== dateRange.startDate?.getTime() ||
      prevDateRange.current?.endDate?.getTime() !== dateRange.endDate?.getTime();
    
    if (dateRangeChanged && customDateRange) {
      setCustomDateRange(null);
      setSelectedTimeRange(null);
    }
    
    prevDateRange.current = dateRange;
  }, [dateRange, customDateRange]);

  const startDate = customDateRange?.startDate || dateRange.startDate;
  const endDate = customDateRange?.endDate || dateRange.endDate;

  console.log('Frontend sending:', {
  commodity: selectedCommodity,
  startDate: startDate?.toISOString().split('T')[0],
  endDate: endDate?.toISOString().split('T')[0],
  grade: selectedGrade === 'all' ? '' : selectedGrade
});

  const { data, loading, error } = usePeriodAnalysis(
    selectedCommodity,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0],
    selectedGrade === 'all' ? '' : selectedGrade
);

  const handleTimeRangeSelect = (months) => {
    setSelectedTimeRange(months);
    
    if (months === null) {
      setCustomDateRange({
        startDate: new Date('2022-01-01'),
        endDate: new Date(),
      });
    } else {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - months);
      setCustomDateRange({ startDate: start, endDate: end });
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Period-to-Period Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Period-to-Period Analysis
        </Typography>
        <Alert severity="error">
          Failed to load period analysis: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Period-to-Period Analysis - {commodityName}
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <GradeFilter 
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick Time Ranges:
                </Typography>
                <TimeRangeButtons onRangeSelect={handleTimeRangeSelect} selectedRange={selectedTimeRange} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Summary Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Commodity
                  </Typography>
                  <Typography variant="h6">
                    {commodityName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Periods
                  </Typography>
                  <Typography variant="h6">
                    {data.periodChanges?.length || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Grade Filter
                  </Typography>
                  <Typography variant="h6">
                    {selectedGrade === 'all' ? 'All Grades' : selectedGrade.toUpperCase()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mb: 3 }}>
            <PeriodChangesChart data={data} commodity={selectedCommodity} />
          </Box>

          <InsightsCards data={data} />
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No period analysis data available.
        </Alert>
      )}
    </Box>
  );
};

export default PeriodToPeriod;