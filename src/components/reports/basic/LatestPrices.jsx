import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import { useAppContext } from '../../../context/AppContext';
import { useLatestPrices } from '../../../hooks/useLatestPrices';

const PriceCard = ({ title, priceData, color }) => {
  if (!priceData) {
    return (
      <Card sx={{ height: '100%', border: `2px solid ${color}` }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color={color}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', border: `2px solid ${color}` }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color={color}>
          {title}
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Minimum
                </Typography>
                <Typography variant="h6" color="error.main">
                  ₹{priceData.minPrice.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Modal
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  ₹{priceData.modalPrice.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Maximum
                </Typography>
                <Typography variant="h6" color="success.main">
                  ₹{priceData.maxPrice.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Price Range: ₹{(priceData.maxPrice - priceData.minPrice).toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const LatestPrices = () => {
  const { selectedCommodity } = useAppContext();
  const { data, loading, error } = useLatestPrices(selectedCommodity);

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Latest Prices
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={250} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={250} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Latest Prices
        </Typography>
        <Alert severity="error">
          Failed to load latest prices: {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Latest Prices
        </Typography>
        <Alert severity="info">
          No price data available for {selectedCommodity}
        </Alert>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const commodityName = selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Latest Prices - {commodityName}
      </Typography>

      {/* Date and Summary Card */}
      <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h6">
                Current Market Prices
              </Typography>
              <Typography variant="body1">
                As of {formatDate(data.latestDate)}
              </Typography>
            </Grid>
            <Grid item>
              <Chip 
                label={`${Object.keys(data.data).length} Grade${Object.keys(data.data).length > 1 ? 's' : ''} Available`}
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Price Cards */}
      <Grid container spacing={3}>
        {data.data.faq && (
          <Grid item xs={12} md={data.data['non-faq'] ? 6 : 12}>
            <PriceCard
              title="FAQ Grade"
              priceData={data.data.faq}
              color="#2E7D32"
            />
          </Grid>
        )}
        
        {data.data['non-faq'] && (
          <Grid item xs={12} md={data.data.faq ? 6 : 12}>
            <PriceCard
              title="Non-FAQ Grade"
              priceData={data.data['non-faq']}
              color="#FF8F00"
            />
          </Grid>
        )}
      </Grid>

      {/* Additional Info */}
      {data.data.faq && data.data['non-faq'] && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Grade Comparison
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  FAQ Premium (Modal Price)
                </Typography>
                <Typography variant="h6" color="primary.main">
                  ₹{(data.data.faq.modalPrice - data.data['non-faq'].modalPrice).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Premium Percentage
                </Typography>
                <Typography variant="h6" color="secondary.main">
                  {(((data.data.faq.modalPrice - data.data['non-faq'].modalPrice) / data.data['non-faq'].modalPrice) * 100).toFixed(1)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LatestPrices;