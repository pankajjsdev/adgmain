import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { orientationIntegrationTest, TestResult } from '@/tests/orientationIntegrationTest';

/**
 * Quick orientation test component that can be embedded in any screen
 * for testing fullscreen orientation functionality
 */
export const QuickOrientationTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResults, setLastResults] = useState<TestResult[]>([]);

  const runQuickTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    Alert.alert('Testing', 'Running orientation tests...');
    
    try {
      const results = await orientationIntegrationTest.runFullTestSuite();
      setLastResults(results);
      
      const successRate = orientationIntegrationTest.getSuccessRate();
      const status = successRate >= 80 ? 'PASSED' : 'FAILED';
      
      Alert.alert(
        'Test Results',
        `${status}\nSuccess Rate: ${successRate.toFixed(1)}%\nPlatform: ${Platform.OS}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } catch (error) {
      Alert.alert('Test Error', `Failed to run tests: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = () => {
    if (lastResults.length === 0) return '#666';
    const successRate = orientationIntegrationTest.getSuccessRate();
    return successRate >= 80 ? '#34C759' : '#FF3B30';
  };

  const getStatusText = () => {
    if (lastResults.length === 0) return 'Not tested';
    const successRate = orientationIntegrationTest.getSuccessRate();
    return `${successRate.toFixed(1)}% success`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orientation Test</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runQuickTest}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Testing...' : 'Run Orientation Test'}
        </Text>
      </TouchableOpacity>
      
      {lastResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Last Test Results:</Text>
          {lastResults.slice(0, 3).map((result, index) => (
            <Text key={index} style={[styles.resultText, { color: result.success ? '#34C759' : '#FF3B30' }]}>
              {result.success ? '✅' : '❌'} {result.testName}
            </Text>
          ))}
          {lastResults.length > 3 && (
            <Text style={styles.moreText}>
              +{lastResults.length - 3} more tests
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 11,
    marginBottom: 2,
  },
  moreText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});
