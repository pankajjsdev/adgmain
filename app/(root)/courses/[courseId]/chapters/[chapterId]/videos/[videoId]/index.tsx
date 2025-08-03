import { QuickOrientationTest } from '@/components/QuickOrientationTest';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoQuestionModal } from '@/components/VideoQuestionModal';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import useCourseStore from '@/store/courseStore';
import { VideoData } from '@/types/video';
import { htmlToPlainText } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function VideoDetailScreen() {
  const { courseId, chapterId, videoId } = useLocalSearchParams<{
    courseId: string;
    chapterId: string;
    videoId: string;
  }>();
  
  const { styles, colors, spacing, typography } = useGlobalStyles();
  const [activeTab, setActiveTab] = useState('description');
  const [refreshing, setRefreshing] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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
      // Show enhanced completion feedback
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Show completion alert with better UX
      setTimeout(() => {
        Alert.alert(
          '🎉 Congratulations!',
          'You have successfully completed this video! What would you like to do next?',
          [
            { 
              text: 'Continue Learning', 
              onPress: () => router.back(),
              style: 'default'
            },
            { 
              text: 'Replay Video', 
              onPress: () => {
                // Video replay logic would go here
              },
              style: 'cancel'
            }
          ],
          { cancelable: false }
        );
      }, 500);
    },
    onQuestionAnswer: (questionId: string, answer: string, correct: boolean) => {
      // Add visual feedback for question answers
      if (correct) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          })
        ]).start();
      }
      // Note: handleQuestionAnswer from useVideoPlayer hook has the correct signature
      // It will be called with the questionId, answer, and correct parameters as needed
    }
  });

  // Create a wrapper function to match VideoQuestionModal's expected signature
  const handleModalAnswer = useCallback((answer: string) => {
    if (handleQuestionAnswer) {
      // The handleQuestionAnswer from useVideoPlayer hook only expects the answer string
      handleQuestionAnswer(answer);
    }
  }, [handleQuestionAnswer]);

  // Animation functions for smooth UI transitions
  const animateContentIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Initialize animations when video data loads
  useEffect(() => {
    if (videoData) {
      animateContentIn();
    }
  }, [videoData, animateContentIn]);

  // Navigation for dynamic header updates
  const navigation = useNavigation();

  // Helper function to truncate video title for header
  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Update header title when video data is available
  useEffect(() => {
    if (videoData && videoData.videoTitle) {
      const title = truncateTitle(videoData.videoTitle);
      navigation.setOptions({ title });
    }
  }, [videoData, navigation]);

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
        } catch (error: any) {
          Alert.alert(
            'Error',
            `Failed to fetch video data: ${error.message || 'Unknown error'}. Please try again later.`,
            [
              { 
                text: 'OK', 
                onPress: () => router.back(),
                style: 'default'
              }
            ],
            { cancelable: false }
          );
        }
      }
    };
    
    fetchAllVideoData();
  }, [videoId, fetchVideoDetails, fetchVideoQuestions, fetchVideoProgress]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh all video data
      await fetchVideoDetails(videoId);
      await Promise.all([
        fetchVideoQuestions(videoId),
        fetchVideoProgress(videoId)
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        `Refresh failed: ${error.message || 'Unknown error'}. Please try again.`,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    } finally {
      setRefreshing(false);
    }
  }, [videoId, fetchVideoDetails, fetchVideoQuestions, fetchVideoProgress]);

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

  // Enhanced video type info with better styling and badges
  const getVideoTypeInfo = () => {
    switch (videoData.videoType) {
      case 'basic':
        return {
          icon: 'play-circle',
          title: 'Basic Video',
          description: 'You can skip freely and resume from where you left off',
          color: colors.status.success,
          badge: 'FREE NAVIGATION'
        };
      case 'trackable':
      case 'trackableRandom':
        return {
          icon: 'lock-closed',
          title: 'Trackable Video',
          description: 'Complete the video to unlock seeking. Questions may appear during playback.',
          color: colors.status.warning,
          badge: 'RESTRICTED'
        };
      case 'interactive':
        return {
          icon: 'help-circle',
          title: 'Interactive Video',
          description: 'Answer questions correctly to progress. Wrong answers restart from checkpoints.',
          color: colors.brand.primary,
          badge: 'INTERACTIVE'
        };
      default:
        return {
          icon: 'play',
          title: 'Video',
          description: 'Standard video playback',
          color: colors.text.secondary,
          badge: 'STANDARD'
        };
    }
  };

  const videoTypeInfo = getVideoTypeInfo();

  // Enhanced renderTabContent function with better UI and animations
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <Animated.View style={[
            styles.tabContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            {/* Enhanced Description Section */}
            <View style={[styles.contentCard, {
              backgroundColor: colors.surface.card,
              borderRadius: 12,
              padding: spacing.md,
              marginBottom: spacing.md
            }]}>
              <Text style={[styles.sectionTitle, {
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.md
              }]}>
                Description
              </Text>
              <Text style={[styles.description, {
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                lineHeight: 22
              }]}>
                {htmlToPlainText(videoData.videoDescription || 'No description available')}
              </Text>
            </View>
            
            {/* Enhanced Video Stats */}
            <View style={[styles.statsContainer, {
              backgroundColor: colors.surface.card,
              borderRadius: 12,
              padding: spacing.md
            }]}>
              <Text style={[styles.sectionTitle, {
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.md
              }]}>
                Video Information
              </Text>
              
              <View style={[styles.statItem, {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.sm,
                paddingVertical: spacing.xs
              }]}>
                <View style={[styles.statIcon, {
                  backgroundColor: colors.brand.primary + '20',
                  borderRadius: 20,
                  padding: spacing.xs,
                  marginRight: spacing.sm
                }]}>
                  <Ionicons name="time-outline" size={16} color={colors.brand.primary} />
                </View>
                <Text style={[styles.statText, {
                  fontSize: typography.fontSize.base,
                  color: colors.text.primary
                }]}>
                  Duration: {Math.floor((videoData.duration || 0) / 60)}:{(Math.floor(videoData.duration || 0) % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              
              <View style={[styles.statItem, {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.sm,
                paddingVertical: spacing.xs
              }]}>
                <View style={[styles.statIcon, {
                  backgroundColor: (isVideoCompleted ? colors.status.success : colors.status.warning) + '20',
                  borderRadius: 20,
                  padding: spacing.xs,
                  marginRight: spacing.sm
                }]}>
                  <Ionicons 
                    name={isVideoCompleted ? "checkmark-circle" : "play-circle-outline"} 
                    size={16} 
                    color={isVideoCompleted ? colors.status.success : colors.status.warning} 
                  />
                </View>
                <Text style={[
                  styles.statText, 
                  {
                    fontSize: typography.fontSize.base,
                    color: isVideoCompleted ? colors.status.success : colors.text.primary
                  }
                ]}>
                  {isVideoCompleted ? 'Completed' : 'In Progress'}
                </Text>
              </View>

              {/* Enhanced Progress Display */}
              {playerState && (playerState.currentTime || 0) > 0 && (
                <View style={[styles.progressContainer, {
                  marginTop: spacing.md,
                  padding: spacing.md,
                  backgroundColor: colors.background.secondary,
                  borderRadius: 8
                }]}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.sm
                  }}>
                    <Text style={[styles.progressText, {
                      fontSize: typography.fontSize.sm,
                      fontWeight: '600',
                      color: colors.text.primary
                    }]}>
                      Progress: {Math.round(((playerState.currentTime || 0) / (videoData.duration || 1)) * 100)}%
                    </Text>
                    <Text style={[styles.timeText, {
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary
                    }]}>
                      {Math.floor((playerState.currentTime || 0) / 60)}:{(Math.floor(playerState.currentTime || 0) % 60).toString().padStart(2, '0')} / 
                      {Math.floor((videoData.duration || 0) / 60)}:{(Math.floor(videoData.duration || 0) % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                  
                  <View style={[styles.progressBar, {
                    height: 6,
                    backgroundColor: colors.surface.overlay,
                    borderRadius: 3,
                    overflow: 'hidden'
                  }]}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${((playerState.currentTime || 0) / (videoData.duration || 1)) * 100}%`,
                          height: '100%',
                          backgroundColor: colors.brand.primary,
                          borderRadius: 3
                        }
                      ]} 
                    />
                  </View>
                  
                  {/* Questions Progress for Interactive Videos */}
                  {(videoData.videoType === 'interactive' || videoData.videoType === 'trackableRandom') && playerState?.progress && (
                    <Text style={[styles.questionsText, {
                      marginTop: spacing.sm,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary
                    }]}>
                      Questions answered: {playerState.progress?.answeredQuestions?.length || 0} / {videoData.questions?.length || 0}
                      {playerState.progress?.answeredQuestions && playerState.progress.answeredQuestions.filter(q => q.correct).length < playerState.progress.answeredQuestions.length && 
                        ` (${playerState.progress.answeredQuestions.filter(q => q.correct).length} correct)`
                      }
                    </Text>
                  )}
                </View>
              )}

              {/* Questions Info */}
              {videoData.questions && Array.isArray(videoData.questions) && videoData.questions.length > 0 && (
                <View style={[styles.statItem, {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: spacing.md,
                  paddingVertical: spacing.xs
                }]}>
                  <View style={[styles.statIcon, {
                    backgroundColor: colors.brand.primary + '20',
                    borderRadius: 20,
                    padding: spacing.xs,
                    marginRight: spacing.sm
                  }]}>
                    <Ionicons name="help-circle-outline" size={16} color={colors.brand.primary} />
                  </View>
                  <Text style={[styles.statText, {
                    fontSize: typography.fontSize.base,
                    color: colors.text.primary
                  }]}>
                    {videoData.questions.length} interactive question{videoData.questions.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        );

      case 'resources':
        return (
          <Animated.View style={[
            styles.tabContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={[styles.contentCard, {
              backgroundColor: colors.surface.card,
              borderRadius: 12,
              padding: spacing.md
            }]}>
              <Text style={[styles.sectionTitle, {
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.md
              }]}>
                Resources
              </Text>
              
              {videoData.videoResources && Array.isArray(videoData.videoResources) && videoData.videoResources.length > 0 ? (
                videoData.videoResources.map((resource, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.resourceItem, {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.background.secondary,
                      borderRadius: 8,
                      padding: spacing.md,
                      marginBottom: spacing.sm
                    }]}
                  >
                    <View style={[styles.resourceIcon, {
                      backgroundColor: colors.brand.primary + '20',
                      borderRadius: 20,
                      padding: spacing.sm,
                      marginRight: spacing.md
                    }]}>
                      <Ionicons name="document-outline" size={20} color={colors.brand.primary} />
                    </View>
                    <View style={[styles.resourceContent, { flex: 1 }]}>
                      <Text style={[styles.resourceTitle, {
                        fontSize: typography.fontSize.base,
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: spacing.xs
                      }]}>
                        Resource {index + 1}
                      </Text>
                      <Text style={[styles.resourceUrl, {
                        fontSize: typography.fontSize.base,
                        color: colors.text.secondary
                      }]} numberOfLines={2}>
                        {resource}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={[styles.emptyState, {
                  alignItems: 'center',
                  paddingVertical: spacing.xl
                }]}>
                  <View style={[styles.emptyIcon, {
                    backgroundColor: colors.surface.overlay,
                    borderRadius: 40,
                    padding: spacing.lg,
                    marginBottom: spacing.md
                  }]}>
                    <Ionicons name="document-outline" size={48} color={colors.text.secondary} />
                  </View>
                  <Text style={[styles.emptyStateText, {
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    textAlign: 'center'
                  }]}>
                    No resources available
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        );
      
      case 'questions':
        return (
          <Animated.View style={[
            styles.tabContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={[styles.contentCard, {
              backgroundColor: colors.surface.card,
              borderRadius: 12,
              padding: spacing.md
            }]}>
              <Text style={[styles.sectionTitle, {
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.md
              }]}>
                Video Questions
              </Text>
              
              {videoData.questions && Array.isArray(videoData.questions) && videoData.questions.length > 0 ? (
                videoData.questions.map((question: any, index: number) => (
                  <View key={question._id || index} style={[styles.questionCard, {
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.brand.primary
                  }]}>
                    <View style={[styles.questionHeader, {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.sm
                    }]}>
                      <Text style={[styles.questionNumber, {
                        fontSize: typography.fontSize.lg,
                        fontWeight: '600',
                        color: colors.brand.primary
                      }]}>
                        Q{index + 1}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <View style={[styles.questionTypeBadge, {
                          backgroundColor: colors.status.info + '20',
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: 12
                        }]}>
                          <Text style={[styles.questionTypeText, {
                            fontSize: typography.fontSize.xs,
                            fontWeight: '600',
                            color: colors.status.info
                          }]}>
                            {question.questionType?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.questionLevelBadge, {
                          backgroundColor: colors.status.warning + '20',
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                          borderRadius: 12
                        }]}>
                          <Text style={[styles.questionLevelText, {
                            fontSize: typography.fontSize.xs,
                            fontWeight: '600',
                            color: colors.status.warning
                          }]}>
                            {question.questionLevel}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={[styles.questionText, {
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      lineHeight: 22,
                      marginBottom: spacing.md
                    }]}>
                      {question.question?.text?.replace(/<[^>]*>/g, '') || 'Question text not available'}
                    </Text>
                    
                    {/* Enhanced Options Display */}
                    <View style={[styles.optionsContainer, { marginBottom: spacing.md }]}>
                      {question.options?.map((option: any, optIndex: number) => (
                        <View key={optIndex} style={[styles.optionItem, {
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: spacing.sm,
                          padding: spacing.sm,
                          backgroundColor: colors.surface.overlay,
                          borderRadius: 8
                        }]}>
                          <Text style={[styles.optionLabel, {
                            marginRight: spacing.sm,
                            fontWeight: '600',
                            color: colors.brand.primary,
                            fontSize: typography.fontSize.sm
                          }]}>
                            {String.fromCharCode(65 + optIndex)}.
                          </Text>
                          <Text style={[styles.optionText, {
                            flex: 1,
                            fontSize: typography.fontSize.base,
                            color: colors.text.secondary,
                            lineHeight: 20
                          }]}>
                            {option.text?.replace(/<[^>]*>/g, '') || `Option ${optIndex + 1}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {/* Enhanced Question Metadata */}
                    <View style={[styles.questionMeta, {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: colors.border.primary
                    }]}>
                      <View style={[styles.metaItem, {
                        flexDirection: 'row',
                        alignItems: 'center'
                      }]}>
                        <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                        <Text style={[styles.metaText, {
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginLeft: spacing.xs
                        }]}>
                          Appears at: {Math.floor(question.meta?.timeToShowQuestion || 0)}s
                        </Text>
                      </View>
                      <View style={[styles.metaItem, {
                        flexDirection: 'row',
                        alignItems: 'center'
                      }]}>
                        <Ionicons name="timer-outline" size={14} color={colors.text.tertiary} />
                        <Text style={[styles.metaText, {
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginLeft: spacing.xs
                        }]}>
                          Time limit: {question.meta?.timeToCompleteQuestion || 'No limit'}s
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.emptyState, {
                  alignItems: 'center',
                  paddingVertical: spacing.xl
                }]}>
                  <View style={[styles.emptyIcon, {
                    backgroundColor: colors.surface.overlay,
                    borderRadius: 40,
                    padding: spacing.lg,
                    marginBottom: spacing.md
                  }]}>
                    <Ionicons name="help-circle-outline" size={48} color={colors.text.secondary} />
                  </View>
                  <Text style={[styles.emptyStateText, {
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    textAlign: 'center'
                  }]}>
                    No questions available for this video
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        );
      
      case 'progress':
        return (
          <Animated.View style={[
            styles.tabContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={[styles.contentCard, {
              backgroundColor: colors.surface.card,
              borderRadius: 12,
              padding: spacing.md
            }]}>
              <Text style={[styles.sectionTitle, {
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                color: colors.text.primary,
                marginBottom: spacing.md
              }]}>
                Video Progress
              </Text>
              
              {videoProgress ? (
                <>
                  {/* Enhanced Completion Status */}
                  <View style={[styles.progressCard, {
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.md
                  }]}>
                    <View style={[styles.progressHeader, {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.md
                    }]}>
                      <Text style={[styles.progressTitle, {
                        fontSize: typography.fontSize.base,
                        fontWeight: '600',
                        color: colors.text.primary
                      }]}>
                        Completion Status
                      </Text>
                      <View style={[styles.statusBadge, {
                        backgroundColor: (videoProgress?.completed ? colors.status.success : colors.status.warning) + '20',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: 12
                      }]}>
                        <Text style={[styles.statusText, {
                          fontSize: typography.fontSize.sm,
                          fontWeight: '600',
                          color: videoProgress?.completed ? colors.status.success : colors.status.warning
                        }]}>
                          {videoProgress?.completed ? 'Completed' : 'In Progress'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={[styles.watchTimeText, {
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      marginBottom: spacing.md
                    }]}>
                      Watch Time: {Math.floor(videoProgress?.currentTime || 0)}s / {Math.floor(videoProgress?.totalDuration || 0)}s
                    </Text>
                    
                    <View style={[styles.progressBar, {
                      height: 8,
                      backgroundColor: colors.surface.overlay,
                      borderRadius: 4,
                      overflow: 'hidden',
                      marginBottom: spacing.md
                    }]}>
                      <Animated.View style={[
                        styles.progressFill, 
                        { 
                          width: `${videoProgress?.progress || 0}%`,
                          height: '100%',
                          backgroundColor: colors.brand.primary,
                          borderRadius: 4
                        }
                      ]} />
                    </View>
                    
                    {/* Enhanced Progress Stats */}
                    <View style={[styles.progressStats, {
                      flexDirection: 'row',
                      justifyContent: 'space-between'
                    }]}>
                      <View style={[styles.statColumn, { alignItems: 'center' }]}>
                        <Text style={[styles.statLabel, {
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginBottom: spacing.xs
                        }]}>
                          Progress
                        </Text>
                        <Text style={[styles.statValue, {
                          fontSize: typography.fontSize.lg,
                          fontWeight: '600',
                          color: colors.text.primary
                        }]}>
                          {Math.round(videoProgress?.progress || 0)}%
                        </Text>
                      </View>
                      <View style={[styles.statColumn, { alignItems: 'center' }]}>
                        <Text style={[styles.statLabel, {
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginBottom: spacing.xs
                        }]}>
                          Questions Answered
                        </Text>
                        <Text style={[styles.statValue, {
                          fontSize: typography.fontSize.lg,
                          fontWeight: '600',
                          color: colors.text.primary
                        }]}>
                          {videoProgress?.questionsAnswered || 0}
                        </Text>
                      </View>
                      <View style={[styles.statColumn, { alignItems: 'center' }]}>
                        <Text style={[styles.statLabel, {
                          fontSize: typography.fontSize.xs,
                          color: colors.text.tertiary,
                          marginBottom: spacing.xs
                        }]}>
                          Correct Answers
                        </Text>
                        <Text style={[styles.statValue, {
                          fontSize: typography.fontSize.lg,
                          fontWeight: '600',
                          color: colors.status.success
                        }]}>
                          {videoProgress?.correctAnswers || 0} / {videoProgress?.totalQuestions || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Questions Progress Details */}
                  {videoProgress?.questionsProgress && (
                    <View style={[styles.questionsProgressCard, {
                      backgroundColor: colors.background.secondary,
                      borderRadius: 12,
                      padding: spacing.md
                    }]}>
                      <Text style={[styles.questionsProgressTitle, {
                        fontSize: typography.fontSize.base,
                        fontWeight: '600',
                        color: colors.text.primary,
                        marginBottom: spacing.sm
                      }]}>
                        Questions Progress
                      </Text>
                      <Text style={[styles.questionsProgressText, {
                        fontSize: typography.fontSize.base,
                        color: colors.text.secondary
                      }]}>
                        {videoProgress?.questionsProgress?.answered || 0} answered out of {videoProgress?.questionsProgress?.total || 0} questions
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={[styles.emptyState, {
                  alignItems: 'center',
                  paddingVertical: spacing.xl
                }]}>
                  <View style={[styles.emptyIcon, {
                    backgroundColor: colors.surface.overlay,
                    borderRadius: 40,
                    padding: spacing.lg,
                    marginBottom: spacing.md
                  }]}>
                    <Ionicons name="analytics-outline" size={48} color={colors.text.secondary} />
                  </View>
                  <Text style={[styles.emptyStateText, {
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary,
                    textAlign: 'center'
                  }]}>
                    No progress data available
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Video' }} />
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
      

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
                posterUrl={videoData.videoThumbnail}
                isPlaying={playerState?.isPlaying || false}
                currentTime={playerState?.currentTime || 0}
                duration={playerState?.duration || videoData.duration || 0}
                canSeek={canSeek}
                onPlayPause={togglePlayPause}
                onTimeUpdate={(status) => {
                    if (handleTimeUpdate) {
                    handleTimeUpdate(status);
                  }
                }}
                onLoad={(status) => {
                    // Update duration if not set
                  if (status.durationMillis && !playerState?.duration) {
                    // Duration handling logic
                  }
                }}
                onFullscreenChange={(isFullscreen) => {
                  setIsVideoFullscreen(isFullscreen);
                }}
                style={styles.video}
              />
                
              {/* Video Type Badge */}
              <View style={[styles.videoTypeBadge, { backgroundColor: videoTypeInfo.color }]}>
                <Ionicons name={videoTypeInfo.icon as any} size={16} color={colors.text.inverse} />
                <Text style={styles.videoTypeBadgeText}>{videoTypeInfo.badge}</Text>
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
                        { width: `${playerState ? ((playerState.currentTime || 0) / (playerState.duration || 1)) * 100 : 0}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {playerState ? Math.floor((playerState.currentTime || 0) / 60) : 0}:{playerState ? (Math.floor(playerState.currentTime || 0) % 60).toString().padStart(2, '0') : '00'} / 
                    {playerState ? Math.floor((playerState.duration || 0) / 60) : Math.floor((videoData.duration || 0) / 60)}:{playerState ? (Math.floor(playerState.duration || 0) % 60).toString().padStart(2, '0') : (Math.floor(videoData.duration || 0) % 60).toString().padStart(2, '0')}
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
        visible={playerState?.showQuestion || false}
        question={playerState?.currentQuestion}
        onAnswer={handleModalAnswer}
        onClose={playerState?.currentQuestion?.closeable ? closeQuestion : undefined}
        isFullscreen={isVideoFullscreen}
      />
    </SafeAreaView>
  );
}
