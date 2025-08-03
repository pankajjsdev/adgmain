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
  
  // Handle both old and new API response structure
  const courseId = item._id || item.id;
  const courseName = item.courseName || item.title;
  const courseIcon = item.courseIcon || item.image;
  const courseCode = item.courseCode || '';
  
  // Calculate progress from courseProgress if available
  let progressPercentage = 0;
  if (item.courseProgress?.course?.overall) {
    const { completedCount, totalCount } = item.courseProgress.course.overall;
    progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  } else if (typeof item.progress === 'number') {
    progressPercentage = item.progress;
  }
  
  return (
    <TouchableOpacity style={localStyles.card} onPress={() => courseId && onPress(courseId)}>
      {courseIcon && (
        <Image 
          source={{ uri: typeof courseIcon === 'string' ? courseIcon : courseIcon.uri }} 
          style={localStyles.image} 
        />
      )}
      <View style={localStyles.cardTextContainer}>
        <Text style={localStyles.title}>{courseName}</Text>
        {courseCode && (
          <Text style={localStyles.subtitle}>Code: {courseCode}</Text>
        )}
        {item.chapters && (
          <Text style={localStyles.subtitle}>{item.chapters.length} Chapters</Text>
        )}
        {progressPercentage > 0 && (
          <View style={localStyles.progressContainer}>
            <View style={localStyles.progressBar}>
              <View style={[localStyles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={localStyles.progressText}>{progressPercentage}% complete</Text>
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
    coursesHasMore,
    coursesRefreshing,
    fetchCourses,
    refreshCourses,
    loadMoreCourses,
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
    if (courseId) {
      // Navigate directly to chapter list for this course
      router.push(`/courses/${courseId}/chapters`);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Courses' }} />

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
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={localStyles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!coursesLoading && coursesHasMore) {
              loadMoreCourses();
            }
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => {
            if (coursesLoading && courses.length > 0) {
              return (
                <View style={localStyles.loadingFooter}>
                  <ActivityIndicator size="small" color={colors.brand.primary} />
                  <Text style={localStyles.loadingFooterText}>Loading more courses...</Text>
                </View>
              );
            }
            return null;
          }}
          refreshControl={
            <RefreshControl
              refreshing={coursesRefreshing}
              onRefresh={() => refreshCourses()}
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
  loadingFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  loadingFooterText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
});