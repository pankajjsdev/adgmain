import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Question } from '@/types/video';
import { Ionicons } from '@expo/vector-icons';
import { VideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VideoQuestionModal } from './VideoQuestionModal';

const { width: screenWidth } = Dimensions.get('window');

interface ModernVideoPlayerProps {
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
  
  // Get screen dimensions for orientation detection
  const screenData = Dimensions.get('window');
  const isLandscape = screenData.width > screenData.height;
  
  // Animation values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  
  // Auto-hide controls after 3 seconds of inactivity
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    } else {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
      setShowControls(true);
    }
    
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [isPlaying, resetControlsTimer]);

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
    const progressBarWidth = isFullscreen ? screenWidth - 120 : screenWidth - 80;
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

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    const newFullscreen = !isFullscreen;
    setIsFullscreen(newFullscreen);
    onFullscreenChange?.(newFullscreen);
  };

  return (
    <View style={[styles.container, style]}>
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
        {/* Top Controls - Title and Right Actions */}
        <View style={styles.topControls}>
          <View style={styles.titleContainer}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {videoTitle}
            </Text>
            <Text style={styles.videoAuthor}>
              {videoAuthor}
            </Text>
          </View>
          
          <View style={styles.topRightControls}>
            <TouchableOpacity 
              style={styles.topControlButton}
              onPress={() => {
                onClose?.();
                handleControlPress();
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.topControlButton}
              onPress={handleControlPress}
            >
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.topControlButton}
              onPress={handleControlPress}
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
            {isLandscape && (
              <>
                <TouchableOpacity 
                  style={styles.topControlButton}
                  onPress={() => {
                    handleFullscreenToggle();
                    handleControlPress();
                  }}
                >
                  <Ionicons name="expand" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.topControlButton}
                  onPress={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    handleControlPress();
                  }}
                >
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.topControlButton}
                  onPress={handleControlPress}
                >
                  <Ionicons name="download-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {/* Center Controls Container */}
        <View style={styles.centerControlsContainer}>
          {/* Skip Backward Button - Only show in landscape */}
          {isLandscape && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => {
                if (canSeek) {
                  const seekTime = Math.max(0, currentTime - 10);
                  handleSeek(seekTime);
                }
                handleControlPress();
              }}
            >
              <Ionicons name="play-skip-back" size={28} color="#fff" />
              <Text style={styles.skipText}>10</Text>
            </TouchableOpacity>
          )}
          
          {/* Center Play/Pause Button */}
          <TouchableOpacity 
            style={styles.centerPlayButton}
            onPress={() => {
              onPlayPause();
              handleControlPress();
            }}
          >
            <View style={styles.playButtonInner}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={36} 
                color="#000" 
                style={{ marginLeft: isPlaying ? 0 : 4 }}
              />
            </View>
          </TouchableOpacity>
          
          {/* Skip Forward Button - Only show in landscape */}
          {isLandscape && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => {
                if (canSeek) {
                  const seekTime = Math.min(duration, currentTime + 10);
                  handleSeek(seekTime);
                }
                handleControlPress();
              }}
            >
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
              <Text style={styles.skipText}>10</Text>
            </TouchableOpacity>
          )}
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
            <Text style={styles.timeText}>
              {formatTime(currentTime)}
            </Text>
            <Text style={styles.durationText}>
              {formatTime(duration)}
            </Text>
          </View>
          
          {/* Video Quality */}
          <Text style={styles.qualityText}>
            Video Quality: Auto
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
      
      {/* Question Modal */}
      <VideoQuestionModal
        visible={showQuestion}
        question={currentQuestion || null}
        onAnswer={onQuestionAnswer || (() => {})}
        onClose={onQuestionClose}
        isFullscreen={isLandscape}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: '20%',
    paddingBottom:'20%',
    paddingHorizontal: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 20,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  videoAuthor: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '400',
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  centerPlayButton: {
    alignSelf: 'center',
  },
  playButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomControls: {
    alignSelf: 'stretch',
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -4,
    marginLeft: -6,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  qualityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
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
});
