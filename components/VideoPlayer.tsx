import { ModernVideoPlayer } from './ModernVideoPlayer';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import {
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  initializePortraitOrientation,
  unlockOrientation
} from '@/utils/orientationUtils';
import { createVideoSource } from '@/utils/videoFormatUtils';
import { VideoView, useVideoPlayer, TimeUpdateEventPayload, StatusChangeEventPayload, SourceLoadEventPayload } from 'expo-video';
import { useEventListener } from 'expo';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';

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
  videoRef?: React.RefObject<VideoView>;
  player?: any; // Add player prop
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
  currentQuestion?: any;
  showQuestion?: boolean;
  onQuestionAnswer?: (answer: string) => void;
  onQuestionClose?: () => void;
  // Video title and author
  videoTitle?: string;
  videoAuthor?: string;
}

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
  onSpeedChange,
  onClose,
  currentQuestion,
  showQuestion,
  onQuestionAnswer,
  onQuestionClose,
  videoTitle,
  videoAuthor,
  player
}) => {
  const internalVideoRef = useRef<VideoView>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Create properly configured video source
  const videoSource = useMemo(() => {
    console.log('🔧 Creating video source for URL:', videoUrl);
    const source = createVideoSource(videoUrl);
    console.log('🔧 Created video source:', source);
    return source;
  }, [videoUrl]);

  // Create video player instance with expo-video
  const internalPlayer = useVideoPlayer(videoSource, (player) => {
    console.log('🎬 Initializing video player with source:', videoUrl);
    try {
      player.loop = false;
      player.muted = false;
      player.volume = volume;
      player.playbackRate = playbackSpeed;
      console.log('✅ Player initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize player:', error);
    }
  });
  
  // Use provided player or internal player
  const playerInstance = player || internalPlayer;
  
  // Validate player instance
  useEffect(() => {
    console.log('🔍 Player instance validation:', {
      hasPlayer: !!playerInstance,
      playerType: typeof playerInstance,
      playerStatus: playerInstance?.status,
      playerMethods: playerInstance ? Object.getOwnPropertyNames(Object.getPrototypeOf(playerInstance)) : []
    });
  }, [playerInstance]);

  useEffect(() => {
    if (videoUrl) {
      console.log('🔄 Replacing video source:', videoUrl);
      console.log('🔧 Video source config:', videoSource);
      console.log('🔍 Video URL validation:', {
        isValidUrl: videoUrl.startsWith('http'),
        length: videoUrl.length,
        domain: videoUrl.split('/')[2],
        extension: videoUrl.split('.').pop(),
        format: videoSource.format
      });
      
      // Replace the source in the player asynchronously
      playerInstance.replaceAsync(videoSource)
        .then(() => {
          console.log('✅ Video source replaced successfully');
        })
        .catch((error: any) => {
          console.error('❌ Failed to replace video source:', error);
          console.error('🔍 Error details:', {
            errorMessage: error.message,
            errorCode: error.code,
            videoUrl,
            videoSource
          });
          
          // Try with a test video URL to verify player functionality
          const testUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
          console.log('🧪 Trying with test video URL:', testUrl);
          const testSource = createVideoSource(testUrl);
          
          playerInstance.replaceAsync(testSource)
            .then(() => {
              console.log('✅ Test video loaded successfully - player is working');
            })
            .catch((testError: any) => {
              console.error('❌ Test video also failed:', testError);
            });
        });
    }
  }, [videoUrl, playerInstance, videoSource]);

  // Initialize orientation when component mounts
  useEffect(() => {
    initializePortraitOrientation();
    
    return () => {
      const cleanupOrientation = async () => {
        try {
          await unlockOrientation();
          if (Platform.OS === 'android') {
            StatusBar.setHidden(false);
          }
        } catch (error) {
          console.warn('Failed to cleanup orientation:', error);
        }
      };
      
      cleanupOrientation();
    };
  }, []);

  // Enhanced fullscreen toggle with cross-platform optimization utilities
  const toggleFullscreen = useCallback(async () => {
    console.log('🔄 Toggling fullscreen mode...');
    
    try {
      const newFullscreen = !isFullscreen;
      setIsFullscreen(newFullscreen);
      
      if (newFullscreen) {
        console.log('📱 Entering fullscreen orientation...');
        const success = await enterFullscreenOrientation();
        if (!success) {
          console.warn('Failed to enter fullscreen orientation');
          return;
        }
        
        // Hide status bar for immersive experience
        if (Platform.OS === 'android') {
          StatusBar.setHidden(true, 'slide');
        }
      } else {
        console.log('📱 Exiting fullscreen orientation...');
        const success = await exitFullscreenOrientation();
        if (!success) {
          console.warn('Failed to exit fullscreen orientation');
        }
        
        // Show status bar again
        if (Platform.OS === 'android') {
          StatusBar.setHidden(false, 'slide');
        }
      }
      
      onFullscreenChange?.(newFullscreen);
      console.log('✅ Fullscreen mode toggled successfully');
    } catch (error) {
      console.error('❌ Error toggling fullscreen:', error);
    }
  }, [isFullscreen, onFullscreenChange]);

  // Handle play/pause with expo-video
  useEffect(() => {
    if (!playerInstance) {
      console.warn('⚠️ No player instance available');
      return;
    }
    
    console.log('🎮 Play/pause state changed:', { 
      isPlaying, 
      playerStatus: playerInstance.status,
      playerExists: !!playerInstance,
      hasPlayMethod: typeof playerInstance.play === 'function'
    });
    
    if (isPlaying) {
      console.log('▶️ Attempting to play video');
      try {
        if (typeof playerInstance.play === 'function') {
          playerInstance.play();
          console.log('✅ Play command sent successfully');
          
          // Additional fallback: if player is not playing after a short delay, try again
          setTimeout(() => {
            try {
              if (playerInstance && !playerInstance.playing && isPlaying) {
                console.log('🔄 Player not playing after delay, retrying...');
                if (typeof playerInstance.play === 'function') {
                  playerInstance.play();
                  console.log('✅ Retry play command sent');
                }
              }
            } catch (retryError) {
              console.error('❌ Retry play failed:', retryError);
            }
          }, 500);
        } else {
          console.error('❌ Player play method not available');
        }
      } catch (error) {
        console.error('❌ Failed to play video:', error);
      }
    } else {
      console.log('⏸️ Attempting to pause video');
      try {
        if (typeof playerInstance.pause === 'function') {
          playerInstance.pause();
          console.log('✅ Pause command sent successfully');
        } else {
          console.error('❌ Player pause method not available');
        }
      } catch (error) {
        console.error('❌ Failed to pause video:', error);
      }
    }
  }, [isPlaying, playerInstance]);

  // Handle volume changes
  useEffect(() => {
    playerInstance.volume = volume;
  }, [volume, playerInstance]);

  // Handle playback speed changes
  useEffect(() => {
    playerInstance.playbackRate = playbackSpeed;
  }, [playbackSpeed, playerInstance]);

  // Set up event listeners using useEventListener
  useEventListener(playerInstance, 'timeUpdate', (payload: TimeUpdateEventPayload) => {
    onTimeUpdate({
      positionMillis: payload.currentTime * 1000,
      durationMillis: playerInstance.duration * 1000,
      isLoaded: true,
      isPlaying: playerInstance.playing
    });
  });

  useEventListener(playerInstance, 'statusChange', (payload: StatusChangeEventPayload) => {
    console.log('🔄 Player status changed:', payload.status, {
      isLoaded: payload.status === 'readyToPlay',
      currentTime: playerInstance.currentTime,
      duration: playerInstance.duration,
      playing: playerInstance.playing
    });
    
    // If video is ready to play and we should be playing, ensure it starts
    if (payload.status === 'readyToPlay' && isPlaying && !playerInstance.playing) {
      console.log('🚀 Video ready, starting playback');
      setTimeout(() => {
        try {
          playerInstance.play();
          console.log('✅ Auto-play triggered after ready state');
        } catch (error) {
          console.error('❌ Failed to auto-play after ready:', error);
        }
      }, 100);
    }
  });

  useEventListener(playerInstance, 'sourceLoad', (payload: SourceLoadEventPayload) => {
    console.log('✅ Video source loaded successfully:', {
      duration: payload.duration,
      url: videoUrl,
      playerStatus: playerInstance.status,
      shouldPlay: isPlaying
    });
    
    onLoad({
      durationMillis: payload.duration * 1000,
      isLoaded: true
    });
    
    // If we should be playing when the source loads, trigger play
    if (isPlaying) {
      console.log('🎬 Source loaded, triggering play for auto-start');
      setTimeout(() => {
        try {
          playerInstance.play();
          console.log('✅ Auto-play triggered after source load');
        } catch (error) {
          console.error('❌ Failed to auto-play after source load:', error);
        }
      }, 200);
    }
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        ref={videoRef}
        player={playerInstance}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Modern Video Player Controls */}
      <ModernVideoPlayer
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        canSeek={canSeek}
        videoType={videoType}
        isCompleted={isCompleted}
        volume={volume}
        playbackSpeed={playbackSpeed}
        onPlayPause={onPlayPause}
        onTimeUpdate={onTimeUpdate}
        onLoad={onLoad}
        onFullscreenChange={toggleFullscreen}
        onVolumeChange={onVolumeChange}
        onSpeedChange={onSpeedChange}
        onClose={onClose}
        videoRef={videoRef}
        player={playerInstance}
        currentQuestion={currentQuestion}
        showQuestion={showQuestion}
        onQuestionAnswer={onQuestionAnswer}
        onQuestionClose={onQuestionClose}
        videoTitle={videoTitle}
        videoAuthor={videoAuthor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
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
