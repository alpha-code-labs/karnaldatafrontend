import React from 'react';
import { ToggleButton, ToggleButtonGroup, Box, Typography } from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { COMMODITIES } from '../../utils/constants';

const CommodityToggle = () => {
  const { selectedCommodity, setSelectedCommodity } = useAppContext();

  const handleChange = (event, newCommodity) => {
    if (newCommodity !== null) {
      setSelectedCommodity(newCommodity);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
        Commodity:
      </Typography>
      <ToggleButtonGroup
        value={selectedCommodity}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            textTransform: 'none',
          },
        }}
      >
        {COMMODITIES.map((commodity) => (
          <ToggleButton key={commodity.value} value={commodity.value}>
            {commodity.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default CommodityToggle;