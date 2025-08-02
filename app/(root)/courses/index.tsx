import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useCourseStore, { Course } from '@/store/courseStore';

function renderCourse({ item, onPress, colors, spacing }: { 
  item: Course; 
  onPress: (courseId: string) => void;
  colors: any;
  spacing: any;
}) {
  const localStyles = getLocalStyles(colors, spacing);
  
  return (
    <TouchableOpacity style={localStyles.card} onPress={() => onPress(item.id)}>
      {item.image && <Image source={item.image} style={localStyles.image} />}
      <View style={localStyles.cardTextContainer}>
        <Text style={localStyles.title}>{item.title}</Text>
        <Text style={localStyles.subtitle}>{item.lessons + ' Lessons • ' + item.time}</Text>
        {item.description && (
          <Text style={localStyles.description}>{item.description}</Text>
        )}
        {item.instructor && (
          <View style={localStyles.instructorContainer}>
            <Ionicons name="person-outline" size={14} color={colors.icon.secondary} />
            <Text style={localStyles.instructorText}>{item.instructor}</Text>
          </View>
        )}
        {typeof item.progress === 'number' && item.progress > 0 && (
          <View style={localStyles.progressContainer}>
            <View style={localStyles.progressBar}>
              <View style={[localStyles.progressFill, { width: `${item.progress}%` }]} />
            </View>
            <Text style={localStyles.progressText}>{item.progress}% complete</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.icon.secondary} />
    </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const router = useRouter();
  const localStyles = getLocalStyles(colors, spacing);
  
  const {
    courses,
    coursesLoading,
    coursesError,
    fetchCourses,
    clearError,
  } = useCourseStore();

  const loadCourses = useCallback(async () => {
    try {
      await fetchCourses();
    } catch {
      Alert.alert(
        'Error',
        'Failed to load courses. Please try again.',
        [
          { text: 'OK', onPress: () => clearError('courses') }
        ]
      );
    }
  }, [fetchCourses, clearError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCoursePress = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Available Courses' }} />

      {coursesLoading && courses.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading Courses...</Text>
        </View>
      )}

      {coursesError && (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
          <Text style={styles.errorText}>{coursesError}</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={loadCourses}>
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!coursesLoading && !coursesError && courses.length > 0 && (
        <FlatList
          data={courses}
          renderItem={({ item }) => renderCourse({ item, onPress: handleCoursePress, colors, spacing })}
          keyExtractor={(item) => item.id}
          contentContainerStyle={localStyles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={coursesLoading}
              onRefresh={loadCourses}
              colors={[colors.brand.primary]}
              tintColor={colors.brand.primary}
            />
          }
        />
      )}

      {!coursesLoading && !coursesError && courses.length === 0 && (
        <View style={styles.centeredContainer}>
          <Ionicons name="school-outline" size={64} color={colors.icon.secondary} />
          <Text style={styles.heading3}>No courses available</Text>
          <Text style={styles.textSecondary}>Check back later for new courses</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={loadCourses}>
            <Text style={localStyles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  listContent: {
    paddingBottom: spacing.base,
  },
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    marginHorizontal: spacing.base,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: spacing.md,
    resizeMode: 'cover' as const,
  },
  cardTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  instructorContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: spacing.xs,
  },
  instructorText: {
    marginLeft: spacing.xs,
    fontSize: 12,
    color: colors.text.secondary,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.secondary,
    borderRadius: 2,
    overflow: 'hidden' as const,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: colors.status.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  retryButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});