import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy test details data
const testDetailsData = {
  '1': {
    '1': {
      '1': {
        id: '1',
        title: 'React Native Basics Quiz',
        totalMarks: 50,
        duration: 30,
        questionCount: 25,
        status: 'completed',
        score: 42,
        attempts: 1,
        maxAttempts: 2,
        dueDate: '2024-08-12',
        completedDate: '2024-08-11',
        timeSpent: 28,
        instructions: [
          'Read each question carefully before answering',
          'You have 30 minutes to complete the test',
          'Each question carries 2 marks',
          'There is no negative marking',
          'You can attempt this test maximum 2 times',
          'Make sure you have a stable internet connection'
        ],
        topics: [
          'React Native Components',
          'State Management',
          'Props and State',
          'Navigation',
          'Styling with StyleSheet'
        ],
        results: {
          correctAnswers: 21,
          incorrectAnswers: 4,
          accuracy: 84,
          timeSpent: 28,
          breakdown: [
            { topic: 'React Native Components', score: 8, total: 10 },
            { topic: 'State Management', score: 6, total: 8 },
            { topic: 'Props and State', score: 4, total: 4 },
            { topic: 'Navigation', score: 2, total: 2 },
            { topic: 'Styling with StyleSheet', score: 2, total: 2 },
          ]
        }
      },
      '2': {
        id: '2',
        title: 'Component Architecture Test',
        totalMarks: 75,
        duration: 45,
        questionCount: 30,
        status: 'available',
        score: null,
        attempts: 0,
        maxAttempts: 3,
        dueDate: '2024-08-25',
        completedDate: null,
        timeSpent: null,
        instructions: [
          'This test covers advanced React Native concepts',
          'You have 45 minutes to complete the test',
          'Questions have varying marks (1-5 points each)',
          'Some questions may have multiple correct answers',
          'You can attempt this test maximum 3 times',
          'Review the study materials before attempting'
        ],
        topics: [
          'Component Lifecycle',
          'Custom Hooks',
          'Context API',
          'Performance Optimization',
          'Testing React Native Apps'
        ],
        results: null
      },
    }
  }
};

export default function TestDetails() {
  const { courseId, chapterId, testId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
    testId: string; 
  }>();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const test = testDetailsData[courseId as keyof typeof testDetailsData]
    ?.[chapterId as keyof typeof testDetailsData['1']]
    ?.[testId as keyof typeof testDetailsData['1']['1']];

  if (!test) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Test not found</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'available':
        return '#007AFF';
      case 'locked':
        return '#666';
      case 'overdue':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getScorePercentage = (score: number, totalMarks: number) => {
    return Math.round((score / totalMarks) * 100);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return '#8BC34A';
    if (percentage >= 70) return '#FF9800';
    if (percentage >= 60) return '#FF5722';
    return '#F44336';
  };

  const handleStartTest = () => {
    Alert.alert(
      'Start Test',
      `Are you ready to start "${test.title}"? You will have ${test.duration} minutes to complete it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => Alert.alert('Test Started', 'Test interface would open here') }
      ]
    );
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'information-circle-outline' },
    ...(test.status === 'completed' ? [{ id: 'results', title: 'Results', icon: 'bar-chart-outline' }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Test Information</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Questions</Text>
                <Text style={styles.infoValue}>{test.questionCount}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{test.duration} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="trophy-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Total Marks</Text>
                <Text style={styles.infoValue}>{test.totalMarks}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="refresh-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Attempts</Text>
                <Text style={styles.infoValue}>{test.attempts}/{test.maxAttempts}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Instructions</Text>
            {test.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Topics Covered</Text>
            <View style={styles.topicsContainer}>
              {test.topics.map((topic, index) => (
                <View key={index} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>

            <View style={styles.dueDateContainer}>
              <Ionicons name="calendar-outline" size={20} color="#FF9800" />
              <Text style={styles.dueDateText}>Due: {formatDate(test.dueDate)}</Text>
            </View>
          </View>
        );
      
      case 'results':
        if (!test.results) return null;
        
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreLabel}>Final Score</Text>
                <Text style={[
                  styles.finalScore, 
                  { color: getGradeColor(getScorePercentage(test.score!, test.totalMarks)) }
                ]}>
                  {test.score}/{test.totalMarks}
                </Text>
              </View>
              <Text style={styles.percentageText}>
                {getScorePercentage(test.score!, test.totalMarks)}% Accuracy
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${getScorePercentage(test.score!, test.totalMarks)}%`,
                      backgroundColor: getGradeColor(getScorePercentage(test.score!, test.totalMarks))
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>{test.results.correctAnswers}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
                <Text style={styles.statNumber}>{test.results.incorrectAnswers}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color="#FF9800" />
                <Text style={styles.statNumber}>{test.results.timeSpent}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Topic Breakdown</Text>
            {test.results.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownTopic}>{item.topic}</Text>
                  <Text style={styles.breakdownScore}>{item.score}/{item.total}</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill, 
                      { 
                        width: `${(item.score / item.total) * 100}%`,
                        backgroundColor: getGradeColor((item.score / item.total) * 100)
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}

            <View style={styles.completionInfo}>
              <Text style={styles.completionText}>
                Completed on: {formatDate(test.completedDate!)}
              </Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(test.status) }]}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Action Button */}
        {test.status === 'available' && test.attempts < test.maxAttempts && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  infoItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  topicChip: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  topicText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dueDateText: {
    fontSize: 16,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },
  scoreCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 12,
  },
  finalScore: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownTopic: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  breakdownScore: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  breakdownBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
  },
  completionInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completionText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  actionContainer: {
    padding: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
});
