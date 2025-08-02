import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

export default function NotFoundScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.status.warning} />
        <Text style={styles.heading2}>This screen does not exist.</Text>
        <Text style={styles.textSecondary}>The page you&apos;re looking for could not be found.</Text>
        <Link href="/" style={localStyles.link}>
          <Text style={localStyles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  linkText: {
    color: colors.brand.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
  },
});
