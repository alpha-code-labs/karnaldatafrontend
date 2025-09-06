import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppContext } from '../../context/AppContext';

const DateFilter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { dateRange, setDateRange } = useAppContext();
  const [anchorEl, setAnchorEl] = useState(null);

  const presets = [
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 },
    { label: 'All time', days: null },
  ];

  const handlePresetClick = (days) => {
    if (days === null) {
      setDateRange({
        startDate: new Date('2022-12-01'),
        endDate: new Date('2025-03-31'),
      });
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      setDateRange({ startDate, endDate });
    }
    setAnchorEl(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ 
          minWidth: 'fit-content',
          width: isMobile ? '100%' : 'auto',
          textAlign: isMobile ? 'center' : 'left',
          mb: isMobile ? 1 : 0
        }}>
          Date Range:
        </Typography>
                
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          <DatePicker
            label="Start Date"
            value={dateRange.startDate}
            onChange={(newValue) =>
              setDateRange({ ...dateRange, startDate: newValue })
            }
            slotProps={{
              textField: {
                size: "small",
                sx: { width: isMobile ? '100%' : 140 }
              }
            }}
          />
          <DatePicker
            label="End Date"
            value={dateRange.endDate}
            onChange={(newValue) =>
              setDateRange({ ...dateRange, endDate: newValue })
            }
            slotProps={{
              textField: {
                size: "small", 
                sx: { width: isMobile ? '100%' : 140 }
              }
            }}
          />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {presets.map((preset) => (
            <MenuItem
              key={preset.label}
              onClick={() => handlePresetClick(preset.days)}
            >
              {preset.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};

export default DateFilter;