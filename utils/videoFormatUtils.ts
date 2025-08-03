/**
 * Video format utilities for handling different streaming formats
 * Supports HLS, DASH, MPD, and standard video formats
 */

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
  
  // HLS detection
  if (urlLower.includes('.m3u8') || urlLower.includes('hls') || urlLower.includes('/playlist.m3u8')) {
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
          ...customHeaders,
        },
        shouldCache: false, // HLS streams are typically not cached
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
 * Test video format utilities
 */
export const testVideoFormatUtils = () => {
  console.log('🧪 Testing Video Format Utilities...');
  
  const testUrls = [
    'https://example.com/video.m3u8',
    'https://example.com/video.mpd',
    'https://example.com/manifest.mpd',
    'https://example.com/playlist.m3u8',
    'https://example.com/video.mp4',
    'https://example.com/video.webm',
    'https://example.com/unknown-format',
  ];
  
  testUrls.forEach(url => {
    const format = detectVideoFormat(url);
    const source = createVideoSource(url);
    const validation = validateVideoUrl(url);
    
    console.log(`URL: ${url}`);
    console.log(`Format: ${getFormatDisplayName(format)}`);
    console.log(`Is Streaming: ${isStreamingFormat(format)}`);
    console.log(`Validation: ${validation.message}`);
    console.log('---');
  });
  
  console.log('✅ Video Format Utilities test completed');
};
