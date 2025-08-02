import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy assignment details data
const assignmentDetailsData = {
  '1': {
    '1': {
      '1': {
        id: '1',
        title: 'Build a Simple Calculator App',
        description: 'Create a basic calculator app using React Native components. The app should have a clean interface with buttons for numbers (0-9) and operations (+, -, *, /). Implement proper state management and handle edge cases like division by zero.',
        submissionDate: '2024-08-15',
        attachmentLink: 'https://example.com/assignment1.pdf',
        status: 'submitted',
        score: 85,
        maxScore: 100,
        dueDate: '2024-08-10',
        requirements: [
          'Use React Native functional components with hooks',
          'Implement proper state management for calculator operations',
          'Handle edge cases (division by zero, invalid operations)',
          'Create a clean and intuitive user interface',
          'Add proper error handling and validation',
          'Include comments in your code explaining key functionality'
        ],
        submissionInstructions: 'Submit your completed React Native project as a ZIP file. Include all source code, package.json, and a README file with setup instructions.',
        rubric: [
          { criteria: 'Functionality', points: 40, description: 'Calculator performs all basic operations correctly' },
          { criteria: 'Code Quality', points: 25, description: 'Clean, well-structured, and commented code' },
          { criteria: 'UI/UX Design', points: 20, description: 'Intuitive and visually appealing interface' },
          { criteria: 'Error Handling', points: 15, description: 'Proper handling of edge cases and errors' }
        ],
        feedback: 'Great work on the calculator app! Your implementation is solid and handles most edge cases well. The UI is clean and intuitive. Consider adding more advanced operations for extra credit.',
      },
      '2': {
        id: '2',
        title: 'Component Styling Exercise',
        description: 'Style React Native components using StyleSheet. Create a profile card component that displays user information with proper layout and styling.',
        submissionDate: null,
        attachmentLink: 'https://example.com/assignment2.pdf',
        status: 'pending',
        score: null,
        maxScore: 100,
        dueDate: '2024-08-20',
        requirements: [
          'Create a reusable ProfileCard component',
          'Use StyleSheet for all styling (no inline styles)',
          'Implement responsive design principles',
          'Include user avatar, name, bio, and contact information',
          'Add proper spacing and typography',
          'Use appropriate colors and visual hierarchy'
        ],
        submissionInstructions: 'Submit your ProfileCard component file along with a demo screen showing the component in use.',
        rubric: [
          { criteria: 'Component Structure', points: 30, description: 'Well-structured and reusable component' },
          { criteria: 'Styling Implementation', points: 35, description: 'Proper use of StyleSheet and responsive design' },
          { criteria: 'Visual Design', points: 25, description: 'Attractive and professional appearance' },
          { criteria: 'Code Organization', points: 10, description: 'Clean and organized code structure' }
        ],
        feedback: null,
      },
    }
  }
};

export default function AssignmentDetails() {
  const { courseId, chapterId, assignmentId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
    assignmentId: string; 
  }>();
  
  const [activeTab, setActiveTab] = useState('details');
  
  const assignment = assignmentDetailsData[courseId as keyof typeof assignmentDetailsData]
    ?.[chapterId as keyof typeof assignmentDetailsData['1']]
    ?.[assignmentId as keyof typeof assignmentDetailsData['1']['1']];

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Assignment not found</Text>
      </SafeAreaView>
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmission = () => {
    Alert.alert(
      'Submit Assignment',
      'Are you ready to submit your assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => Alert.alert('Success', 'Assignment submitted successfully!') }
      ]
    );
  };

  const tabs = [
    { id: 'details', title: 'Details', icon: 'information-circle-outline' },
    { id: 'rubric', title: 'Rubric', icon: 'list-outline' },
    { id: 'submission', title: 'Submission', icon: 'cloud-upload-outline' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{assignment.description}</Text>
            
            <Text style={styles.sectionTitle}>Requirements</Text>
            {assignment.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Submission Instructions</Text>
            <Text style={styles.instructionsText}>{assignment.submissionInstructions}</Text>
          </View>
        );
      
      case 'rubric':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Grading Rubric</Text>
            {assignment.rubric.map((item, index) => (
              <View key={index} style={styles.rubricItem}>
                <View style={styles.rubricHeader}>
                  <Text style={styles.rubricCriteria}>{item.criteria}</Text>
                  <Text style={styles.rubricPoints}>{item.points} pts</Text>
                </View>
                <Text style={styles.rubricDescription}>{item.description}</Text>
              </View>
            ))}
            <View style={styles.totalPoints}>
              <Text style={styles.totalText}>Total: {assignment.maxScore} points</Text>
            </View>
          </View>
        );
      
      case 'submission':
        return (
          <View style={styles.tabContent}>
            {assignment.status === 'submitted' ? (
              <View>
                <Text style={styles.sectionTitle}>Submission Status</Text>
                <View style={styles.submissionStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.submittedText}>Assignment Submitted</Text>
                </View>
                <Text style={styles.submissionDate}>
                  Submitted on: {formatDate(assignment.submissionDate!)}
                </Text>
                
                {assignment.score !== null && (
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>
                      Score: {assignment.score}/{assignment.maxScore}
                    </Text>
                    <View style={styles.scoreBar}>
                      <View 
                        style={[
                          styles.scoreFill, 
                          { width: `${(assignment.score / assignment.maxScore) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                {assignment.feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.sectionTitle}>Instructor Feedback</Text>
                    <Text style={styles.feedbackText}>{assignment.feedback}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Submit Assignment</Text>
                <Text style={styles.submissionNote}>
                  Due: {formatDate(assignment.dueDate)}
                </Text>
                
                <TouchableOpacity style={styles.uploadButton}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
                  <Text style={styles.uploadText}>Choose File to Upload</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmission}>
                  <Text style={styles.submitButtonText}>Submit Assignment</Text>
                </TouchableOpacity>
              </View>
            )}
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
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
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
  assignmentTitle: {
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
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    lineHeight: 22,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  rubricItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  rubricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rubricCriteria: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rubricPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  rubricDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  totalPoints: {
    padding: 16,
    backgroundColor: '#007AFF10',
    borderRadius: 8,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  submissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  submittedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  submissionDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  feedbackText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  submissionNote: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
});
