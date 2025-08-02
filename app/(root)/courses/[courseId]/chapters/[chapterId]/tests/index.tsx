import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy test data
const testData = {
  '1': {
    '1': [
      {
        id: '1',
        title: 'React Native Basics Quiz',
        totalMarks: 50,
        duration: 30, // in minutes
        questionCount: 25,
        status: 'completed',
        score: 42,
        attempts: 1,
        maxAttempts: 2,
        dueDate: '2024-08-12',
        completedDate: '2024-08-11',
        timeSpent: 28, // in minutes
      },
      {
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
      },
    ]
  }
};

export default function TestList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  const tests = testData[courseId as keyof typeof testData]?.[chapterId as keyof typeof testData['1']] || [];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'available':
        return 'play-circle';
      case 'locked':
        return 'lock-closed';
      case 'overdue':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
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

  const renderTest = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/tests/${item.id}`)}
    >
      <View style={styles.testHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.testTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.testStats}>
        <View style={styles.statItem}>
          <Ionicons name="help-circle-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.questionCount} Questions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.duration} Minutes</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={16} color="#666" />
          <Text style={styles.statText}>{item.totalMarks} Points</Text>
        </View>
      </View>

      {item.status === 'completed' && item.score !== null && (
        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={[
              styles.scoreValue, 
              { color: getGradeColor(getScorePercentage(item.score, item.totalMarks)) }
            ]}>
              {item.score}/{item.totalMarks} ({getScorePercentage(item.score, item.totalMarks)}%)
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${getScorePercentage(item.score, item.totalMarks)}%`,
                  backgroundColor: getGradeColor(getScorePercentage(item.score, item.totalMarks))
                }
              ]} 
            />
          </View>
        </View>
      )}

      <View style={styles.testMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.metaText}>Due: {formatDate(item.dueDate)}</Text>
        </View>
        
        {item.completedDate && (
          <View style={styles.metaRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.metaText}>Completed: {formatDate(item.completedDate)}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="refresh-outline" size={16} color="#666" />
          <Text style={styles.metaText}>
            Attempts: {item.attempts}/{item.maxAttempts}
          </Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: getStatusColor(item.status) + '10' }
          ]}
        >
          <Text style={[styles.actionButtonText, { color: getStatusColor(item.status) }]}>
            {item.status === 'completed' ? 'View Results' : 'Start Test'}
          </Text>
        </TouchableOpacity>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tests</Text>
        <Text style={styles.headerSubtitle}>{tests.length} tests available</Text>
      </View>

      <FlatList
        data={tests}
        renderItem={renderTest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  testCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testHeader: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  testTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  scoreSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  testMeta: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
