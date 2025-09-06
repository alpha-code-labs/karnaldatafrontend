import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Deep forest green
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF8F00', // Warm amber
      light: '#FFB74D',
      dark: '#E65100',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E0E0E0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#E8F5E8',
          },
          '&.Mui-selected': {
            backgroundColor: '#E8F5E8',
            borderRight: '3px solid #2E7D32',
          },
        },
      },
    },
  },
});

export default theme;