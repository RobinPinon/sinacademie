import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#202020',
        light: '#404040',
        dark: '#000000',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: isDarkMode ? '#202020' : '#E8E8E8',
        paper: isDarkMode ? '#2d2d2d' : '#ffffff',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: isDarkMode ? '#404040' : '#ffffff',
            },
          },
          contained: {
            '&:hover': {
              backgroundColor: isDarkMode ? '#404040' : '#000000',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: isDarkMode ? '#404040' : '#ffffff',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#202020' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#202020',
            '& .MuiButton-root, & a': {
              color: isDarkMode ? '#ffffff' : '#202020',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                backgroundColor: 'transparent',
                color: isDarkMode ? '#ffffff' : '#202020',
                opacity: 0.8,
              },
            },
            '& .MuiIconButton-root': {
              color: isDarkMode ? '#ffffff' : '#202020',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                backgroundColor: 'transparent',
                color: isDarkMode ? '#ffffff' : '#202020',
                opacity: 0.8,
              },
            },
            '& .MuiTypography-root': {
              color: isDarkMode ? '#ffffff' : '#202020',
            },
            '& .logout-button': {
              color: '#dc004e !important',
              borderColor: '#dc004e !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                color: '#dc004e !important',
                borderColor: '#dc004e !important',
                opacity: 0.8,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#dc004e !important',
                },
                '& .MuiButton-outlined': {
                  borderColor: '#dc004e !important',
                },
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode 
              ? '0px 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0px 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: isDarkMode ? '#ffffff' : '#202020',
            textDecoration: 'none',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              color: isDarkMode ? '#ffffff' : '#202020',
              opacity: 0.8,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            '& a': {
              color: isDarkMode ? '#ffffff' : '#202020',
              textDecoration: 'none',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                color: isDarkMode ? '#ffffff' : '#202020',
                opacity: 0.8,
              },
            },
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 