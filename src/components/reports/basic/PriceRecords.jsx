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
  TrendingUp,
  TrendingDown,
  ExpandMore,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { usePriceRecords } from '../../../hooks/usePriceRecords';

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

const RecordCard = ({ title, icon, records, type = 'price' }) => {
  const formatDate = (dateStr) => format(parseISO(dateStr), 'MMM dd, yyyy');
  
  const formatValue = (value, valueType = 'price') => {
    if (valueType === 'price') return `₹${value?.toLocaleString()}`;
    if (valueType === 'percent') return `${value > 0 ? '+' : ''}${value}%`;
    return value;
  };

  const getChangeColor = (value) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.primary';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        
        {records && records.length > 0 ? (
          <Box>
            {records.slice(0, 5).map((record, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ color: getChangeColor(record.price || record.absoluteChange || record.percentChange) }}>
                      {type === 'change' ? (
                        <>
                          {formatValue(record.absoluteChange)} 
                          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            ({formatValue(record.percentChange, 'percent')})
                          </Typography>
                        </>
                      ) : (
                        formatValue(record.price)
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type === 'change' ? 
                        `${formatDate(record.previousDate)} → ${formatDate(record.date)}` :
                        formatDate(record.date)
                      }
                    </Typography>
                  </Grid>
                  {type === 'change' && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        {formatValue(record.previousPrice)} → {formatValue(record.currentPrice)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No records available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const AllTimeRecordsSection = ({ records }) => {
  const formatDate = (dateStr) => format(parseISO(dateStr), 'MMM dd, yyyy');

  return (
    <Grid container spacing={3}>
      {Object.keys(records).map(gradeKey => {
        const gradeRecords = records[gradeKey].allTimeRecords;
        
        return (
          <Grid item xs={12} key={gradeKey}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  All-Time Records - {gradeKey.toUpperCase()} Grade
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="success.contrastText">
                        ₹{gradeRecords.highestOverall.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="success.contrastText">
                        Highest Overall ({gradeRecords.highestOverall.priceType})
                      </Typography>
                      <Typography variant="caption" color="success.contrastText">
                        {formatDate(gradeRecords.highestOverall.date)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="error.contrastText">
                        ₹{gradeRecords.lowestOverall.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="error.contrastText">
                        Lowest Overall ({gradeRecords.lowestOverall.priceType})
                      </Typography>
                      <Typography variant="caption" color="error.contrastText">
                        {formatDate(gradeRecords.lowestOverall.date)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="primary.contrastText">
                        ₹{gradeRecords.highestModal.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="primary.contrastText">
                        Highest Modal Price
                      </Typography>
                      <Typography variant="caption" color="primary.contrastText">
                        {formatDate(gradeRecords.highestModal.date)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                      <Typography variant="h4" color="secondary.contrastText">
                        ₹{gradeRecords.lowestModal.price?.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="secondary.contrastText">
                        Lowest Modal Price
                      </Typography>
                      <Typography variant="caption" color="secondary.contrastText">
                        {formatDate(gradeRecords.lowestModal.date)}
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

const PriceRecords = () => {
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

  const { data, loading, error } = usePriceRecords(
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
          Price Records
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
          Price Records
        </Typography>
        <Alert severity="error">
          Failed to load price records: {error}
        </Alert>
      </Box>
    );
  }

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Price Records - {commodityName}
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
                    Total Data Points
                  </Typography>
                  <Typography variant="h6">
                    {data.totalDataPoints}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Grades Available
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {Object.keys(data.records).map(grade => (
                      <Chip key={grade} label={grade.toUpperCase()} size="small" sx={{ mr: 1 }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* All-Time Records */}
          <Box sx={{ mb: 3 }}>
            <AllTimeRecordsSection records={data.records} />
          </Box>

          {/* Daily Changes */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={3}>
              {Object.keys(data.records).map(gradeKey => {
                const gradeRecords = data.records[gradeKey].dailyChanges;
                
                return (
                  <Grid item xs={12} key={gradeKey}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">
                          Daily Price Changes - {gradeKey.toUpperCase()} Grade
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <RecordCard
                              title="Largest Increases"
                              icon={<TrendingUp color="success" />}
                              records={gradeRecords.largestIncreases}
                              type="change"
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <RecordCard
                              title="Largest Decreases"
                              icon={<TrendingDown color="error" />}
                              records={gradeRecords.largestDecreases}
                              type="change"
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </>
      )}

      {!data && !loading && (
        <Alert severity="info">
          No price records available for the selected filters.
        </Alert>
      )}
    </Box>
  );
};

export default PriceRecords;
