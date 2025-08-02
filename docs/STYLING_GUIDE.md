# Global Styling System Guide

This guide explains how to use the comprehensive global styling system implemented in this Expo project.

## Overview

The styling system provides:
- **Theme-aware colors** that automatically adapt to light/dark mode
- **Consistent spacing** and typography scales
- **Reusable component styles** for common UI elements
- **Design tokens** for maintaining consistency
- **Responsive utilities** for different screen sizes

## Core Files

- `constants/Colors.ts` - Color palette for light and dark themes
- `constants/GlobalStyles.ts` - Global styles and design tokens
- `hooks/useGlobalStyles.ts` - React hook for accessing styles and colors

## Basic Usage

### 1. Import the Hook

```typescript
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
```

### 2. Use in Components

```typescript
export default function MyComponent() {
  const { styles, colors, spacing, typography } = useGlobalStyles();
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading2}>Welcome</Text>
      <Text style={styles.textSecondary}>This is a subtitle</Text>
    </View>
  );
}
```

## Available Design Tokens

### Colors
The color system automatically adapts to light/dark themes:

```typescript
const { colors } = useGlobalStyles();

// Brand colors
colors.brand.primary
colors.brand.secondary

// Text colors
colors.text.primary
colors.text.secondary
colors.text.tertiary
colors.text.disabled
colors.text.inverse

// Background colors
colors.background.primary
colors.background.secondary
colors.background.overlay

// Surface colors
colors.surface.primary
colors.surface.secondary
colors.surface.card
colors.surface.elevated
colors.surface.modal

// Status colors
colors.status.success
colors.status.warning
colors.status.error
colors.status.info

// Interactive colors
colors.interactive.primary
colors.interactive.secondary
colors.interactive.disabled

// Border colors
colors.border.primary
colors.border.secondary
colors.border.focus
colors.border.error

// Icon colors
colors.icon.primary
colors.icon.secondary
colors.icon.disabled

// Tab colors
colors.tab.background
colors.tab.labelDefault
colors.tab.labelSelected
colors.tab.iconDefault
colors.tab.iconSelected
```

### Spacing
Consistent spacing scale:

```typescript
const { spacing } = useGlobalStyles();

spacing.xs    // 4
spacing.sm    // 8
spacing.md    // 12
spacing.base  // 16
spacing.lg    // 20
spacing.xl    // 24
spacing['2xl'] // 32
spacing['3xl'] // 40
// ... up to 6xl
```

### Typography
Font sizes, weights, and line heights:

```typescript
const { typography } = useGlobalStyles();

// Font sizes
typography.fontSize.xs    // 12
typography.fontSize.sm    // 14
typography.fontSize.base  // 16
typography.fontSize.lg    // 18
// ... up to 6xl

// Font weights
typography.fontWeight.light     // '300'
typography.fontWeight.normal    // '400'
typography.fontWeight.medium    // '500'
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'

// Line heights
typography.lineHeight.tight   // 1.2
typography.lineHeight.normal  // 1.4
typography.lineHeight.relaxed // 1.6
```

### Border Radius
Consistent border radius scale:

```typescript
const { borderRadius } = useGlobalStyles();

borderRadius.none  // 0
borderRadius.xs    // 2
borderRadius.sm    // 4
borderRadius.base  // 8
borderRadius.md    // 12
borderRadius.lg    // 16
borderRadius.xl    // 20
borderRadius.full  // 9999
```

### Shadows
Pre-defined shadow styles:

```typescript
const { shadows } = useGlobalStyles();

shadows.none
shadows.sm
shadows.base
shadows.md
shadows.lg
shadows.xl
```

## Pre-built Component Styles

### Containers
```typescript
styles.container        // Basic flex container
styles.safeContainer   // Safe area container
styles.scrollContainer // Scroll view container
styles.centeredContainer // Centered content
```

### Cards
```typescript
styles.card          // Basic card
styles.cardElevated  // Elevated card with more shadow
styles.cardLarge     // Large card with more padding
```

### Typography
```typescript
styles.textPrimary   // Primary text color
styles.textSecondary // Secondary text color
styles.textTertiary  // Tertiary text color

styles.heading1      // Large heading
styles.heading2      // Medium heading
styles.heading3      // Small heading
styles.heading4      // Extra small heading
styles.heading5      // Tiny heading
```

### Buttons
```typescript
styles.buttonPrimary     // Primary button
styles.buttonSecondary   // Secondary button
styles.buttonOutline     // Outline button
styles.buttonDisabled    // Disabled button

styles.buttonTextPrimary   // Primary button text
styles.buttonTextSecondary // Secondary button text
styles.buttonTextOutline   // Outline button text
styles.buttonTextDisabled  // Disabled button text
```

### Form Elements
```typescript
styles.inputContainer    // Input container
styles.inputLabel       // Input label
styles.inputWrapper     // Input wrapper
styles.inputWrapperFocused // Focused input wrapper
styles.inputWrapperError   // Error input wrapper
styles.input            // Input field
styles.inputIcon        // Input icon
```

### Status Messages
```typescript
styles.errorContainer   // Error message container
styles.errorText       // Error text
styles.successContainer // Success message container
styles.successText     // Success text
styles.warningContainer // Warning message container
styles.warningText     // Warning text
```

### Loading States
```typescript
styles.loadingContainer // Loading indicator container
styles.loadingText     // Loading text
```

### Lists
```typescript
styles.listContainer   // List container
styles.listItem       // List item
styles.listItemPressed // Pressed list item
```

### Badges
```typescript
styles.badge          // Basic badge
styles.badgeText      // Badge text
styles.badgeSuccess   // Success badge
styles.badgeWarning   // Warning badge
styles.badgeError     // Error badge
```

### Modals
```typescript
styles.modalOverlay    // Modal overlay
styles.modalContainer  // Modal container
styles.modalTitle      // Modal title
styles.modalContent    // Modal content
styles.modalActions    // Modal actions
```

### Progress Bars
```typescript
styles.progressBarContainer // Progress bar container
styles.progressBarFill     // Progress bar fill
styles.progressBarSuccess  // Success progress bar
styles.progressBarWarning  // Warning progress bar
styles.progressBarError    // Error progress bar
```

## Responsive Design

### Device Utilities
```typescript
const { device } = useGlobalStyles();

device.isSmallDevice   // width < 375
device.isMediumDevice  // width >= 375 && width < 414
device.isLargeDevice   // width >= 414

device.screenPadding   // Responsive padding
device.cardPadding     // Responsive card padding

// Responsive font size function
device.responsiveFontSize(16) // Adjusts based on screen size
```

## Custom Styles

For component-specific styles, create local styles that use the design tokens:

```typescript
export default function MyComponent() {
  const { colors, spacing, borderRadius, shadows } = useGlobalStyles();
  
  const localStyles = StyleSheet.create({
    customCard: {
      backgroundColor: colors.surface.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.md,
      ...shadows.md,
    },
    customText: {
      color: colors.text.primary,
      fontSize: 18,
      fontWeight: '600',
    },
  });
  
  return (
    <View style={localStyles.customCard}>
      <Text style={localStyles.customText}>Custom Component</Text>
    </View>
  );
}
```

## Theme Support

The system automatically detects and responds to system theme changes:

```typescript
// Colors automatically switch between light and dark themes
const { colors, theme } = useGlobalStyles();

// Current theme is available as 'light' or 'dark'
console.log('Current theme:', theme);
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (e.g., `colors.text.primary` instead of specific hex values)
3. **Leverage pre-built component styles** when possible
4. **Create local styles for component-specific needs** using design tokens
5. **Test in both light and dark themes**
6. **Use responsive utilities** for different screen sizes

## Migration from Old Styles

**Note: The old `utils/styles.ts` file has been removed and replaced with this new global styling system.**

If you have existing components with hardcoded styles, migrate them using the new system:

### Before (Old Approach)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  text: {
    color: '#333333',
    fontSize: 16,
  },
});
```

### After (New Global Styles)
```typescript
export default function MyComponent() {
  const { styles, colors, spacing, borderRadius } = useGlobalStyles();
  
  const localStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface.primary,
      padding: spacing.base,
      borderRadius: borderRadius.base,
    },
    text: {
      color: colors.text.primary,
      fontSize: 16,
    },
  });
  
  // Or use pre-built styles where possible
  return (
    <View style={styles.card}>
      <Text style={styles.textPrimary}>My Text</Text>
    </View>
  );
}
```

## Examples

Check the following files for implementation examples:
- `app/_layout.tsx` - Root layout with theme support
- `app/(auth)/login.tsx` - Form components with global styles
- `app/(root)/courses/index.tsx` - List components with cards and badges

This styling system ensures consistency, maintainability, and excellent user experience across light and dark themes.
