import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Welcome to Karnal Market Data Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a report from the sidebar to get started with market analysis.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;