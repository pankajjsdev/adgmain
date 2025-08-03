import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  initializePortraitOrientation,
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  getCurrentOrientation,
  isLandscapeOrientation,
  getStatusBarHeight,
  testOrientationFunctionality,
} from '@/utils/orientationUtils';

/**
 * Test screen to verify fullscreen orientation functionality
 * across Android and iOS platforms
 */
export const OrientationTestScreen: React.FC = () => {
  const [currentOrientation, setCurrentOrientation] = useState<string>('Unknown');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Update screen dimensions and orientation state
  useEffect(() => {
    const updateScreenInfo = async () => {
      const orientation = await getCurrentOrientation();
      const landscape = await isLandscapeOrientation();
      const dimensions = Dimensions.get('window');
      const sbHeight = getStatusBarHeight(landscape);

      setCurrentOrientation(orientation?.toString() || 'Unknown');
      setIsLandscape(landscape);
      setScreenDimensions(dimensions);
      setStatusBarHeight(sbHeight);
    };

    updateScreenInfo();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', () => {
      updateScreenInfo();
    });

    return () => subscription?.remove();
  }, []);

  // Test portrait initialization
  const testPortraitInit = async () => {
    const result = await initializePortraitOrientation();
    const message = `Portrait Init: ${result ? 'SUCCESS' : 'FAILED'}`;
    setTestResults(prev => [...prev, message]);
    Alert.alert('Test Result', message);
  };

  // Test fullscreen entry
  const testFullscreenEntry = async () => {
    const result = await enterFullscreenOrientation();
    if (result) {
      setIsFullscreen(true);
      if (Platform.OS === 'android') {
        StatusBar.setHidden(true, 'slide');
      }
    }
    const message = `Fullscreen Entry: ${result ? 'SUCCESS' : 'FAILED'}`;
    setTestResults(prev => [...prev, message]);
    Alert.alert('Test Result', message);
  };

  // Test fullscreen exit
  const testFullscreenExit = async () => {
    const result = await exitFullscreenOrientation();
    if (result) {
      setIsFullscreen(false);
      if (Platform.OS === 'android') {
        StatusBar.setHidden(false, 'slide');
      }
    }
    const message = `Fullscreen Exit: ${result ? 'SUCCESS' : 'FAILED'}`;
    setTestResults(prev => [...prev, message]);
    Alert.alert('Test Result', message);
  };

  // Run comprehensive test suite
  const runFullTestSuite = async () => {
    setTestResults([]);
    Alert.alert('Test Suite', 'Running comprehensive orientation tests...');
    
    await testOrientationFunctionality();
    
    // Test sequence: Portrait -> Landscape -> Portrait
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testPortraitInit();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testFullscreenEntry();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testFullscreenExit();
    
    Alert.alert('Test Suite', 'All tests completed! Check console for detailed logs.');
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orientation Test Screen</Text>
      <Text style={styles.platform}>Platform: {Platform.OS}</Text>
      
      {/* Current State Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Current State:</Text>
        <Text style={styles.infoText}>Orientation: {currentOrientation}</Text>
        <Text style={styles.infoText}>Is Landscape: {isLandscape ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>Is Fullscreen: {isFullscreen ? 'Yes' : 'No'}</Text>
        <Text style={styles.infoText}>
          Screen: {screenDimensions.width}x{screenDimensions.height}
        </Text>
        <Text style={styles.infoText}>Status Bar Height: {statusBarHeight}px</Text>
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testPortraitInit}>
          <Text style={styles.buttonText}>Test Portrait Init</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testFullscreenEntry}>
          <Text style={styles.buttonText}>Test Fullscreen Entry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testFullscreenExit}>
          <Text style={styles.buttonText}>Test Fullscreen Exit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={runFullTestSuite}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>Run Full Test Suite</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {index + 1}. {result}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  platform: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#34C759',
  },
  secondaryButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});
