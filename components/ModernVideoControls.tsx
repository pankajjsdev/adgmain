import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ModernVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canSeek: boolean;
  isBuffering: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  videoType: 'basic' | 'trackable' | 'trackableRandom' | 'interactive';
  isCompleted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
  onControlsToggle: () => void;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
  volume?: number;
  playbackSpeed?: number;
}

export const ModernVideoControls: React.FC<ModernVideoControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  canSeek,
  isBuffering,
  isFullscreen,
  showControls,
  videoType,
  isCompleted,
  onPlayPause,
  onSeek,
  onFullscreen,
  onControlsToggle,
  onVolumeChange,
  onSpeedChange,
  volume = 1,
  playbackSpeed = 1,
}) => {
  const { colors, spacing } = useGlobalStyles();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  
  // Animation values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const progressBarScale = useRef(new Animated.Value(1)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const volumeSliderOpacity = useRef(new Animated.Value(0)).current;
  const speedMenuOpacity = useRef(new Animated.Value(0)).current;

  // Auto-hide controls animation
  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls, controlsOpacity]);

  // Volume slider animation
  useEffect(() => {
    Animated.timing(volumeSliderOpacity, {
      toValue: showVolumeSlider ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showVolumeSlider, volumeSliderOpacity]);

  // Speed menu animation
  useEffect(() => {
    Animated.timing(speedMenuOpacity, {
      toValue: showSpeedMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSpeedMenu, speedMenuOpacity]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoTypeInfo = () => {
    switch (videoType) {
      case 'basic':
        return { 
          icon: 'play-circle', 
          color: colors.status.success, 
          label: 'Basic',
          description: 'Full control available'
        };
      case 'trackable':
        return { 
          icon: 'eye', 
          color: colors.status.warning, 
          label: 'Trackable',
          description: canSeek ? 'Completed - seeking enabled' : 'Complete to enable seeking'
        };
      case 'trackableRandom':
        return { 
          icon: 'shuffle', 
          color: colors.status.info, 
          label: 'Random Q&A',
          description: canSeek ? 'Completed - seeking enabled' : 'Complete to enable seeking'
        };
      case 'interactive':
        return { 
          icon: 'chatbubbles', 
          color: colors.brand.primary, 
          label: 'Interactive',
          description: canSeek ? 'Completed - seeking enabled' : 'Answer questions to progress'
        };
      default:
        return { 
          icon: 'videocam', 
          color: colors.text.secondary, 
          label: 'Video',
          description: 'Loading...'
        };
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (!canSeek || duration === 0) return;

    const { locationX } = event.nativeEvent;
    const progressBarWidth = screenWidth - (spacing.base * 2) - 120; // Account for time labels
    const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
    
    // Animate progress bar feedback
    Animated.sequence([
      Animated.timing(progressBarScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(progressBarScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayPausePress = () => {
    onPlayPause();
    
    // Animate play button feedback
    Animated.sequence([
      Animated.timing(playButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const videoTypeInfo = getVideoTypeInfo();
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <Animated.View 
      style={[
        styles.controlsContainer,
        { opacity: controlsOpacity }
      ]}
      pointerEvents={showControls ? 'auto' : 'none'}
    >
      {/* Top Gradient Overlay */}
      <View style={styles.topGradient} pointerEvents="none" />

      {/* Bottom Gradient Overlay */}
      <View style={styles.bottomGradient} pointerEvents="none" />

      {/* Top Controls */}
      <View style={styles.topControls}>
        {/* Video Type Badge */}
        <View style={[styles.videoTypeBadge, { backgroundColor: videoTypeInfo.color }]}>
          <Ionicons 
            name={videoTypeInfo.icon as any} 
            size={16} 
            color={colors.text.inverse} 
          />
          <Text style={styles.videoTypeBadgeText}>{videoTypeInfo.label}</Text>
        </View>

        {/* Seeking Status */}
        {!canSeek && (
          <View style={styles.seekingRestriction}>
            <Ionicons 
              name="lock-closed" 
              size={14} 
              color={colors.status.warning} 
            />
            <Text style={styles.seekingRestrictionText}>
              {videoTypeInfo.description}
            </Text>
          </View>
        )}

        {/* Speed Control */}
        <TouchableOpacity
          style={styles.speedButton}
          onPress={() => setShowSpeedMenu(!showSpeedMenu)}
        >
          <Text style={styles.speedButtonText}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>

      {/* Center Play/Pause Button */}
      <View style={styles.centerControls}>
        {isBuffering ? (
          <View style={styles.bufferingContainer}>
            <Animated.View style={[styles.bufferingIndicator, { transform: [{ scale: playButtonScale }] }]}>
              <Ionicons name="reload" size={32} color={colors.text.inverse} />
            </Animated.View>
            <Text style={styles.bufferingText}>Buffering...</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
            <TouchableOpacity
              style={[styles.playPauseButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
              onPress={handlePlayPausePress}
              activeOpacity={0.8}
            >
              <View style={styles.playPauseButtonInner}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={colors.text.inverse}
                  style={isPlaying ? {} : { marginLeft: 4 }} // Adjust play icon position
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Progress Bar Container */}
        <Animated.View 
          style={[
            styles.progressContainer,
            { transform: [{ scaleY: progressBarScale }] }
          ]}
        >
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          
          <TouchableOpacity
            style={styles.progressBarContainer}
            onPress={handleProgressBarPress}
            disabled={!canSeek}
            activeOpacity={1}
          >
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: canSeek ? colors.brand.primary : colors.status.warning,
                  },
                ]}
              />
              {/* Progress Thumb */}
              <View
                style={[
                  styles.progressThumb,
                  {
                    left: `${Math.max(0, Math.min(100, progressPercentage))}%`,
                    backgroundColor: canSeek ? colors.brand.primary : colors.status.warning,
                    opacity: canSeek ? 1 : 0.7,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </Animated.View>

        {/* Control Buttons Row */}
        <View style={styles.controlButtonsRow}>
          {/* Volume Control */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowVolumeSlider(!showVolumeSlider)}
          >
            <Ionicons
              name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
              size={24}
              color={colors.text.inverse}
            />
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Completion Status */}
          {isCompleted && (
            <View style={styles.completionBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
              <Text style={styles.completionText}>Completed</Text>
            </View>
          )}

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Fullscreen Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onFullscreen}
          >
            <Ionicons
              name={isFullscreen ? 'contract' : 'expand'}
              size={24}
              color={colors.text.inverse}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Volume Slider Overlay */}
      <Animated.View
        style={[
          styles.volumeSliderOverlay,
          { opacity: volumeSliderOpacity }
        ]}
        pointerEvents={showVolumeSlider ? 'auto' : 'none'}
      >
        <View style={styles.volumeSliderContainer}>
          <Text style={styles.volumeLabel}>Volume</Text>
          <View style={styles.volumeSlider}>
            <View style={styles.volumeTrack}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${volume * 100}%`, backgroundColor: colors.brand.primary }
                ]}
              />
            </View>
          </View>
          <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
        </View>
      </Animated.View>

      {/* Speed Menu Overlay */}
      <Animated.View
        style={[
          styles.speedMenuOverlay,
          { opacity: speedMenuOpacity }
        ]}
        pointerEvents={showSpeedMenu ? 'auto' : 'none'}
      >
        <View style={styles.speedMenuContainer}>
          <Text style={styles.speedMenuTitle}>Playback Speed</Text>
          {speedOptions.map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                playbackSpeed === speed && styles.speedOptionActive
              ]}
              onPress={() => {
                onSpeedChange?.(speed);
                setShowSpeedMenu(false);
              }}
            >
              <Text
                style={[
                  styles.speedOptionText,
                  playbackSpeed === speed && { color: colors.brand.primary }
                ]}
              >
                {speed}x
              </Text>
              {playbackSpeed === speed && (
                <Ionicons name="checkmark" size={16} color={colors.brand.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Tap to Hide Controls */}
      <TouchableOpacity
        style={styles.tapToHideOverlay}
        onPress={onControlsToggle}
        activeOpacity={1}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    zIndex: 10,
  },
  videoTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  videoTypeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  seekingRestriction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 200,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  seekingRestrictionText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 6,
    opacity: 0.9,
  },
  speedButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playPauseButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingContainer: {
    alignItems: 'center',
  },
  bufferingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 12,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completionText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  volumeSliderOverlay: {
    position: 'absolute',
    left: 16,
    bottom: 120,
    width: 200,
    zIndex: 20,
  },
  volumeSliderContainer: {
    padding: 16,
    borderRadius: 12,
  },
  volumeLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  volumeSlider: {
    marginBottom: 8,
  },
  volumeTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  volumeFill: {
    height: 4,
    borderRadius: 2,
  },
  volumeValue: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  speedMenuOverlay: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 150,
    zIndex: 20,
  },
  speedMenuContainer: {
    padding: 16,
    borderRadius: 12,
  },
  speedMenuTitle: {
    color: '#fff',
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
  speedOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  speedOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  tapToHideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
