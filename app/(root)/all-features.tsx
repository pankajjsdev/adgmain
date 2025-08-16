import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useAnalytics } from '@/hooks/useAnalytics';

interface FeatureItem {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  route: Href;
  category: string;
  isNew?: boolean;
  isPremium?: boolean;
}

interface FeatureListItemProps extends FeatureItem {
  index: number;
}

const FeatureListItem: React.FC<FeatureListItemProps> = ({
  icon,
  title,
  subtitle,
  description,
  color,
  route,
  isNew,
  isPremium,
  index
}) => {
  const router = useRouter();
  const { colors, spacing } = useGlobalStyles();
  const { trackAction } = useAnalytics();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    trackAction('click', { 
      element_name: 'feature_item',
      feature: title, 
      category: 'all_features_page',
      index 
    });
    router.push(route);
  };

  const localStyles = getLocalStyles(colors, spacing);

  return (
    <Animated.View
      style={[
        localStyles.listItem,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={localStyles.itemTouchable}
      >
        <View style={localStyles.itemContent}>
          {/* Icon Container */}
          <LinearGradient
            colors={[color + '20', color + '10', color + '05']}
            style={localStyles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={icon as any} size={24} color={color} />
          </LinearGradient>

          {/* Content */}
          <View style={localStyles.textContent}>
            <View style={localStyles.titleRow}>
              <Text style={localStyles.itemTitle}>{title}</Text>
              <View style={localStyles.badges}>
                {isNew && (
                  <View style={[localStyles.badge, localStyles.newBadge]}>
                    <Text style={localStyles.newBadgeText}>NEW</Text>
                  </View>
                )}
                {isPremium && (
                  <View style={[localStyles.badge, localStyles.premiumBadge]}>
                    <Ionicons name="diamond" size={10} color={colors.status.warning} />
                  </View>
                )}
              </View>
            </View>
            <Text style={localStyles.itemSubtitle}>{subtitle}</Text>
            <Text style={localStyles.itemDescription}>{description}</Text>
          </View>

          {/* Arrow */}
          <View style={localStyles.arrowContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.text.tertiary} 
            />
          </View>
        </View>

        {/* Divider */}
        <View style={localStyles.divider} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const AllFeaturesScreen: React.FC = () => {
  const { colors, spacing } = useGlobalStyles();
  const router = useRouter();
  const { trackScreen } = useAnalytics();
  const localStyles = getLocalStyles(colors, spacing);

  useEffect(() => {
    trackScreen('all_features', { source: 'home_quick_links' });
  }, [trackScreen]);

  const allFeatures: FeatureItem[] = [
    {
      icon: 'book-outline',
      title: 'My Courses',
      subtitle: 'Continue learning',
      description: 'Access all your enrolled courses and track progress',
      color: colors.brand.primary,
      route: '/(tabs)/courses' as Href,
      category: 'learning',
    },
    {
      icon: 'analytics-outline',
      title: 'Analytics',
      subtitle: 'Track progress',
      description: 'View detailed analytics and performance insights',
      color: colors.status.info,
      route: '/(root)/analytics' as Href,
      category: 'insights',
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Forum',
      subtitle: 'Join discussions',
      description: 'Connect with peers and participate in discussions',
      color: colors.status.success,
      route: '/(root)/forum' as Href,
      category: 'community',
    },
    {
      icon: 'calendar-outline',
      title: 'Schedule',
      subtitle: 'Plan your time',
      description: 'Organize your study schedule and set reminders',
      color: colors.status.warning,
      route: '/(root)/schedule' as Href,
      category: 'productivity',
    },
    {
      icon: 'library-outline',
      title: 'Library',
      subtitle: 'Browse resources',
      description: 'Access study materials, notes, and references',
      color: colors.brand.secondary,
      route: '/(root)/library' as Href,
      category: 'resources',
      isNew: true,
    },
    {
      icon: 'trophy-outline',
      title: 'Achievements',
      subtitle: 'View badges',
      description: 'See your earned badges and milestone rewards',
      color: colors.status.warning,
      route: '/(root)/achievements' as Href,
      category: 'gamification',
    },
    {
      icon: 'people-outline',
      title: 'Study Groups',
      subtitle: 'Collaborate',
      description: 'Join or create study groups with other learners',
      color: colors.status.success,
      route: '/(root)/study-groups' as Href,
      category: 'community',
      isNew: true,
    },
    {
      icon: 'flash-outline',
      title: 'Quick Practice',
      subtitle: 'Test knowledge',
      description: 'Take quick quizzes and practice tests',
      color: colors.status.error,
      route: '/(root)/practice' as Href,
      category: 'assessment',
    },
    {
      icon: 'bookmark-outline',
      title: 'Bookmarks',
      subtitle: 'Saved content',
      description: 'Access your saved lessons and important notes',
      color: colors.text.secondary,
      route: '/(root)/bookmarks' as Href,
      category: 'organization',
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Customize app',
      description: 'Personalize your learning experience and preferences',
      color: colors.text.tertiary,
      route: '/(root)/settings' as Href,
      category: 'system',
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      description: 'Find answers to questions and contact support',
      color: colors.status.info,
      route: '/(root)/help' as Href,
      category: 'support',
    },
    {
      icon: 'star-outline',
      title: 'Premium Features',
      subtitle: 'Upgrade account',
      description: 'Unlock advanced features and exclusive content',
      color: colors.status.warning,
      route: '/(root)/premium' as Href,
      category: 'premium',
      isPremium: true,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={localStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brand.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.brand.primary, colors.brand.secondary]}
        style={localStyles.header}
      >
        <TouchableOpacity 
          onPress={handleBack}
          style={localStyles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={localStyles.headerContent}>
          <Text style={localStyles.headerTitle}>All Features</Text>
          <Text style={localStyles.headerSubtitle}>
            Discover everything our app has to offer
          </Text>
        </View>
      </LinearGradient>

      {/* Features List */}
      <ScrollView 
        style={localStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
      >
        <View style={localStyles.featuresContainer}>
          {allFeatures.map((feature, index) => (
            <FeatureListItem
              key={index}
              {...feature}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getLocalStyles = (colors: any, spacing: any) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: 'Urbanist',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  listItem: {
    marginBottom: spacing.sm,
  },
  itemTouchable: {
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    flex: 1,
  },
  badges: {
    flexDirection: 'row' as const,
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  newBadge: {
    backgroundColor: colors.status.success + '20',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.status.success,
  },
  premiumBadge: {
    backgroundColor: colors.status.warning + '20',
    width: 20,
    height: 16,
  },
  itemSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: 'Urbanist',
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.overlay + '10',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light + '30',
    marginLeft: spacing.lg + 48 + spacing.md,
    marginRight: spacing.lg,
  },
});

export default AllFeaturesScreen;
