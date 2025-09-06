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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { useMonthlyAverages } from '../../../hooks/useMonthlyAverages';

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

const MonthlyChart = ({ data, commodity, grade }) => {
  if (!data || !data.monthlyAverages) return null;

  // Format data for chart
  const chartData = data.monthlyAverages.map(month => {
    const point = {
      month: `${month.monthName} ${month.year}`,
      shortMonth: month.monthName.substring(0, 3),
      year: month.year,
    };

    // Add grade data
    Object.keys(month.grades).forEach(gradeKey => {
      const gradeData = month.grades[gradeKey];
      point[`${gradeKey}_avg`] = gradeData.averageModalPrice;
      point[`${gradeKey}_min`] = gradeData.averageMinPrice;
      point[`${gradeKey}_max`] = gradeData.averageMaxPrice;
    });

    return point;
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Average Prices - {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
          {grade && ` (${grade.toUpperCase()} Grade)`}
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="shortMonth"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Average Price (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.month;
                  }
                  return label;
                }}
                formatter={(value, name) => [
                  `₹${value?.toLocaleString() || 'N/A'}`, 
                  name.replace('_avg', '').replace('_', ' ').toUpperCase() + ' Avg'
                ]}
              />
              <Legend />
              
              {/* FAQ Grade */}
              {chartData.length > 0 && 'faq_avg' in chartData[0] && (
                <Line 
                  type="monotone" 
                  dataKey="faq_avg" 
                  stroke="#2E7D32" 
                  strokeWidth={3}
                  name="FAQ Average"
                  dot={{ r: 4 }}
                />
              )}
              
              {/* Non-FAQ Grade */}
              {chartData.length > 0 && 'non-faq_avg' in chartData[0] && (
                <Line 
                  type="monotone" 
                  dataKey="non-faq_avg" 
                  stroke="#FF8F00" 
                  strokeWidth={3}
                  name="Non-FAQ Average"
                  dot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const MonthlyTable = ({ data, commodity }) => {
  if (!data || !data.monthlyAverages) return null;

  const getChangeColor = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatChange = (change) => {
    if (change === undefined || change === null) return '-';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Averages Table
        </Typography>
        
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell align="right"><strong>Grade</strong></TableCell>
                <TableCell align="right"><strong>Avg Price (₹)</strong></TableCell>
                <TableCell align="right"><strong>Min Avg (₹)</strong></TableCell>
                <TableCell align="right"><strong>Max Avg (₹)</strong></TableCell>
                <TableCell align="right"><strong>Data Points</strong></TableCell>
                <TableCell align="right"><strong>Change (%)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.monthlyAverages.map((month, monthIndex) => (
                Object.keys(month.grades).map((gradeKey, gradeIndex) => {
                  const gradeData = month.grades[gradeKey];
                  const change = month.changes?.[gradeKey];
                  
                  return (
                    <TableRow key={`${month.month}-${gradeKey}`}>
                      {gradeIndex === 0 && (
                        <TableCell rowSpan={Object.keys(month.grades).length}>
                          {month.monthName} {month.year}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Chip 
                          label={gradeKey.toUpperCase()} 
                          size="small"
                          color={gradeKey === 'faq' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <strong>₹{gradeData.averageModalPrice.toLocaleString()}</strong>
                      </TableCell>
                      <TableCell align="right">
                        ₹{gradeData.averageMinPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{gradeData.averageMaxPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {gradeData.dataPoints}
                      </TableCell>
                      <TableCell align="right">
                        {change && (
                          <Box sx={{ color: getChangeColor(change.percentChange) }}>
                            {formatChange(change.percentChange)}%
                            <br />
                            <Typography variant="caption">
                              (₹{formatChange(change.absoluteChange)})
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const MonthlyAverages = () => {
  const { selectedCommodity, dateRange } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [customDateRange, setCustomDateRange] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Reset custom range when global date range changes
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

  const { data, loading, error } = useMonthlyAverages(
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
          Monthly Averages
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
          Monthly Averages
        </Typography>
        <Alert severity="error">
          Failed to load monthly averages: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Monthly Averages - {commodityName}
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
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Date Range
                  </Typography>
                  <Typography variant="h6">
                    {format(new Date(data.dateRange.start), 'MMM dd, yyyy')} - {format(new Date(data.dateRange.end), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Months
                  </Typography>
                  <Typography variant="h6">
                    {data.totalMonths}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Data Points
                  </Typography>
                  <Typography variant="h6">
                    {data.totalDataPoints}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Grades Available
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {data.monthlyAverages.length > 0 && 
                      Object.keys(data.monthlyAverages[0].grades).map(grade => (
                        <Chip key={grade} label={grade.toUpperCase()} size="small" sx={{ mr: 1 }} />
                      ))
                    }
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Chart */}
          <Box sx={{ mb: 3 }}>
            <MonthlyChart 
              data={data} 
              commodity={selectedCommodity}
              grade={selectedGrade}
            />
          </Box>

          {/* Table */}
          <MonthlyTable data={data} commodity={selectedCommodity} />
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No monthly data available for the selected filters.
        </Alert>
      )}
    </Box>
  );
};

export default MonthlyAverages;