import { VideoAnalytics } from '@/utils/analytics';
import {
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  initializePortraitOrientation,
  unlockOrientation
} from '@/utils/orientationUtils';
import { VideoFormat, createVideoSource, detectVideoFormat, generateFallbackSources, getBufferConfig, parseHLSManifest, validateHLSStream, validateVideoUrl } from '@/utils/videoFormatUtils';
import { useEventListener } from 'expo';
import { SourceLoadEventPayload, StatusChangeEventPayload, TimeUpdateEventPayload, VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ModernVideoPlayer } from './ModernVideoPlayer';

interface VideoPlayerProps {
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
  const [hlsValidation, setHlsValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [hlsManifest, setHlsManifest] = useState<any>(null);
  const [streamHealth, setStreamHealth] = useState<'checking' | 'healthy' | 'unhealthy' | 'unknown'>('unknown');
  const [shouldShowSafeArea, setShouldShowSafeArea] = useState(false);
  
  // URL validation guard
  const isValidVideoUrl = useMemo(() => {
    if (!videoUrl || typeof videoUrl !== 'string') {
      console.warn('⚠️ Invalid video URL provided:', videoUrl);
      return false;
    }
    
    try {
      const url = new URL(videoUrl);
      const isValid = url.protocol === 'http:' || url.protocol === 'https:';
      if (!isValid) {
        console.warn('⚠️ Invalid URL protocol:', url.protocol);
      }
      return isValid;
    } catch (error) {
      console.warn('⚠️ Malformed video URL:', videoUrl, error);
      return false;
    }
  }, [videoUrl]);
  
  // Fallback system state
  const [fallbackSources, setFallbackSources] = useState<any[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Internal time tracking for UI updates
  const [internalCurrentTime, setInternalCurrentTime] = useState(0);
  const [internalDuration, setInternalDuration] = useState(0);
  
  // Generate fallback sources when URL changes
  useEffect(() => {
    if (!isValidVideoUrl) {
      console.warn('⚠️ Skipping fallback generation for invalid URL:', videoUrl);
      setFallbackSources([]);
      setHasError(true);
      return;
    }
    
    const sources = generateFallbackSources(videoUrl);
    setFallbackSources(sources);
    setCurrentSourceIndex(0);
    setHasError(false);
    setIsRetrying(false);
    console.log('🔄 Generated fallback sources:', sources.length, 'sources');
    sources.forEach((source, index) => {
      console.log(`   ${index + 1}. ${source.format.toUpperCase()}: ${source.uri}`);
    });
  }, [videoUrl, isValidVideoUrl]);

  // Get current video source from fallback list
  const { videoSource, videoFormat } = useMemo(() => {
    if (fallbackSources.length === 0) {
      // Fallback to original source if no fallback sources generated
      console.log('🔧 Using original source (no fallbacks available):', videoUrl);
      const format = detectVideoFormat(videoUrl);
      const source = createVideoSource(videoUrl);
      return { videoSource: source, videoFormat: format };
    }
    
    const currentSource = fallbackSources[currentSourceIndex] || fallbackSources[0];
    console.log(`🔧 Using fallback source ${currentSourceIndex + 1}/${fallbackSources.length}:`, currentSource.uri);
    console.log('🔧 Source format:', currentSource.format);
    
    // Validate the current video URL
    const urlValidation = validateVideoUrl(currentSource.uri);
    if (!urlValidation.isValid) {
      console.error('❌ Invalid video URL detected:', urlValidation.message);
    }
    
    const bufferConfig = getBufferConfig(currentSource.format);
    console.log('🔧 Buffer configuration:', bufferConfig);
    
    // If it's HLS, apply optimized settings
    if (currentSource.format === VideoFormat.HLS) {
      console.log('🎬 Applying HLS optimizations');
      // Apply HLS-specific settings to the source
      (currentSource as any).metadata = {
        ...(currentSource as any).metadata,
        ...bufferConfig,
        allowExternalPlayback: true,
        allowsAirPlay: true,
      };
    }
    
    return { 
      videoSource: currentSource, 
      videoFormat: currentSource.format 
    };
  }, [fallbackSources, currentSourceIndex]);

  // Create video player instance with expo-video (only if URL is valid)
  const internalPlayer = useVideoPlayer(
    isValidVideoUrl ? videoSource : null, 
    (player) => {
    console.log('🎬 Initializing video player with source:', videoUrl);
    try {
      player.loop = false;
      player.muted = false;
      player.volume = volume;
      player.playbackRate = playbackSpeed;
      
      // Apply buffer configuration based on video format for better performance
      const bufferConfig = getBufferConfig(videoFormat);
      player.bufferOptions = {
        minBufferForPlayback: bufferConfig.minBufferMs / 1000, // Convert ms to seconds
        preferredForwardBufferDuration: bufferConfig.maxBufferMs / 1000, // Convert ms to seconds
        waitsToMinimizeStalling: true,
      };
      
      console.log('✅ Player initialized successfully with buffer config:', bufferConfig);
    } catch (error) {
      console.error('❌ Failed to initialize player:', error);
    }
  });
  
  // Use provided player or internal player
  const playerInstance = player || internalPlayer;

  // Track video player opened event
  useEffect(() => {
    if (videoUrl) {
      VideoAnalytics.trackVideoPlayerOpened(videoId, videoUrl);
    }
  }, [videoUrl, videoId]);

  // Handle play/pause state changes for analytics
  useEffect(() => {
    if (isPlaying && playerInstance) {
      VideoAnalytics.trackVideoPlaybackStarted(videoId, currentTime);
    } else if (!isPlaying && playerInstance) {
      VideoAnalytics.trackVideoPlaybackPaused(videoId, currentTime, duration);
    }
  }, [isPlaying, playerInstance, videoId, currentTime, duration]);

  // Track video load success
  useEffect(() => {
    if (playerInstance && playerInstance.status && playerInstance.status.duration) {
      const loadStartTime = Date.now();
      const loadEndTime = Date.now();
      const loadTime = loadEndTime - loadStartTime;
      VideoAnalytics.trackVideoLoadSuccess(videoId, loadTime);
    }
  }, [playerInstance, videoId]);
  
  // HLS validation and monitoring
  useEffect(() => {
    if (videoFormat === VideoFormat.HLS) {
      console.log('🔍 Starting HLS stream validation for:', videoUrl);
      setStreamHealth('checking');
      
      // Validate HLS stream
      validateHLSStream(videoUrl)
        .then((validation) => {
          console.log('✅ HLS validation result:', validation);
          setHlsValidation(validation);
          setStreamHealth(validation.isValid ? 'healthy' : 'unhealthy');
          
          // Parse manifest if validation is successful
          if (validation.isValid) {
            parseHLSManifest(videoUrl)
              .then((manifest) => {
                console.log('📋 HLS manifest parsed:', manifest);
                setHlsManifest(manifest);
              })
              .catch((error) => {
                console.warn('⚠️ Failed to parse HLS manifest:', error);
              });
          }
        })
        .catch((error) => {
          console.error('❌ HLS validation failed:', error);
          setHlsValidation({ isValid: false, message: error.message });
          setStreamHealth('unhealthy');
        });
    } else {
      setStreamHealth('unknown');
      setHlsValidation(null);
      setHlsManifest(null);
    }
  }, [videoUrl, videoFormat]);

  // Handle video player errors and try fallback sources
  const handleVideoError = useCallback((error: any) => {
    console.error('❌ Video playback error:', error);
    console.error('🔍 Error details:', {
      errorCode: error.code || 'UNKNOWN',
      errorMessage: error.message || 'Unknown error',
      videoFormat: videoFormat,
      videoSource: videoSource,
      videoUrl: fallbackSources[currentSourceIndex]?.uri || videoUrl
    });
    
    // Track error analytics
    const errorObj = error instanceof Error ? error : new Error(error.message || 'Unknown error');
    VideoAnalytics.trackVideoError(videoId, errorObj, {
      current_time_seconds: currentTime,
      video_format: videoFormat,
      source_index: currentSourceIndex,
      total_sources: fallbackSources.length,
      video_url: fallbackSources[currentSourceIndex]?.uri || videoUrl
    });
    
    // Log detailed error analysis
    console.error('📊 Video Source Analysis:', {
      url: fallbackSources[currentSourceIndex]?.uri || videoUrl,
      format: videoFormat,
      domain: new URL(fallbackSources[currentSourceIndex]?.uri || videoUrl).hostname,
      extension: (fallbackSources[currentSourceIndex]?.uri || videoUrl).split('.').pop(),
      isValidUrl: true,
      timestamp: new Date().toISOString()
    });
    
    console.error('🔍 Error Details for API Team:');
    console.error({
      errorCode: error.code || 'ERR_UNEXPECTED',
      errorMessage: error.message || 'Operation Stopped',
      errorType: error.constructor?.name || 'Unknown',
      stackTrace: error.stack || 'No stack trace available'
    });
    
    setHasError(true);
    
    // Try next fallback source if available
    if (currentSourceIndex < fallbackSources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      console.log(`🔄 Trying fallback source ${nextIndex + 1}/${fallbackSources.length}:`, fallbackSources[nextIndex]?.uri);
      setIsRetrying(true);
      setCurrentSourceIndex(nextIndex);
      setHasError(false);
      
      // Reset retry flag after a delay
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);
    } else {
      console.error('❌ All fallback sources exhausted. Video playback failed.');
      setIsRetrying(false);
    }
  }, [videoId, videoFormat, videoSource, fallbackSources, currentSourceIndex, videoUrl, currentTime]);

  // Add error event listener to player
  useEffect(() => {
    if (playerInstance) {
      const errorListener = (event: any) => {
        handleVideoError(event.error || event);
      };
      
      // Listen for error events
      playerInstance.addEventListener?.('error', errorListener);
      
      return () => {
        playerInstance.removeEventListener?.('error', errorListener);
      };
    }
  }, [playerInstance, handleVideoError]);

  // Validate player instance
  useEffect(() => {
    console.log('🔍 Player instance validation:', {
      hasPlayer: !!playerInstance,
      playerType: typeof playerInstance,
      playerStatus: playerInstance?.status,
      playerMethods: playerInstance ? Object.getOwnPropertyNames(Object.getPrototypeOf(playerInstance)) : []
    });
  }, [playerInstance]);

  // Manage SafeAreaView visibility based on player state and playback
  useEffect(() => {
    // Show SafeAreaView when:
    // 1. Player instance exists (video player is shown)
    // 2. Video is playing
    // 3. Video URL is valid
    const shouldShow = !!playerInstance && (isPlaying || !!videoUrl) && isValidVideoUrl;
    
    console.log('🛡️ SafeAreaView state update:', {
      shouldShow,
      hasPlayer: !!playerInstance,
      isPlaying,
      hasVideoUrl: !!videoUrl,
      isValidUrl: isValidVideoUrl
    });
    
    setShouldShowSafeArea(shouldShow);
  }, [playerInstance, isPlaying, videoUrl, isValidVideoUrl]);



  useEffect(() => {
    if (videoUrl) {
      console.log('🔄 Replacing video source:', videoUrl);
      console.log('🔧 Video source config:', videoSource);
      console.log('🔍 Video URL validation:', {
        isValidUrl: videoUrl.startsWith('http'),
        length: videoUrl.length,
        domain: videoUrl.split('/')[2],
        extension: videoUrl.split('.').pop(),
        format: videoFormat,
        isHLS: videoFormat === VideoFormat.HLS,
        isStreaming: [VideoFormat.HLS, VideoFormat.DASH, VideoFormat.MPD].includes(videoFormat)
      });
      
      // For HLS streams, provide additional logging and handling
      if (videoFormat === VideoFormat.HLS) {
        console.log('🎬 Loading HLS stream:', {
          validationStatus: streamHealth,
          hasManifest: !!hlsManifest,
          manifestVariants: hlsManifest?.variants?.length || 0
        });
        
        if (hlsValidation && !hlsValidation.isValid) {
          console.warn('⚠️ HLS validation failed, but attempting to load anyway:', hlsValidation.message);
        }
      }
      
      // Replace the source in the player asynchronously
      playerInstance.replaceAsync(videoSource)
        .then(() => {
          console.log('✅ Video source replaced successfully');
          if (videoFormat === VideoFormat.HLS) {
            console.log('🎬 HLS stream loaded successfully');
          }
        })
        .catch((error: any) => {
          console.error('❌ Failed to replace video source:', error);
          console.error('🔍 Error details:', {
            errorMessage: error.message,
            errorCode: error.code,
            videoUrl,
            videoFormat,
            videoSource
          });
          
          // Provide detailed error information for API data issues
          console.error('📊 Video Source Analysis:', {
            url: videoUrl,
            format: videoFormat,
            isValidUrl: videoUrl.startsWith('http'),
            domain: videoUrl.split('/')[2],
            extension: videoUrl.split('.').pop(),
            timestamp: new Date().toISOString()
          });
          
          // For HLS streams, provide specific troubleshooting
          if (videoFormat === VideoFormat.HLS) {
            console.error('🩺 HLS troubleshooting tips:');
            console.error('  - Check if the M3U8 manifest is accessible');
            console.error('  - Verify CORS headers are properly configured');
            console.error('  - Ensure the stream variants are valid');
            console.error('  - Check network connectivity and firewall settings');
            console.error('  - Validate the API response contains a valid video URL');
          }
          
          // Log specific error details for API debugging
          console.error('🔍 Error Details for API Team:', {
            errorType: error.constructor.name,
            errorMessage: error.message,
            errorCode: error.code,
            videoUrl,
            timestamp: new Date().toISOString(),
            stackTrace: error.stack
          });
        });
    }
  }, [videoUrl, playerInstance, videoSource, videoFormat, hlsValidation, hlsManifest, streamHealth]);

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
    const newFullscreen = !isFullscreen;
    console.log('📱 Fullscreen toggle requested:', newFullscreen);
    
    try {
      setIsFullscreen(newFullscreen);
      
      if (newFullscreen) {
        VideoAnalytics.trackVideoFullscreenEntered(videoId, currentTime);
        await enterFullscreenOrientation();
        console.log('📱 Entered fullscreen orientation');
        
        // Hide status bar for fullscreen
        if (Platform.OS === 'android') {
          StatusBar.setHidden(true, 'slide');
        }
      } else {
        VideoAnalytics.trackVideoFullscreenExited(videoId, currentTime, 0); // TODO: track actual fullscreen duration
        console.log('📱 Exiting fullscreen orientation...');
        await exitFullscreenOrientation();
        
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
  }, [isFullscreen, onFullscreenChange, videoId, currentTime]);

  // Handle play/pause with expo-video
  useEffect(() => {
    console.log('🎮 Play/pause useEffect triggered:', {
      isPlaying,
      hasPlayerInstance: !!playerInstance,
      playerStatus: playerInstance?.status,
      playerPlaying: playerInstance?.playing
    });
    
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
    // Update internal state for UI
    setInternalCurrentTime(payload.currentTime);
    setInternalDuration(playerInstance.duration);
    
    const progressData = {
      positionMillis: payload.currentTime * 1000,
      durationMillis: playerInstance.duration * 1000,
      isLoaded: true,
      isPlaying: playerInstance.playing
    };
    
    // Debug every timeUpdate event to see if it's firing
    console.log('⏱️ TimeUpdate Event:', {
      currentTime: payload.currentTime,
      duration: playerInstance.duration,
      progress: (payload.currentTime / playerInstance.duration * 100).toFixed(1) + '%',
      isPlaying: playerInstance.playing,
      onTimeUpdateCalled: true
    });
    
    onTimeUpdate(progressData);
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
    
    // Set initial duration in internal state
    setInternalDuration(payload.duration);
    
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

  // Handle seek functionality
  const handleSeek = useCallback(async (time: number) => {
    console.log('🎯 VideoPlayer handleSeek called:', {
      seekTime: time,
      currentTime,
      duration: playerInstance?.duration,
      playerStatus: playerInstance?.status
    });
    
    if (!playerInstance) {
      console.warn('⚠️ Cannot seek: No player instance');
      return;
    }
    
    try {
      // Convert seconds to milliseconds for expo-video
      const timeInMs = time * 1000;
      await playerInstance.seekByAsync(timeInMs);
      console.log('✅ Seek successful to:', time, 'seconds');
    } catch (error) {
      console.error('❌ Seek failed:', error);
    }
  }, [playerInstance, currentTime]);

  // Debug: Check video progress every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerInstance) {
        console.log('🔍 Video Progress Check:', {
          currentTime: playerInstance.currentTime,
          duration: playerInstance.duration,
          playing: playerInstance.playing,
          status: playerInstance.status,
          isPlaying: isPlaying
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [playerInstance, isPlaying]);

  // Show error state for invalid URLs
  if (!isValidVideoUrl) {
    const ErrorContent = (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid Video URL</Text>
          <Text style={styles.errorSubtext}>Please check the video source</Text>
        </View>
      </View>
    );
    
    return shouldShowSafeArea ? (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {ErrorContent}
      </SafeAreaView>
    ) : ErrorContent;
  }

  const VideoContent = (
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

      {/* Format Indicator */}
      {/* {videoFormat && videoFormat !== VideoFormat.UNKNOWN && (
        <View style={styles.formatIndicator}>
          <View style={[
            styles.formatBadge,
            { backgroundColor: videoFormat === VideoFormat.HLS ? '#4CAF50' : '#2196F3' }
          ]}>
            <Text style={styles.formatText}>
              {videoFormat === VideoFormat.HLS ? 'HLS' : videoFormat.toUpperCase()}
            </Text>
          </View>
          {videoFormat === VideoFormat.HLS && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: 
                streamHealth === 'healthy' ? '#4CAF50' : 
                streamHealth === 'unhealthy' ? '#FF5722' : 
                streamHealth === 'checking' ? '#FF9800' : '#9E9E9E' 
              }
            ]}>
              <Text style={styles.formatText}>
                {streamHealth === 'healthy' ? '✓' : 
                 streamHealth === 'unhealthy' ? '!' : 
                 streamHealth === 'checking' ? '⟳' : '?'}
              </Text>
            </View>
          )}
          {videoFormat === VideoFormat.HLS && hlsManifest && hlsManifest.variants && hlsManifest.variants.length > 0 && (
            <View style={[styles.statusBadge, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.formatText}>
                {hlsManifest.variants.length}
              </Text>
            </View>
          )}
        </View>
      )} */}

      {/* Modern Video Player Controls */}
      <ModernVideoPlayer
        videoId={videoId}
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        isPlaying={isPlaying}
        currentTime={internalCurrentTime || playerInstance?.currentTime || currentTime}
        duration={internalDuration || playerInstance?.duration || duration}
        canSeek={canSeek}
        videoType={videoType}
        isCompleted={isCompleted}
        volume={volume}
        playbackSpeed={playbackSpeed}
        onPlayPause={onPlayPause}
        onSeek={handleSeek}
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
        // Fallback system props
        hasError={hasError}
        isRetrying={isRetrying}
        currentSourceIndex={currentSourceIndex}
        totalSources={fallbackSources.length}
        currentSourceUrl={fallbackSources[currentSourceIndex]?.uri || videoUrl}
      />
    </View>
  );
  
  return shouldShowSafeArea ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {VideoContent}
    </SafeAreaView>
  ) : VideoContent;
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
    gap: 4,
  },
  formatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formatText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Urbanist',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
});
