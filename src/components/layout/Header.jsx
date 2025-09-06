import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppContext } from '../../context/AppContext';
import CommodityToggle from '../common/CommodityToggle';
import DateFilter from '../common/DateFilter';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mobileOpen, setMobileOpen } = useAppContext();
  const location = useLocation();

  // Routes that don't need date filtering
  const routesWithoutDateFilter = [
    '/latest-prices',
    '/seasonal-patterns', 
    '/year-over-year'
  ];

  // Check if current route should show date filter
  const shouldShowDateFilter = !routesWithoutDateFilter.some(route => 
    location.pathname.includes(route)
  );

  return (
    <AppBar 
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        top: 8,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Karnal Data
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexGrow: 1,
            flexWrap: 'wrap',
          }}
        >
          <CommodityToggle />
          {shouldShowDateFilter && <DateFilter />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
