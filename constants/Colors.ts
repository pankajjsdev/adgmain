/**
 * Comprehensive color system for the ADG Classes app.
 * Supports both light and dark themes with semantic color naming.
 */

// Brand Colors
const brandPrimary = '#007AFF';
const brandSecondary = '#4ECDC4';
const brandAccent = '#45B7D1';
const brandSuccess = '#4CAF50';
const brandWarning = '#FF9800';
const brandError = '#FF3B30';
const brandInfo = '#17A2B8';

// Neutral Colors
const neutral = {
  50: '#F8F9FA',
  100: '#F1F3F4',
  200: '#E8EAED',
  300: '#DADCE0',
  400: '#BDC1C6',
  500: '#9AA0A6',
  600: '#80868B',
  700: '#5F6368',
  800: '#3C4043',
  900: '#202124',
  950: '#0F0F0F',
};

export const Colors = {
  light: {
    // Text Colors
    text: {
      primary: neutral[900],
      secondary: neutral[700],
      tertiary: neutral[600],
      disabled: neutral[400],
      inverse: '#FFFFFF',
      link: brandPrimary,
      success: brandSuccess,
      warning: brandWarning,
      error: brandError,
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: neutral[50],
      tertiary: neutral[100],
      elevated: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
      disabled: neutral[200],
    },
    
    // Surface Colors
    surface: {
      primary: '#FFFFFF',
      secondary: neutral[50],
      elevated: '#FFFFFF',
      card: '#FFFFFF',
      modal: '#FFFFFF',
    },
    
    // Border Colors
    border: {
      primary: neutral[300],
      secondary: neutral[200],
      focus: brandPrimary,
      error: brandError,
      success: brandSuccess,
    },
    
    // Brand Colors
    brand: {
      primary: brandPrimary,
      secondary: brandSecondary,
      accent: brandAccent,
      success: brandSuccess,
      warning: brandWarning,
      error: brandError,
      info: brandInfo,
    },
    
    // Interactive Colors
    interactive: {
      primary: brandPrimary,
      primaryHover: '#0056CC',
      primaryPressed: '#004BB8',
      secondary: neutral[100],
      secondaryHover: neutral[200],
      secondaryPressed: neutral[300],
      disabled: neutral[300],
    },
    
    // Icon Colors
    icon: {
      primary: neutral[700],
      secondary: neutral[500],
      tertiary: neutral[400],
      inverse: '#FFFFFF',
      brand: brandPrimary,
      success: brandSuccess,
      warning: brandWarning,
      error: brandError,
    },
    
    // Tab Colors
    tab: {
      background: '#FFFFFF',
      iconDefault: neutral[500],
      iconSelected: brandPrimary,
      labelDefault: neutral[600],
      labelSelected: brandPrimary,
    },
    
    // Status Colors
    status: {
      success: brandSuccess,
      warning: brandWarning,
      error: brandError,
      info: brandInfo,
      pending: brandWarning,
      completed: brandSuccess,
    },
    
    // Shadow Colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.15)',
      heavy: 'rgba(0, 0, 0, 0.25)',
    },
    
    // Legacy tint property for compatibility
    tint: brandPrimary,
  },
  
  dark: {
    // Text Colors
    text: {
      primary: '#FFFFFF',
      secondary: neutral[300],
      tertiary: neutral[400],
      disabled: neutral[600],
      inverse: neutral[900],
      link: '#4A9EFF',
      success: '#5CBF60',
      warning: '#FFB340',
      error: '#FF5F56',
    },
    
    // Background Colors
    background: {
      primary: neutral[950],
      secondary: neutral[900],
      tertiary: neutral[800],
      elevated: neutral[900],
      overlay: 'rgba(0, 0, 0, 0.7)',
      disabled: neutral[800],
    },
    
    // Surface Colors
    surface: {
      primary: neutral[900],
      secondary: neutral[800],
      elevated: neutral[800],
      card: neutral[900],
      modal: neutral[800],
    },
    
    // Border Colors
    border: {
      primary: neutral[700],
      secondary: neutral[800],
      focus: '#4A9EFF',
      error: '#FF5F56',
      success: '#5CBF60',
    },
    
    // Brand Colors (adjusted for dark theme)
    brand: {
      primary: '#4A9EFF',
      secondary: '#5EDDD6',
      accent: '#5BC7E8',
      success: '#5CBF60',
      warning: '#FFB340',
      error: '#FF5F56',
      info: '#40C4D9',
    },
    
    // Interactive Colors
    interactive: {
      primary: '#4A9EFF',
      primaryHover: '#6BB0FF',
      primaryPressed: '#2E8BFF',
      secondary: neutral[800],
      secondaryHover: neutral[700],
      secondaryPressed: neutral[600],
      disabled: neutral[700],
    },
    
    // Icon Colors
    icon: {
      primary: neutral[300],
      secondary: neutral[500],
      tertiary: neutral[600],
      inverse: neutral[900],
      brand: '#4A9EFF',
      success: '#5CBF60',
      warning: '#FFB340',
      error: '#FF5F56',
    },
    
    // Tab Colors
    tab: {
      background: neutral[950],
      iconDefault: neutral[500],
      iconSelected: '#4A9EFF',
      labelDefault: neutral[400],
      labelSelected: '#4A9EFF',
    },
    
    // Status Colors
    status: {
      success: '#5CBF60',
      warning: '#FFB340',
      error: '#FF5F56',
      info: '#40C4D9',
      pending: '#FFB340',
      completed: '#5CBF60',
    },
    
    // Shadow Colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.4)',
      heavy: 'rgba(0, 0, 0, 0.6)',
    },
    
    // Legacy tint property for compatibility
    tint: '#4A9EFF',
  },
};
