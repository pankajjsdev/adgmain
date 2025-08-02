import React from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

export default function CoursesScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const router = useRouter();
  const localStyles = getLocalStyles(colors, spacing);

  return (
    <SafeAreaView style={styles.container}>
      <View style={localStyles.innerContainer}>
        <View style={localStyles.header}>
          <Ionicons name="book-outline" size={48} color={colors.brand.primary} />
          <Text style={styles.heading2}>My Courses</Text>
          <Text style={styles.textSecondary}>Access your enrolled courses</Text>
        </View>
        
        <Pressable 
          style={styles.buttonPrimary} 
          onPress={() => router.push('/(root)/courses')}
        >
          <Text style={styles.buttonTextPrimary}>View All Courses</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  innerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: spacing['3xl'],
  },
});