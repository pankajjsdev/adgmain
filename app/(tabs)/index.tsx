import { ScrollView, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useScreenTracking, useInteractionTracking } from '@/hooks/useAnalytics';
import BannerCarousel from '@/components/BannerCarousel';
import QuickLinks from '@/components/QuickLinks';
import UpcomingTasks from '@/components/UpcomingTasks';
import useAuthStore from '@/store/authStore';

export default function HomeScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const { user } = useAuthStore();
  const { trackClick } = useInteractionTracking();
  const localStyles = getLocalStyles(colors, spacing);

  // Track screen view
  useScreenTracking('Home', {
    user_id: user?.id,
    user_name: user?.firstName,
    has_banners: true
  });

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Custom Header */}
      <View style={localStyles.header}>
        <Text style={localStyles.logo}>LOGO</Text>
        <View style={localStyles.headerRight}>
          <TouchableOpacity 
            style={localStyles.iconButton}
            onPress={() => trackClick('notification_icon', { location: 'header' })}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={localStyles.iconButton}
            onPress={() => trackClick('profile_icon', { location: 'header' })}
          >
            <Ionicons name="person-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={localStyles.contentContainer}>
          {/* Greeting Section */}
          <View style={localStyles.greetingContainer}>
            <Text style={localStyles.greeting}>
              Hello, <Text style={localStyles.greetingName}>{user?.firstName || 'Harsh'}!</Text>
            </Text>
          </View>

          {/* Banner Carousel */}
          <BannerCarousel height={200} />

          {/* Quick Links Section */}
          <View style={localStyles.sectionContainer}>
            <Text style={localStyles.sectionTitle}>Quick Links</Text>
            <QuickLinks />
          </View>

          {/* Upcoming Tasks Section */}
          <View style={localStyles.sectionContainer}>
            <View style={localStyles.sectionHeader}>
              <Text style={localStyles.sectionTitle}>Upcoming Tasks</Text>
              <TouchableOpacity onPress={() => trackClick('view_all_tasks', { section: 'upcoming_tasks' })}>
                <Text style={localStyles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <UpcomingTasks />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  logo: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  greetingContainer: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '400' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
  },
  greetingName: {
    fontWeight: '700' as const,
    color: colors.brand.primary,
  },
  sectionContainer: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },
});
