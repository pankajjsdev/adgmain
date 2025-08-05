import { ScrollView, SafeAreaView, View, Text, TouchableOpacity, Animated, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useScreenTracking, useInteractionTracking } from '@/hooks/useAnalytics';
import BannerCarousel from '@/components/BannerCarousel';
import QuickLinks from '@/components/QuickLinks';
import UpcomingTasks from '@/components/UpcomingTasks';
import useAuthStore from '@/store/authStore';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

export default function HomeScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const { user } = useAuthStore();
  const { trackClick } = useInteractionTracking();
  const localStyles = getLocalStyles(colors, spacing);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // State for refresh and interactions
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Track screen view
  useScreenTracking('Home', {
    user_id: user?.id,
    user_name: user?.firstName,
    has_banners: true
  });

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    trackClick('home_refresh', { timestamp: new Date().toISOString() });
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get time-based emoji
  const getTimeEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Modern Gradient Header */}
      <LinearGradient
        colors={[colors.brand.primary, colors.brand.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={localStyles.gradientHeader}
      >
        <View style={localStyles.headerContent}>
          <View style={localStyles.headerLeft}>
            <View style={localStyles.logoContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={localStyles.logoGradient}
              >
                <Text style={localStyles.logo}>CLOSM</Text>
              </LinearGradient>
            </View>
          </View>
          
          <View style={localStyles.headerRight}>
            <TouchableOpacity 
              style={localStyles.headerIconButton}
              onPress={() => trackClick('notification_icon', { location: 'header' })}
              activeOpacity={0.7}
            >
              <View style={localStyles.iconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                <View style={localStyles.notificationBadge}>
                  <Text style={localStyles.badgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={localStyles.headerIconButton}
              onPress={() => {
                trackClick('profile_icon', { location: 'header' });
                router.push('/(root)/profile');
              }}
              activeOpacity={0.7}
            >
              <View style={localStyles.iconContainer}>
                {user?.avatarUrl ? (
                  <Image 
                    source={{ uri: user.avatarUrl }} 
                    style={localStyles.profileAvatar}
                  />
                ) : (
                  <View style={localStyles.profilePlaceholder}>
                    <Text style={localStyles.profileInitial}>
                      {user?.firstName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        <Animated.View 
          style={[
            localStyles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Enhanced Greeting Section */}
          <View style={localStyles.greetingSection}>
            <LinearGradient
              colors={[colors.surface.card + '40', colors.surface.card + '20']}
              style={localStyles.greetingCard}
            >
              <View style={localStyles.greetingContent}>
                <Text style={localStyles.timeEmoji}>{getTimeEmoji()}</Text>
                <Text style={localStyles.greeting}>
                  {getGreeting()}, <Text style={localStyles.greetingName}>{user?.firstName || 'User'}!</Text>
                </Text>
                <Text style={localStyles.greetingSubtext}>
                  Ready to continue your learning journey?
                </Text>
              </View>
              <View style={localStyles.greetingStats}>
                <View style={localStyles.statItem}>
                  <Text style={localStyles.statNumber}>12</Text>
                  <Text style={localStyles.statLabel}>Courses</Text>
                </View>
                <View style={localStyles.statDivider} />
                <View style={localStyles.statItem}>
                  <Text style={localStyles.statNumber}>85%</Text>
                  <Text style={localStyles.statLabel}>Progress</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Banner Carousel */}
          <View style={localStyles.bannerSection}>
            <BannerCarousel height={220} />
          </View>

          {/* Modern Quick Actions */}
          <View style={localStyles.quickActionsSection}>
            <View style={localStyles.sectionHeader}>
              <Text style={localStyles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity 
                onPress={() => trackClick('quick_actions_more')}
                style={localStyles.moreButton}
              >
                <Text style={localStyles.moreText}>More</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>
            
            <QuickLinks />
          </View>

          {/* Enhanced Upcoming Tasks */}
          <View style={localStyles.tasksSection}>
            <View style={localStyles.sectionHeader}>
              <Text style={localStyles.sectionTitle}>Continue Learning</Text>
              <TouchableOpacity 
                onPress={() => trackClick('view_all_tasks', { section: 'upcoming_tasks' })}
                style={localStyles.moreButton}
              >
                <Text style={localStyles.moreText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.brand.primary} />
              </TouchableOpacity>
            </View>
            <UpcomingTasks />
          </View>

          {/* Study Streak Card */}
          <View style={localStyles.streakSection}>
            <LinearGradient
              colors={[colors.status.success + '20', colors.status.success + '10']}
              style={localStyles.streakCard}
            >
              <View style={localStyles.streakContent}>
                <View style={localStyles.streakIcon}>
                  <Ionicons name="flame" size={28} color={colors.status.success} />
                </View>
                <View style={localStyles.streakInfo}>
                  <Text style={localStyles.streakTitle}>Study Streak</Text>
                  <Text style={localStyles.streakSubtitle}>Keep it up! You&apos;re on fire 🔥</Text>
                </View>
                <View style={localStyles.streakCount}>
                  <Text style={localStyles.streakNumber}>7</Text>
                  <Text style={localStyles.streakLabel}>Days</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  // Modern Gradient Header Styles
  gradientHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    alignSelf: 'flex-start' as const,
  },
  logoGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  headerIconButton: {
    padding: spacing.xs,
  },
  iconContainer: {
    position: 'relative' as const,
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 14,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },

  // Content Styles
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Enhanced Greeting Section
  greetingSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  greetingCard: {
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border.light + '30',
  },
  greetingContent: {
    marginBottom: spacing.lg,
  },
  timeEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 32,
  },
  greetingName: {
    fontWeight: '800' as const,
    color: colors.brand.primary,
  },
  greetingSubtext: {
    fontSize: 16,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    lineHeight: 22,
  },
  greetingStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light + '40',
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    fontWeight: '500' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light + '60',
  },

  // Banner Section
  bannerSection: {
    marginBottom: spacing.xl,
  },

  // Quick Actions Section
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
  },
  moreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  moreText: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },


  // Tasks Section
  tasksSection: {
    marginBottom: spacing.xl,
  },

  // Study Streak Section
  streakSection: {
    marginBottom: spacing.xl,
  },
  streakCard: {
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.status.success + '20',
  },
  streakContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.status.success + '20',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  streakSubtitle: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
  },
  streakCount: {
    alignItems: 'center' as const,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    fontFamily: 'Urbanist',
    color: colors.status.success,
    marginBottom: spacing.xs,
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    fontWeight: '600' as const,
  },
});
