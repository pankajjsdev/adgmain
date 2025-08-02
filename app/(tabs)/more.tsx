import React from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useAuthStore from '@/store/authStore';

export default function MoreScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const localStyles = getLocalStyles(colors, spacing);

  const menuItems = [
    { icon: 'person-outline', title: 'Profile', route: '/(root)/profile' },
    { icon: 'analytics-outline', title: 'Analytics', route: '/(root)/analytics' },
    { icon: 'chatbubbles-outline', title: 'Forum', route: '/(root)/forum' },
    { icon: 'settings-outline', title: 'Settings', route: null },
    { icon: 'help-circle-outline', title: 'Help & Support', route: null },
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
            <View style={localStyles.avatar}>
              <Ionicons name="person" size={32} color={colors.text.inverse} />
            </View>
            <Text style={styles.heading3}>{user?.name || 'User'}</Text>
            <Text style={styles.textSecondary}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        <View style={localStyles.menuSection}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={localStyles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.icon.primary} />
              <Text style={localStyles.menuText}>{item.title}</Text>
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
  },
  profileSection: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.base,
  },
  menuSection: {
    paddingHorizontal: spacing.base,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface.card,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: 12,
    gap: spacing.base,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500' as const,
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
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.status.error,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    color: colors.status.error,
    fontWeight: '600' as const,
  },
});