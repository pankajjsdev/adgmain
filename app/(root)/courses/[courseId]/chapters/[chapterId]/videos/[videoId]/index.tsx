import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { VideoData } from '@/types/video';
import useCourseStore from '@/store/courseStore';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { VideoQuestionModal } from '@/components/VideoQuestionModal';

export default function VideoDetailScreen() {
  const { chapterId, videoId } = useLocalSearchParams<{
    courseId: string;
    chapterId: string;
    videoId: string;
  }>();
  
  const { styles, colors } = useGlobalStyles();
  const [activeTab, setActiveTab] = useState('description');
  const [refreshing, setRefreshing] = useState(false);
  
  // Course store
  const { 
    videoDetails, 
    loading, 
    error, 
    fetchVideoDetails
  } = useCourseStore();

  // Get video data
  const videoData: VideoData | null = videoDetails[videoId] || null;

  // Video player hook for comprehensive video management
  const {
    playerState,
    videoRef,
    handleTimeUpdate,
    handleQuestionAnswer,
    togglePlayPause,
    seekTo,
    closeQuestion,
    canSeek,
    isVideoCompleted
  } = useVideoPlayer({
    videoData: videoData!,
    onVideoComplete: () => {
      console.log('Video completed!');
      // Video completion is now handled by the hook itself
    },
    onQuestionAnswer: (questionId, answer, correct) => {
      console.log('Question answered:', { questionId, answer, correct });
    }
  });

  // Fetch video details on mount
  useEffect(() => {
    if (videoId) {
      fetchVideoDetails(videoId);
    }
  }, [videoId, fetchVideoDetails]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVideoDetails(videoId);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading && !videoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !videoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.status.error} />
          <Text style={styles.errorTitle}>Failed to load video</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleRefresh}>
            <Text style={styles.buttonTextPrimary}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Video not found
  if (!videoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="videocam-off" size={48} color={colors.text.secondary} />
          <Text style={styles.errorTitle}>Video not found</Text>
          <Text style={styles.errorMessage}>The requested video could not be found.</Text>
          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => router.back()}
          >
            <Text style={styles.buttonTextSecondary}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { id: 'description', title: 'Description', icon: 'information-circle-outline' },
    { id: 'resources', title: 'Resources', icon: 'link-outline' },
  ];

  const getVideoTypeInfo = () => {
    switch (videoData.videoType) {
      case 'basic':
        return {
          icon: 'play-circle',
          title: 'Basic Video',
          description: 'You can skip freely and resume from where you left off',
          color: colors.status.success
        };
      case 'trackable':
      case 'trackableRandom':
        return {
          icon: 'eye',
          title: 'Trackable Video',
          description: 'Skipping disabled. Questions may appear. Wrong answers restart video.',
          color: colors.status.warning
        };
      case 'interactive':
        return {
          icon: 'chatbubbles',
          title: 'Interactive Video',
          description: 'Skipping disabled. Wrong answers resume from last correct question.',
          color: colors.status.info
        };
      default:
        return {
          icon: 'play',
          title: 'Video',
          description: '',
          color: colors.text.secondary
        };
    }
  };

  const videoTypeInfo = getVideoTypeInfo();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            {/* Video Type Info */}
            <View style={[styles.infoCard, { borderLeftColor: videoTypeInfo.color }]}>
              <View style={styles.infoHeader}>
                <Ionicons name={videoTypeInfo.icon as any} size={20} color={videoTypeInfo.color} />
                <Text style={[styles.infoTitle, { color: videoTypeInfo.color }]}>
                  {videoTypeInfo.title}
                </Text>
              </View>
              <Text style={styles.infoDescription}>{videoTypeInfo.description}</Text>
            </View>

            {/* Description */}
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{videoData.videoDescription}</Text>
            
            {/* Video Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.statText}>
                  Duration: {Math.floor(videoData.duration / 60)}:{(videoData.duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons 
                  name={isVideoCompleted ? "checkmark-circle" : "play-circle-outline"} 
                  size={20} 
                  color={isVideoCompleted ? colors.status.success : colors.text.secondary} 
                />
                <Text style={[
                  styles.statText, 
                  isVideoCompleted && { color: colors.status.success }
                ]}>
                  {isVideoCompleted ? 'Completed' : 'In Progress'}
                </Text>
              </View>

              {playerState.currentTime > 0 && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Progress: {Math.round((playerState.currentTime / videoData.duration) * 100)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(playerState.currentTime / videoData.duration) * 100}%` }
                      ]} 
                    />
                  </View>
                  
                  {/* Show answered questions count for interactive videos */}
                  {(videoData.videoType === 'interactive' || videoData.videoType === 'trackableRandom') && (
                    <Text style={styles.questionsText}>
                      Questions answered: {playerState.progress.answeredQuestions.length} / {videoData.questions?.length || 0}
                      {playerState.progress.answeredQuestions.filter(q => q.correct).length < playerState.progress.answeredQuestions.length && 
                        ` (${playerState.progress.answeredQuestions.filter(q => q.correct).length} correct)`
                      }
                    </Text>
                  )}
                </View>
              )}

              {/* Questions Info */}
              {videoData.questions && videoData.questions.length > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.brand.primary} />
                  <Text style={styles.statText}>
                    {videoData.questions.length} interactive question{videoData.questions.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      
      case 'resources':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Resources</Text>
            {videoData.videoResources && videoData.videoResources.length > 0 ? (
              videoData.videoResources.map((resource, index) => (
                <TouchableOpacity key={index} style={styles.resourceItem}>
                  <Ionicons name="document-outline" size={20} color={colors.brand.primary} />
                  <View style={styles.resourceContent}>
                    <Text style={styles.resourceTitle}>Resource {index + 1}</Text>
                    <Text style={styles.resourceUrl}>{resource}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No resources available</Text>
              </View>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {videoData.videoTitle}
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Video Player */}
        <View style={styles.videoPlayerContainer}>
          {playerState.isLoading ? (
            <View style={styles.videoPlaceholder}>
              <ActivityIndicator size="large" color={colors.text.inverse} />
              <Text style={styles.loadingVideoText}>Loading video...</Text>
            </View>
          ) : (
            <>
              {/* Video Player Placeholder - Replace with actual Video component when expo-av is available */}
              <View style={styles.videoPlaceholder}>
                <TouchableOpacity 
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <Ionicons 
                    name={playerState.isPlaying ? "pause" : "play"} 
                    size={48} 
                    color={colors.text.inverse} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.loadingVideoText}>
                  {playerState.isPlaying ? 'Playing...' : 'Tap to play'}
                </Text>
                
                {/* Video Type Badge */}
                <View style={[styles.videoTypeBadge, { backgroundColor: videoTypeInfo.color }]}>
                  <Ionicons name={videoTypeInfo.icon as any} size={16} color={colors.text.inverse} />
                  <Text style={styles.videoTypeBadgeText}>{videoTypeInfo.title}</Text>
                </View>
                
                {/* Seek Restriction Notice */}
                {!canSeek && (
                  <View style={styles.restrictionNotice}>
                    <Ionicons name="lock-closed" size={16} color={colors.text.inverse} />
                    <Text style={styles.restrictionText}>
                      {isVideoCompleted ? 'Video completed - seeking now allowed' : 'Complete video to enable seeking'}
                    </Text>
                  </View>
                )}
                
                {/* Progress Bar */}
                <View style={styles.controlsOverlay}>
                  <View style={styles.customProgressContainer}>
                    <View style={styles.customProgressBar}>
                      <View 
                        style={[
                          styles.customProgressFill,
                          { width: `${(playerState.currentTime / playerState.duration) * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.timeText}>
                      {Math.floor(playerState.currentTime / 60)}:{(Math.floor(playerState.currentTime) % 60).toString().padStart(2, '0')} / 
                      {Math.floor(playerState.duration / 60)}:{(Math.floor(playerState.duration) % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Chapter Info */}
        <View style={styles.chapterInfo}>
          <Text style={styles.chapterTitle}>{videoData.videoTitle}</Text>
          <Text style={styles.chapterSubtitle}>Chapter {chapterId}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? colors.brand.primary : colors.text.secondary} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === tab.id && { color: colors.brand.primary, fontWeight: '600' }
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>

      {/* Video Question Modal */}
      <VideoQuestionModal
        visible={playerState.showQuestion}
        question={playerState.currentQuestion}
        onAnswer={handleQuestionAnswer}
        onClose={playerState.currentQuestion?.closeable ? closeQuestion : undefined}
      />
    </SafeAreaView>
  );
}
