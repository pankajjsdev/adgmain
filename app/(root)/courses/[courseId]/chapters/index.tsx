import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import type { Chapter } from '@/store/courseStore';
import useCourseStore from '@/store/courseStore';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChapterCardProps {
  item: Chapter;
  onPress: (chapterId: string) => void;
  colors: any;
  spacing: any;
  styles: any;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ 
  item, 
  onPress, 
  colors, 
  spacing,
  styles
}) => {
  const chapterId = item._id || item.id;
  const chapterName = item.chapterName || item.title;
  const chapterIcon = item.chapterIcon;
  
  if (!chapterId) {
    return null;
  }
  
  return (
    <TouchableOpacity style={styles.card} onPress={() => chapterId && onPress(chapterId)}>
      {chapterIcon && (
        <Image 
          source={{ uri: chapterIcon }} 
          style={styles.chapterIcon}
          resizeMode="cover"
        />
      )}
      <View style={styles.chapterInfo}>
        <Text style={styles.chapterName} numberOfLines={2}>
          {chapterName || 'Untitled Chapter'}
        </Text>
        <View style={styles.componentInfo}>
          {item.chapterComponent && item.chapterComponent.length > 0 && (
            <Text style={styles.componentText}>
              Components: {item.chapterComponent.join(', ')}
            </Text>
          )}
          <View style={styles.countsContainer}>
            <Text style={styles.countText}>
              Videos: {item.videos?.length || item.videosCount || 0}
            </Text>
            <Text style={styles.countText}>
              Assignments: {item.assignments?.length || item.assignmentsCount || 0}
            </Text>
            <Text style={styles.countText}>
              Tests: {item.tests?.length || item.testsCount || 0}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: item.status === 1 ? colors.status.success : colors.text.secondary }
        ]} />
      </View>
    </TouchableOpacity>
  );
};

export default function ChapterListScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { colors, spacing, styles } = useGlobalStyles();
  
  const {
    chapters,
    chaptersLoading,
    chaptersError,
    chaptersHasMore,
    chaptersRefreshing,
    currentCourse,
    fetchChapters,
    refreshChapters,
    loadMoreChapters,
    clearError,
  } = useCourseStore();

  const loadChapters = useCallback(async () => {
    if (!courseId) return;
    
    try {
      // Fetch course details first to get the course name for header
    
      await fetchChapters(courseId);
    } catch {
      Alert.alert(
        'Error',
        'Failed to load chapters. Please try again.',
        [
          { text: 'OK', onPress: () => clearError('chapters') }
        ]
      );
    }
  }, [courseId, fetchChapters, clearError]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // Navigation for dynamic header updates
  const navigation = useNavigation();

  // Update header title when course data is available
  useEffect(() => {
    if (currentCourse) {
      const title = currentCourse.courseName || currentCourse.title || 'Course Chapters';
      navigation.setOptions({ title });
    }
  }, [currentCourse, navigation]);

  const handleChapterPress = (chapterId: string) => {
    if (chapterId && courseId) {
      // Navigate to chapter detail page
      router.push(`/courses/${courseId}/chapters/${chapterId}`);
    }
  };

  const localStyles = {
    listContent: {
      paddingBottom: spacing.xl,
    },
    card: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.surface.primary,
      padding: spacing.base,
      borderRadius: 12,
      marginBottom: spacing.base,
      marginHorizontal: spacing.base,
      shadowColor: colors.shadow.light,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chapterIcon: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: spacing.base,
    },
    chapterInfo: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    chapterName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    componentInfo: {
      marginTop: spacing.xs,
    },
    componentText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    countsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
    },
    countText: {
      fontSize: 11,
      color: colors.text.tertiary,
      backgroundColor: colors.surface.secondary,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusContainer: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: spacing.xl,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: spacing.xl,
    },
    errorText: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center' as const,
      marginBottom: spacing.base,
    },
    retryButton: {
      backgroundColor: colors.brand.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 8,
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
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: currentCourse ? currentCourse.courseName || currentCourse.title || 'Course Chapters' : 'Course Chapters' 
      }} />

      {chaptersLoading && chapters.length === 0 && (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={localStyles.errorText}>Loading chapters...</Text>
        </View>
      )}

      {chaptersError && chapters.length === 0 && (
        <View style={localStyles.errorContainer}>
          <Text style={localStyles.errorText}>{chaptersError}</Text>
          <TouchableOpacity
            style={localStyles.retryButton}
            onPress={loadChapters}
          >
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {chapters.length > 0 && (
        <FlatList
          data={chapters}
          renderItem={({ item }) => (
            <ChapterCard 
              item={item} 
              onPress={handleChapterPress} 
              colors={colors} 
              spacing={spacing}
              styles={localStyles}
            />
          )}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          contentContainerStyle={localStyles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!chaptersLoading && chaptersHasMore && courseId) {
              loadMoreChapters(courseId);
            }
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => {
            if (chaptersLoading && chapters.length > 0) {
              return (
                <View style={localStyles.loadingFooter}>
                  <ActivityIndicator size="small" color={colors.brand.primary} />
                  <Text style={localStyles.loadingFooterText}>Loading more chapters...</Text>
                </View>
              );
            }
            return null;
          }}
          refreshControl={
            <RefreshControl
              refreshing={chaptersRefreshing}
              onRefresh={() => courseId && refreshChapters(courseId)}
              colors={[colors.brand.primary]}
              tintColor={colors.brand.primary}
            />
          }
        />
      )}
    </View>
  );
}
