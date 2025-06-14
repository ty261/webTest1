import React, { createContext, useState, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Create context
const ThemeContext = createContext();

// Theme configuration
const lightTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Green, representing agriculture
    },
    secondary: {
      main: '#0288d1', // Blue, representing water resources
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
};

const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50', // Lighter green
    },
    secondary: {
      main: '#29b6f6', // Lighter blue
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get theme mode from localStorage, default is light
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');
  
  // Toggle theme function
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  
  // Create theme based on mode
  const theme = useMemo(
    () => createTheme(mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );
  
  // Context value
  const value = {
    mode,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider; 