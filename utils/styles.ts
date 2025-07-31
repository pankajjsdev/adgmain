// utils/styles.ts
import { StyleSheet } from 'react-native';

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
  // Add more spacing values as needed
};

export const Typography = StyleSheet.create({
  heading1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  // Add more typography styles as needed
});

export const Borders = {
  radius: 8,
  // Add more border styles as needed
};

export const Shadows = StyleSheet.create({
  // Example shadow styles (adjust for platform differences)
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Add more shadow styles as needed
});
