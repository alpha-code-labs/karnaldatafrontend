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
import { useSeasonalPatterns } from '../../../hooks/useSeasonalPatterns';

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

const SeasonalChart = ({ data, commodity }) => {
  if (!data?.seasonalPatterns) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Seasonal Price Patterns - {commodity.charAt(0).toUpperCase() + commodity.slice(1)}
        </Typography>
        
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.seasonalPatterns} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" angle={-45} textAnchor="end" height={60} />
              <YAxis label={{ value: 'Average Price (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, 'Average Price']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averagePrice" 
                stroke="#2E7D32" 
                strokeWidth={3}
                name="Average Price"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

const InsightsCards = ({ data }) => {
  if (!data?.insights) return null;

  const { cheapestMonths, expensiveMonths, mostVolatileMonth, mostStableMonth } = data.insights;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              Cheapest Months
            </Typography>
            {cheapestMonths.map((month, index) => (
              <Box key={month.month} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    #{index + 1} {month.monthName}
                  </Typography>
                  <Chip 
                    label={`₹${month.averagePrice.toLocaleString()}`} 
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
              Most Expensive Months
            </Typography>
            {expensiveMonths.map((month, index) => (
              <Box key={month.month} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    #{index + 1} {month.monthName}
                  </Typography>
                  <Chip 
                    label={`₹${month.averagePrice.toLocaleString()}`} 
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
            <Typography variant="h6" gutterBottom color="warning.main">
              Most Volatile Month
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h4" color="warning.main">
                {mostVolatileMonth.monthName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price Range: ₹{mostVolatileMonth.priceRange.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="info.main">
              Most Stable Month
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="h4" color="info.main">
                {mostStableMonth.monthName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price Range: ₹{mostStableMonth.priceRange.toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const SeasonalPatterns = () => {
  const { selectedCommodity } = useAppContext();
  const [selectedGrade, setSelectedGrade] = useState('all');

  const { data, loading, error } = useSeasonalPatterns(
    selectedCommodity,
    selectedGrade === 'all' ? '' : selectedGrade
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Seasonal Patterns
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
          Seasonal Patterns
        </Typography>
        <Alert severity="error">
          Failed to load seasonal patterns: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seasonal Patterns - {commodityName}
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
                Seasonal analysis uses all available historical data to identify monthly price patterns across years.
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
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Commodity
                  </Typography>
                  <Typography variant="h6">
                    {commodityName}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mb: 3 }}>
            <SeasonalChart data={data} commodity={selectedCommodity} />
          </Box>

          <InsightsCards data={data} />
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No seasonal pattern data available.
        </Alert>
      )}
    </Box>
  );
};

export default SeasonalPatterns;