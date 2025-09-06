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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { useHistoricalTrends } from '../../../hooks/useHistoricalTrends';

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

const TrendChart = ({ data, commodity, grade }) => {
  if (!data) return null;

  // Format data for the chart
  let chartData = [];

  if (data.trends && typeof data.trends === 'object' && !Array.isArray(data.trends)) {
    // Multiple grades - combine them
    const dates = new Set();
    Object.values(data.trends).forEach(gradeData => {
      gradeData.forEach(point => dates.add(point.date));
    });

    chartData = Array.from(dates).sort().map(date => {
      const point = { date };
      Object.entries(data.trends).forEach(([gradeKey, gradeData]) => {
        const dataPoint = gradeData.find(p => p.date === date);
        if (dataPoint) {
          point[`${gradeKey}_modal`] = dataPoint.modalPrice;
          point[`${gradeKey}_min`] = dataPoint.minPrice;
          point[`${gradeKey}_max`] = dataPoint.maxPrice;
        }
      });
      return point;
    });
  } else if (Array.isArray(data.trends)) {
    // Single grade
    chartData = data.trends.map(point => ({
      date: point.date,
      modalPrice: point.modalPrice,
      minPrice: point.minPrice,
      maxPrice: point.maxPrice,
    }));
  }

  const formatXAxisDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTooltipDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Price Trends - {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
          {grade && ` (${grade.toUpperCase()} Grade)`}
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisDate}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={formatTooltipDate}
                formatter={(value, name) => [
                  `₹${value?.toLocaleString() || 'N/A'}`, 
                  name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                ]}
              />
              <Legend />
              
              {/* Single grade lines - show all three (min, modal, max) */}
              {chartData.length > 0 && 'modalPrice' in chartData[0] && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="modalPrice" 
                    stroke="#2E7D32" 
                    strokeWidth={3}
                    name="Modal Price"
                    dot={{ r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minPrice" 
                    stroke="#FF5722" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Min Price"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxPrice" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Max Price"
                    dot={false}
                  />
                </>
              )}

              {/* Multiple grade lines - show modal prices AND min/max for each grade */}
              {chartData.length > 0 && 'faq_modal' in chartData[0] && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="faq_modal" 
                    stroke="#2E7D32" 
                    strokeWidth={3}
                    name="FAQ Price"
                    dot={{ r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faq_min" 
                    stroke="#2E7D32" 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="FAQ Min"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="faq_max" 
                    stroke="#2E7D32" 
                    strokeWidth={1}
                    strokeDasharray="7 3"
                    name="FAQ Max"
                    dot={false}
                  />
                </>
              )}
              {chartData.length > 0 && 'non-faq_modal' in chartData[0] && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="non-faq_modal" 
                    stroke="#FF8F00" 
                    strokeWidth={3}
                    name="Non-FAQ Price"
                    dot={{ r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="non-faq_min" 
                    stroke="#FF8F00" 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Non-FAQ Min"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="non-faq_max" 
                    stroke="#FF8F00" 
                    strokeWidth={1}
                    strokeDasharray="7 3"
                    name="Non-FAQ Max"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const HistoricalTrends = () => {
  const { selectedCommodity, dateRange } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  const prevDateRange = useRef(dateRange);
  useEffect(() => {
    // Check if the global date range has changed
    const dateRangeChanged = 
      prevDateRange.current?.startDate?.getTime() !== dateRange.startDate?.getTime() ||
      prevDateRange.current?.endDate?.getTime() !== dateRange.endDate?.getTime();
    
    if (dateRangeChanged && customDateRange) {
      // Global date range changed while custom range was active, reset to use global
      setCustomDateRange(null);
      setSelectedTimeRange(null);
    }
    
    prevDateRange.current = dateRange;
  }, [dateRange, customDateRange]);

  // Use custom date range if set, otherwise use global date range
  const startDate = customDateRange?.startDate || dateRange.startDate;
  const endDate = customDateRange?.endDate || dateRange.endDate;

  const { data, loading, error } = useHistoricalTrends(
    selectedCommodity,
    startDate?.toISOString().split('T')[0],
    endDate?.toISOString().split('T')[0],
    selectedGrade === 'all' ? '' : selectedGrade
  );

  const handleTimeRangeSelect = (months) => {
    setSelectedTimeRange(months);
    
    if (months === null) {
      // All time
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

  const handleResetToHeaderRange = () => {
    setCustomDateRange(null);
    setSelectedTimeRange(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Historical Trends
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={60} />
          </Grid>
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
          Historical Trends
        </Typography>
        <Alert severity="error">
          Failed to load historical trends: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historical Trends - {commodityName}
      </Typography>

      {/* Controls */}
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
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Date Range
                  </Typography>
                  <Typography variant="h6">
                    {format(parseISO(data.dateRange.start), 'MMM dd, yyyy')} - {format(parseISO(data.dateRange.end), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Data Points
                  </Typography>
                  <Typography variant="h6">
                    {data.totalDataPoints || data.dataPoints || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Grades Available
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {data.trends && typeof data.trends === 'object' && !Array.isArray(data.trends) 
                      ? Object.keys(data.trends).map(grade => (
                          <Chip key={grade} label={grade.toUpperCase()} size="small" sx={{ mr: 1 }} />
                        ))
                      : <Chip label={selectedGrade?.toUpperCase() || 'FAQ'} size="small" />
                    }
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Chart */}
          <TrendChart 
            data={data} 
            commodity={selectedCommodity}
            grade={selectedGrade}
          />
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No historical data available for the selected filters.
        </Alert>
      )}
    </Box>
  );
};

export default HistoricalTrends;