import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Assessment,
  CompareArrows,
  Schedule,
  BarChart,
  TrendingUp,
  Star,
  Storage,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { NAVIGATION_ITEMS } from '../../utils/constants';

const iconMap = {
  assessment: Assessment,
  compare_arrows: CompareArrows,
  schedule: Schedule,
  bar_chart: BarChart,
  trending_up: TrendingUp,
  star: Star,
  storage: Storage,
};

const DRAWER_WIDTH = 280;
const MOBILE_DRAWER_WIDTH = 250; // Reduced width for mobile

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileOpen, setMobileOpen } = useAppContext();
  const [expanded, setExpanded] = useState({});

  const handleExpandClick = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ overflow: 'auto', mt: 10 }}>
      <List>
        {NAVIGATION_ITEMS.map((section, index) => {
          const IconComponent = iconMap[section.icon];
          const isExpanded = expanded[index];
          
          return (
            <React.Fragment key={section.title}>
              <ListItemButton 
                onClick={() => handleExpandClick(index)}
                sx={{ 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemIcon>
                  <IconComponent color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={section.title}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  }}
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item) => (
                    <ListItemButton
                      key={item.path}
                      sx={{ 
                        pl: 4,
                        py: 0.8,
                      }}
                      selected={location.pathname === item.path}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <ListItemText 
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
              
              {index < NAVIGATION_ITEMS.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: MOBILE_DRAWER_WIDTH, // Use smaller width for mobile
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
