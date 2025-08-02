import { ScrollView, SafeAreaView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import Header from '@/components/Header';
import BannerCarousel from '@/components/BannerCarousel';
import QuickLinks from '@/components/QuickLinks';
import UpcomingTasks from '@/components/UpcomingTasks';

export default function HomeScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
      >
        <View style={localStyles.contentContainer}>
          {/* Greeting Section */}
          <View style={localStyles.greetingContainer}>
            <View style={localStyles.greetingLeft}>
              <Text style={localStyles.greeting}>Hello, Harsh!</Text>
              <Text style={localStyles.welcomeText}>Welcome back to ADG Classes</Text>
            </View>
            <View style={localStyles.greetingRight}>
              <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
              <Ionicons name="person-circle-outline" size={32} color={colors.brand.primary} style={{ marginLeft: spacing.sm }} />
            </View>
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
            <Text style={localStyles.sectionTitle}>Upcoming Tasks</Text>
            <UpcomingTasks />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.base,
  },
  greetingContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
  },
  sectionContainer: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});
