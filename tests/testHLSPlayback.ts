/**
 * Test HLS .m3u8 video playback functionality
 * This test verifies that the VideoPlayer correctly handles HLS streams
 */

import { createVideoSource, detectVideoFormat, getBufferConfig, VideoFormat } from '../utils/videoFormatUtils';

// Test various HLS URL formats
const testHLSUrls = [
  'https://example.com/video.m3u8',
  'https://example.com/playlist.m3u8',
  'https://example.com/master.m3u8',
  'https://example.com/index.m3u8',
  'https://example.com/stream.m3u8?token=abc123',
  'https://cdn.example.com/live/stream.m3u8',
  'https://example.com/vod/movie/playlist.m3u8',
  'https://example.com/video.3mu8', // Note: .3mu8 should be .m3u8
];

// Test correct HLS extensions
const correctHLSExtensions = [
  '.m3u8',
  'playlist.m3u8',
  'master.m3u8',
  'index.m3u8'
];

export const testHLSSupport = () => {
  console.log('🧪 Testing HLS .m3u8 Support');
  console.log('=' . repeat(60));
  
  // Test 1: Format Detection
  console.log('\n📋 Test 1: HLS Format Detection');
  testHLSUrls.forEach(url => {
    const format = detectVideoFormat(url);
    const isHLS = format === VideoFormat.HLS;
    console.log(`URL: ${url}`);
    console.log(`Detected Format: ${format}`);
    console.log(`Is HLS: ${isHLS ? '✅' : '❌'}`);
    
    // Note about .3mu8
    if (url.includes('.3mu8')) {
      console.log('⚠️  WARNING: .3mu8 should be .m3u8 (missing "8")');
    }
    console.log('---');
  });
  
  // Test 2: Video Source Creation
  console.log('\n📋 Test 2: HLS Video Source Configuration');
  const testUrl = 'https://example.com/video.m3u8';
  const source = createVideoSource(testUrl);
  console.log('Created source:', JSON.stringify(source, null, 2));
  
  // Test 3: Buffer Configuration
  console.log('\n📋 Test 3: HLS Buffer Configuration');
  const bufferConfig = getBufferConfig(VideoFormat.HLS);
  console.log('HLS Buffer Config:', JSON.stringify(bufferConfig, null, 2));
  
  // Test 4: Common HLS URL Patterns
  console.log('\n📋 Test 4: Common HLS URL Patterns');
  const commonPatterns = [
    '/hls/stream.m3u8',
    '/live/channel1/playlist.m3u8',
    '/vod/movies/title/master.m3u8',
    '/adaptive/index.m3u8',
    'https://cdn.example.com/hls/live/stream.m3u8',
    'https://streaming.example.com/event/main.m3u8'
  ];
  
  commonPatterns.forEach(pattern => {
    const format = detectVideoFormat(pattern);
    console.log(`Pattern: ${pattern} → ${format === VideoFormat.HLS ? '✅ HLS' : '❌ Not HLS'}`);
  });
  
  // Test 5: Edge Cases
  console.log('\n📋 Test 5: Edge Cases & Corrections');
  const edgeCases = [
    { url: 'https://example.com/video.3mu8', correct: 'https://example.com/video.m3u8', issue: 'Missing "8" in extension' },
    { url: 'https://example.com/video.m3u', correct: 'https://example.com/video.m3u8', issue: 'Missing "8" at end' },
    { url: 'https://example.com/videom3u8', correct: 'https://example.com/video.m3u8', issue: 'Missing dot separator' },
  ];
  
  edgeCases.forEach(({ url, correct, issue }) => {
    const format = detectVideoFormat(url);
    const correctFormat = detectVideoFormat(correct);
    console.log(`\nIncorrect: ${url}`);
    console.log(`Issue: ${issue}`);
    console.log(`Detected as: ${format}`);
    console.log(`Correct URL: ${correct}`);
    console.log(`Would detect as: ${correctFormat}`);
  });
  
  console.log('\n✅ HLS Support Test Complete');
  console.log('\n📌 Important Notes:');
  console.log('1. HLS URLs must end with .m3u8 (not .3mu8)');
  console.log('2. Common HLS filenames: playlist.m3u8, master.m3u8, index.m3u8');
  console.log('3. The VideoPlayer automatically detects and optimizes for HLS');
  console.log('4. HLS streams get special buffering and caching settings');
};

// Run the test
if (require.main === module) {
  testHLSSupport();
}