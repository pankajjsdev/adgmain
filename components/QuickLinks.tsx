import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useInteractionTracking } from '@/hooks/useAnalytics';


interface QuickActionProps {
  icon: string;
  title: string;
  subtitle?: string;
  color: string;
  route: Href;
  onPress?: () => void;
  index: number;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, title, subtitle, color, route, onPress, index }) => {
  const router = useRouter();
  const { colors, spacing } = useGlobalStyles();
  const { trackClick } = useInteractionTracking();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150), // Staggered animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
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

    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, glowAnim, index]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    trackClick('quick_action', { action: title, index });
    
    // Success animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      if (onPress) {
        onPress();
      } else {
        router.push(route);
      }
    }, 150);
  };

  const localStyles = getLocalStyles(colors, spacing);

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={[
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
        style={localStyles.quickActionCard}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Glow effect */}
        <Animated.View
          style={[
            localStyles.glowEffect,
            {
              opacity: glowOpacity,
              shadowColor: color,
            },
          ]}
        />
        
        {/* Main content */}
        <View style={localStyles.cardContent}>
          <LinearGradient
            colors={[color + '20', color + '10', color + '05']}
            style={localStyles.actionIconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View
              style={{
                transform: [{ rotate: iconRotation }],
              }}
            >
              <Ionicons name={icon as any} size={28} color={color} />
            </Animated.View>
          </LinearGradient>
          
          <View style={localStyles.textContainer}>
            <Text style={localStyles.actionTitle}>{title}</Text>
            {subtitle && (
              <Text style={localStyles.actionSubtitle}>{subtitle}</Text>
            )}
          </View>
          
          {/* Arrow indicator */}
          <View style={localStyles.arrowContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={colors.text.secondary} 
            />
          </View>
        </View>
        
        {/* Shimmer effect */}
        <LinearGradient
          colors={['transparent', colors.surface.overlay + '10', 'transparent']}
          style={localStyles.shimmerEffect}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

interface QuickLinksProps {
  showAll?: boolean;
}

const QuickLinks: React.FC<QuickLinksProps> = ({ showAll = false }) => {
  const { colors, spacing } = useGlobalStyles();
  const { trackClick } = useInteractionTracking();
  const router = useRouter();
  const localStyles = getLocalStyles(colors, spacing);

  const allActions = [
    { 
      icon: 'book-outline', 
      title: 'My Courses', 
      subtitle: 'Continue learning',
      color: colors.brand.primary, 
      route: '/(tabs)/courses' as Href 
    },
    { 
      icon: 'analytics-outline', 
      title: 'Analytics', 
      subtitle: 'Track progress',
      color: colors.status.info, 
      route: '/(root)/analytics' as Href 
    },
    { 
      icon: 'chatbubbles-outline', 
      title: 'Forum', 
      subtitle: 'Join discussions',
      color: colors.status.success, 
      route: '/(root)/forum' as Href 
    },
  ];

  const handleViewAll = () => {
    trackClick('view_all_features', { from: 'home_quick_links' });
    router.push('/(root)/all-features' as Href);
  };

  const actionsToShow = showAll ? allActions : allActions.slice(0, 3);

  if (showAll) {
    return (
      <View style={localStyles.listContainer}>
        {actionsToShow.map((action, index) => (
          <QuickAction
            key={index}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            color={action.color}
            route={action.route}
            index={index}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <View style={localStyles.listContainer}>
        {actionsToShow.map((action, index) => (
          <QuickAction
            key={index}
            icon={action.icon}
            title={action.title}
            subtitle={action.subtitle}
            color={action.color}
            route={action.route}
            index={index}
          />
        ))}
      </View>
      
      <TouchableOpacity 
        style={localStyles.viewAllButton}
        onPress={handleViewAll}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.brand.primary + '15', colors.brand.primary + '08']}
          style={localStyles.viewAllGradient}
        >
          <Text style={localStyles.viewAllText}>View All Features</Text>
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={colors.brand.primary} 
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const getLocalStyles = (colors: any, spacing: any) => ({
  container: {
    gap: spacing.md,
  },
  listContainer: {
    gap: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
    justifyContent: 'space-between' as const,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: 20,
    padding: 0,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border.light + '30',
  },
  glowEffect: {
    position: 'absolute' as const,
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 34,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  cardContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    position: 'relative' as const,
    zIndex: 1,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  actionSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    opacity: 0.8,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface.overlay + '15',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: spacing.sm,
  },
  shimmerEffect: {
    position: 'absolute' as const,
    top: 0,
    left: -100,
    right: 100,
    bottom: 0,
    opacity: 0.3,
  },
  viewAllButton: {
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  viewAllGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },
});

export default QuickLinks;