import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useCourseStore, { Video } from '@/store/courseStore';

export default function VideoList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  const { styles, colors, spacing } = useGlobalStyles();
  const localStyles = getLocalStyles(colors, spacing);
  
  const {
    videos,
    videosLoading,
    videosError,
    videosHasMore,
    videosRefreshing,
    fetchVideos,
    refreshVideos,
    loadMoreVideos,
    updateVideoProgress,
    clearError,
  } = useCourseStore();

  const loadVideos = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      await fetchVideos(chapterId as string);
    } catch {
      Alert.alert(
        'Error',
        'Failed to load videos. Please try again.',
        [
          { text: 'OK', onPress: () => clearError('videos') }
        ]
      );
    }
  }, [chapterId, fetchVideos, clearError]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleVideoPress = async (video: Video) => {
    // Update video progress when user starts watching
    if (!video.isWatched) {
      try {
        await updateVideoProgress(video.id, 1); // Mark as started
      } catch (error) {
        console.log('Failed to update video progress:', error);
      }
    }
    router.push(`/courses/${courseId}/chapters/${chapterId}/videos/${video.id}`);
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={localStyles.videoCard}
      onPress={() => handleVideoPress(item)}
    >
      <View style={localStyles.thumbnailContainer}>
        <Image 
          source={{ uri: item.thumbnail || 'https://via.placeholder.com/320x180/4ECDC4/FFFFFF?text=Video' }} 
          style={localStyles.thumbnail} 
        />
        <View style={localStyles.durationBadge}>
          <Text style={localStyles.durationText}>{item.duration}</Text>
        </View>
        <View style={localStyles.playButton}>
          <Ionicons name="play" size={24} color={colors.text.inverse} />
        </View>
        {item.isWatched && (
          <View style={localStyles.watchedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
          </View>
        )}
      </View>
      
      <View style={localStyles.videoInfo}>
        <Text style={localStyles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={localStyles.videoDescription} numberOfLines={3}>{item.description}</Text>
        <View style={localStyles.videoMeta}>
          <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
          <Text style={localStyles.metaText}>{item.duration}</Text>
          {item.isWatched && (
            <>
              <Ionicons name="checkmark-circle" size={16} color={colors.status.success} style={localStyles.watchedIcon} />
              <Text style={[localStyles.metaText, { color: colors.status.success }]}>Watched</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (videosLoading && videos.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Videos' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </View>
    );
  }

  if (videosError && videos.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Videos' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.heading3}>Failed to load videos</Text>
          <Text style={styles.textSecondary}>{videosError}</Text>
          <TouchableOpacity style={localStyles.retryButton} onPress={loadVideos}>
            <Text style={localStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Videos' }} />
      
      <View style={localStyles.header}>
        <Text style={styles.heading2}>Videos</Text>
        <Text style={styles.textSecondary}>{videos.length} videos available</Text>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={localStyles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!videosLoading && videosHasMore && chapterId) {
            loadMoreVideos(chapterId as string);
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => {
          if (videosLoading && videos.length > 0) {
            return (
              <View style={localStyles.loadingFooter}>
                <ActivityIndicator size="small" color={colors.brand.primary} />
                <Text style={localStyles.loadingFooterText}>Loading more videos...</Text>
              </View>
            );
          }
          return null;
        }}
        refreshControl={
          <RefreshControl
            refreshing={videosRefreshing}
            onRefresh={() => chapterId && refreshVideos(chapterId as string)}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          !videosLoading ? (
            <View style={localStyles.emptyContainer}>
              <Ionicons name="play-circle-outline" size={64} color={colors.icon.secondary} />
              <Text style={styles.heading3}>No videos available</Text>
              <Text style={styles.textSecondary}>Check back later for new content</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const getLocalStyles = (colors: any, spacing: any) => ({
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  listContainer: {
    padding: spacing.md,
  },
  videoCard: {
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'relative' as const,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden' as const,
    height: 180,
  },
  thumbnail: {
    width: '100%' as const,
    height: 180,
    backgroundColor: colors.surface.secondary,
  },
  durationBadge: {
    position: 'absolute' as const,
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  playButton: {
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  watchedBadge: {
    position: 'absolute' as const,
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface.card,
    borderRadius: 12,
    padding: spacing.xs,
  },
  videoInfo: {
    padding: spacing.md,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  videoDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  videoMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  watchedIcon: {
    marginLeft: spacing.sm,
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
  },
  emptyContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
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
