import { apiGet } from '@/api';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface UserProfile {
  _id: string;
  avatarUrl: string;
  country: string;
  emailVerified: string;
  firstName: string;
  lastName: string;
  logins: {
    createdAt: string;
    email: string;
    type: string;
  }[];
  mobileNumber: string;
  mobileVerified: string;
  status: number;
  vendorCode: string;
}



export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const { styles, colors, spacing } = useGlobalStyles();

  const fetchUserProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await apiGet<UserProfile>('/student/profile');
      if (response.success && response.data) {
        setUserProfile(response.data);
        // Animate content in
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
        ]).start();
      } else {
        setError(response.message || 'Error fetching profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const onRefresh = () => {
    fetchUserProfile(true);
  };

  const localStyles = getLocalStyles(colors, spacing);

  return (
    <View style={styles.safeContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Profile',
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontFamily: 'Urbanist',
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginLeft: -8,
                marginRight: 8,
                padding: 8,
                borderRadius: 20,
                backgroundColor: 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
          ),
        }} 
      />

      {loading && (
        <View style={localStyles.centered}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={localStyles.loadingText}>Loading Profile...</Text>
        </View>
      )}

      {error && (
        <View style={localStyles.centered}>
          <View style={localStyles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
            <ThemedText type="error" style={localStyles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={localStyles.retryButton} onPress={() => fetchUserProfile()}>
              <Text style={localStyles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && !error && userProfile && (
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
          {/* Profile Header with Gradient */}
          <LinearGradient
            colors={[colors.brand.primary, colors.brand.secondary || colors.brand.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={localStyles.profileHeaderGradient}
          >
            <Animated.View 
              style={[
                localStyles.profileHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <View style={localStyles.avatarContainer}>
                <View style={localStyles.avatarShadow}>
                  <Image 
                    source={{ uri: userProfile.avatarUrl }} 
                    style={localStyles.avatar}
                    defaultSource={require('@/assets/images/placeholder.png')}
                  />
                </View>
                <View style={localStyles.verificationBadge}>
                  <LinearGradient
                    colors={[colors.status.success, colors.status.success + '80']}
                    style={localStyles.badgeGradient}
                  >
                    <Ionicons name="checkmark" size={16} color="white" />
                  </LinearGradient>
                </View>
              </View>
              <Text style={localStyles.userName}>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Text style={localStyles.userEmail}>
                {userProfile.logins[0]?.email}
              </Text>
              <View style={localStyles.statsContainer}>
                <View style={localStyles.statItem}>
                  <Text style={localStyles.statNumber}>1</Text>
                  <Text style={localStyles.statLabel}>Account</Text>
                </View>
                <View style={localStyles.statDivider} />
                <View style={localStyles.statItem}>
                  <Text style={localStyles.statNumber}>{userProfile.emailVerified === 'true' ? '✓' : '✗'}</Text>
                  <Text style={localStyles.statLabel}>Verified</Text>
                </View>
                <View style={localStyles.statDivider} />
                <View style={localStyles.statItem}>
                  <Text style={localStyles.statNumber}>{userProfile.status === 1 ? 'Active' : 'Inactive'}</Text>
                  <Text style={localStyles.statLabel}>Status</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* Profile Info Cards */}
          <Animated.View 
            style={[
              localStyles.infoSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Personal Information */}
            <View style={localStyles.infoCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={localStyles.cardGradient}
              >
                <View style={localStyles.cardHeader}>
                  <View style={localStyles.iconContainer}>
                    <LinearGradient
                      colors={[colors.brand.primary, colors.brand.primary + '80']}
                      style={localStyles.iconGradient}
                    >
                      <Ionicons name="person-outline" size={20} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={localStyles.cardTitle}>Personal Information</Text>
                </View>
                <View style={localStyles.cardContent}>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>First Name</Text>
                      <Text style={localStyles.infoValue}>{userProfile.firstName}</Text>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Last Name</Text>
                      <Text style={localStyles.infoValue}>{userProfile.lastName}</Text>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Country</Text>
                      <Text style={localStyles.infoValue}>{userProfile.country}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Contact Information */}
            <View style={localStyles.infoCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={localStyles.cardGradient}
              >
                <View style={localStyles.cardHeader}>
                  <View style={localStyles.iconContainer}>
                    <LinearGradient
                      colors={[colors.status.info, colors.status.info + '80']}
                      style={localStyles.iconGradient}
                    >
                      <Ionicons name="mail-outline" size={20} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={localStyles.cardTitle}>Contact Information</Text>
                </View>
                <View style={localStyles.cardContent}>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Email</Text>
                      <View style={localStyles.verifiedRow}>
                        <Text style={localStyles.infoValue}>{userProfile.logins[0]?.email}</Text>
                        {userProfile.emailVerified === 'true' && (
                          <View style={localStyles.verificationBadgeSmall}>
                            <Ionicons name="checkmark" size={12} color={colors.status.success} />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Mobile Number</Text>
                      <View style={localStyles.verifiedRow}>
                        <Text style={localStyles.infoValue}>{userProfile.mobileNumber}</Text>
                        {userProfile.mobileVerified === 'true' && (
                          <View style={localStyles.verificationBadgeSmall}>
                            <Ionicons name="checkmark" size={12} color={colors.status.success} />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Account Information */}
            <View style={localStyles.infoCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={localStyles.cardGradient}
              >
                <View style={localStyles.cardHeader}>
                  <View style={localStyles.iconContainer}>
                    <LinearGradient
                      colors={[colors.status.warning, colors.status.warning + '80']}
                      style={localStyles.iconGradient}
                    >
                      <Ionicons name="shield-outline" size={20} color="white" />
                    </LinearGradient>
                  </View>
                  <Text style={localStyles.cardTitle}>Account Information</Text>
                </View>
                <View style={localStyles.cardContent}>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Account ID</Text>
                      <Text style={localStyles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                        {userProfile._id}
                      </Text>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Vendor Code</Text>
                      <Text style={localStyles.infoValue}>{userProfile.vendorCode}</Text>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Account Status</Text>
                      <View style={localStyles.statusRow}>
                        <LinearGradient
                          colors={userProfile.status === 1 ? [colors.status.success, colors.status.success + '80'] : [colors.status.error, colors.status.error + '80']}
                          style={localStyles.statusBadge}
                        >
                          <Text style={localStyles.statusText}>
                            {userProfile.status === 1 ? 'Active' : 'Inactive'}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </View>
                  <View style={localStyles.infoRow}>
                    <View style={localStyles.infoItem}>
                      <Text style={localStyles.infoLabel}>Login Type</Text>
                      <View style={localStyles.loginTypeBadge}>
                        <Text style={localStyles.loginTypeText}>{userProfile.logins[0]?.type.toUpperCase()}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </ScrollView>
      )}

      {!loading && !error && !userProfile && (
        <View style={localStyles.centered}>
          <Ionicons name="person-outline" size={48} color={colors.text.secondary} />
          <ThemedText style={localStyles.noDataText}>No profile data available.</ThemedText>
        </View>
      )}
    </View>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  centered: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  errorText: {
    textAlign: 'center' as const,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontFamily: 'Urbanist',
    fontWeight: '600' as const,
  },
  // Profile Header Gradient
  profileHeaderGradient: {
    borderRadius: 0,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: spacing.lg,
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  verificationBadge: {
    position: 'absolute' as const,
    bottom: 5,
    right: 5,
  },
  badgeGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: 'white',
    marginBottom: spacing.xs,
    textAlign: 'center' as const,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Urbanist',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.lg,
    textAlign: 'center' as const,
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center' as const,
    paddingHorizontal: spacing.md,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    fontFamily: 'Urbanist',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Info Section
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
  },
  infoCard: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden' as const,
    shadowColor: colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
  },
  cardContent: {
    // Container for card content
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Urbanist',
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'Urbanist',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right' as const,
  },
  verifiedRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  verificationBadgeSmall: {
    marginLeft: spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 10,
    padding: 4,
  },
  statusRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: 'white',
  },
  loginTypeBadge: {
    backgroundColor: colors.brand.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.primary + '40',
  },
  loginTypeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: 'Urbanist',
    color: colors.brand.primary,
  },
  noDataText: {
    marginTop: spacing.md,
    textAlign: 'center' as const,
  },
});