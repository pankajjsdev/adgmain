import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useCourseStore from '@/store/courseStore';



export default function ChapterDetails() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  const { styles, colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);
  
  const {
    currentChapter,
    chaptersLoading,
    chaptersError,
    fetchChapter,
    clearError,
  } = useCourseStore();

  const loadChapterData = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      await fetchChapter(chapterId as string);
    } catch {
      Alert.alert(
        'Error',
        'Failed to load chapter details. Please try again.',
        [
          { text: 'OK', onPress: () => clearError('chapters') }
        ]
      );
    }
  }, [chapterId, fetchChapter, clearError]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  if (chaptersLoading && !currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading chapter details...</Text>
        </View>
      </View>
    );
  }

  if (chaptersError && !currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.heading3}>Failed to load chapter</Text>
          <Text style={styles.textSecondary}>{chaptersError}</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={loadChapterData}>
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="library-outline" size={64} color={colors.icon.secondary} />
          <Text style={styles.heading3}>Chapter not found</Text>
          <Text style={styles.textSecondary}>The requested chapter could not be found.</Text>
          <TouchableOpacity style={localStyles.backButton} onPress={() => router.back()}>
            <Text style={localStyles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      title: 'Videos',
      icon: 'play-circle-outline',
      count: currentChapter.videosCount,
      route: `/courses/${courseId}/chapters/${chapterId}/videos`,
      color: colors.brand.secondary,
    },
    {
      title: 'Assignments',
      icon: 'document-text-outline',
      count: currentChapter.assignmentsCount,
      route: `/courses/${courseId}/chapters/${chapterId}/assignments`,
      color: colors.status.info,
    },
    {
      title: 'Tests',
      icon: 'school-outline',
      count: currentChapter.testsCount,
      route: `/courses/${courseId}/chapters/${chapterId}/tests`,
      color: colors.status.warning,
    },
    {
      title: 'Notes',
      icon: 'book-outline',
      count: currentChapter.notesCount,
      route: `/courses/${courseId}/chapters/${chapterId}/notes`,
      color: colors.status.success,
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[localStyles.menuCard, { borderLeftColor: item.color }]}
      onPress={() => router.push(item.route)}
    >
      <View style={localStyles.menuContent}>
        <View style={[localStyles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={localStyles.menuText}>
          <Text style={localStyles.menuTitle}>{item.title}</Text>
          <Text style={localStyles.menuCount}>{item.count} items</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.icon.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: currentChapter.title,
        headerTitleStyle: { fontSize: 16 }
      }} />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={chaptersLoading}
            onRefresh={loadChapterData}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
      >
        {/* Chapter Header */}
        <View style={localStyles.header}>
          <Text style={styles.heading1}>{currentChapter.title}</Text>
          <Text style={styles.textSecondary}>{currentChapter.description}</Text>
          
          <View style={localStyles.chapterStats}>
            <View style={localStyles.statItem}>
              <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
              <Text style={localStyles.statText}>Duration: {currentChapter.duration}</Text>
            </View>
            <View style={localStyles.statItem}>
              <Ionicons name="list-outline" size={16} color={colors.icon.secondary} />
              <Text style={localStyles.statText}>Order: {currentChapter.order}</Text>
            </View>
            {currentChapter.isCompleted && (
              <View style={localStyles.statItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
                <Text style={[localStyles.statText, { color: colors.status.success }]}>Completed</Text>
              </View>
            )}
          </View>
        </View>

        {/* Chapter Content Menu */}
        <View style={localStyles.menuSection}>
          <Text style={styles.heading2}>Chapter Content</Text>
          {menuItems.map(renderMenuItem)}
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
  chapterStats: {
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
  menuSection: {
    padding: spacing.lg,
  },
  menuCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.lg,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  menuCount: {
    fontSize: 14,
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
