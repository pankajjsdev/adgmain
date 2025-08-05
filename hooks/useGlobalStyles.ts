import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { createGlobalStyles, Typography, Spacing, BorderRadius, Shadows, DeviceStyles } from '@/constants/GlobalStyles';
import { Colors } from '@/constants/Colors';
import useThemeStore from '@/store/themeStore';

/**
 * Custom hook that provides theme-aware global styles and design tokens
 */
export const useGlobalStyles = () => {
  const systemColorScheme = useColorScheme();
  const { getCurrentTheme } = useThemeStore();
  
  const theme = getCurrentTheme(systemColorScheme ?? 'light');
  
  const styles = useMemo(() => createGlobalStyles(theme), [theme]);
  const colors = useMemo(() => Colors[theme], [theme]);
  
  return {
    styles,
    colors,
    theme,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    device: DeviceStyles,
  };
};

/**
 * Hook to get only colors for the current theme
 */
export const useThemeColors = () => {
  const systemColorScheme = useColorScheme();
  const { getCurrentTheme } = useThemeStore();
  
  const theme = getCurrentTheme(systemColorScheme ?? 'light');
  
  return useMemo(() => Colors[theme], [theme]);
};

/**
 * Hook to get design tokens without styles
 */
export const useDesignTokens = () => {
  return {
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    device: DeviceStyles,
  };
};

export default useGlobalStyles;
