import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useAppContext } from '../context/AppContext';

const PlaceholderPage = ({ title, description }) => {
  const { selectedCommodity, dateRange } = useAppContext();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Commodity: {selectedCommodity.charAt(0).toUpperCase() + selectedCommodity.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date Range: {dateRange.startDate?.toLocaleDateString()} - {dateRange.endDate?.toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description || 'This report will display market data analysis. API integration coming soon.'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlaceholderPage;