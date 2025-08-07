import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Question } from '@/types/video';
import { enterFullscreenOrientation, exitFullscreenOrientation } from '@/utils/orientationUtils';
import { VideoAnalytics } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Dimensions, Platform, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  videoTitle = 'Nadi Shodhana Pranayama',
  videoAuthor = 'by Joshna Ramakrishnan'
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferStartTime, setBufferStartTime] = useState<number | null>(null);
  const [lastTrackedTime, setLastTrackedTime] = useState(0);
  const [milestonesTracked, setMilestonesTracked] = useState<number[]>([]);
  const [fullscreenStartTime, setFullscreenStartTime] = useState<number | null>(null);
  const [lastSeekTime, setLastSeekTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [progressUpdateTimer, setProgressUpdateTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const [lastVolume, setLastVolume] = useState(volume);
  const [lastPlaybackSpeed, setLastPlaybackSpeed] = useState(playbackSpeed);

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
  
  // Handle dimension changes
  useEffect(() => {
    const updateDimensions = ({ window }: { window: { width: number; height: number } }) => {
      const { width, height } = window;
      setDimensions({ width, height });
      
      // Platform-specific handling for orientation changes
      if (Platform.OS === 'ios') {
        // iOS sometimes needs a forced re-render after orientation change
        setTimeout(() => {
          setDimensions({ width, height });
        }, 100);
      }
    };

    // Initial dimensions
    updateDimensions({ window: Dimensions.get('window') });

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);
  
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
  
  // Handle initial orientation
  useEffect(() => {
    // Ensure we start in portrait mode unless already in fullscreen
    if (!isFullscreen) {
      exitFullscreenOrientation();
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (isFullscreen) {
        exitFullscreenOrientation();
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false);
        }
      }
    };
  }, [isFullscreen]);
  
  // Button handlers
  const handleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    // You can add API call here to save favorite status
    Alert.alert('Success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  }, [isFavorite]);
  
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this video: ${videoTitle}\n${videoAuthor}`,
        title: videoTitle,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [videoTitle, videoAuthor]);
  
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
    // Use player instance if available, otherwise try the ref method
    if (canSeek && player) {
      player.currentTime = seekTime;
    } else if (canSeek && videoRef.current && 'setPositionAsync' in videoRef.current) {
      // Fallback to ref method if player is not available
      // This maintains backward compatibility
      console.warn('Using deprecated setPositionAsync method');
      // @ts-ignore - for backward compatibility
      videoRef.current.setPositionAsync?.(seekTime * 1000);
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (!canSeek) return;
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = dimensions.width - (getResponsiveSize(40) * 2); // Account for padding
    const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekTime = seekPercentage * duration;
    handleSeek(seekTime);
    resetControlsTimer();
  };

  const handleControlPress = () => {
    resetControlsTimer();
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
    resetControlsTimer();
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Handle fullscreen toggle with orientation switching
  const handleFullscreenToggle = useCallback(async () => {
    try {
      const newFullscreen = !isFullscreen;
      
      // Platform-specific pre-orientation change handling
      if (Platform.OS === 'ios') {
        // iOS needs a small delay for smoother transitions
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Update state first for immediate UI feedback
      setIsFullscreen(newFullscreen);
      
      // Switch orientation based on fullscreen state
      let orientationSuccess = false;
      if (newFullscreen) {
        orientationSuccess = await enterFullscreenOrientation();
        // Hide status bar on Android
        if (Platform.OS === 'android') {
          StatusBar.setHidden(true);
        }
      } else {
        orientationSuccess = await exitFullscreenOrientation();
        // Show status bar on Android
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false);
        }
      }
      
      // Handle orientation failure
      if (!orientationSuccess) {
        console.warn('Orientation change failed, reverting state');
        setIsFullscreen(!newFullscreen);
        Alert.alert(
          'Orientation Error',
          'Unable to change screen orientation. Please check your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Notify parent component
      onFullscreenChange?.(newFullscreen);
      
      // Platform-specific post-orientation handling
      if (Platform.OS === 'android') {
        // Force a layout update on Android
        setTimeout(() => {
          const { width, height } = Dimensions.get('window');
          setDimensions({ width, height });
        }, 200);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      Alert.alert(
        'Fullscreen Error',
        'An error occurred while changing fullscreen mode.',
        [{ text: 'OK' }]
      );
    }
  }, [isFullscreen, onFullscreenChange]);
  
  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        handleFullscreenToggle();
        return true; // Prevent default back behavior
      }
      return false; // Let default back behavior happen
    });
    
    return () => backHandler.remove();
  }, [isFullscreen, handleFullscreenToggle]);

  return (
    <View style={[styles.container, style, isFullscreen && styles.fullscreenContainer]}>
      {/* Dark overlay when controls are shown */}
      <Animated.View 
        style={[
          styles.darkOverlay,
          { opacity: controlsOpacity }
        ]}
        pointerEvents="none"
      />
      
      {/* Tap overlay to toggle controls */}
      <TouchableOpacity 
        style={styles.tapOverlay} 
        activeOpacity={1}
        onPress={handleVideoPress}
      />
      
      {/* Controls Overlay */}
      <Animated.View 
        style={[
          styles.controlsOverlay,
          { opacity: controlsOpacity }
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Top Controls - Title */}
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
                onPress={() => {
                  onClose?.();
                  handleControlPress();
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
                  width: getResponsiveSize(48),
                  height: getResponsiveSize(48),
                  borderRadius: getResponsiveSize(24)
                }]}
                onPress={() => {
                  handleShare();
                  handleControlPress();
                }}
              >
                <Ionicons name="share-outline" size={getResponsiveSize(24)} color="#000" />
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
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleFullscreenToggle();
                  handleControlPress();
                }}
              >
                <Ionicons name={isFullscreen ? "contract" : "expand"} size={getResponsiveSize(22)} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sideControlButton, {
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  onClose?.();
                  handleControlPress();
                }}
              >
                <Ionicons name="close" size={getResponsiveSize(22)} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sideControlButton, {
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
                  handleShare();
                  handleControlPress();
                }}
              >
                <Ionicons name="share-outline" size={getResponsiveSize(22)} color="#000" />
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
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22)
                }]}
                onPress={() => {
                  handleDownload();
                  handleControlPress();
                }}
              >
                <Ionicons name="download-outline" size={getResponsiveSize(22)} color="#000" />
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
              handleSeek(seekTime);
              handleControlPress();
            }}
          >
            <View style={styles.skipButtonInner}>
              <Ionicons name="refresh" size={getResponsiveSize(24)} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
              <Text style={[styles.skipText, { fontSize: getResponsiveSize(12) }]}>10</Text>
            </View>
          </TouchableOpacity>
          
          {/* Center Play/Pause Button */}
          <TouchableOpacity 
            style={styles.centerPlayButton}
            onPress={() => {
              onPlayPause();
              handleControlPress();
            }}
          >
            <View style={[styles.playButtonInner, {
              width: getResponsiveSize(70),
              height: getResponsiveSize(70),
              borderRadius: getResponsiveSize(35)
            }]}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={getResponsiveSize(40)} 
                color="#000" 
                style={{ marginLeft: isPlaying ? 0 : 4 }}
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
              handleSeek(seekTime);
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
        
        {/* Bottom Navigation Controls */}
        {actualIsPortrait && (
          <View style={styles.bottomNavigation}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => {
                Alert.alert('Navigation', 'Overview button pressed');
                handleControlPress();
              }}
            >
              <View style={styles.navButtonInner}>
                <View style={styles.navIcon}>
                  <View style={styles.navSquare} />
                  <View style={styles.navSquare} />
                  <View style={styles.navSquare} />
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => {
                Alert.alert('Navigation', 'Home button pressed');
                handleControlPress();
              }}
            >
              <View style={styles.navButtonInner}>
                <View style={[styles.navCircle, {
                  width: getResponsiveSize(20),
                  height: getResponsiveSize(20),
                  borderRadius: getResponsiveSize(10)
                }]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => {
                if (onClose) {
                  onClose();
                } else {
                  Alert.alert('Navigation', 'Back button pressed');
                }
                handleControlPress();
              }}
            >
              <Ionicons name="chevron-back" size={getResponsiveSize(24)} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
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
        question={currentQuestion || null}
        onAnswer={onQuestionAnswer || (() => {})}
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
  },
  rightSideControlsPortrait: {
    top: 60,
    transform: [{ translateY: 0 }],
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
});
