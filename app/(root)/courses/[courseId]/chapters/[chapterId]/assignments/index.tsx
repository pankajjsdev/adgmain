import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy assignment data
const assignmentData = {
  '1': {
    '1': [
      {
        id: '1',
        title: 'Build a Simple Calculator App',
        description: 'Create a basic calculator app using React Native components. Implement addition, subtraction, multiplication, and division operations.',
        submissionDate: '2024-08-15',
        attachmentLink: 'https://example.com/assignment1.pdf',
        status: 'submitted',
        score: 85,
        maxScore: 100,
        dueDate: '2024-08-10',
      },
      {
        id: '2',
        title: 'Component Styling Exercise',
        description: 'Style React Native components using StyleSheet. Create a profile card with proper layout and styling.',
        submissionDate: null,
        attachmentLink: 'https://example.com/assignment2.pdf',
        status: 'pending',
        score: null,
        maxScore: 100,
        dueDate: '2024-08-20',
      },
    ]
  }
};

export default function AssignmentList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  const assignments = assignmentData[courseId as keyof typeof assignmentData]?.[chapterId as keyof typeof assignmentData['1']] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'overdue':
        return 'alert-circle';
      default:
        return 'document-text';
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

  const renderAssignment = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/assignments/${item.id}`)}
    >
      <View style={styles.assignmentHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.assignmentTitle} numberOfLines={2}>{item.title}</Text>
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

      <Text style={styles.assignmentDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.assignmentMeta}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.metaText}>Due: {formatDate(item.dueDate)}</Text>
        </View>
        
        {item.submissionDate && (
          <View style={styles.metaRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.metaText}>Submitted: {formatDate(item.submissionDate)}</Text>
          </View>
        )}

        {item.score !== null && (
          <View style={styles.metaRow}>
            <Ionicons name="trophy-outline" size={16} color="#FF9800" />
            <Text style={styles.metaText}>Score: {item.score}/{item.maxScore}</Text>
          </View>
        )}
      </View>

      <View style={styles.assignmentFooter}>
        <TouchableOpacity style={styles.attachmentButton}>
          <Ionicons name="document-attach-outline" size={16} color="#007AFF" />
          <Text style={styles.attachmentText}>View Instructions</Text>
        </TouchableOpacity>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <Text style={styles.headerSubtitle}>{assignments.length} assignments available</Text>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderAssignment}
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
  assignmentCard: {
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
  assignmentHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assignmentTitle: {
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
  assignmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  assignmentMeta: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 12,
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
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});
