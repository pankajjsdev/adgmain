import { ModernVideoControls } from './ModernVideoControls';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import {
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  getCurrentOrientation,
  initializePortraitOrientation,
  unlockOrientation
} from '@/utils/orientationUtils';
import {
  createVideoSource,
  detectVideoFormat,
  getFormatDisplayName,
  isStreamingFormat,
  validateVideoUrl,
  VideoFormat
} from '@/utils/videoFormatUtils';
import { ResizeMode, Video } from 'expo-av';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StatusBar, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
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
  // Enhanced props for modern controls
  videoType?: 'basic' | 'trackable' | 'trackableRandom' | 'interactive';
  isCompleted?: boolean;
  volume?: number;
  playbackSpeed?: number;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  style,
  onFullscreenChange,
  videoType = 'basic',
  isCompleted = false,
  volume = 1,
  playbackSpeed = 1,
  onVolumeChange,
  onSpeedChange
}) => {
  // const { colors } = useGlobalStyles(); // Not needed with modern controls
  const internalVideoRef = useRef<Video>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoFormat, setVideoFormat] = useState<VideoFormat>(VideoFormat.UNKNOWN);
  const [videoSource, setVideoSource] = useState<any>(null);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentSpeed, setCurrentSpeed] = useState(playbackSpeed);
  
  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const controlsOpacity = useRef(new Animated.Value(1)).current; // Not needed with modern controls

  // Auto-hide controls functionality
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000); // Hide after 4 seconds
  }, []);

  const toggleControlsVisibility = useCallback(() => {
    setShowControls(prev => !prev);
    if (!showControls) {
      resetControlsTimer();
    }
  }, [showControls, resetControlsTimer]);

  // Volume and speed handlers
  const handleVolumeChange = useCallback(async (newVolume: number) => {
    setCurrentVolume(newVolume);
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(newVolume);
    }
    onVolumeChange?.(newVolume);
  }, [onVolumeChange]);

  const handleSpeedChange = useCallback(async (newSpeed: number) => {
    setCurrentSpeed(newSpeed);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(newSpeed, true);
    }
    onSpeedChange?.(newSpeed);
  }, [onSpeedChange]);

  const handleSeekFromControls = useCallback(async (seekTime: number) => {
    if (canSeek && videoRef.current) {
      await videoRef.current.setPositionAsync(seekTime * 1000);
    }
  }, [canSeek]);

  console.log("🎥 VideoPlayer Debug:", {
    videoUrl,
    posterUrl,
    isPlaying,
    currentTime,
    duration
  });
  
  // Initialize video format and source when videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      const validation = validateVideoUrl(videoUrl);
      const format = detectVideoFormat(videoUrl);
      const source = createVideoSource(videoUrl);
      
      console.log(`🎥 Video Format: ${getFormatDisplayName(format)}`);
      console.log(`🔗 Video URL: ${videoUrl}`);
      console.log(`🖼️ Poster URL: ${posterUrl || 'No poster'}`);
      console.log(`✅ Validation: ${validation.message}`);
      console.log(`📡 Is Streaming: ${isStreamingFormat(format)}`);
      
      setVideoFormat(format);
      setVideoSource(source);
      
      if (!validation.isValid) {
        console.warn('⚠️ Video URL validation failed:', validation.message);
      }
    }
  }, [videoUrl, posterUrl]);
  
  // State to track if video is ready for playback control
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Enhanced play/pause control with proper video readiness check
  useEffect(() => {
    if (videoRef.current && isVideoReady) {
      if (isPlaying) {
        console.log('🎬 Starting video playback...');
        videoRef.current.playAsync().catch((error: any) => {
          console.error('❌ Failed to play video:', error);
        });
      } else {
        console.log('⏸️ Pausing video playback...');
        videoRef.current.pauseAsync().catch((error: any) => {
          console.error('❌ Failed to pause video:', error);
        });
      }
    } else {
      console.warn('⚠️ Video not ready for play/pause:', {
        refExists: !!videoRef.current,
        isVideoReady,
        isPlaying
      });
    }
  }, [isPlaying, isVideoReady]);

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
        // setOriginalOrientation(currentOrientation); // Commented out since variable is not used
        
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
          source={videoSource || { uri: videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false} // Let useEffect handle play/pause for better control
          isLooping={false}
          useNativeControls={false}
          // Add poster thumbnail support
          posterSource={posterUrl ? { uri: posterUrl } : undefined}
          usePoster={!!posterUrl}
          posterStyle={styles.video}
          // Enhanced configuration for streaming formats
          progressUpdateIntervalMillis={isStreamingFormat(videoFormat) ? 1000 : 500}
          positionMillis={undefined} // Let video player manage position
          // Additional props for better streaming support
          {...(isStreamingFormat(videoFormat) && {
            // Streaming-specific optimizations
            shouldCorrectPitch: true,
            volume: 1.0,
          })}
          onPlaybackStatusUpdate={(status: any) => {
            if (status.isLoaded) {
              onTimeUpdate(status);
              setIsBuffering(status.isBuffering);
              
              // Enhanced error handling for streaming formats
              if (status.error && isStreamingFormat(videoFormat)) {
                console.warn(`🚨 Streaming error for ${getFormatDisplayName(videoFormat)}:`, status.error);
              }
            }
          }}
          onLoad={(status: any) => {
            console.log('🎥 Video loaded successfully:', {
              duration: status.durationMillis,
              isLoaded: status.isLoaded,
              uri: status.uri,
              shouldAutoPlay: isPlaying
            });
            setIsVideoReady(true); // Mark video as ready for playback control
            
            // Auto-start playback if isPlaying prop is true
            if (isPlaying && videoRef.current) {
              setTimeout(() => {
                console.log('🎬 Auto-starting video after load...');
                videoRef.current?.playAsync().catch((error: any) => {
                  console.error('❌ Failed to auto-start video:', error);
                });
              }, 100);
            }
            
            if (onLoad) {
              onLoad(status);
            }
          }}
          onLoadStart={() => {
            console.log('🔄 Video loading started...');
            setIsVideoReady(false); // Reset readiness when loading starts
          }}
          onError={(error: any) => {
            console.error(`❌ Video load error for ${getFormatDisplayName(videoFormat)}:`, error);
            setIsVideoReady(false); // Reset readiness on error
          }}
          onReadyForDisplay={() => {
            console.log('✅ Video ready for display');
            setIsVideoReady(true); // Ensure video is marked ready when display is ready
          }}
        />

        {/* Modern Video Controls */}
        <ModernVideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          canSeek={canSeek}
          isBuffering={isBuffering}
          isFullscreen={isFullscreen}
          showControls={showControls}
          videoType={videoType}
          isCompleted={isCompleted}
          onPlayPause={onPlayPause}
          onSeek={handleSeekFromControls}
          onFullscreen={toggleFullscreen}
          onControlsToggle={toggleControlsVisibility}
          onVolumeChange={handleVolumeChange}
          onSpeedChange={handleSpeedChange}
          volume={currentVolume}
          playbackSpeed={currentSpeed}
        />
      </TouchableOpacity>
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
  formatIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formatText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
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
