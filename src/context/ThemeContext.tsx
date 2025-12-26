import React, { createContext, useContext, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

interface ThemeContextType {
  colors: typeof LIGHT_COLORS;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: LIGHT_COLORS,
  isDark: false,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const isDark = settings.darkMode;

  const colors = useMemo(() => {
    return isDark ? DARK_COLORS : LIGHT_COLORS;
  }, [isDark]);

  const value = useMemo(() => ({
    colors,
    isDark,
  }), [colors, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
