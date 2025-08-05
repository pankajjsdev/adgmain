import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useInteractionTracking } from '@/hooks/useAnalytics';

const { width: screenWidth } = Dimensions.get('window');

interface QuickActionProps {
  icon: string;
  title: string;
  color: string;
  route: Href;
  onPress?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, color, route, onPress }) => {
  const router = useRouter();
  const { colors, spacing } = useGlobalStyles();
  const { trackClick } = useInteractionTracking();
  
  const handlePress = () => {
    trackClick('quick_action', { action: title });
    if (onPress) {
      onPress();
    } else {
      router.push(route);
    }
  };

  const localStyles = getLocalStyles(colors, spacing);

  return (
    <TouchableOpacity
      style={localStyles.quickActionCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color + '15', color + '05']}
        style={localStyles.actionIconContainer}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </LinearGradient>
      <Text style={localStyles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

const QuickLinks: React.FC = () => {
  const { colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);

  const quickActions = [
    { icon: 'book-outline', title: 'Courses', color: colors.brand.primary, route: '/(tabs)/courses' as Href },
    { icon: 'analytics-outline', title: 'Analytics', color: colors.status.info, route: '/(root)/analytics' as Href },
    { icon: 'chatbubbles-outline', title: 'Forum', color: colors.status.success, route: '/(root)/forum' as Href },
    { icon: 'calendar-outline', title: 'Schedule', color: colors.status.warning, route: '/(root)/schedule' as Href },
  ];

  return (
    <View style={localStyles.quickActionsGrid}>
      {quickActions.map((action, index) => (
        <QuickAction
          key={index}
          icon={action.icon}
          title={action.title}
          color={action.color}
          route={action.route}
        />
      ))}
    </View>
  );
};

const getLocalStyles = (colors: any, spacing: any) => ({
  quickActionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
    justifyContent: 'space-between' as const,
  },
  quickActionCard: {
    width: (screenWidth - (spacing.lg * 2) - spacing.md) / 2,
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center' as const,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border.light + '20',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    textAlign: 'center' as const,
  },
});

export default QuickLinks;