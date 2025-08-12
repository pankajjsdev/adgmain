import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from './Colors';

const { width } = Dimensions.get('window');

// Typography Scale
export const Typography = {
  // Font Family
  fontFamily: {
    primary: 'Urbanist',
    secondary: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

// Border Radius Scale
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow Presets
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 12,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16.0,
    elevation: 16,
  },
};

// Global Styles Factory
export const createGlobalStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    // Container Styles
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: colors.background.primary,
    },
    
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },
    
    // Card Styles
    card: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.base,
      padding: Spacing.base,
      ...Shadows.base,
    },
    
    cardElevated: {
      backgroundColor: colors.surface.elevated,
      borderRadius: BorderRadius.base,
      padding: Spacing.base,
      ...Shadows.md,
    },
    
    cardLarge: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      ...Shadows.base,
    },
    
    // Text Styles
    textPrimary: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    },
    
    textSecondary: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.normal,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    },
    
    textTertiary: {
      color: colors.text.tertiary,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.normal,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
    },
    
    // Heading Styles
    heading1: {
      color: colors.text.primary,
      fontSize: Typography.fontSize['4xl'],
      fontWeight: Typography.fontWeight.bold,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize['4xl'] * Typography.lineHeight.tight,
    },
    
    heading2: {
      color: colors.text.primary,
      fontSize: Typography.fontSize['3xl'],
      fontWeight: Typography.fontWeight.bold,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize['3xl'] * Typography.lineHeight.tight,
    },
    
    heading3: {
      color: colors.text.primary,
      fontSize: Typography.fontSize['2xl'],
      fontWeight: Typography.fontWeight.semibold,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize['2xl'] * Typography.lineHeight.tight,
    },
    
    heading4: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.semibold,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize.xl * Typography.lineHeight.normal,
    },
    
    heading5: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
      fontFamily: Typography.fontFamily.primary,
      lineHeight: Typography.fontSize.lg * Typography.lineHeight.normal,
    },
    
    // Button Styles
    buttonPrimary: {
      backgroundColor: colors.interactive.primary,
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
    
    buttonSecondary: {
      backgroundColor: colors.interactive.secondary,
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.primary,
    },
    
    buttonOutline: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.interactive.primary,
    },
    
    buttonDisabled: {
      backgroundColor: colors.interactive.disabled,
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Button Text Styles
    buttonTextPrimary: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    buttonTextSecondary: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
    },
    
    buttonTextOutline: {
      color: colors.interactive.primary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
    },
    
    buttonTextDisabled: {
      color: colors.text.disabled,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
    },
    
    // Input Styles
    inputContainer: {
      marginBottom: Spacing.base,
    },
    
    inputLabel: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      marginBottom: Spacing.xs,
    },
    
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: BorderRadius.base,
      backgroundColor: colors.surface.secondary,
    },
    
    inputWrapperFocused: {
      borderColor: colors.border.focus,
      ...Shadows.sm,
    },
    
    inputWrapperError: {
      borderColor: colors.border.error,
    },
    
    input: {
      flex: 1,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.base,
      fontSize: Typography.fontSize.base,
      color: colors.text.primary,
    },
    
    inputIcon: {
      marginHorizontal: Spacing.md,
    },
    
    // Loading Styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
    },
    
    loadingText: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      marginTop: Spacing.base,
    },
    
    // Error Styles
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.error + '10',
      borderColor: colors.status.error + '30',
      borderWidth: 1,
      borderRadius: BorderRadius.sm,
      padding: Spacing.md,
      marginVertical: Spacing.xs,
    },
    
    errorText: {
      color: colors.status.error,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      marginLeft: Spacing.xs,
      flex: 1,
    },
    
    // Success Styles
    successContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.success + '10',
      borderColor: colors.status.success + '30',
      borderWidth: 1,
      borderRadius: BorderRadius.sm,
      padding: Spacing.md,
      marginVertical: Spacing.xs,
    },
    
    successText: {
      color: colors.status.success,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      marginLeft: Spacing.xs,
      flex: 1,
    },
    
    // Warning Styles
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.warning + '10',
      borderColor: colors.status.warning + '30',
      borderWidth: 1,
      borderRadius: BorderRadius.sm,
      padding: Spacing.md,
      marginVertical: Spacing.xs,
    },
    
    warningText: {
      color: colors.status.warning,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      marginLeft: Spacing.xs,
      flex: 1,
    },
    
    // List Styles
    listContainer: {
      padding: Spacing.base,
    },
    
    listItem: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.base,
      padding: Spacing.base,
      marginBottom: Spacing.md,
      ...Shadows.sm,
    },
    
    listItemPressed: {
      backgroundColor: colors.surface.secondary,
    },
    
    // Separator Styles
    separator: {
      height: 1,
      backgroundColor: colors.border.secondary,
      marginVertical: Spacing.md,
    },
    
    separatorThick: {
      height: 2,
      backgroundColor: colors.border.primary,
      marginVertical: Spacing.lg,
    },
    
    // Badge Styles
    badge: {
      backgroundColor: colors.brand.primary,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      alignSelf: 'flex-start',
    },
    
    badgeText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    badgeSuccess: {
      backgroundColor: colors.status.success,
    },
    
    badgeWarning: {
      backgroundColor: colors.status.warning,
    },
    
    badgeError: {
      backgroundColor: colors.status.error,
    },
    
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.background.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.base,
    },
    
    modalContainer: {
      backgroundColor: colors.surface.modal,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      width: '90%',
      maxWidth: 400,
      ...Shadows.xl,
    },
    
    modalTitle: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.semibold,
      marginBottom: Spacing.base,
      textAlign: 'center',
    },
    
    modalContent: {
      marginBottom: Spacing.lg,
    },
    
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    
    // Tab Styles
    tabBar: {
      backgroundColor: colors.tab.background,
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
      paddingTop: Spacing.xs,
    },
    
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
    },
    
    tabIcon: {
      marginBottom: Spacing.xs,
    },
    
    tabLabel: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
    },
    
    tabLabelActive: {
      color: colors.tab.labelSelected,
    },
    
    tabLabelInactive: {
      color: colors.tab.labelDefault,
    },
    
    // Header Styles
    header: {
      backgroundColor: colors.surface.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.base,
    },
    
    headerTitle: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      textAlign: 'center',
    },
    
    // Progress Bar Styles
    progressBarContainer: {
      height: 4,
      backgroundColor: colors.border.secondary,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.brand.primary,
      borderRadius: BorderRadius.full,
    },
    
    progressBarSuccess: {
      backgroundColor: colors.status.success,
    },
    
    progressBarWarning: {
      backgroundColor: colors.status.warning,
    },
    
    progressBarError: {
      backgroundColor: colors.status.error,
    },
    
    // Video Player Styles
    videoPlayerContainer: {
      width: '100%',
      height: width * 0.56, // 16:9 aspect ratio
      backgroundColor: colors.background.secondary,
      borderRadius: BorderRadius.base,
      overflow: 'hidden',
      position: 'relative',
    },
    
    video: {
      width: '100%',
      height: '100%',
    },
    
    videoPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    },
    
    loadingVideoText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.base,
      marginTop: Spacing.md,
    },
    
    controlsOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    playPauseButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    
    customProgressContainer: {
      flex: 1,
    },
    
    customProgressBar: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      marginBottom: Spacing.xs,
    },
    
    customProgressFill: {
      height: '100%',
      backgroundColor: colors.brand.primary,
      borderRadius: 2,
    },
    
    timeText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.xs,
    },
    
    videoTypeBadge: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
    },
    
    videoTypeBadgeText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semibold,
      marginLeft: Spacing.xs,
    },
    
    // Chapter Info Styles
    chapterInfo: {
      padding: Spacing.base,
      backgroundColor: colors.surface.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    
    chapterTitle: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      marginBottom: Spacing.xs,
    },
    
    chapterSubtitle: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.sm,
    },
    
    // Tab Navigation Styles
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.sm,
    },
    
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.brand.primary,
    },
    
    tabText: {
      marginLeft: Spacing.xs,
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      fontWeight: Typography.fontWeight.medium,
    },
    
    // Tab Content Styles
    tabContent: {
      backgroundColor: colors.surface.card,
      margin: Spacing.md,
      marginBottom: Spacing.xl,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      ...Shadows.md,
      borderWidth: 1,
      borderColor: colors.surface.overlay + '40',
    },
    
    // Info Card Styles
    infoCard: {
      backgroundColor: colors.surface.secondary,
      borderRadius: BorderRadius.base,
      padding: Spacing.base,
      marginBottom: Spacing.lg,
      borderLeftWidth: 4,
    },
    
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    
    infoTitle: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
      marginLeft: Spacing.sm,
    },
    
    infoDescription: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.sm,
      lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    },
    
    // Stats Container Styles
    statsContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
      paddingTop: Spacing.base,
      marginTop: Spacing.base,
    },
    
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    
    statText: {
      marginLeft: Spacing.sm,
      fontSize: Typography.fontSize.base,
      color: colors.text.secondary,
    },
    
    // Progress Styles
    progressContainer: {
      marginTop: Spacing.sm,
    },
    
    progressText: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: Spacing.sm,
    },
    
    progressBar: {
      height: 6,
      backgroundColor: colors.border.secondary,
      borderRadius: BorderRadius.sm,
      overflow: 'hidden',
    },
    
    progressFill: {
      height: '100%',
      backgroundColor: colors.status.success,
      borderRadius: BorderRadius.sm,
    },
    
    // Resource Styles
    resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    
    resourceContent: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    
    resourceTitle: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: Spacing.xs,
    },
    
    resourceUrl: {
      fontSize: Typography.fontSize.sm,
      color: colors.brand.primary,
    },
    
    // Empty State Styles
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    
    emptyStateText: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.base,
      marginTop: Spacing.md,
      textAlign: 'center',
    },
    
    // Back Button Styles
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    headerRight: {
      width: 40,
      height: 40,
    },
    
    // Error State Styles
    errorTitle: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    
    errorMessage: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.base,
      lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    
    // Section Title Style
    sectionTitle: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.semibold,
      marginBottom: Spacing.base,
    },
    
    // Description Style
    description: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.base,
      lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
      marginBottom: Spacing.lg,
    },
    
    // Questions Text Style
    questionsText: {
      color: colors.text.secondary,
      fontSize: Typography.fontSize.sm,
      marginTop: Spacing.xs,
      fontStyle: 'italic',
    },
    
    // Restriction Notice Styles
    restrictionNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      marginTop: Spacing.sm,
    },
    
    restrictionText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.xs,
      marginLeft: Spacing.xs,
      flex: 1,
    },
    
    // Video Question Modal Styles
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.secondary,
    },
    
    headerLeft: {
      flex: 1,
    },
    
    closeButton: {
      padding: Spacing.sm,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface.secondary,
    },
    
    timerContainer: {
      backgroundColor: colors.status.warning,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.base,
    },
    
    timerText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    modalFooter: {
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
    },
    
    submitButton: {
      backgroundColor: colors.interactive.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    submitButtonDisabled: {
      backgroundColor: colors.interactive.disabled,
      opacity: 0.6,
    },
    
    submitButtonText: {
      color: colors.text.inverse,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    fillBox: {
      marginVertical: Spacing.md,
    },
    
    fillLabel: {
      color: colors.text.primary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.medium,
      marginBottom: Spacing.sm,
    },
    
    fillInput: {
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: BorderRadius.base,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.fontSize.base,
      color: colors.text.primary,
      backgroundColor: colors.surface.primary,
    },
    
    // Question Options Styles
    optionsContainer: {
      marginVertical: Spacing.md,
    },
    
    optionButton: {
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      backgroundColor: colors.surface.primary,
    },
    
    selectedOption: {
      borderColor: colors.interactive.primary,
      backgroundColor: colors.interactive.primary + '10',
    },
    
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    optionText: {
      fontSize: Typography.fontSize.base,
      color: colors.text.primary,
      flex: 1,
      marginLeft: Spacing.sm,
    },
    
    selectedOptionText: {
      color: colors.interactive.primary,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    optionImage: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.sm,
      marginRight: Spacing.sm,
    },
    
    // Radio Button Styles
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    radioButtonSelected: {
      borderColor: colors.interactive.primary,
    },
    
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.interactive.primary,
    },
    
    // Checkbox Styles
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: BorderRadius.xs,
      borderWidth: 2,
      borderColor: colors.border.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    checkboxSelected: {
      borderColor: colors.interactive.primary,
      backgroundColor: colors.interactive.primary,
    },
    
    // Text Input Styles
    textInput: {
      borderWidth: 1,
      borderColor: colors.border.primary,
      borderRadius: BorderRadius.base,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.fontSize.base,
      color: colors.text.primary,
      backgroundColor: colors.surface.primary,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    
    // Fill Container
    fillContainer: {
      marginVertical: Spacing.md,
    },
    
    // Question Content Styles
    questionContent: {
      marginVertical: Spacing.lg,
      alignItems: 'center',
    },
    
    questionText: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    
    questionImage: {
      width: 200,
      height: 150,
      borderRadius: BorderRadius.base,
      marginBottom: Spacing.md,
    },

    // Video Detail Page Stats Styles
    statColumn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },

    statLabel: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },

    statValue: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      textAlign: 'center',
    },

    // Questions Progress Styles
    questionsProgressCard: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },

    questionsProgressTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },

    questionsProgressText: {
      fontSize: Typography.fontSize.base,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: Typography.fontSize.base * 1.5,
    },

    // Empty State Styles
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
      alignSelf: 'center',
    },

    // Content Card Styles
    contentCard: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },

    // Stats Icon Styles
    statIcon: {
      width: 24,
      height: 24,
      marginBottom: Spacing.xs,
    },

    // Resource Icon Styles
    resourceIcon: {
      width: 20,
      height: 20,
      marginRight: Spacing.sm,
    },

    // Question Card Styles
    questionCard: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },

    questionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },

    questionNumber: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.secondary,
    },

    questionTypeBadge: {
      backgroundColor: colors.brand.primary + '20',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },

    questionTypeText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
      color: colors.brand.primary,
    },

    questionLevelBadge: {
      backgroundColor: colors.status.warning + '20',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },

    questionLevelText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
      color: colors.status.warning,
    },

    // Option Item Styles
    optionItem: {
      backgroundColor: colors.surface.primary,
      borderRadius: BorderRadius.base,
      padding: Spacing.md,
      marginVertical: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },

    optionLabel: {
      fontSize: Typography.fontSize.base,
      color: colors.text.primary,
      fontWeight: Typography.fontWeight.medium,
    },

    // Question Meta Styles
    questionMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
    },

    metaItem: {
      alignItems: 'center',
    },

    metaText: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: Spacing.xs,
    },

    // Progress Card Styles
    progressCard: {
      backgroundColor: colors.surface.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },

    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },

    progressTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
    },

    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },

    statusText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
    },

    watchTimeText: {
      fontSize: Typography.fontSize.base,
      color: colors.text.secondary,
      marginVertical: Spacing.sm,
    },

    progressStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.secondary,
    },

    // Modern Chapter Content Page Styles
    heroSection: {
      backgroundColor: colors.surface.card,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      ...Shadows.md,
    },
    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    heroText: {
      flex: 1,
      marginRight: Spacing.lg,
    },
    heroTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: Spacing.xs,
      fontFamily: 'Urbanist-Bold',
    },
    heroDescription: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: Spacing.lg,
      lineHeight: 20,
      fontFamily: 'Urbanist-Regular',
    },
    heroStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.lg,
    },
    heroStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    heroStatText: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: 'Urbanist-Medium',
    },
    heroProgress: {
      alignItems: 'center',
      gap: Spacing.md,
    },
    overallProgressText: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'center',
      fontFamily: 'Urbanist-Medium',
    },

    // Filter Section Styles
    filterSection: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xl,
    },
    chapterSectionTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Spacing.lg,
      fontFamily: 'Urbanist-SemiBold',
    },
    filterScrollView: {
      marginHorizontal: -Spacing.lg,
    },
    filterContainer: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
    },
    filterButton: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.surface.secondary,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    filterButtonActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    filterButtonText: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: 'Urbanist-Medium',
    },
    filterButtonTextActive: {
      color: colors.surface.primary,
      fontFamily: 'Urbanist-SemiBold',
    },

    // Content Grid Styles
    contentGrid: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xl,
      gap: Spacing.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    cardIcon: {
      padding: Spacing.md,
      borderRadius: BorderRadius.base,
      backgroundColor: colors.surface.secondary,
    },
    cardProgress: {
      alignItems: 'center',
    },
    cardContent: {
      flex: 1,
      marginLeft: Spacing.md,
    },
    cardTitle: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: Spacing.xs,
      fontFamily: 'Urbanist-SemiBold',
    },
    cardDescription: {
      fontSize: Typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: Spacing.md,
      fontFamily: 'Urbanist-Regular',
    },
    cardStats: {
      gap: Spacing.xs,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    cardFooter: {
      marginTop: Spacing.md,
    },
    chapterProgressBar: {
      height: 4,
      backgroundColor: colors.surface.secondary,
      borderRadius: BorderRadius.xs,
      overflow: 'hidden',
    },
    chapterProgressFill: {
      height: '100%',
      backgroundColor: colors.brand.primary,
      borderRadius: BorderRadius.xs,
    },
    chapterProgressText: {
      fontSize: Typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'right',
      marginTop: Spacing.xs,
      fontFamily: 'Urbanist-Medium',
    },

    // Primary and Secondary Button Styles
    primaryButton: {
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.brand.primary,
      borderRadius: BorderRadius.base,
      alignItems: 'center' as const,
      marginTop: Spacing.base,
    },
    primaryButtonText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.inverse,
    },
    secondaryButton: {
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.lg,
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.base,
      borderWidth: 1,
      borderColor: colors.border.primary,
      alignItems: 'center' as const,
      marginTop: Spacing.base,
    },
    secondaryButtonText: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text.primary,
    },

    // Quick Actions Styles
    quickActions: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xl,
      marginBottom: Spacing['6xl'],
    },
    actionButtons: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.surface.secondary,
      borderRadius: BorderRadius.base,
      borderWidth: 1,
      borderColor: colors.border.secondary,
    },
    actionButtonText: {
      marginLeft: Spacing.xs,
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text.primary,
    },

    // Enhanced Video Detail Page Styles
    videoInfoCard: {
      margin: Spacing.md,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.md,
    },
    
    videoHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    
    videoTitleSection: {
      flex: 1,
      marginRight: Spacing.md,
    },
    
    videoTitle: {
      marginBottom: Spacing.sm,
      lineHeight: 28,
    },
    
    videoMetadata: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: Spacing.md,
    },
    
    metadataItem: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: Spacing.xs,
    },
    
    metadataText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
    },
    
    completionBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      gap: Spacing.xs,
    },
    
    completionText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    videoTypeBadgeEnhanced: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.lg,
      gap: Spacing.sm,
      minWidth: 120,
      justifyContent: 'center',
    },
    
    videoTypeBadgeTextEnhanced: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.bold,
      textAlign: 'center' as const,
    },
    
    videoProgressSection: {
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
    },
    
    videoProgressHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    
    videoProgressTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    videoProgressPercentage: {
      fontSize: Typography.fontSize.xl,
      fontWeight: Typography.fontWeight.bold,
    },
    
    videoProgressBarContainer: {
      height: 8,
      borderRadius: BorderRadius.full,
      overflow: 'hidden' as const,
      marginBottom: Spacing.sm,
    },
    
    videoProgressBarFill: {
      height: '100%',
      borderRadius: BorderRadius.full,
      minWidth: 2,
    },
    
    progressDetails: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    progressTime: {
      fontSize: Typography.fontSize.sm,
      fontWeight: Typography.fontWeight.medium,
    },
    
    restrictionBadge: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.md,
      gap: Spacing.xs,
    },
    
    restrictionBadgeText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: Typography.fontWeight.medium,
    },
    
    videoTypeInfo: {
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginTop: Spacing.md,
    },
    
    videoTypeHeader: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    
    videoTypeTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.semibold,
    },
    
    videoTypeDescription: {
      fontSize: Typography.fontSize.sm,
      lineHeight: 20,
    },
  });
};

// Device-specific styles
export const DeviceStyles = {
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  
  // Responsive padding
  screenPadding: width < 375 ? Spacing.md : Spacing.base,
  cardPadding: width < 375 ? Spacing.md : Spacing.xl,
  
  // Responsive font sizes
  responsiveFontSize: (baseSize: number) => {
    if (width < 375) return baseSize - 2;
    if (width >= 414) return baseSize + 2;
    return baseSize;
  },
};

export default createGlobalStyles;
