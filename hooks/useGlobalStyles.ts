import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { createGlobalStyles, Typography, Spacing, BorderRadius, Shadows, DeviceStyles } from '@/constants/GlobalStyles';
import { Colors } from '@/constants/Colors';

/**
 * Custom hook that provides theme-aware global styles and design tokens
 */
export const useGlobalStyles = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  
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
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  
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
