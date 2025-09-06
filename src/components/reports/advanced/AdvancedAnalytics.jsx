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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { useAdvancedAnalytics } from '../../../hooks/useAdvancedAnalytics';

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

const CrossCommodityCorrelation = ({ data }) => {
  if (!data?.crossCommodityCorrelation) {
    return (
      <Alert severity="info">
        Insufficient overlapping data for correlation analysis. Both commodities need data for the same dates.
      </Alert>
    );
  }

  const correlation = data.crossCommodityCorrelation;
  const getCorrelationColor = (coeff) => {
    if (Math.abs(coeff) > 0.7) return 'success.main';
    if (Math.abs(coeff) > 0.3) return 'warning.main';
    return 'error.main';
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h2" sx={{ color: getCorrelationColor(correlation.coefficient) }}>
            {correlation.coefficient}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {correlation.strength} {correlation.direction} Correlation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Based on {correlation.dataPoints} overlapping data points
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, height: '100%', display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1">
            {correlation.interpretation}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

const VolatilityAnalysis = ({ data }) => {
  if (!data?.onionAnalytics && !data?.potatoAnalytics) return null;

  const volatilityData = [
    data.onionAnalytics && {
      name: 'Onion',
      volatility: data.onionAnalytics.volatility,
      recentVolatility: data.onionAnalytics.recentVolatility,
      averagePrice: data.onionAnalytics.averagePrice
    },
    data.potatoAnalytics && {
      name: 'Potato', 
      volatility: data.potatoAnalytics.volatility,
      recentVolatility: data.potatoAnalytics.recentVolatility,
      averagePrice: data.potatoAnalytics.averagePrice
    }
  ].filter(Boolean);

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'Increasing': return <TrendingUp color="success" />;
      case 'Decreasing': return <TrendingDown color="error" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volatilityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Volatility (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => [
                `₹${value?.toFixed(2)}`,
                name === 'volatility' ? 'Overall Volatility' : 'Recent Volatility (30 days)'
              ]} />
              <Legend />
              <Bar dataKey="volatility" fill="#FF8F00" name="Overall Volatility" />
              <Bar dataKey="recentVolatility" fill="#1976D2" name="Recent Volatility" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Typography variant="h6" gutterBottom>Price Outlook</Typography>
        {volatilityData.map((item) => {
          const analytics = data[`${item.name.toLowerCase()}Analytics`];
          return (
            <Box key={item.name} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getTrendIcon(analytics?.trendDirection)}
                <Typography variant="h6" sx={{ ml: 1, color: item.name === 'Onion' ? '#FF6B35' : '#8B4513' }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="body2">
                Trend: {analytics?.trendDirection || 'Unknown'}
              </Typography>
              {analytics?.predictions && (
                <>
                  <Typography variant="body2">
                    Expected Range: ₹{analytics.predictions.volatilityRange.lower} - ₹{analytics.predictions.volatilityRange.upper}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    *Based on recent volatility patterns
                  </Typography>
                </>
              )}
            </Box>
          );
        })}
      </Grid>
    </Grid>
  );
};

const GradePremiumAnalysis = ({ data }) => {
  if (!data?.gradePremiums || Object.keys(data.gradePremiums).length === 0) {
    return (
      <Alert severity="info">
        Grade premium analysis requires both FAQ and Non-FAQ grade data for comparison.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {Object.keys(data.gradePremiums).map(commodity => {
        const premium = data.gradePremiums[commodity];
        const commodityColor = commodity === 'onion' ? '#FF6B35' : '#8B4513';
        
        return (
          <Grid item xs={12} md={6} key={commodity}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ color: commodityColor, mb: 2 }}>
                  {commodity.charAt(0).toUpperCase() + commodity.slice(1)} Grade Premium
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">FAQ Price</Typography>
                    <Typography variant="h6">₹{premium.faqPrice.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Non-FAQ Price</Typography>
                    <Typography variant="h6">₹{premium.nonFaqPrice.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: `${commodityColor}20`, borderRadius: 1 }}>
                      <Typography variant="h5" sx={{ color: commodityColor }}>
                        ₹{premium.absolutePremium} ({premium.percentPremium}%)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        FAQ Premium over Non-FAQ
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

const PriceDistributionAnalysis = ({ data }) => {
  if (!data?.onionAnalytics?.priceDistribution && !data?.potatoAnalytics?.priceDistribution) return null;

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  const createPieData = (distribution) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    return Object.keys(distribution).map(range => ({
      name: range,
      value: distribution[range],
      percentage: ((distribution[range] / total) * 100).toFixed(1)
    }));
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4; // Push labels further out
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.02) return null; // Don't show labels for very small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#333" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Grid container spacing={3}>
      {data.onionAnalytics?.priceDistribution && (
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="#FF6B35" gutterBottom>
            Onion Price Distribution
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}> {/* Increased height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}> {/* Added margins */}
                <Pie
                  data={createPieData(data.onionAnalytics.priceDistribution)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {createPieData(data.onionAnalytics.priceDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      )}

      {data.potatoAnalytics?.priceDistribution && (
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="#8B4513" gutterBottom>
            Potato Price Distribution
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}> {/* Increased height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}> {/* Added margins */}
                <Pie
                  data={createPieData(data.potatoAnalytics.priceDistribution)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {createPieData(data.potatoAnalytics.priceDistribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      )}

      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Distribution Categories:</strong> Very Low/High: Beyond 1 standard deviation | 
            Low/High: Between quartiles | Average: Within interquartile range
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );
};

const AdvancedAnalytics = () => {
  const { dateRange } = useAppContext();
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

  const { data, loading, error } = useAdvancedAnalytics(
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
          Advanced Analytics
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
          Advanced Analytics
        </Typography>
        <Alert severity="error">
          Failed to load advanced analytics: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Advanced Analytics
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
                    Analysis Period
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
                    {data.marketSummary.totalDataPoints}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Commodities Analyzed
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {data.marketSummary.commoditiesAnalyzed.map(commodity => (
                      <Chip 
                        key={commodity} 
                        label={commodity.charAt(0).toUpperCase() + commodity.slice(1)} 
                        size="small" 
                        sx={{ mr: 1, bgcolor: commodity === 'onion' ? '#FF6B35' : '#8B4513', color: 'white' }} 
                      />
                    ))}
                  </Box>
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

          {/* Analytics Sections */}
          <Box sx={{ mb: 3 }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Cross-Commodity Correlations</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <CrossCommodityCorrelation data={data} />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Volatility Analysis & Price Outlook</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <VolatilityAnalysis data={data} />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Grade Premium Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <GradePremiumAnalysis data={data} />
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Price Distribution Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <PriceDistributionAnalysis data={data} />
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Disclaimer */}
          <Card sx={{ bgcolor: 'warning.light', mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="warning.contrastText">
                <strong>Disclaimer:</strong> Price predictions and trend analyses are based on historical patterns and statistical models. 
                They should be used for analytical purposes only and not as trading or investment advice. 
                Market conditions, supply/demand changes, and external factors can significantly impact actual prices.
              </Typography>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No advanced analytics data available for the selected filters.
        </Alert>
      )}
    </Box>
  );
};

export default AdvancedAnalytics;
