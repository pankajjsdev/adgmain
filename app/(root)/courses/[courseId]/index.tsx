import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useCourseStore, { Chapter } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';



export default function CourseDetails() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { styles, colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);
  
  const {
    currentCourse,
    chapters,
    coursesLoading,
    chaptersLoading,
    coursesError,
    chaptersError,
    fetchChapters,
    clearError,
  } = useCourseStore();

  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      await Promise.all([
        fetchChapters(courseId as string)
      ]);
    } catch {
      Alert.alert(
        'Error',
        'Failed to load course details. Please try again.',
        [
          { text: 'OK', onPress: () => {
            clearError('courses');
            clearError('chapters');
          }}
        ]
      );
    }
  }, [courseId, fetchChapters, clearError]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const isLoading = coursesLoading || chaptersLoading;
  const hasError = coursesError || chaptersError;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Course Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </View>
    );
  }

  if (hasError && !currentCourse) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Course Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.heading3}>Failed to load course</Text>
          <Text style={styles.textSecondary}>{coursesError || chaptersError}</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={loadCourseData}>
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentCourse) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Course Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="school-outline" size={64} color={colors.icon.secondary} />
          <Text style={styles.heading3}>Course not found</Text>
          <Text style={styles.textSecondary}>The requested course could not be found.</Text>
          <TouchableOpacity style={localStyles.backButton} onPress={() => router.back()}>
            <Text style={localStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderChapter = ({ item }: { item: Chapter }) => (
    <TouchableOpacity
      style={localStyles.chapterCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${item.id}`)}
    >
      <View style={localStyles.chapterHeader}>
        <Text style={localStyles.chapterTitle}>{item.title}</Text>
        {item.isCompleted && (
          <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
        )}
      </View>
      <Text style={localStyles.chapterDescription}>{item.description}</Text>
      <View style={localStyles.chapterStats}>
        <View style={localStyles.statItem}>
          <Ionicons name="play-outline" size={16} color={colors.icon.secondary} />
          <Text style={localStyles.statText}>{item.videosCount} videos</Text>
        </View>
        <View style={localStyles.statItem}>
          <Ionicons name="document-text-outline" size={16} color={colors.icon.secondary} />
          <Text style={localStyles.statText}>{item.assignmentsCount} assignments</Text>
        </View>
        <View style={localStyles.statItem}>
          <Ionicons name="school-outline" size={16} color={colors.icon.secondary} />
          <Text style={localStyles.statText}>{item.testsCount} tests</Text>
        </View>
      </View>
      <Text style={localStyles.chapterDuration}>Duration: {item.duration}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: currentCourse.title,
        headerTitleStyle: { fontSize: 16 }
      }} />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadCourseData}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* Course Header */}
        <View style={localStyles.header}>
          <Text style={styles.heading1}>{currentCourse.title}</Text>
          <Text style={styles.textSecondary}>{currentCourse.description}</Text>
          
          <View style={localStyles.courseStats}>
            <View style={localStyles.statItem}>
              <Ionicons name="person-outline" size={16} color={colors.icon.secondary} />
              <Text style={localStyles.statText}>{currentCourse.instructor}</Text>
            </View>
            <View style={localStyles.statItem}>
              <Ionicons name="book-outline" size={16} color={colors.icon.secondary} />
              <Text style={localStyles.statText}>{currentCourse.lessons} lessons</Text>
            </View>
            <View style={localStyles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
              <Text style={localStyles.statText}>{currentCourse.time}</Text>
            </View>
          </View>
          
          {typeof currentCourse.progress === 'number' && (
            <View style={localStyles.progressSection}>
              <View style={localStyles.progressHeader}>
                <Text style={localStyles.progressLabel}>Progress</Text>
                <Text style={localStyles.progressText}>{currentCourse.progress}%</Text>
              </View>
              <View style={localStyles.progressBar}>
                <View style={[localStyles.progressFill, { width: `${currentCourse.progress}%` }]} />
              </View>
            </View>
          )}
        </View>
        
        {/* Chapters Section */}
        <View style={localStyles.chaptersSection}>
          <Text style={styles.heading2}>Chapters</Text>
          
          {chaptersLoading && chapters.length === 0 && (
            <View style={localStyles.loadingSection}>
              <ActivityIndicator size="small" color={colors.brand.primary} />
              <Text style={styles.textSecondary}>Loading chapters...</Text>
            </View>
          )}
          
          {chaptersError && chapters.length === 0 && (
            <View style={localStyles.errorSection}>
              <Text style={styles.errorText}>{chaptersError}</Text>
              <TouchableOpacity style={localStyles.retryButton} onPress={loadCourseData}>
                <Text style={localStyles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {chapters.length > 0 && (
            <FlatList
              data={chapters}
              renderItem={renderChapter}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {!chaptersLoading && !chaptersError && chapters.length === 0 && (
            <View style={localStyles.emptySection}>
              <Ionicons name="library-outline" size={48} color={colors.icon.secondary} />
              <Text style={styles.textSecondary}>No chapters available yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface.card,
    marginBottom: spacing.md,
  },
  courseStats: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: spacing.lg,
  },
  statText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressSection: {
    marginTop: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.brand.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.secondary,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%' as const,
    backgroundColor: colors.brand.primary,
  },
  chaptersSection: {
    padding: spacing.lg,
  },
  loadingSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorSection: {
    alignItems: 'center' as const,
    padding: spacing.lg,
  },
  emptySection: {
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  chapterCard: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    flex: 1,
  },
  chapterDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  chapterStats: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  chapterDuration: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic' as const,
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
  backButton: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  backButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});
