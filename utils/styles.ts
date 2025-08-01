// utils/styles.ts
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Color Palette
export const ColorPalette = {
  primary: {
    main: Colors.light.tint,
    dark: '#0451AF',
    light: '#66b2ff',
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: Colors.light.tint,
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    main: Colors.light.secondary || '#6c757d',
    dark: '#495057',
    light: '#adb5bd',
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#495057',
    700: '#343a40',
    800: '#212529',
    900: '#000000',
  },
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },
  success: {
    main: '#28a745',
    dark: '#218838',
    light: '#28a74533',
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  warning: {
    main: '#ffc107',
    dark: '#e0a800',
    light: '#ffc10733',
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    main: '#dc3545',
    dark: '#c82333',
    light: '#dc354533',
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    main: '#17a2b8',
    dark: '#138496',
    light: '#17a2b833',
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  gradients: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#f093fb', '#f5576c'],
    success: ['#4facfe', '#00f2fe'],
    sunset: ['#ff9a9e', '#fecfef'],
    ocean: ['#667eea', '#764ba2'],
    forest: ['#134e5e', '#71b280'],
  },
  text: Colors.light.text,
  background: Colors.light.background,
  surface: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

// Enhanced Spacing System
export const Spacing = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  '5xl': 40,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,
  '9xl': 72,
  '10xl': 80,
  // Legacy support
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

// Enhanced Typography System
export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 48,
  '8xl': 60,
  '9xl': 72,
};

export const FontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const LineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export const Typography = StyleSheet.create({
  // Display styles
  display1: {
    fontSize: FontSizes['9xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['9xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  display2: {
    fontSize: FontSizes['8xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['8xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  display3: {
    fontSize: FontSizes['7xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['7xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  
  // Heading styles
  h1: {
    fontSize: FontSizes['6xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['6xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  h2: {
    fontSize: FontSizes['5xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes['5xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  h3: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['4xl'] * LineHeights.tight,
    color: ColorPalette.text,
  },
  h4: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes['3xl'] * LineHeights.snug,
    color: ColorPalette.text,
  },
  h5: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes['2xl'] * LineHeights.snug,
    color: ColorPalette.text,
  },
  h6: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.xl * LineHeights.normal,
    color: ColorPalette.text,
  },
  
  // Body text styles
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.lg * LineHeights.relaxed,
    color: ColorPalette.text,
  },
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.base * LineHeights.normal,
    color: ColorPalette.text,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.sm * LineHeights.normal,
    color: ColorPalette.text,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    lineHeight: FontSizes.xs * LineHeights.normal,
    color: ColorPalette.neutral.gray500,
  },
  
  // Interactive text styles
  buttonLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: ColorPalette.background,
  },
  button: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: ColorPalette.background,
  },
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: ColorPalette.background,
  },
  link: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    color: ColorPalette.primary.main,
    textDecorationLine: 'underline',
  },
  linkBold: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: ColorPalette.primary.main,
  },
  
  // Legacy support
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ColorPalette.text,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ColorPalette.text,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: ColorPalette.background,
  },
});

// Enhanced Border System
export const BorderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
  // Legacy support
  radius: 8,
};

export const BorderWidths = {
  none: 0,
  thin: 0.5,
  base: 1,
  thick: 2,
  thicker: 4,
};

export const Borders = StyleSheet.create({
  none: {
    borderWidth: BorderWidths.none,
  },
  thin: {
    borderWidth: BorderWidths.thin,
    borderColor: ColorPalette.neutral.gray200,
  },
  base: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.neutral.gray200,
  },
  thick: {
    borderWidth: BorderWidths.thick,
    borderColor: ColorPalette.neutral.gray300,
  },
  primary: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.primary.main,
  },
  success: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.success.main,
  },
  warning: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.warning.main,
  },
  error: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.error.main,
  },
  rounded: {
    borderRadius: BorderRadius.base,
  },
  roundedLg: {
    borderRadius: BorderRadius.lg,
  },
  roundedFull: {
    borderRadius: BorderRadius.full,
  },
});

// Enhanced Shadow System
export const Shadows = StyleSheet.create({
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 16,
  },
  // Legacy support
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

// Enhanced Z-Index Management
export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  // Legacy support
  low: 10,
  medium: 100,
  high: 1000,
};

// Enhanced Animation System
export const Animations = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
    slowest: 1000,
    // Legacy support
    short: 150,
    medium: 300,
    long: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Legacy support
    timingFunction: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  spring: {
    gentle: { tension: 120, friction: 14 },
    wobbly: { tension: 180, friction: 12 },
    stiff: { tension: 210, friction: 20 },
  },
};

// Icon Sizes
export const IconSizes = {
  xs: 12,
  sm: 16,
  base: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

// Enhanced Layout System
export const Layout = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  containerFluid: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  
  // Flex layouts
  flex1: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  flexShrink: { flexShrink: 1 },
  
  // Direction
  row: {
    flexDirection: 'row',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  column: {
    flexDirection: 'column',
  },
  columnReverse: {
    flexDirection: 'column-reverse',
  },
  
  // Justify content
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyCenter: { justifyContent: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyAround: { justifyContent: 'space-around' },
  justifyEvenly: { justifyContent: 'space-evenly' },
  
  // Align items
  itemsStart: { alignItems: 'flex-start' },
  itemsEnd: { alignItems: 'flex-end' },
  itemsCenter: { alignItems: 'center' },
  itemsStretch: { alignItems: 'stretch' },
  itemsBaseline: { alignItems: 'baseline' },
  
  // Align self
  selfStart: { alignSelf: 'flex-start' },
  selfEnd: { alignSelf: 'flex-end' },
  selfCenter: { alignSelf: 'center' },
  selfStretch: { alignSelf: 'stretch' },
  selfBaseline: { alignSelf: 'baseline' },
  
  // Common combinations
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Positioning
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  
  // Full dimensions
  fullWidth: { width: '100%' },
  fullHeight: { height: '100%' },
  fullSize: { width: '100%', height: '100%' },
  
  // Screen dimensions
  screenWidth: { width: screenWidth },
  screenHeight: { height: screenHeight },
});

// Component Styles
export const Components = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: ColorPalette.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  cardHeader: {
    paddingBottom: Spacing.md,
    borderBottomWidth: BorderWidths.thin,
    borderBottomColor: ColorPalette.neutral.gray200,
  },
  cardBody: {
    paddingVertical: Spacing.md,
  },
  cardFooter: {
    paddingTop: Spacing.md,
    borderTopWidth: BorderWidths.thin,
    borderTopColor: ColorPalette.neutral.gray200,
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: ColorPalette.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: ColorPalette.secondary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Form elements
  input: {
    borderWidth: BorderWidths.base,
    borderColor: ColorPalette.neutral.gray300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.base,
    color: ColorPalette.text,
    backgroundColor: ColorPalette.surface,
  },
  inputFocused: {
    borderColor: ColorPalette.primary.main,
    ...Shadows.sm,
  },
  inputError: {
    borderColor: ColorPalette.error.main,
  },
  
  // Lists
  listItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: BorderWidths.thin,
    borderBottomColor: ColorPalette.neutral.gray200,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  
  // Dividers
  divider: {
    height: BorderWidths.thin,
    backgroundColor: ColorPalette.neutral.gray200,
    marginVertical: Spacing.md,
  },
  dividerVertical: {
    width: BorderWidths.thin,
    backgroundColor: ColorPalette.neutral.gray200,
    marginHorizontal: Spacing.md,
  },
  
  // Badges
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  badgePrimary: {
    backgroundColor: ColorPalette.primary.main,
  },
  badgeSuccess: {
    backgroundColor: ColorPalette.success.main,
  },
  badgeWarning: {
    backgroundColor: ColorPalette.warning.main,
  },
  badgeError: {
    backgroundColor: ColorPalette.error.main,
  },
});

// Responsive Breakpoints
export const Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
  // Legacy support
  small: 600,
  medium: 900,
  large: 1200,
};

// Accessibility Helpers
export const Accessibility = {
  minTouchTarget: 44,
  focusRing: {
    borderWidth: 2,
    borderColor: ColorPalette.primary.main,
  },
  screenReaderOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// Platform-specific styles
export const PlatformStyles = StyleSheet.create({
  iosOnly: Platform.select({
    ios: { display: 'flex' },
    default: { display: 'none' },
  }),
  androidOnly: Platform.select({
    android: { display: 'flex' },
    default: { display: 'none' },
  }),
  webOnly: Platform.select({
    web: { display: 'flex' },
    default: { display: 'none' },
  }),
});

// Status Bar Styles
export const StatusBarStyles = {
  light: 'light-content',
  dark: 'dark-content',
  default: 'default',
};

// Enhanced dynamic styles function
export const dynamicStyles = (colorScheme: 'light' | 'dark') => {
  const isDark = colorScheme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      padding: Spacing.md,
    },
    surface: {
      backgroundColor: isDark ? ColorPalette.neutral.gray800 : ColorPalette.surface,
    },
    text: {
      color: Colors[colorScheme].text,
    },
    textMuted: {
      color: isDark ? ColorPalette.neutral.gray400 : ColorPalette.neutral.gray600,
    },
    border: {
      borderColor: isDark ? ColorPalette.neutral.gray700 : ColorPalette.neutral.gray200,
    },
    shadow: isDark ? {} : Shadows.md,
  });
};

// Utility functions
export const getResponsiveValue = (
  values: { [key: string]: any },
  screenWidth: number
): any => {
  const sortedBreakpoints = Object.entries(Breakpoints)
    .sort(([, a], [, b]) => b - a);
  
  for (const [breakpoint, minWidth] of sortedBreakpoints) {
    if (screenWidth >= minWidth && values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  return values.default || Object.values(values)[0];
};

export const createSpacing = (multiplier: number) => Spacing.md * multiplier;

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Export all for easy access
export default {
  ColorPalette,
  Spacing,
  Typography,
  FontSizes,
  FontWeights,
  LineHeights,
  BorderRadius,
  BorderWidths,
  Borders,
  Shadows,
  ZIndex,
  Animations,
  IconSizes,
  Layout,
  Components,
  Breakpoints,
  Accessibility,
  PlatformStyles,
  StatusBarStyles,
  dynamicStyles,
  getResponsiveValue,
  createSpacing,
  hexToRgba,
};