import { apiGet } from '@/api';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { AssignmentAnalytics, trackScreenView } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AssignmentDetail {
  assignmentDuration: string;
  assignmentGrading: string;
  assignmentName: string;
  assignmentSolution: string;
  assignmentType: string;
  assignmentUIType: string;
  chapterId: string;
  courseId: string;
  endTime: string;
  fileType?: {
    askForExplaination: string;
    explainationType: string;
    isQuestionDownloadable: string;
    question: string;
    solution: string;
  };
  level: string;
  questions: any[];
  startTime: string;
  status: number;
  totalMarks: string;
  description?: string;
  requirements?: string[];
  submissionInstructions?: string;
  rubric?: RubricItem[];
  maxScore?: number;
}

interface RubricItem {
  criteria: string;
  points: number;
  description: string;
}

interface AssignmentSubmission {
  _id: string;
  assignmentId: string;
  courseId: string;
  createdAt: string;
  isSubmitted: string;
  score: number;
  status: number;
  submission: any;
  updatedAt: string;
  userId: string;
  vendorCode: string;
}

interface AssignmentDetailResponse {
  assignment: AssignmentDetail;
  submission: AssignmentSubmission;
}

export default function AssignmentDetail() {
  const router = useRouter();
  const { courseId, chapterId, assignmentId } = useLocalSearchParams<{
    courseId: string;
    chapterId: string;
    assignmentId: string;
  }>();

  // Store hooks
  const { styles: globalStyles, colors } = useGlobalStyles();

  // Local state
  const [assignmentDetail, setAssignmentDetail] = useState<AssignmentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'rubric' | 'submission'>('details');
  const [loadStartTime, setLoadStartTime] = useState<number>(Date.now());

  // Fetch assignment details on mount
  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
      trackScreenView('Assignment Detail Page');
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      
      // Track assignment opened
      AssignmentAnalytics.trackAssignmentOpened(
        assignmentId as string,
        'unknown', // Will be updated once we get the response
        {
          course_id: courseId,
          chapter_id: chapterId,
          load_start_time: startTime
        }
      );
      
      const response = await apiGet<AssignmentDetailResponse>(`/assignment/student/assignment/${assignmentId}`);
      
      if (response.data) {
        setAssignmentDetail(response.data);
        const loadTime = Date.now() - startTime;
        
        // Track successful load with assignment details
        AssignmentAnalytics.trackAssignmentLoadSuccess(
          assignmentId as string,
          loadTime,
          {
            assignment_type: response.data.assignment.assignmentType,
            assignment_ui_type: response.data.assignment.assignmentUIType,
            assignment_duration: response.data.assignment.assignmentDuration,
            total_marks: response.data.assignment.totalMarks,
            assignment_level: response.data.assignment.level,
            has_submission: !!response.data.submission,
            is_submitted: response.data.submission?.isSubmitted === 'true',
            course_id: courseId,
            chapter_id: chapterId
          }
        );
        
        // Track if assignment is expired
        const now = new Date();
        const endTime = new Date(response.data.assignment.endTime);
        if (now > endTime) {
          const timeExpired = Math.floor((now.getTime() - endTime.getTime()) / 1000);
          AssignmentAnalytics.trackAssignmentExpired(
            assignmentId as string,
            -timeExpired, // Negative to indicate already expired
            {
              assignment_type: response.data.assignment.assignmentType,
              expired_duration_seconds: timeExpired
            }
          );
        }
      } else {
        const error = new Error('Failed to load assignment details');
        setError('Failed to load assignment details');
        AssignmentAnalytics.trackAssignmentLoadFailed(
          assignmentId as string,
          error,
          {
            error_context: 'empty_response',
            course_id: courseId,
            chapter_id: chapterId
          }
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load assignment details';
      setError(errorMessage);
      
      // Track load failure
      AssignmentAnalytics.trackAssignmentLoadFailed(
        assignmentId as string,
        err,
        {
          error_context: 'api_call_failed',
          course_id: courseId,
          chapter_id: chapterId,
          load_duration_ms: Date.now() - startTime
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Time expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { text: 'Not Started', color: '#999' };
      case 1: return { text: 'In Progress', color: '#FFA500' };
      case 2: return { text: 'Submitted', color: '#4CAF50' };
      default: return { text: 'Unknown', color: '#999' };
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return '#2196F3';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#999';
    }
  };

  // Check if assignment is currently ongoing (between start and end time)
  const isAssignmentOngoing = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  // Get submission state and determine button/message to show
  const getSubmissionState = (assignment: AssignmentDetail, submission: AssignmentSubmission) => {
    const isOngoing = isAssignmentOngoing(assignment.startTime, assignment.endTime);
    const hasSubmissionData = submission.submission && (Array.isArray(submission.submission) ? submission.submission.length > 0 : Object.keys(submission.submission).length > 0);
    const isSubmitted = submission.isSubmitted === 'true';
    const isTestAssignment = assignment.assignmentUIType === 'test' || assignment.assignmentType === 'test';

    if (isSubmitted) {
      return {
        type: 'submitted',
        buttonText: 'View Assignment',
        statusText: isTestAssignment ? 'Test Submitted Successfully' : 'Assignment Submitted Successfully',
        subText: 'Results may be available soon',
        buttonAction: 'view',
        showButton: true
      };
    }

    if (!isOngoing) {
      return {
        type: 'expired',
        buttonText: 'Assignment Expired',
        statusText: 'Assignment Time Expired',
        subText: 'This assignment is no longer available',
        buttonAction: 'none',
        showButton: false
      };
    }

    if (hasSubmissionData) {
      return {
        type: 'continue',
        buttonText: 'Continue Assignment',
        statusText: 'Assignment In Progress',
        subText: 'You have saved progress. Continue where you left off.',
        buttonAction: 'continue',
        showButton: true
      };
    }

    return {
      type: 'start',
      buttonText: 'Start Assignment',
      statusText: 'Ready to Start',
      subText: 'Begin your assignment when ready.',
      buttonAction: 'start',
      showButton: true
    };
  };

  const handleDownloadFile = async (url: string, fileName: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        
        // Track successful file download
        AssignmentAnalytics.trackAssignmentFileDownload(
          assignmentId as string,
          fileName,
          fileName.split('.').pop() || 'unknown',
          {
            file_url: url,
            download_method: 'browser_open'
          }
        );
      } else {
        Alert.alert('Error', 'Cannot open file URL');
        
        // Track download error
        AssignmentAnalytics.trackAssignmentError(
          assignmentId as string,
          'file_download_failed',
          new Error('Cannot open file URL'),
          {
            file_name: fileName,
            file_url: url,
            error_reason: 'unsupported_url'
          }
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to download file');
      
      // Track download error
      AssignmentAnalytics.trackAssignmentError(
        assignmentId as string,
        'file_download_failed',
        err,
        {
          file_name: fileName,
          file_url: url,
          error_reason: 'exception_thrown'
        }
      );
    }
  };

  const handleSubmitAssignment = () => {
    Alert.alert(
      'Submit Assignment',
      'Are you sure you want to submit this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => console.log('Assignment submitted') }
      ]
    );
  };

  // Create theme-aware styles early
  const styles = createStyles({ colors });

  const renderLoading = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading assignment details...</Text>
      </View>
    </SafeAreaView>
  );

  const renderError = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAssignmentDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const renderDetailsTab = (assignment: AssignmentDetail) => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {assignment.description || 'No description available for this assignment.'}
      </Text>
      
      {assignment.requirements && assignment.requirements.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {assignment.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </>
      )}
      
      {assignment.submissionInstructions && (
        <>
          <Text style={styles.sectionTitle}>Submission Instructions</Text>
          <Text style={styles.instructionsText}>{assignment.submissionInstructions}</Text>
        </>
      )}
    </View>
  );

  const handleTabChange = (newTab: 'details' | 'rubric' | 'submission') => {
    const oldTab = activeTab;
    setActiveTab(newTab);
    
    // Track tab change
    AssignmentAnalytics.trackAssignmentTabChanged(
      assignmentId as string,
      oldTab,
      newTab,
      {
        assignment_type: assignmentDetail?.assignment.assignmentType,
        has_submission: !!assignmentDetail?.submission
      }
    );
    
    // Track rubric viewing specifically
    if (newTab === 'rubric') {
      AssignmentAnalytics.trackAssignmentRubricViewed(
        assignmentId as string,
        {
          has_rubric: !!(assignmentDetail?.assignment.rubric && assignmentDetail.assignment.rubric.length > 0),
          rubric_items_count: assignmentDetail?.assignment.rubric?.length || 0,
          max_score: assignmentDetail?.assignment.maxScore
        }
      );
    }
  };

  const renderRubricTab = (assignment: AssignmentDetail) => (
    <View style={styles.tabContent}>
      {assignment.rubric && assignment.rubric.length > 0 ? (
        <>
          {assignment.rubric.map((item, index) => (
            <View key={index} style={styles.rubricItem}>
              <View style={styles.rubricHeader}>
                <Text style={styles.rubricCriteria}>{item.criteria}</Text>
                <Text style={styles.rubricPoints}>{item.points} points</Text>
              </View>
              <Text style={styles.rubricDescription}>{item.description}</Text>
            </View>
          ))}
          {assignment.maxScore && (
            <View style={styles.totalPoints}>
              <Text style={styles.totalText}>Total Points: {assignment.maxScore}</Text>
            </View>
          )}
        </>
      ) : (
        <Text>No rubric available for this assignment.</Text>
      )}
    </View>
  );

  const renderSubmissionTab = (assignment: AssignmentDetail, submission: AssignmentSubmission) => (
    <View style={styles.tabContent}>
      {submission.isSubmitted === 'true' ? (
        <>
          <View style={styles.submissionStatus}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.submittedText}>Assignment Submitted</Text>
          </View>
          <Text style={styles.submissionDate}>
            Submitted on: {formatDate(submission.createdAt)}
          </Text>
          
          {submission.score !== undefined && assignment.maxScore && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {submission.score} / {assignment.maxScore} 
                ({Math.round((submission.score / assignment.maxScore) * 100)}%)
              </Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill, 
                    { width: `${(submission.score / assignment.maxScore) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}
          
          <View style={styles.feedbackContainer}>
            <Text style={styles.sectionTitle}>Instructor Feedback</Text>
            <Text style={styles.feedbackText}>
              {submission.submission?.feedback || 'No feedback available yet.'}
            </Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.submissionNote}>
            Please upload your assignment files or enter your submission below.
          </Text>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadText}>Upload Files</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmitAssignment}
          >
            <Text style={styles.submitButtonText}>Submit Assignment</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderTabContent = () => {
    if (!assignmentDetail) return null;
    
    const { assignment, submission } = assignmentDetail;
    
    switch (activeTab) {
      case 'details':
        return renderDetailsTab(assignment);
      case 'rubric':
        return renderRubricTab(assignment);
      case 'submission':
        return renderSubmissionTab(assignment, submission);
      default:
        return null;
    }
  };

  if (loading) return renderLoading();
  if (error) return renderError();
  if (!assignmentDetail) return null;

  const { assignment, submission } = assignmentDetail;
  const statusInfo = getStatusInfo(assignment.status);
  const levelColor = getLevelColor(assignment.level);

  // Tabs configuration
  const tabs = [
    { id: 'details', title: 'Details', icon: 'document-text-outline' },
    { id: 'rubric', title: 'Rubric', icon: 'list-outline' },
    { id: 'submission', title: 'Submission', icon: 'send-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assignment Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.assignmentTitle}>{assignment.assignmentName}</Text>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name="checkmark-circle" size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="school-outline" size={16} color={levelColor} />
              <Text style={[styles.levelText, { color: levelColor }]}>{assignment.level.charAt(0).toUpperCase() + assignment.level.slice(1)}</Text>
            </View>
          </View>
        </View>

        {assignment.fileType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Files & Resources</Text>
            
            {/* Question File */}
            {assignment.fileType.question && (
              <TouchableOpacity 
                style={styles.fileCard}
                onPress={() => handleDownloadFile(assignment.fileType!.question, 'Assignment Question')}
              >
                <View style={styles.fileInfo}>
                  <Ionicons name="document-outline" size={24} color="#007AFF" />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>Assignment Question</Text>
                    <Text style={styles.fileDescription}>PDF Document • Downloadable</Text>
                  </View>
                </View>
                <Ionicons name="download-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}

            {/* Solution File (if available) */}
            {assignment.fileType.solution && assignment.assignmentSolution === 'true' && submission.isSubmitted === 'true' && (
              <TouchableOpacity 
                style={styles.fileCard}
                onPress={() => handleDownloadFile(assignment.fileType!.solution, 'Assignment Solution')}
              >
                <View style={styles.fileInfo}>
                  <Ionicons name="bulb-outline" size={24} color="#4CAF50" />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>Assignment Solution</Text>
                    <Text style={styles.fileDescription}>PDF Document • Available after submission</Text>
                  </View>
                </View>
                <Ionicons name="download-outline" size={20} color="#4CAF50" />
              </TouchableOpacity>
            )}

            {/* Explanation Requirements */}
            {assignment.fileType.askForExplaination === 'yes' && (
              <View style={styles.explanationCard}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="chatbubble-outline" size={20} color="#FF9800" />
                  <Text style={styles.explanationTitle}>Explanation Required</Text>
                </View>
                <Text style={styles.explanationText}>
                  You need to provide an explanation with your submission.
                  {assignment.fileType.explainationType && (
                    ` Format: ${assignment.fileType.explainationType}`
                  )}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Submission Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Status</Text>
          <View style={styles.submissionCard}>
            <View style={styles.submissionHeader}>
              <Ionicons 
                name={(() => {
                  const state = getSubmissionState(assignment, submission);
                  switch (state.type) {
                    case 'submitted': return 'checkmark-circle';
                    case 'expired': return 'time-outline';
                    case 'continue': return 'play-circle';
                    default: return 'play-outline';
                  }
                })()} 
                size={24} 
                color={(() => {
                  const state = getSubmissionState(assignment, submission);
                  switch (state.type) {
                    case 'submitted': return '#4CAF50';
                    case 'expired': return '#F44336';
                    case 'continue': return '#FF9800';
                    default: return '#007AFF';
                  }
                })()} 
              />
              <Text style={styles.submissionStatus}>
                {getSubmissionState(assignment, submission).statusText}
              </Text>
            </View>
            
            <View style={styles.submissionDetails}>
              {getSubmissionState(assignment, submission).type === 'submitted' ? (
                <>
                  <Text style={styles.submissionText}>Submitted on: {formatDate(submission.updatedAt)}</Text>
                  {submission.score !== undefined && assignment.totalMarks && (
                    <>
                      <Text style={styles.submissionText}>Score: {submission.score}/{assignment.totalMarks}</Text>
                      {submission.score > 0 && (
                        <Text style={styles.submissionText}>
                          Percentage: {Math.round((submission.score / parseInt(assignment.totalMarks)) * 100)}%
                        </Text>
                      )}
                    </>
                  )}
                  <Text style={styles.submissionSubtext}>
                    {getSubmissionState(assignment, submission).subText}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.submissionText}>
                    {getSubmissionState(assignment, submission).subText}
                  </Text>
                  {getSubmissionState(assignment, submission).type === 'expired' && (
                    <Text style={styles.submissionSubtext}>
                      Assignment ended on: {formatDate(assignment.endTime)}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {(() => {
            const state = getSubmissionState(assignment, submission);
            
            if (!state.showButton) {
              return null;
            }
            
            switch (state.buttonAction) {
              case 'start':
                return (
                  <TouchableOpacity 
                    style={styles.startButton} 
                    onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/assignments/${assignmentId}/question`)}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#fff" />
                    <Text style={styles.startButtonText}>{state.buttonText}</Text>
                  </TouchableOpacity>
                );
              
              case 'continue':
                return (
                  <TouchableOpacity 
                    style={styles.continueButton} 
                    onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/assignments/${assignmentId}/question`)}
                  >
                    <Ionicons name="play-circle" size={20} color="#fff" />
                    <Text style={styles.continueButtonText}>{state.buttonText}</Text>
                  </TouchableOpacity>
                );
              
              case 'view':
                return (
                  <TouchableOpacity 
                    style={styles.viewSubmissionButton}
                    onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/assignments/${assignmentId}/question`)}
                  >
                    <Ionicons name="eye-outline" size={20} color="#007AFF" />
                    <Text style={styles.viewSubmissionButtonText}>{state.buttonText}</Text>
                  </TouchableOpacity>
                );
              
              default:
                return null;
            }
          })()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Create theme-aware styles function
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  titleSection: {
    padding: 20,
    backgroundColor: theme.colors.card,
  },
  assignmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  levelText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  section: {
    backgroundColor: theme.colors.card,
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContent: {
    backgroundColor: theme.colors.card,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  explanationCard: {
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    marginTop: 16,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  fileDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
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
  submissionCard: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  submissionDetails: {
    padding: 8,
  },
  submissionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  submissionSubtext: {
    fontSize: 14,
    color: '#999',
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
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  viewSubmissionButton: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewSubmissionButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionSection: {
    padding: 20,
    backgroundColor: theme.colors.card,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
