import { createTheme, Theme } from '@mui/material/styles';

// Optimized color palette for both modes
const lightPalette = {
  primary: {
    main: '#00674F', // Emerald green
    light: '#4CAF50',
    dark: '#004D40',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#431C5B', // Eggplant
    light: '#7B1FA2',
    dark: '#2E0A3D',
    contrastText: '#ffffff',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  divider: '#e0e0e0',
  action: {
    hover: 'rgba(0, 103, 79, 0.04)',
    selected: 'rgba(0, 103, 79, 0.08)',
  },
};

const darkPalette = {
  primary: {
    main: '#4CAF50', // Lighter green for dark mode
    light: '#81C784',
    dark: '#2E7D32',
    contrastText: '#000000',
  },
  secondary: {
    main: '#AB47BC', // Lighter purple for dark mode
    light: '#CE93D8',
    dark: '#7B1FA2',
    contrastText: '#000000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
  },
  divider: '#333333',
  action: {
    hover: 'rgba(76, 175, 80, 0.08)',
    selected: 'rgba(76, 175, 80, 0.12)',
  },
};

// Lightweight typography settings
const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 },
  h2: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '0.875rem', lineHeight: 1.5 },
  body2: { fontSize: '0.75rem', lineHeight: 1.4 },
  button: { fontSize: '0.875rem', fontWeight: 500, textTransform: 'none' as const },
  caption: { fontSize: '0.75rem', lineHeight: 1.4 },
};

// Optimized component overrides
const getComponentOverrides = (mode: 'light' | 'dark') => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: mode === 'dark' ? '#6b6b6b #2b2b2b' : '#c1c1c1 #f1f1f1',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#2b2b2b' : '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#6b6b6b' : '#c1c1c1',
          borderRadius: '4px',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        boxShadow: mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        '&:hover': {
          backgroundColor: mode === 'dark' 
            ? 'rgba(76, 175, 80, 0.08)' 
            : 'rgba(0, 103, 79, 0.04)',
        },
      },
    },
  },
});

export const createOptimizedTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    typography,
    components: getComponentOverrides(mode),
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  });
};