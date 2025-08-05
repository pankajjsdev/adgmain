import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore, { ThemeMode } from '@/store/themeStore';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

interface ThemeToggleProps {
  style?: any;
}

export default function ThemeToggle({ style }: ThemeToggleProps) {
  const { colors, spacing } = useGlobalStyles();
  const { themeMode, setThemeMode } = useThemeStore();

  const themeOptions: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    { mode: 'light', label: 'Light', icon: 'sunny-outline', description: 'Always use light theme' },
    { mode: 'dark', label: 'Dark', icon: 'moon-outline', description: 'Always use dark theme' },
    { mode: 'system', label: 'System', icon: 'phone-portrait-outline', description: 'Follow system setting' },
  ];

  const handleThemeChange = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme mode',
      themeOptions.map(option => ({
        text: option.label,
        onPress: () => setThemeMode(option.mode),
        style: themeMode === option.mode ? 'default' : 'cancel',
      })),
      { cancelable: true }
    );
  };

  const currentTheme = themeOptions.find(option => option.mode === themeMode);
  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
      default:
        return 'phone-portrait';
    }
  };

  const localStyles = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surface.card,
      padding: spacing.base,
      borderRadius: 12,
      ...style,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brand.primary + '20',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginRight: spacing.base,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '500' as const,
      fontFamily: 'Urbanist',
      color: colors.text.primary,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: 'Urbanist',
      color: colors.text.secondary,
    },
    chevron: {
      marginLeft: spacing.sm,
    },
  };

  return (
    <TouchableOpacity style={localStyles.container} onPress={handleThemeChange}>
      <View style={localStyles.iconContainer}>
        <Ionicons name={getThemeIcon() as any} size={20} color={colors.brand.primary} />
      </View>
      <View style={localStyles.textContainer}>
        <Text style={localStyles.title}>Theme</Text>
        <Text style={localStyles.subtitle}>{currentTheme?.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon.secondary} style={localStyles.chevron} />
    </TouchableOpacity>
  );
}
