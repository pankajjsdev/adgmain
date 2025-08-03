import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import {
  initializePortraitOrientation,
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  getCurrentOrientation,
  unlockOrientation
} from '@/utils/orientationUtils';

interface VideoPlayerProps {
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  canSeek: boolean;
  onPlayPause: () => void;
  onTimeUpdate: (status: any) => void;
  onLoad: (status: any) => void;
  videoRef?: React.RefObject<Video>;
  style?: any;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isPlaying,
  currentTime,
  duration,
  canSeek,
  onPlayPause,
  onTimeUpdate,
  onLoad,
  videoRef: externalVideoRef,
  style,
  onFullscreenChange
}) => {
  const { colors } = useGlobalStyles();
  const internalVideoRef = useRef<Video>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [originalOrientation, setOriginalOrientation] = useState<ScreenOrientation.Orientation | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying, videoRef]);

  // Initialize orientation to portrait on component mount
  useEffect(() => {
    const initializeOrientation = async () => {
      try {
        // Use cross-platform orientation utility
        const success = await initializePortraitOrientation();
        if (!success) {
          console.warn('Failed to initialize portrait orientation');
        }
        
        // Platform-specific status bar handling
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false);
          StatusBar.setBackgroundColor('#000000', true);
        }
      } catch (error) {
        console.warn('Failed to initialize orientation:', error);
      }
    };
    initializeOrientation();

    // Cleanup function to restore orientation on unmount
    return () => {
      const cleanup = async () => {
        try {
          await unlockOrientation();
          if (Platform.OS === 'android') {
            StatusBar.setHidden(false);
          }
        } catch (error) {
          console.warn('Failed to cleanup orientation:', error);
        }
      };
      cleanup();
    };
  }, []);

  // Enhanced fullscreen toggle with cross-platform optimization utilities
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Entering fullscreen - switch to landscape
        const currentOrientation = await getCurrentOrientation();
        setOriginalOrientation(currentOrientation);
        
        // Use cross-platform landscape orientation utility
        const success = await enterFullscreenOrientation();
        if (!success) {
          console.warn('Failed to enter fullscreen orientation');
          return;
        }
        
        // Hide status bar for immersive experience
        if (Platform.OS === 'android') {
          StatusBar.setHidden(true, 'slide');
        }
        
        setIsFullscreen(true);
        onFullscreenChange?.(true);
      } else {
        // Exiting fullscreen - return to portrait
        const success = await exitFullscreenOrientation();
        if (!success) {
          console.warn('Failed to exit fullscreen orientation');
        }
        
        // Show status bar again
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false, 'slide');
        }
        
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }
    } catch (error) {
      console.warn('Failed to toggle fullscreen orientation:', error);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoPress = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handleSeek = async (seekTime: number) => {
    if (canSeek && videoRef.current) {
      await videoRef.current.setPositionAsync(seekTime * 1000);
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (!canSeek) return;
    
    const { locationX } = event.nativeEvent;
    const progressBarWidth = screenWidth - 40; // Account for padding
    const seekPercentage = locationX / progressBarWidth;
    const seekTime = seekPercentage * duration;
    handleSeek(seekTime);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          onPlaybackStatusUpdate={(status: any) => {
            if (status.isLoaded) {
              onTimeUpdate(status);
              setIsBuffering(status.isBuffering);
              if (status.durationMillis && !duration) {
                onLoad(status);
              }
            }
          }}
          onLoad={onLoad}
        />

        {/* Video Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Play/Pause Button */}
            <TouchableOpacity 
              style={styles.playPauseButton}
              onPress={onPlayPause}
            >
              {isBuffering ? (
                <View style={styles.bufferingIndicator} />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={48} 
                  color={colors.text.inverse} 
                />
              )}
            </TouchableOpacity>

            {/* Fullscreen Button */}
            <TouchableOpacity 
              style={styles.fullscreenButton}
              onPress={toggleFullscreen}
            >
              <Ionicons 
                name={isFullscreen ? "contract" : "expand"} 
                size={24} 
                color={colors.text.inverse} 
              />
            </TouchableOpacity>

            {/* Seek Restriction Notice */}
            {!canSeek && (
              <View style={styles.restrictionNotice}>
                <Ionicons name="lock-closed" size={16} color={colors.status.warning} />
                <Text style={styles.restrictionText}>
                  Seeking disabled for this video type
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={[styles.timeText, { color: colors.text.secondary }]}>
          {formatTime(currentTime)}
        </Text>
        
        <TouchableOpacity 
          style={styles.progressBar}
          onPress={handleProgressBarPress}
          disabled={!canSeek}
        >
          <View style={[styles.progressTrack, { backgroundColor: colors.surface.tertiary }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.brand.primary,
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.timeText, { color: colors.text.secondary }]}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#fff',
    borderTopColor: 'transparent',
    // Add rotation animation here if needed
  },
  restrictionNotice: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  restrictionText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 12,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});
