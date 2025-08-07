# HLS Video Support Guide

This guide covers the comprehensive HLS (HTTP Live Streaming) support integrated directly into the main VideoPlayer component in the ADG Classes video player system.

## 🎯 Overview

The VideoPlayer component now includes robust, integrated support for HLS streaming with:
- **Automatic format detection** for HLS streams (.m3u8 files)
- **Stream validation** and health checks  
- **Manifest parsing** to extract stream variants
- **Optimized buffering** for streaming content
- **Real-time monitoring** with visual indicators
- **Enhanced error handling** and debugging tools
- **Seamless integration** - no separate components needed

## 🔧 Components

### 1. Enhanced Video Format Utilities (`utils/videoFormatUtils.ts`)

#### Format Detection
```typescript
import { detectVideoFormat, VideoFormat } from '@/utils/videoFormatUtils';

const format = detectVideoFormat('https://example.com/video.m3u8');
// Returns: VideoFormat.HLS
```

#### HLS Stream Validation
```typescript
import { validateHLSStream } from '@/utils/videoFormatUtils';

const validation = await validateHLSStream('https://example.com/playlist.m3u8');
console.log(validation.isValid); // true/false
console.log(validation.message); // Detailed status message
```

#### Manifest Parsing
```typescript
import { parseHLSManifest } from '@/utils/videoFormatUtils';

const manifest = await parseHLSManifest('https://example.com/master.m3u8');
console.log(manifest.variants); // Array of stream variants with resolution, bandwidth, etc.
```

### 2. Enhanced Video Player (`components/VideoPlayer.tsx`)

The main VideoPlayer component now includes:
- **Automatic HLS detection** and validation
- **Format indicators** showing stream type and status
- **Enhanced error handling** with HLS-specific troubleshooting
- **Optimized loading** with validation before playback

```typescript
<VideoPlayer
  videoUrl="https://example.com/playlist.m3u8"
  isPlaying={true}
  // ... other props
/>
```

### 3. Specialized HLS Player (`components/HLSVideoPlayer.tsx`)

A dedicated component for HLS streams with advanced features:

```typescript
<HLSVideoPlayer
  videoUrl="https://example.com/stream.m3u8"
  autoValidateHLS={true}
  showHLSInfo={true}
  fallbackUrls={['https://backup1.m3u8', 'https://backup2.m3u8']}
  // ... other props
/>
```

#### Features:
- **Real-time validation** of HLS streams
- **Stream information display** with variants and quality options
- **Automatic fallback** to alternative streams
- **Test stream integration** for debugging

### 4. HLS Test Player (`components/HLSTestPlayer.tsx`)

A comprehensive testing component for HLS functionality:

```typescript
<HLSTestPlayer />
```

Features:
- **Multiple test URLs** including real HLS streams
- **Custom URL input** for testing any HLS stream
- **Real-time format detection** and validation
- **Settings panel** for configuration options
- **Debug tools** and format tests

## 🚀 Usage Examples

### Basic HLS Playback

```typescript
import { VideoPlayer } from '@/components/VideoPlayer';

const MyComponent = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  return (
    <VideoPlayer
      videoUrl="https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      canSeek={true}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onTimeUpdate={(status) => setCurrentTime(status.positionMillis / 1000)}
      onLoad={(status) => setDuration(status.durationMillis / 1000)}
    />
  );
};
```

### Advanced HLS with Validation

```typescript
import { HLSVideoPlayer } from '@/components/HLSVideoPlayer';

const AdvancedHLSPlayer = () => {
  return (
    <HLSVideoPlayer
      videoUrl="https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"
      autoValidateHLS={true}
      showHLSInfo={true}
      fallbackUrls={[
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      ]}
      onLoad={(status) => console.log('HLS stream loaded:', status)}
      onError={(error) => console.error('HLS stream error:', error)}
    />
  );
};
```

### Manual HLS Validation

```typescript
import { validateHLSStream, parseHLSManifest } from '@/utils/videoFormatUtils';

const checkHLSStream = async (url: string) => {
  try {
    // Validate the stream
    const validation = await validateHLSStream(url);
    console.log('Stream valid:', validation.isValid);
    
    if (validation.isValid) {
      // Parse manifest for details
      const manifest = await parseHLSManifest(url);
      console.log('Available variants:', manifest.variants);
      
      manifest.variants.forEach(variant => {
        console.log(`Quality: ${variant.resolution}, Bandwidth: ${variant.bandwidth}`);
      });
    }
  } catch (error) {
    console.error('HLS validation failed:', error);
  }
};
```

## ⚙️ Configuration

### Buffer Settings

HLS streams use optimized buffer settings:

```typescript
const hlsBufferConfig = {
  minBufferMs: 10000,        // 10 seconds minimum buffer
  maxBufferMs: 60000,        // 60 seconds maximum buffer
  bufferForPlaybackMs: 2000, // 2 seconds to start playback
  bufferForPlaybackAfterRebufferMs: 5000, // 5 seconds after rebuffer
  maxPlaylistAgeMs: 30000,   // 30 seconds playlist age
  loadTimeout: 8000,         // 8 seconds load timeout
};
```

### HTTP Headers

HLS requests include optimized headers:

```typescript
const hlsHeaders = {
  'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, application/octet-stream',
  'Content-Type': 'application/vnd.apple.mpegurl',
  'User-Agent': 'ExpoVideoPlayer/1.0',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};
```

## 🔍 Debugging and Testing

### Test URLs

The system includes several test URLs for HLS validation:

```typescript
import { getHLSTestUrls } from '@/utils/videoFormatUtils';

const testUrls = getHLSTestUrls();
// Returns array of working HLS test streams
```

### Format Testing

Run comprehensive format tests:

```typescript
import { testVideoFormatUtils } from '@/utils/videoFormatUtils';

// Run tests (check console for results)
await testVideoFormatUtils();
```

### Debug Logging

Enable detailed logging for HLS streams:

```typescript
// The video player automatically logs detailed information for HLS streams:
// 🔧 Creating video source for URL: [URL]
// 🔧 Detected video format: hls
// 🔍 Validating HLS stream: [URL]
// 🎬 HLS validation result: {isValid: true, message: "Valid HLS stream detected"}
// ✅ Video source replaced successfully
// 🎬 HLS stream loaded successfully
```

## 🩺 Troubleshooting

### Common Issues and Solutions

#### 1. HLS Stream Not Loading
**Symptoms**: Stream fails to load, shows error
**Solutions**:
- Check if the M3U8 manifest is accessible via browser
- Verify CORS headers are properly configured on the server
- Ensure the stream variants are valid and accessible
- Check network connectivity and firewall settings

#### 2. Stream Validation Fails
**Symptoms**: Validation returns `isValid: false`
**Solutions**:
- Verify the URL actually points to an HLS stream (.m3u8)
- Check if the stream server is responding correctly
- Ensure proper content-type headers are set on the server
- Test with known working streams first

#### 3. Poor Playback Quality
**Symptoms**: Buffering, stuttering, quality issues
**Solutions**:
- Check available bandwidth
- Verify stream variants have appropriate bitrates
- Ensure device supports the stream codecs
- Try adjusting buffer configuration

### HLS Validation Checklist

- [ ] URL ends with `.m3u8` or contains `m3u8` parameter
- [ ] Server responds with correct content-type
- [ ] CORS headers allow cross-origin requests
- [ ] Manifest file is properly formatted
- [ ] Stream variants are accessible
- [ ] Network connectivity is stable

## 🌐 Supported HLS Features

### ✅ Supported
- **Adaptive bitrate streaming**
- **Multiple quality variants**
- **Live and VOD streams**
- **Standard M3U8 manifests**
- **Cross-platform playback** (iOS/Android/Web)
- **Stream validation and health checks**
- **Automatic fallback mechanisms**

### ⚠️ Limitations
- **DRM-protected streams** require additional configuration
- **Advanced playlist features** (like discontinuities) may need special handling
- **Live stream DVR** functionality depends on manifest structure

## 🔮 Future Enhancements

Planned improvements for HLS support:

1. **Quality Selection UI** - Manual quality switching interface
2. **Advanced Analytics** - Detailed playback metrics and quality analytics
3. **DRM Support** - Integration with content protection systems
4. **Subtitle Support** - HLS subtitle track handling
5. **Advanced Caching** - Intelligent segment caching strategies

## 📚 Resources

- [HLS Specification (RFC 8216)](https://tools.ietf.org/html/rfc8216)
- [Apple HLS Authoring Guide](https://developer.apple.com/documentation/http_live_streaming)
- [Expo Video Documentation](https://docs.expo.dev/versions/latest/sdk/video/)

## 🎬 Example HLS Streams for Testing

```typescript
const testStreams = [
  // Apple Demo Stream
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  
  // Tears of Steel Demo
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  
  // Big Buck Bunny (MP4 for comparison)
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
];
```

This comprehensive HLS support ensures reliable streaming video playback across all platforms while providing detailed debugging and monitoring capabilities for optimal user experience.