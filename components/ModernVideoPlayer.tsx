import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Question } from '@/types/video';
import { VideoAnalytics } from '@/utils/analytics';
import { enterFullscreenOrientation, exitFullscreenOrientation } from '@/utils/orientationUtils';
// Performance and monitoring utilities
// import { usePerformanceMonitoring } from '@/utils/performance';
// import { useMonitoring, ErrorType, ErrorSeverity } from '@/utils/monitoring';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VideoQuality, VideoQualityModal } from './VideoQualityModal';
import { VideoQuestionModal } from './VideoQuestionModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModernVideoPlayerProps {
  videoId: string; // Add videoId prop for analytics tracking
  videoUrl: string;
  posterUrl?: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canSeek: boolean;
  onPlayPause: () => void;
  onSeek?: (time: number) => void;
  onTimeUpdate: (status: any) => void;
  onLoad: (status: any) => void;
  videoRef?: React.RefObject<VideoView | null>;
  player?: VideoPlayer; // Add player prop for expo-video
  style?: any;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  videoType?: 'basic' | 'trackable' | 'trackableRandom' | 'interactive';
  isCompleted?: boolean;
  volume?: number;
  playbackSpeed?: number;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
  onClose?: () => void;
  // Question-related props
  currentQuestion?: Question | null;
  showQuestion?: boolean;
  onQuestionAnswer?: (answer: string) => void;
  onQuestionClose?: () => void;
  // Video title and author
  videoTitle?: string;
  videoAuthor?: string;
  // Fallback system props
  hasError?: boolean;
  isRetrying?: boolean;
  currentSourceIndex?: number;
  totalSources?: number;
  currentSourceUrl?: string;
}

export const ModernVideoPlayer: React.FC<ModernVideoPlayerProps> = ({
  videoId,
  videoUrl,
  posterUrl,
  isPlaying,
  currentTime,
  duration,
  canSeek,
  onPlayPause,
  onSeek,
  onTimeUpdate,
  onLoad,
  videoRef: externalVideoRef,
  player,
  style,
  onFullscreenChange,
  videoType = 'basic',
  isCompleted = false,
  volume = 1,
  playbackSpeed = 1,
  onVolumeChange,
  onSpeedChange,
  onClose,
  currentQuestion,
  showQuestion = false,
  onQuestionAnswer,
  onQuestionClose,
  videoTitle = '',
  videoAuthor = '...',
  // Fallback system props
  hasError = false,
  isRetrying = false,
  currentSourceIndex = 0,
  totalSources = 1,
  currentSourceUrl
}) => {
  const { colors } = useGlobalStyles();
  const internalVideoRef = useRef<VideoView>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dimensions, setDimensions] = useState({ width: screenWidth, height: screenHeight });
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto');
  const [isBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [milestonesTracked, setMilestonesTracked] = useState<number[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastVolume, setLastVolume] = useState(volume);
  const [lastPlaybackSpeed, setLastPlaybackSpeed] = useState(playbackSpeed);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);

  // Platform-specific orientation detection
  const getActualOrientation = useCallback(() => {
    const { width, height } = dimensions;
    // Add platform-specific logic for better detection
    if (Platform.OS === 'ios') {
      // iOS sometimes reports dimensions incorrectly during transition
      return width < height && !isFullscreen;
    } else {
      // Android is more reliable with dimensions
      return width < height;
    }
  }, [dimensions, isFullscreen]);
  
  const actualIsPortrait = getActualOrientation();
  
  // Responsive sizing based on screen dimensions
  const getResponsiveSize = useCallback((baseSize: number) => {
    const scaleFactor = Math.min(dimensions.width, dimensions.height) / 375; // Using iPhone SE as base
    return Math.round(baseSize * Math.min(scaleFactor, 1.5)); // Cap at 1.5x
  }, [dimensions]);
  
  // Animation values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  
  // Auto-hide controls after 3 seconds of inactivity
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Reset controls timer function
  const resetControlsTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);
  
  // Enhanced dimensions update with fullscreen awareness
  useEffect(() => {
    const updateDimensions = ({ window }: { window: { width: number; height: number } }) => {
      const { width, height } = window;
      const isLandscape = width > height;
      
      console.log('📱 Dimensions updated:', {
        width,
        height,
        isLandscape,
        isFullscreen,
        platform: Platform.OS
      });
      
      setDimensions({ width, height });
      
      // Update fullscreen state based on orientation if needed
      if (isFullscreen && !isLandscape) {
        console.log('⚠️ Fullscreen but not landscape - may need adjustment');
      }
      
      // Platform-specific handling for orientation changes
      if (Platform.OS === 'ios') {
        // iOS sometimes needs a forced re-render after orientation change
        setTimeout(() => {
          setDimensions({ width, height });
          console.log('✅ iOS dimensions force-updated');
        }, 150);
      }
      
      // Reset controls visibility after orientation change
      if (isFullscreen && isPlaying) {
        setShowControls(true);
        resetControlsTimer();
      }
    };

    // Initial dimensions
    updateDimensions({ window: Dimensions.get('window') });

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, [isFullscreen, isPlaying, resetControlsTimer]);
  
  // Load saved quality preference
  useEffect(() => {
    const loadQualityPreference = async () => {
      try {
        const savedQuality = await AsyncStorage.getItem('videoQuality');
        if (savedQuality && ['auto', 'high', 'data_saver'].includes(savedQuality)) {
          setSelectedQuality(savedQuality as VideoQuality);
        }
      } catch (error) {
        console.error('Error loading quality preference:', error);
      }
    };
    
    loadQualityPreference();
  }, []);
  
  // Handle initial orientation and cleanup
  useEffect(() => {
    // Initialize proper orientation state
    const initializeOrientation = async () => {
      try {
        if (!isFullscreen) {
          console.log('🔧 Initializing portrait orientation');
          await exitFullscreenOrientation();
          if (Platform.OS === 'android') {
            StatusBar.setHidden(false, 'slide');
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to initialize orientation:', error);
      }
    };
    
    initializeOrientation();
    
    // Cleanup on unmount - always return to portrait
    return () => {
      const cleanup = async () => {
        try {
          if (isFullscreen) {
            console.log('🧹 Cleaning up fullscreen state');
            await exitFullscreenOrientation();
            if (Platform.OS === 'android') {
              StatusBar.setHidden(false, 'slide');
            }
          }
        } catch (error) {
          console.warn('⚠️ Cleanup error:', error);
        }
      };
      cleanup();
    };
  }, [isFullscreen]);
  
  // Button handlers
  const handleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    // You can add API call here to save favorite status
    Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  }, [isFavorite]);
  

  const handleSettings = useCallback(() => {
    setShowQualityModal(true);
    setShowSpeedMenu(false); // Close speed menu if open
  }, []);
  
  const handleDownload = useCallback(() => {
    Alert.alert(
      'Download Video',
      'Video download feature will be available soon!',
      [{ text: 'OK' }]
    );
  }, []);
  
  const handleQualitySelect = useCallback(async (quality: VideoQuality) => {
    setSelectedQuality(quality);
    
    // Save preference to AsyncStorage
    try {
      await AsyncStorage.setItem('videoQuality', quality);
    } catch (error) {
      console.error('Error saving quality preference:', error);
    }
    
    // You can add API call here to update video quality
    const qualityNames = {
      'auto': 'Auto',
      'high': 'Higher quality',
      'data_saver': 'Data saver'
    };
    Alert.alert('Quality Changed', `Video quality set to: ${qualityNames[quality]}`);
  }, []);
  


  // Auto-hide controls animation
  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls, controlsOpacity]);

  // Reset timer when playing state changes
  useEffect(() => {
    if (isPlaying) {
      resetControlsTimer();
      if (!hasStarted) {
        VideoAnalytics.trackVideoPlaybackStarted(videoId, currentTime);
        setHasStarted(true);
      } else {
        VideoAnalytics.trackVideoPlaybackResumed(videoId, currentTime);
      }
    } else {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      setShowControls(true);
      if (hasStarted) {
        VideoAnalytics.trackVideoPlaybackPaused(videoId, currentTime, duration);
      }
    }
    
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isPlaying, resetControlsTimer, videoId, currentTime, duration, hasStarted]);

  // Handle video loading and buffering states
  useEffect(() => {
    // Set loading to false when video starts playing or has duration
    if (duration > 0 && currentTime >= 0) {
      setIsLoading(false);
    }
    
    // Handle buffering state changes
    if (isPlaying && currentTime > 0 && !isBuffering) {
      // Video is playing normally, not buffering
      setIsLoading(false);
    }
  }, [duration, currentTime, isPlaying, isBuffering]);

  // Track volume changes
  useEffect(() => {
    if (volume !== lastVolume && lastVolume !== volume) {
      VideoAnalytics.trackVideoVolumeChanged(videoId, lastVolume, volume);
      setLastVolume(volume);
    }
  }, [volume, lastVolume, videoId]);

  // Track playback speed changes
  useEffect(() => {
    if (playbackSpeed !== lastPlaybackSpeed && lastPlaybackSpeed !== playbackSpeed) {
      VideoAnalytics.trackVideoSpeedChanged(videoId, lastPlaybackSpeed, playbackSpeed);
      setLastPlaybackSpeed(playbackSpeed);
    }
  }, [playbackSpeed, lastPlaybackSpeed, videoId]);

  // Track video completion
  useEffect(() => {
    if (isCompleted && duration > 0) {
      VideoAnalytics.trackVideoPlaybackCompleted(videoId, duration, currentTime);
    }
  }, [isCompleted, videoId, duration, currentTime]);

  // Detect video end based on current time and duration
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const timeRemaining = duration - currentTime;
      const hasEnded = timeRemaining <= 0.5; // Consider ended if less than 0.5 seconds remaining
      
      if (hasEnded && !hasVideoEnded) {
        console.log('🎬 Video has ended - showing replay button');
        setHasVideoEnded(true);
        setShowControls(true); // Show controls when video ends
        VideoAnalytics.trackVideoPlaybackCompleted(videoId, duration, currentTime);
      } else if (!hasEnded && hasVideoEnded) {
        // Reset end state if video is seeked back
        setHasVideoEnded(false);
      }
    }
  }, [currentTime, duration, hasVideoEnded, videoId]);

  // Track progress milestones (25%, 50%, 75%)
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const progressPercentage = Math.round((currentTime / duration) * 100);
      const milestones = [25, 50, 75];
      
      milestones.forEach(milestone => {
        if (progressPercentage >= milestone && !milestonesTracked.includes(milestone)) {
          VideoAnalytics.trackVideoMilestoneReached(videoId, milestone, currentTime);
          setMilestonesTracked(prev => [...prev, milestone]);
        }
      });
    }
  }, [currentTime, duration, videoId, milestonesTracked]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (seekTime: number) => {
    console.log('🎯 ModernVideoPlayer handleSeek called:', {
      seekTime,
      canSeek,
      hasPlayer: !!player,
      hasOnSeek: !!onSeek,
      videoType,
      isCompleted
    });
    
    if (!canSeek) {
      console.log('🚫 Seeking blocked - canSeek is false');
      return;
    }

    // Always use the onSeek prop if available (preferred method)
    if (onSeek) {
      console.log('✅ Using onSeek prop to seek to:', seekTime);
      onSeek(seekTime);
      return;
    }

    // Fallback to direct player control
    if (player) {
      console.log('✅ Using player.currentTime to seek to:', seekTime);
      player.currentTime = seekTime;
    } else {
      console.warn('⚠️ No seek method available');
    }
  };

  const handleProgressBarPress = (event: any) => {
    console.log('🎯 Progress bar pressed:', {
      canSeek,
      duration,
      currentTime,
      videoType,
      isCompleted,
      hasLocationX: !!event?.nativeEvent?.locationX
    });
    
    if (!canSeek) {
      console.log('🚫 Seek blocked - Video type:', videoType, 'Completed:', isCompleted);
      // Show user feedback for why seeking is blocked
      if (videoType === 'trackable' || videoType === 'trackableRandom' || videoType === 'interactive') {
        console.log('ℹ️ Seeking blocked: Complete the video first to enable seeking');
      }
      return;
    }
    
    if (!event?.nativeEvent?.locationX || duration <= 0) {
      console.warn('⚠️ Invalid progress bar press event or duration');
      return;
    }
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = dimensions.width - (getResponsiveSize(40) * 2);
    const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekTime = seekPercentage * duration;
    
    console.log('🎯 Seeking to:', {
      locationX,
      progressBarWidth,
      seekPercentage: (seekPercentage * 100).toFixed(1) + '%',
      seekTime: seekTime.toFixed(1) + 's'
    });
    
    handleSeek(seekTime);
    resetControlsTimer();
  };

  const handleControlPress = () => {
    resetControlsTimer();
  };

  const handleVideoPress = () => {
    console.log('🎬 Video pressed - toggling controls:', !showControls);
    setShowControls(!showControls);
    if (!showControls) {
      resetControlsTimer();
    }
  };

  const handleReplay = () => {
    console.log('🔄 Replay button pressed - restarting video');
    
    // Track replay analytics with proper data
    VideoAnalytics.trackVideoReplayed(videoId, currentTime, duration, {
      video_type: videoType,
      was_completed: isCompleted,
      replay_from_time: currentTime,
      video_url: videoUrl || currentSourceUrl,
      platform: Platform.OS
    });
    
    // Reset video end state
    setHasVideoEnded(false);
    
    // Ensure video starts from the very beginning
    console.log('🔄 Seeking to start (0 seconds) for replay');
    handleSeek(0);
    
    // Small delay to ensure seek completes before starting playback
    setTimeout(() => {
      console.log('🔄 Starting playback after seek');
      if (!isPlaying) {
        onPlayPause(); // Start playing if not already playing
      }
      resetControlsTimer();
      
      // Track that video playback started from replay
      VideoAnalytics.trackVideoPlaybackStarted(videoId, 0, { 
        action: 'replay',
        video_type: videoType 
      });
    }, 100);
  };

  const progress = duration > 0 ? currentTime / duration : 0;
  
  // Debug progress calculation every 5 seconds
  useEffect(() => {
    const currentTimeSeconds = Math.floor(currentTime);
    if (currentTimeSeconds % 5 === 0 && currentTimeSeconds !== (window as any).lastUILoggedTime && currentTime > 0) {
      console.log('🎨 UI Progress Debug:', {
        currentTime,
        duration,
        progress: (progress * 100).toFixed(1) + '%',
        progressRaw: progress,
        isPlaying,
        propsReceived: {
          currentTime: typeof currentTime,
          duration: typeof duration,
          isPlaying: typeof isPlaying
        }
      });
      (window as any).lastUILoggedTime = currentTimeSeconds;
    }
  }, [currentTime, duration, progress, isPlaying]);

  // Handle fullscreen toggle with enhanced orientation switching
  const handleFullscreenToggle = useCallback(async () => {
    try {
      const newFullscreen = !isFullscreen;
      
      console.log('🔄 Fullscreen toggle:', {
        from: isFullscreen ? 'fullscreen' : 'portrait',
        to: newFullscreen ? 'fullscreen' : 'portrait',
        platform: Platform.OS
      });
      
      // Show controls during transition for better UX
      setShowControls(true);
      
      // Platform-specific pre-orientation change handling
      if (Platform.OS === 'ios') {
        // iOS needs a small delay for smoother transitions
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Update state first for immediate UI feedback
      setIsFullscreen(newFullscreen);
      
      // Switch orientation based on fullscreen state
      let orientationSuccess = false;
      if (newFullscreen) {
        console.log('📱 Entering fullscreen landscape mode');
        orientationSuccess = await enterFullscreenOrientation();
        // Hide status bar for immersive experience
        if (Platform.OS === 'android') {
          StatusBar.setHidden(true, 'slide');
        }
      } else {
        console.log('📱 Exiting to portrait mode');
        orientationSuccess = await exitFullscreenOrientation();
        // Show status bar when returning to portrait
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false, 'slide');
        }
      }
      
      // Handle orientation failure with better error recovery
      if (!orientationSuccess) {
        console.warn('⚠️ Orientation change failed, reverting state');
        setIsFullscreen(!newFullscreen);
        
        // Revert status bar state
        if (Platform.OS === 'android') {
          StatusBar.setHidden(!newFullscreen, 'slide');
        }
        
        Alert.alert(
          'Orientation Error',
          'Unable to change screen orientation. Please check your device settings or try rotating your device manually.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Notify parent component about fullscreen change
      onFullscreenChange?.(newFullscreen);
      
      // Enhanced platform-specific post-orientation handling
      const handlePostOrientation = () => {
        const { width, height } = Dimensions.get('window');
        setDimensions({ width, height });
        
        console.log('✅ Fullscreen transition completed:', {
          newDimensions: { width, height },
          isFullscreen: newFullscreen,
          isLandscape: width > height
        });
        
        // Reset controls timer after transition
        if (newFullscreen && isPlaying) {
          resetControlsTimer();
        }
      };
      
      if (Platform.OS === 'android') {
        // Android needs more time for layout updates
        setTimeout(handlePostOrientation, 300);
      } else {
        // iOS can handle it faster
        setTimeout(handlePostOrientation, 200);
      }
      
    } catch (error) {
      console.error('❌ Error toggling fullscreen:', error);
      
      // Revert state on error
      setIsFullscreen(!isFullscreen);
      
      Alert.alert(
        'Fullscreen Error',
        'An error occurred while changing fullscreen mode. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [isFullscreen, onFullscreenChange, isPlaying, resetControlsTimer]);
  
  // Enhanced Android back button handling
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        console.log('📱 Back button pressed in fullscreen - exiting to portrait');
        handleFullscreenToggle();
        return true; // Prevent default back behavior
      }
      return false; // Let default back behavior happen
    });
    
    return () => backHandler.remove();
  }, [isFullscreen, handleFullscreenToggle]);


  return (
    <View style={[styles.container, style, isFullscreen && styles.fullscreenContainer]}>
      {player && (
        <VideoView
          ref={videoRef}
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      )}
      
      {/* Video Loading/Buffering Overlay */}
      {(isLoading || isBuffering) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <View style={styles.spinner}>
              <Ionicons 
                name="reload" 
                size={getResponsiveSize(32)} 
                color="#fff" 
                style={styles.spinnerIcon}
              />
            </View>
            <Text style={[styles.loadingText, { fontSize: getResponsiveSize(14) }]}>
              {isLoading ? 'Loading video...' : 'Buffering...'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Dark overlay when controls are shown */}
      <Animated.View 
        style={[
          styles.darkOverlay,
          { opacity: controlsOpacity }
        ]}
        pointerEvents="none"
      />
      
      {/* Tap overlay to toggle controls */}
      <View 
        style={styles.tapOverlay} 
        pointerEvents={showControls ? 'none' : 'auto'}
      >
        <TouchableOpacity 
          style={styles.tapOverlay} 
          activeOpacity={1}
          onPress={handleVideoPress}
        />
      </View>
      
      {/* Controls Overlay */}
      <Animated.View 
        style={[
          styles.controlsOverlay,
          { opacity: controlsOpacity }
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Video Title and Author - Top Left */}
        <View style={styles.topControls}>
          <View style={styles.titleContainer}>
            <Text style={[styles.videoTitle, { fontSize: getResponsiveSize(20) }]} numberOfLines={2}>
              {videoTitle}
            </Text>
            <Text style={[styles.videoAuthor, { fontSize: getResponsiveSize(16) }]}>
              {videoAuthor}
            </Text>
          </View>
        </View>
        
        {/* Right Side Controls */}
        <View style={[styles.rightSideControls, actualIsPortrait && styles.rightSideControlsPortrait]}>
          {actualIsPortrait ? (
            <>
              <TouchableOpacity 
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(48),
                  height: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24)
                }]}
                onPress={async () => {
                  console.log('❌ Close button pressed - exiting fullscreen');
                  try {
                    // If in fullscreen, exit fullscreen first
                    if (isFullscreen) {
                      await handleFullscreenToggle();
                      // Small delay to ensure orientation change completes
                      setTimeout(() => {
                        onClose?.();
                      }, 300);
                    } else {
                      onClose?.();
                    }
                    handleControlPress();
                  } catch (error) {
                    console.error('❌ Error closing video player:', error);
                    onClose?.(); // Fallback close
                  }
                }}
              >
                <Ionicons name="close" size={getResponsiveSize(24)} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(48),
                  height: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24)
                }]}
                onPress={() => {
                  handleFavorite();
                  handleControlPress();
                }}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={getResponsiveSize(24)} 
                  color={isFavorite ? "#ff3b30" : "#000"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleSettings();
                  handleControlPress();
                }}
              >
                <Ionicons name="settings-outline" size={getResponsiveSize(22)} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(48),
                  height: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24)
                }]}
                onPress={() => {
                  handleFullscreenToggle();
                  handleControlPress();
                }}
              >
                <Ionicons name={isFullscreen ? "contract" : "expand"} size={getResponsiveSize(24)} color="#000" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.landscapeControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleFullscreenToggle();
                  handleControlPress();
                }}
              >
                <Ionicons name={isFullscreen ? "contract" : "expand"} size={getResponsiveSize(22)} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.landscapeControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  onClose?.();
                  handleControlPress();
                }}
              >
                <Ionicons name="close" size={getResponsiveSize(22)} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.landscapeControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleFavorite();
                  handleControlPress();
                }}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={getResponsiveSize(22)} 
                  color={isFavorite ? "#ff3b30" : "#fff"} 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.landscapeControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleSettings();
                  handleControlPress();
                }}
              >
                <Ionicons name="settings" size={getResponsiveSize(20)} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.landscapeControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleDownload();
                  handleControlPress();
                }}
              >
                <Ionicons name="download" size={getResponsiveSize(20)} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Center Controls Container */}
        <View style={styles.centerControlsContainer}>
          {/* Skip Backward Button */}
          <TouchableOpacity 
            style={[styles.skipButton, {
              width: getResponsiveSize(56),
              height: getResponsiveSize(56),
              borderRadius: getResponsiveSize(28)
            }]}
            onPress={() => {
              const seekTime = Math.max(0, currentTime - 10);
              console.log('⏪ Skip backward pressed, seeking to:', seekTime);
              if (onSeek) {
                onSeek(seekTime);
              } else {
                console.warn('⚠️ onSeek prop not provided for skip backward');
              }
              handleControlPress();
            }}
          >
            <View style={styles.skipButtonInner}>
              <Ionicons name="refresh" size={getResponsiveSize(24)} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
              <Text style={[styles.skipText, { fontSize: getResponsiveSize(12) }]}>10</Text>
            </View>
          </TouchableOpacity>
          
          {/* Center Play/Pause/Replay Button */}
          <TouchableOpacity 
            style={styles.centerPlayButton}
            onPress={() => {
              if (hasVideoEnded) {
                console.log('🔄 Replay button pressed');
                handleReplay();
              } else {
                console.log('🎮 ModernVideoPlayer: Play/pause button pressed, current isPlaying:', isPlaying);
                console.log('🎮 ModernVideoPlayer: onPlayPause function type:', typeof onPlayPause);
                onPlayPause();
                handleControlPress();
              }
            }}
          >
            <View style={[styles.playButtonInner, {
              width: getResponsiveSize(70),
              height: getResponsiveSize(70),
              borderRadius: getResponsiveSize(35)
            }]}>
              <Ionicons 
                name={hasVideoEnded ? "refresh" : (isPlaying ? "pause" : "play")} 
                size={getResponsiveSize(40)} 
                color="#000" 
                style={{ marginLeft: (isPlaying && !hasVideoEnded) ? 0 : 4 }}
              />
            </View>
          </TouchableOpacity>
          
          {/* Skip Forward Button */}
          <TouchableOpacity 
            style={[styles.skipButton, {
              width: getResponsiveSize(56),
              height: getResponsiveSize(56),
              borderRadius: getResponsiveSize(28)
            }]}
            onPress={() => {
              const seekTime = Math.min(duration, currentTime + 10);
              console.log('⏩ Skip forward pressed, seeking to:', seekTime);
              if (onSeek) {
                onSeek(seekTime);
              } else {
                console.warn('⚠️ onSeek prop not provided for skip forward');
              }
              handleControlPress();
            }}
          >
            <View style={styles.skipButtonInner}>
              <Ionicons name="refresh" size={getResponsiveSize(24)} color="#fff" />
              <Text style={[styles.skipText, { fontSize: getResponsiveSize(12) }]}>10</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Progress Bar */}
          <TouchableOpacity 
            style={styles.progressContainer}
            onPress={handleProgressBarPress}
            activeOpacity={1}
          >
            <View style={styles.progressTrack}>
              <View style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
              ]} />
              <View style={[
                styles.progressThumb,
                { left: `${progress * 100}%` }
              ]} />
            </View>
          </TouchableOpacity>
          
          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { fontSize: getResponsiveSize(14) }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.durationText, { fontSize: getResponsiveSize(14) }]}>
              {formatTime(duration)}
            </Text>
          </View>
          
          {/* Video Quality Text */}
          <Text style={[styles.qualityText, { fontSize: getResponsiveSize(14) }]}>
            Video Quality: {selectedQuality === 'auto' ? 'Auto' : selectedQuality === 'high' ? 'High' : 'Data Saver'}
          </Text>
        </View>
        
       
      </Animated.View>
      
      {/* Speed Menu */}
      {showSpeedMenu && (
        <View style={[
          styles.speedMenu,
          isFullscreen && styles.fullscreenSpeedMenu
        ]}>
          <View style={[
            styles.speedMenuContainer,
            { backgroundColor: colors.surface.card }
          ]}>
            <Text style={[
              styles.speedMenuTitle,
              { color: colors.text.primary }
            ]}>Playback Speed</Text>
            {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
              <TouchableOpacity
                key={speed}
                style={styles.speedOption}
                onPress={() => {
                  onSpeedChange?.(speed);
                  setShowSpeedMenu(false);
                  handleControlPress();
                }}
              >
                <Text style={[
                  styles.speedOptionText,
                  { color: colors.text.primary }
                ]}>{speed}x</Text>
                {playbackSpeed === speed && (
                  <Ionicons name="checkmark" size={16} color={colors.brand.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Question Modal - Always on top */}
      <VideoQuestionModal
        visible={showQuestion}
        questions={currentQuestion ? [currentQuestion] : []}
        onAnswer={(questionId: string, answer: string) => {
          onQuestionAnswer?.(answer);
        }}
        onSubmitAll={(submissions: any[]) => {
          // Handle final submission if needed
          if (submissions.length > 0) {
            onQuestionAnswer?.(submissions[0].answer);
          }
        }}
        onClose={onQuestionClose}
        isFullscreen={!actualIsPortrait}
      />
      
      {/* Video Quality Modal */}
      <VideoQualityModal
        visible={showQualityModal}
        selectedQuality={selectedQuality}
        onQualitySelect={handleQualitySelect}
        onClose={() => setShowQualityModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
    elevation: 999, // For Android
    // Ensure fullscreen container covers everything
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  topControls: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    maxWidth: '70%',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoAuthor: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightSideControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -150 }],
    gap: 8,
    zIndex: 1000, // Ensure controls are above video
  },
  rightSideControlsPortrait: {
    top: 60,
    transform: [{ translateY: 0 }],
    right: 20, // Better positioning for portrait
  },
  landscapeControlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sideControlButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  centerPlayButton: {
    alignSelf: 'center',
  },
  playButtonInner: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipButtonInner: {
    alignItems: 'center',
  },
  skipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    position: 'absolute',
    bottom: -1,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    height: 40,
    justifyContent: 'center',
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -5,
    marginLeft: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  qualityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomRightControls: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  fullscreenButton: {
    marginLeft: 16,
    padding: 8,
  },
  speedMenu: {
    position: 'absolute',
    right: 20,
    top: 80,
    width: 150,
    zIndex: 20,
  },
  fullscreenSpeedMenu: {
    right: 30,
    top: 100,
  },
  speedMenuContainer: {
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  speedMenuTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  speedOptionText: {
    fontSize: 14,
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonInner: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 16,
    height: 16,
    justifyContent: 'space-between',
  },
  navSquare: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    margin: 1,
  },
  navCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Above video but below controls
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  spinnerIcon: {
    opacity: 0.9,
  },
  loadingText: {
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
