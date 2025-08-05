import React from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useAuthStore from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';

export default function MoreScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const localStyles = getLocalStyles(colors, spacing);

  const menuItems = [
    { icon: 'person-outline', title: 'Profile', route: '/(root)/profile', subtitle: 'Manage your account' },
    { icon: 'analytics-outline', title: 'Analytics', route: '/(root)/analytics', subtitle: 'View your progress' },
    { icon: 'chatbubbles-outline', title: 'Forum', route: '/(root)/forum', subtitle: 'Community discussions' },
    { icon: 'settings-outline', title: 'Settings', route: null, subtitle: 'App preferences' },
    { icon: 'help-circle-outline', title: 'Help & Support', route: null, subtitle: 'Get assistance' },
    { icon: 'information-circle-outline', title: 'About', route: null, subtitle: 'App information' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={localStyles.header}>
          <View style={localStyles.profileSection}>
            <View style={localStyles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image 
                  source={{ uri: user.avatarUrl }} 
                  style={localStyles.avatarImage}
                  defaultSource={require('@/assets/images/placeholder.png')}
                />
              ) : (
                <View style={localStyles.avatar}>
                  <Ionicons name="person" size={32} color={colors.text.inverse} />
                </View>
              )}
            </View>
            <Text style={localStyles.userName}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}</Text>
            <Text style={localStyles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        <View style={localStyles.menuSection}>
          {/* Theme Toggle Section */}
          <View style={localStyles.sectionHeader}>
            <Text style={localStyles.sectionTitle}>Appearance</Text>
          </View>
          <ThemeToggle style={localStyles.themeToggle} />
          
          {/* Menu Items Section */}
          <View style={localStyles.sectionHeader}>
            <Text style={localStyles.sectionTitle}>Menu</Text>
          </View>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={localStyles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={localStyles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={20} color={colors.brand.primary} />
              </View>
              <View style={localStyles.menuTextContainer}>
                <Text style={localStyles.menuText}>{item.title}</Text>
                <Text style={localStyles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon.secondary} />
            </Pressable>
          ))}
        </View>

        <View style={localStyles.logoutSection}>
          <Pressable style={localStyles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.status.error} />
            <Text style={localStyles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  header: {
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  profileSection: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center' as const,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    textAlign: 'center' as const,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  themeToggle: {
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 16,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primary + '15',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500' as const,
    fontFamily: 'Urbanist',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'Urbanist',
  },
  logoutSection: {
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.status.error,
    gap: spacing.sm,
    shadowColor: colors.status.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: colors.status.error,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
  },
});