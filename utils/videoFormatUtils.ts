/**
 * Video format utilities for handling different streaming formats
 * Supports HLS, DASH, MPD, and standard video formats
 */

import { Platform } from 'react-native';

export enum VideoFormat {
  HLS = 'hls',
  DASH = 'dash',
  MPD = 'mpd',
  MP4 = 'mp4',
  WEBM = 'webm',
  MOV = 'mov',
  AVI = 'avi',
  MKV = 'mkv',
  UNKNOWN = 'unknown'
}

export interface VideoSource {
  uri: string;
  format: VideoFormat;
  headers?: { [key: string]: string };
  overrideFileExtensionAndroid?: string;
  shouldCache?: boolean;
}

/**
 * Detect video format from URL
 * @param url - Video URL
 * @returns VideoFormat
 */
export const detectVideoFormat = (url: string): VideoFormat => {
  if (!url) return VideoFormat.UNKNOWN;
  
  const urlLower = url.toLowerCase();
  
  // Enhanced HLS detection
  if (urlLower.includes('.m3u8') || 
      urlLower.includes('hls') || 
      urlLower.includes('/playlist.m3u8') ||
      urlLower.includes('/master.m3u8') ||
      urlLower.includes('/index.m3u8') ||
      urlLower.endsWith('.m3u8') ||
      urlLower.includes('m3u8?') ||
      urlLower.includes('application/vnd.apple.mpegurl') ||
      urlLower.includes('application/x-mpegurl')) {
    return VideoFormat.HLS;
  }
  
  // DASH detection
  if (urlLower.includes('.mpd') || urlLower.includes('dash') || urlLower.includes('/manifest.mpd')) {
    return VideoFormat.DASH;
  }
  
  // MPD detection (same as DASH but explicit)
  if (urlLower.endsWith('.mpd')) {
    return VideoFormat.MPD;
  }
  
  // Standard video formats
  if (urlLower.includes('.mp4') || urlLower.endsWith('.mp4')) {
    return VideoFormat.MP4;
  }
  
  if (urlLower.includes('.webm') || urlLower.endsWith('.webm')) {
    return VideoFormat.WEBM;
  }
  
  if (urlLower.includes('.mov') || urlLower.endsWith('.mov')) {
    return VideoFormat.MOV;
  }
  
  if (urlLower.includes('.avi') || urlLower.endsWith('.avi')) {
    return VideoFormat.AVI;
  }
  
  if (urlLower.includes('.mkv') || urlLower.endsWith('.mkv')) {
    return VideoFormat.MKV;
  }
  
  return VideoFormat.UNKNOWN;
};

/**
 * Create video source object with proper configuration for different formats
 * @param url - Video URL
 * @param customHeaders - Optional custom headers
 * @returns VideoSource
 */
export const createVideoSource = (url: string, customHeaders?: { [key: string]: string }): VideoSource => {
  const format = detectVideoFormat(url);
  
  const baseSource: VideoSource = {
    uri: url,
    format,
    headers: customHeaders || {},
  };
  
  // Configure based on format
  switch (format) {
    case VideoFormat.HLS:
      return {
        ...baseSource,
        headers: {
          'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, application/octet-stream',
          'Content-Type': 'application/vnd.apple.mpegurl',
          'User-Agent': 'ExpoVideoPlayer/1.0',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...customHeaders,
        },
        shouldCache: false, // HLS streams should not be cached
        overrideFileExtensionAndroid: 'm3u8', // Help Android recognize HLS format
      };
      
    case VideoFormat.DASH:
    case VideoFormat.MPD:
      return {
        ...baseSource,
        headers: {
          'Accept': 'application/dash+xml, video/mp4, application/octet-stream',
          ...customHeaders,
        },
        overrideFileExtensionAndroid: 'mpd',
        shouldCache: false, // DASH streams are typically not cached
      };
      
    case VideoFormat.MP4:
      return {
        ...baseSource,
        headers: {
          'Accept': 'video/mp4, application/octet-stream',
          ...customHeaders,
        },
        shouldCache: true,
      };
      
    case VideoFormat.WEBM:
      return {
        ...baseSource,
        headers: {
          'Accept': 'video/webm, application/octet-stream',
          ...customHeaders,
        },
        shouldCache: true,
      };
      
    default:
      return {
        ...baseSource,
        headers: {
          'Accept': 'video/*, application/octet-stream',
          ...customHeaders,
        },
        shouldCache: true,
      };
  }
};

/**
 * Check if format is a streaming format (HLS, DASH, MPD)
 * @param format - VideoFormat
 * @returns boolean
 */
export const isStreamingFormat = (format: VideoFormat): boolean => {
  return format === VideoFormat.HLS || format === VideoFormat.DASH || format === VideoFormat.MPD;
};

/**
 * Get format display name
 * @param format - VideoFormat
 * @returns string
 */
export const getFormatDisplayName = (format: VideoFormat): string => {
  switch (format) {
    case VideoFormat.HLS:
      return 'HLS Stream';
    case VideoFormat.DASH:
      return 'DASH Stream';
    case VideoFormat.MPD:
      return 'MPD Stream';
    case VideoFormat.MP4:
      return 'MP4 Video';
    case VideoFormat.WEBM:
      return 'WebM Video';
    case VideoFormat.MOV:
      return 'QuickTime Video';
    case VideoFormat.AVI:
      return 'AVI Video';
    case VideoFormat.MKV:
      return 'MKV Video';
    default:
      return 'Unknown Format';
  }
};

/**
 * Get recommended buffer configuration for different formats
 * @param format - VideoFormat
 * @returns object with buffer settings
 */
export const getBufferConfig = (format: VideoFormat) => {
  if (format === VideoFormat.HLS) {
    // Optimized buffer settings for HLS streams
    return {
      minBufferMs: 10000, // 10 seconds minimum buffer
      maxBufferMs: 60000, // 60 seconds maximum buffer
      bufferForPlaybackMs: 2000, // 2 seconds to start playback
      bufferForPlaybackAfterRebufferMs: 5000, // 5 seconds after rebuffer
      maxPlaylistAgeMs: 30000, // 30 seconds playlist age
      loadTimeout: 8000, // 8 seconds load timeout
    };
  }
  
  if (isStreamingFormat(format)) {
    return {
      minBufferMs: 15000,
      maxBufferMs: 50000,
      bufferForPlaybackMs: 2500,
      bufferForPlaybackAfterRebufferMs: 5000,
    };
  }
  
  return {
    minBufferMs: 5000,
    maxBufferMs: 30000,
    bufferForPlaybackMs: 1000,
    bufferForPlaybackAfterRebufferMs: 2000,
  };
};

/**
 * Check if URL is a valid HLS stream
 * @param url - Video URL to check
 * @returns Promise<boolean>
 */
export const validateHLSStream = async (url: string): Promise<{ isValid: boolean; message: string; variants?: any[] }> => {
  if (detectVideoFormat(url) !== VideoFormat.HLS) {
    return {
      isValid: false,
      message: 'URL is not an HLS stream'
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL',
        'User-Agent': 'ExpoVideoPlayer/1.0'
      }
    });
    
    if (!response.ok) {
      return {
        isValid: false,
        message: `HLS stream not accessible: ${response.status} ${response.statusText}`
      };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('mpegurl') && !contentType.includes('m3u8')) {
      return {
        isValid: false,
        message: `Invalid content type for HLS: ${contentType}`
      };
    }
    
    return {
      isValid: true,
      message: 'Valid HLS stream detected'
    };
  } catch (error: any) {
    return {
      isValid: false,
      message: `Failed to validate HLS stream: ${error.message}`
    };
  }
};

/**
 * Parse HLS manifest to get stream variants
 * @param url - HLS manifest URL
 * @returns Promise with stream variants info
 */
export const parseHLSManifest = async (url: string): Promise<{
  isValid: boolean;
  variants: Array<{
    bandwidth: number;
    resolution?: string;
    codecs?: string;
    url: string;
  }>;
  message: string;
}> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL',
        'User-Agent': 'ExpoVideoPlayer/1.0'
      }
    });
    
    if (!response.ok) {
      return {
        isValid: false,
        variants: [],
        message: `Failed to fetch manifest: ${response.status}`
      };
    }
    
    const manifestText = await response.text();
    const lines = manifestText.split('\n');
    const variants = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        // Parse stream info
        const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);
        const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
        const codecsMatch = line.match(/CODECS="([^"]+)"/);
        
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith('#')) {
          variants.push({
            bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
            resolution: resolutionMatch ? resolutionMatch[1] : undefined,
            codecs: codecsMatch ? codecsMatch[1] : undefined,
            url: nextLine.startsWith('http') ? nextLine : new URL(nextLine, url).href
          });
        }
      }
    }
    
    return {
      isValid: true,
      variants,
      message: `Found ${variants.length} stream variants`
    };
  } catch (error: any) {
    return {
      isValid: false,
      variants: [],
      message: `Failed to parse manifest: ${error.message}`
    };
  }
};

/**
 * Validate video URL format
 * @param url - Video URL
 * @returns object with validation result
 */
export const validateVideoUrl = (url: string): { isValid: boolean; format: VideoFormat; message: string } => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      format: VideoFormat.UNKNOWN,
      message: 'Invalid URL: URL is required and must be a string'
    };
  }
  
  try {
    new URL(url);
  } catch {
    return {
      isValid: false,
      format: VideoFormat.UNKNOWN,
      message: 'Invalid URL: URL format is not valid'
    };
  }
  
  const format = detectVideoFormat(url);
  
  if (format === VideoFormat.UNKNOWN) {
    return {
      isValid: true, // Still valid, just unknown format
      format,
      message: 'Warning: Unknown video format detected'
    };
  }
  
  return {
    isValid: true,
    format,
    message: `Valid ${getFormatDisplayName(format)} detected`
  };
};

/**
 * Generate fallback video sources for when primary source fails
 * @param originalUrl - Original video URL
 * @returns Array of VideoSource objects in priority order
 */
export const generateFallbackSources = (originalUrl: string): VideoSource[] => {
  const fallbackSources: VideoSource[] = [];
  
  // Add original source first
  fallbackSources.push(createVideoSource(originalUrl));
  
  try {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Generate format alternatives
    const baseUrl = url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    
    // Try HLS version
    const hlsUrl = `${baseUrl}/${filenameWithoutExt}.m3u8`;
    fallbackSources.push(createVideoSource(hlsUrl));
    
    // Try different MP4 qualities
    const mp4Variants = [
      `${baseUrl}/${filenameWithoutExt}_720p.mp4`,
      `${baseUrl}/${filenameWithoutExt}_480p.mp4`,
      `${baseUrl}/${filenameWithoutExt}_360p.mp4`
    ];
    
    mp4Variants.forEach(variantUrl => {
      fallbackSources.push(createVideoSource(variantUrl));
    });
    
    // Add local HLS fallback (platform-specific)
    const localHLSPath = Platform.OS === 'ios' 
      ? 'file://index.m3u8'
      : 'file:///android_asset/index.m3u8';
    
    fallbackSources.push({
      uri: localHLSPath,
      format: VideoFormat.HLS,
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL',
        'User-Agent': 'ExpoVideoPlayer/1.0'
      },
      shouldCache: false
    });
    
    // Add online test video as final fallback
    fallbackSources.push(createVideoSource('https://mux.com/test.m3u8'));
    
  } catch (error) {
    console.warn('Failed to generate fallback sources:', error);
  }
  
  return fallbackSources;
};

/**
 * Check if video format is reliable for playback
 * @param format - VideoFormat
 * @returns boolean indicating reliability
 */
export const isFormatReliable = (format: VideoFormat): boolean => {
  switch (format) {
    case VideoFormat.MP4:
    case VideoFormat.MOV:
      return true;
    case VideoFormat.HLS:
      return Platform.OS === 'ios' ? true : false; // HLS more reliable on iOS
    case VideoFormat.DASH:
    case VideoFormat.MPD:
      return Platform.OS === 'android' ? true : false; // DASH only on Android
    default:
      return false;
  }
};

/**
 * Test video format utilities including HLS validation
 */
export const testVideoFormatUtils = async () => {
  console.log('🧪 Testing Video Format Utilities...');
  
  const testUrls = [
    'https://example.com/video.m3u8',
    'https://example.com/master.m3u8',
    'https://example.com/playlist.m3u8?token=abc123',
    'https://example.com/video.mpd',
    'https://example.com/manifest.mpd',
    'https://example.com/video.mp4',
    'https://example.com/video.webm',
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'https://unknown-format-url',
  ];
  
  for (const url of testUrls) {
    const format = detectVideoFormat(url);
    const source = createVideoSource(url);
    const validation = validateVideoUrl(url);
    const bufferConfig = getBufferConfig(format);
    
    console.log(`\n📺 URL: ${url}`);
    console.log(`🏷️  Format: ${getFormatDisplayName(format)}`);
    console.log(`🌊 Is Streaming: ${isStreamingFormat(format)}`);
    console.log(`✅ Validation: ${validation.message}`);
    console.log(`⚡ Buffer Config:`, bufferConfig);
    
    // Test HLS-specific functionality
    if (format === VideoFormat.HLS) {
      console.log('🔍 Testing HLS-specific features...');
      try {
        const hlsValidation = await validateHLSStream(url);
        console.log(`🎬 HLS Validation: ${hlsValidation.message}`);
        
        if (hlsValidation.isValid) {
          const manifestInfo = await parseHLSManifest(url);
          console.log(`📋 Manifest: ${manifestInfo.message}`);
          if (manifestInfo.variants.length > 0) {
            manifestInfo.variants.forEach((variant, index) => {
              console.log(`   Variant ${index + 1}: ${variant.bandwidth}bps ${variant.resolution || 'Unknown'}`);
            });
          }
        }
      } catch (error: any) {
        console.log(`❌ HLS Test Error: ${error.message}`);
      }
    }
    
    console.log('─'.repeat(60));
  }
  
  console.log('✅ Video Format Utilities test completed');
};

/**
 * Validate if URL appears to be a legitimate video source from API
 * @param url - Video URL to validate
 * @returns validation result
 */
export const validateVideoUrlFromAPI = (url: string): { isValid: boolean; message: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, message: 'URL is required and must be a string' };
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { isValid: false, message: 'URL must start with http:// or https://' };
  }
  
  // Check for common test/placeholder domains that should not be used in production
  const testDomains = [
    'placeholder.com',
    'via.placeholder.com',
    'commondatastorage.googleapis.com/gtv-videos-bucket',
    'sample-videos.com',
    'picsum.photos'
  ];
  
  const urlDomain = url.toLowerCase();
  for (const testDomain of testDomains) {
    if (urlDomain.includes(testDomain)) {
      return { 
        isValid: false, 
        message: `URL appears to be test/placeholder data from ${testDomain}. Please use actual API video data.` 
      };
    }
  }
  
  return { isValid: true, message: 'URL appears valid' };
};
