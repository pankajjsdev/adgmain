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
import { VideoPlayer } from '@/components/VideoPlayer';
import { QuickOrientationTest } from '@/components/QuickOrientationTest';
import { htmlToPlainText } from '@/utils/htmlUtils';

export default function VideoDetailScreen() {
  const { courseId, chapterId, videoId } = useLocalSearchParams<{
    courseId: string;
    chapterId: string;
    videoId: string;
  }>();
  
  const { styles, colors } = useGlobalStyles();
  const [activeTab, setActiveTab] = useState('description');
  const [refreshing, setRefreshing] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  
  // Course store
  const { 
    videoDetails, 
    loading, 
    error, 
    fetchVideoDetails,
    fetchVideoQuestions,
    fetchVideoProgress
  } = useCourseStore();

  // Get video data
  const videoData: VideoData | null = videoDetails[videoId] || null;

  // Get video progress data from videoDetails
  const videoProgress = videoData?.progress || null;

  // Enhanced video data with route parameters - provide default structure if null
  const enhancedVideoData = videoData ? {
    ...videoData,
    // Ensure courseId and chapterId are available from route params
    courseId: videoData.courseId || courseId,
    chapterId: videoData.chapterId || chapterId
  } : {
    // Default video data structure to prevent hook errors
    _id: videoId || '',
    courseId: courseId || '',
    chapterId: chapterId || '',
    createdAt: new Date().toISOString(),
    duration: 0,
    videoTitle: 'Loading...',
    videoDescription: 'Loading video details...',
    videoThumbnail: '',
    videoUrl: '',
    questions: [],
    isSubmitSingleEveryTime: false,
    videoType: 'basic' as const,
    videoResources: [],
    meta: {
      videoType: 0,
      timeToShowQuestion: '0'
    }
  };

  // Video player hook for comprehensive video management
  const {
    playerState,
    handleQuestionAnswer,
    handleTimeUpdate,
    togglePlayPause,
    closeQuestion,
    canSeek,
    isVideoCompleted
  } = useVideoPlayer({
    videoData: enhancedVideoData,
    onVideoComplete: () => {
      console.log('Video completed!');
      // Video completion is now handled by the hook itself
    },
    onQuestionAnswer: (questionId, answer, correct) => {
      console.log('Question answered:', { questionId, answer, correct });
    }
  });

  // Fetch all video data on mount
  useEffect(() => {
    const fetchAllVideoData = async () => {
      if (videoId) {
        try {
          // Fetch video details first
          await fetchVideoDetails(videoId);
          // Then fetch questions and progress in parallel
          await Promise.all([
            fetchVideoQuestions(videoId),
            fetchVideoProgress(videoId)
          ]);
        } catch (error) {
          console.error('Failed to fetch video data:', error);
        }
      }
    };
    
    fetchAllVideoData();
  }, [videoId, fetchVideoDetails, fetchVideoQuestions, fetchVideoProgress]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all video data
      await fetchVideoDetails(videoId);
      await Promise.all([
        fetchVideoQuestions(videoId),
        fetchVideoProgress(videoId)
      ]);
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
    { id: 'questions', title: 'Questions', icon: 'help-circle-outline' },
    { id: 'resources', title: 'Resources', icon: 'link-outline' },
    { id: 'progress', title: 'Progress', icon: 'analytics-outline' },
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
            <Text style={styles.description}>
              {htmlToPlainText(videoData.videoDescription || 'No description available')}
            </Text>
            
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
      
      case 'questions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Video Questions</Text>
            {videoData.questions && videoData.questions.length > 0 ? (
              videoData.questions.map((question: any, index: number) => (
                <View key={question._id || index} style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Text style={styles.heading4}>Q{index + 1}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Text style={[styles.textSecondary, { fontSize: 12, fontWeight: '600' }]}>
                        {question.questionType?.toUpperCase()}
                      </Text>
                      <Text style={[styles.textSecondary, { fontSize: 12 }]}>
                        {question.questionLevel}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.textPrimary}>
                    {question.question?.text?.replace(/<[^>]*>/g, '') || 'Question text not available'}
                  </Text>
                  
                  <View style={{ marginTop: 12 }}>
                    {question.options?.map((option: any, optIndex: number) => (
                      <View key={optIndex} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                        <Text style={[styles.textSecondary, { marginRight: 8, fontWeight: '600' }]}>
                          {String.fromCharCode(65 + optIndex)}.
                        </Text>
                        <Text style={[styles.textSecondary, { flex: 1 }]}>
                          {option.text?.replace(/<[^>]*>/g, '') || `Option ${optIndex + 1}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border.primary }}>
                    <Text style={[styles.textTertiary, { fontSize: 12 }]}>
                      Appears at: {Math.floor(question.meta?.timeToShowQuestion || 0)}s
                    </Text>
                    <Text style={[styles.textTertiary, { fontSize: 12 }]}>
                      Time limit: {question.meta?.timeToCompleteQuestion || 'No limit'}s
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.centeredContainer}>
                <Ionicons name="help-circle-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.textSecondary}>No questions available for this video</Text>
              </View>
            )}
          </View>
        );
      
      case 'progress':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Video Progress</Text>
            {videoProgress ? (
              <>
                <View style={styles.infoCard}>
                  <View style={styles.infoHeader}>
                    <Text style={styles.heading4}>Completion Status</Text>
                    <Text style={[styles.textSecondary, { fontWeight: '600' }]}>
                      {videoProgress.completed ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                  
                  <Text style={styles.textPrimary}>
                    Watch Time: {Math.floor(videoProgress.currentTime || 0)}s / {Math.floor(videoProgress.totalDuration || 0)}s
                  </Text>
                  
                  <View style={[styles.progressBar, { marginTop: 12 }]}>
                    <View style={[styles.progressFill, { width: `${videoProgress.progress || 0}%` }]} />
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.textTertiary}>Progress</Text>
                      <Text style={styles.textPrimary}>{Math.round(videoProgress.progress || 0)}%</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.textTertiary}>Questions Answered</Text>
                      <Text style={styles.textPrimary}>{videoProgress.questionsAnswered || 0}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={styles.textTertiary}>Correct Answers</Text>
                      <Text style={styles.textPrimary}>
                        {videoProgress.correctAnswers || 0} / {videoProgress.totalQuestions || 0}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {videoProgress.questionsProgress && (
                  <View style={[styles.infoCard, { marginTop: 16 }]}>
                    <Text style={styles.heading4}>Questions Progress</Text>
                    <Text style={styles.textSecondary}>
                      {videoProgress.questionsProgress.answered || 0} answered out of {videoProgress.questionsProgress.total || 0} questions
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.centeredContainer}>
                <Ionicons name="analytics-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.textSecondary}>No progress data available</Text>
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
          {loading || !videoData.videoUrl ? (
            <View style={styles.videoPlaceholder}>
              <ActivityIndicator size="large" color={colors.text.inverse} />
              <Text style={styles.loadingVideoText}>Loading video...</Text>
            </View>
          ) : (
            <>
              {/* Actual Video Player */}
              <VideoPlayer
                videoUrl={videoData.videoUrl}
                isPlaying={playerState?.isPlaying || false}
                currentTime={playerState?.currentTime || 0}
                duration={playerState?.duration || videoData.duration || 0}
                canSeek={canSeek}
                onPlayPause={togglePlayPause}
                onTimeUpdate={(status) => {
                  // Handle time updates from video player
                  if (handleTimeUpdate) {
                    handleTimeUpdate(status);
                  }
                }}
                onLoad={(status) => {
                  // Handle video load
                  console.log('Video loaded:', status);
                }}
                onFullscreenChange={(isFullscreen) => {
                  setIsVideoFullscreen(isFullscreen);
                }}
                style={styles.video}
              />
                
              {/* Video Type Badge */}
              <View style={[styles.videoTypeBadge, { backgroundColor: videoTypeInfo.color }]}>
                <Ionicons name={videoTypeInfo.icon as any} size={16} color={colors.text.inverse} />
                <Text style={styles.videoTypeBadgeText}>{videoTypeInfo.title}</Text>
              </View>

              {/* Seeking Restriction Notice */}
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
        
        {/* Quick Orientation Test - For testing fullscreen functionality */}
        <QuickOrientationTest />
      </ScrollView>

      {/* Video Question Modal */}
      <VideoQuestionModal
        visible={playerState.showQuestion}
        question={playerState.currentQuestion}
        onAnswer={handleQuestionAnswer}
        onClose={playerState.currentQuestion?.closeable ? closeQuestion : undefined}
        isFullscreen={isVideoFullscreen}
      />
    </SafeAreaView>
  );
}
