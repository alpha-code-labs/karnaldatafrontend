import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import { useYearOverYear } from '../../../hooks/useYearOverYear';

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

const YearOverYearChart = ({ data, commodity }) => {
  if (!data?.monthlyAverages) return null;

  const years = [...new Set(data.monthlyAverages.map(item => item.year))];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = months.map((monthName, index) => {
    const monthNum = index + 1;
    const point = { month: monthName };
    
    years.forEach(year => {
      const monthData = data.monthlyAverages.find(item => 
        item.year === year && item.month === monthNum
      );
      if (monthData) {
        point[`year_${year}`] = monthData.averagePrice;
      }
    });
    
    return point;
  });

  const colors = ['#2E7D32', '#FF6B35', '#1976D2', '#FF8F00', '#9C27B0'];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Year-over-Year Monthly Comparison - {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Average Price (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [
                value ? `₹${value.toLocaleString()}` : 'N/A',
                name.replace('year_', '')
              ]} />
              <Legend />
              
              {years.map((year, index) => (
                <Line
                  key={year}
                  type="monotone"
                  dataKey={`year_${year}`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={3}
                  name={year.toString()}
                  dot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const YearOverYearTable = ({ data }) => {
  if (!data?.yoyComparisons) return null;

  const getChangeColor = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Year-over-Year Changes by Month
        </Typography>
        
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Month</strong></TableCell>
                <TableCell align="right"><strong>Years</strong></TableCell>
                <TableCell align="right"><strong>Previous Price (₹)</strong></TableCell>
                <TableCell align="right"><strong>Current Price (₹)</strong></TableCell>
                <TableCell align="right"><strong>Change (₹)</strong></TableCell>
                <TableCell align="right"><strong>Change (%)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.yoyComparisons.map((monthData) => (
                monthData.comparisons.map((comparison, index) => (
                  <TableRow key={`${monthData.month}-${index}`}>
                    {index === 0 && (
                      <TableCell rowSpan={monthData.comparisons.length}>
                        <strong>{monthData.monthName}</strong>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      {comparison.previousYear} → {comparison.currentYear}
                    </TableCell>
                    <TableCell align="right">
                      ₹{comparison.previousPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      ₹{comparison.currentPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ color: getChangeColor(comparison.absoluteChange) }}>
                        {formatChange(comparison.absoluteChange)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ color: getChangeColor(comparison.percentChange) }}>
                        {formatChange(comparison.percentChange)}%
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const InsightsCards = ({ data }) => {
  if (!data?.insights) return null;

  const { largestIncreases, largestDecreases, largestPercentIncreases, largestPercentDecreases } = data.insights;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Largest Absolute Increases
            </Typography>
            {largestIncreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.monthName} ({change.previousYear} → {change.currentYear})
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

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error.main">
              Largest Absolute Decreases
            </Typography>
            {largestDecreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.monthName} ({change.previousYear} → {change.currentYear})
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

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary.main">
              Largest Percentage Increases
            </Typography>
            {largestPercentIncreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.monthName} ({change.previousYear} → {change.currentYear})
                  </Typography>
                  <Chip 
                    label={`+${change.percentChange}%`} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="secondary.main">
              Largest Percentage Decreases
            </Typography>
            {largestPercentDecreases.slice(0, 3).map((change, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {change.monthName} ({change.previousYear} → {change.currentYear})
                  </Typography>
                  <Chip 
                    label={`${change.percentChange}%`} 
                    color="secondary" 
                    size="small" 
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const YearOverYear = () => {
  const { selectedCommodity } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState('all');

  const { data, loading, error } = useYearOverYear(
    selectedCommodity,
    selectedGrade === 'all' ? '' : selectedGrade
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Year-over-Year Comparisons
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
          Year-over-Year Comparisons
        </Typography>
        <Alert severity="error">
          Failed to load year-over-year data: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Year-over-Year Comparisons - {commodityName}
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
              <Typography variant="body2" color="text.secondary">
                Year-over-year analysis compares the same months across different years to identify multi-year trends.
              </Typography>
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
                    Years Available
                  </Typography>
                  <Typography variant="h6">
                    {[...new Set(data.monthlyAverages.map(item => item.year))].length}
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
            <YearOverYearChart data={data} commodity={selectedCommodity} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <InsightsCards data={data} />
          </Box>

          <YearOverYearTable data={data} />
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No year-over-year comparison data available.
        </Alert>
      )}
    </Box>
  );
};

export default YearOverYear;