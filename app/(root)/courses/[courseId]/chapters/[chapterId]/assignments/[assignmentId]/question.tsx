import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  TextInput,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from 'react-native-webview';
import { apiGet, apiPost } from '@/api';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useThemeStore from '@/store/themeStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AssignmentDetail {
  assignmentDuration: string;
  assignmentGrading: string;
  assignmentName: string;
  assignmentSolution: string;
  assignmentType: string; // "file" or "basic"
  assignmentUIType: string;
  chapterId: string;
  courseId: string;
  endTime: string;
  fileType?: {
    askForExplaination: string;
    explainationType: string;
    isQuestionDownloadable: string;
    question: string; // This contains the PDF URL
    solution: string;
  };
  level: string;
  questions: string[]; // Array of question IDs for basic type
  startTime: string;
  status: number;
  totalMarks: string;
  description?: string;
  requirements?: string[];
  submissionInstructions?: string;
}

interface QuestionData {
  _id: string;
  askForExplaination: string;
  assignmentId: string;
  correct?: string; // For SCQ questions
  explainationType: string;
  meta: {
    chapterTags: string[];
    questionTags: string[];
  };
  options?: {
    image: string;
    text: string;
  }[]; // For SCQ questions
  question: {
    image: string;
    text: string;
  };
  questionLevel: string;
  questionType: 'scq' | 'text';
  status: number;
}

interface SubmissionItem {
  questionId: string;
  answer: string;
  explanation: string;
  attemptStatus: '1' | '2'; // 1 = attempted, 2 = not attempted
}

interface SubmissionData {
  // For file type assignments
  textResponse?: string;
  uploadedFile?: {
    uri: string;
    name: string;
    type: string;
  };
  explanation?: string;
  
  // For basic type assignments
  submission?: SubmissionItem[];
  isSubmitted?: string;
}

export default function AssignmentQuestion() {
  const router = useRouter();
  const { courseId, chapterId, assignmentId } = useLocalSearchParams<{
    courseId: string;
    chapterId: string;
    assignmentId: string;
  }>();

  // Theme and global styles
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const globalStyles = useGlobalStyles();
  
  // Create theme-aware styles
  const styles = createStyles(currentTheme);

  // State management
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // File assignment state
  const [submissionData, setSubmissionData] = useState<SubmissionData>({
    textResponse: '',
    explanation: ''
  });

  // Initialize submissions array
  useEffect(() => {
    if (assignment && assignment.assignmentType === 'basic') {
      const initialSubmissions = assignment.questions.map(questionId => ({
        questionId,
        answer: '',
        explanation: '',
        attemptStatus: '2' as '1' | '2'
      }));
      setSubmissions(initialSubmissions);
    }
  }, [assignment]);

  // Timer effect
  useEffect(() => {
    if (assignment && assignment.assignmentDuration) {
      const durationStr = assignment.assignmentDuration;
      const duration = parseInt(durationStr, 10);
      
      // Validate duration is a valid number
      if (isNaN(duration) || duration <= 0) {
        console.warn('Invalid assignment duration:', durationStr);
        return;
      }
      
      const durationInSeconds = duration * 60; // Convert to seconds
      setTimeRemaining(durationInSeconds);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [assignment]);

  // Fetch assignment details and questions
  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/assignment/student/assignment/${assignmentId}`);
      if (response && response.data) {
        setAssignment(response.data.assignment);
        
        // Initialize submissions from existing data
        if (response.data.submission && response.data.submission.submission) {
          setSubmissions(response.data.submission.submission);
        }
        
        // Fetch questions for basic type assignments
        if (response.data.assignment.assignmentType === 'basic') {
          await fetchQuestions();
        }
      } else {
        Alert.alert('Error', 'Failed to load assignment details');
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      Alert.alert('Error', 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await apiGet(`/question/student/questions?assignmentId=${assignmentId}&limit=1000&skip=0&order=asc&status=10`);
      if (response && response.data) {
        setQuestions(response.data);
      } else {
        Alert.alert('Error', 'Failed to load questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Helper functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const getCurrentSubmission = () => {
    if (!questions[currentQuestionIndex]) return null;
    return submissions.find(s => s.questionId === questions[currentQuestionIndex]._id);
  };

  const updateSubmission = (questionId: string, updates: Partial<SubmissionItem>) => {
    setSubmissions(prev => {
      const existingIndex = prev.findIndex(s => s.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...updates };
        return updated;
      } else {
        return [...prev, {
          questionId,
          answer: '',
          explanation: '',
          attemptStatus: '2' as '1' | '2',
          ...updates
        }];
      }
    });
  };

  const handleAnswerChange = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      updateSubmission(currentQuestion._id, {
        answer,
        attemptStatus: answer.trim() ? '1' : '2'
      });
    }
  };

  const handleExplanationChange = (explanation: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      updateSubmission(currentQuestion._id, { explanation });
    }
  };

  const handleAutoSubmit = async () => {
    Alert.alert(
      'Time Up!',
      'The assignment time has expired. Your responses will be submitted automatically.',
      [{ text: 'OK', onPress: () => submitAssignment(true) }]
    );
  };

  const saveProgress = async () => {
    try {
      setSubmitting(true);
      const payload = {
        submission: submissions,
        isSubmitted: 'false',
        redirect_status: true,
        courseId,
        assignmentId: assignmentId
      };

      const response = await apiPost(`/courseManagement/studentAssignment/${assignmentId}`, payload);
      if (response.statusCode === 200) {
        Alert.alert('Success', 'Progress saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      Alert.alert('Error', 'Failed to save progress');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAssignment = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      const payload = {
        submission: submissions,
        isSubmitted: 'true',
        redirect_status: true,
        courseId,
        assignmentId: assignmentId
      };

      const response = await apiPost(`/courseManagement/studentAssignment/${assignmentId}`, payload);
      if (response.statusCode === 200) {
        Alert.alert(
          'Success',
          isAutoSubmit ? 'Assignment submitted due to time expiry!' : 'Assignment submitted successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitConfirmation = () => {
    setShowSummary(true);
  };

  const handleFinalSubmit = () => {
    Alert.alert(
      'Final Submission',
      'Are you absolutely sure you want to submit this assignment? You cannot modify it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Now', onPress: () => submitAssignment() }
      ]
    );
  };

  // File upload handler for file assignments
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSubmissionData(prev => ({
          ...prev,
          uploadedFile: {
            uri: file.uri,
            name: file.name || 'unknown_file',
            type: file.mimeType || 'application/octet-stream'
          }
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  // Submit handler for file assignments
  const handleSubmitAssignment = async () => {
    if (!submissionData.textResponse && !submissionData.uploadedFile) {
      Alert.alert('Error', 'Please provide a response before submitting');
      return;
    }

    if (assignment?.fileType?.askForExplaination === 'yes' && !submissionData.explanation) {
      Alert.alert('Error', 'Please provide an explanation before submitting');
      return;
    }

    Alert.alert(
      'Submit Assignment',
      'Are you sure you want to submit this assignment? You cannot modify it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: submitFileAssignment }
      ]
    );
  };

  const submitFileAssignment = async () => {
    try {
      setSubmitting(true);
      const payload = {
        ...submissionData,
        courseId,
        assignmentId
      };

      const response = await apiPost(`/courseManagement/studentAssignment/${assignmentId}`, payload);
      if (response.statusCode === 200) {
        Alert.alert(
          'Success',
          'Assignment submitted successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAssignmentExpired = () => {
    if (!assignment?.endTime) return false;
    return new Date() > new Date(assignment.endTime);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading assignment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>Assignment not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // For basic assignments, show the test attempt page
  if (assignment.assignmentType === 'basic') {
    const currentQuestion = questions[currentQuestionIndex];
    const currentSubmission = getCurrentSubmission();
    const answeredCount = submissions.filter(s => s.attemptStatus === '1').length;
    const unansweredCount = questions.length - answeredCount;
    const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    // Show Summary Page before submission
    if (showSummary) {
      return (
        <SafeAreaView style={styles.container}>
          {/* Summary Header */}
          <View style={styles.summaryHeader}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowSummary(false)}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.summaryHeaderContent}>
              <Text style={styles.summaryTitle}>Assignment Summary</Text>
              <Text style={styles.summarySubtitle}>Review before final submission</Text>
            </View>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color={timeRemaining < 300 ? "#F44336" : "#4CAF50"} />
              <Text style={[styles.timerText, timeRemaining < 300 && styles.timerTextUrgent]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.summaryContent} showsVerticalScrollIndicator={false}>
            {/* Assignment Overview Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                <Text style={styles.summaryCardTitle}>Assignment Overview</Text>
              </View>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>{assignment.assignmentName}</Text>
                  <Text style={styles.summaryStatLabel}>Assignment Name</Text>
                </View>
                <View style={styles.summaryStatDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>{assignment.totalMarks}</Text>
                  <Text style={styles.summaryStatLabel}>Total Marks</Text>
                </View>
                <View style={styles.summaryStatDivider} />
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>{assignment.level}</Text>
                  <Text style={styles.summaryStatLabel}>Difficulty</Text>
                </View>
              </View>
            </View>

            {/* Progress Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="analytics-outline" size={24} color="#4CAF50" />
                <Text style={styles.summaryCardTitle}>Your Progress</Text>
              </View>
              <View style={styles.progressSummaryContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCircleText}>{Math.round(progressPercentage)}%</Text>
                  <Text style={styles.progressCircleLabel}>Complete</Text>
                </View>
                <View style={styles.progressDetails}>
                  <View style={styles.progressDetailItem}>
                    <View style={[styles.progressDetailDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.progressDetailText}>{answeredCount} Attempted</Text>
                  </View>
                  <View style={styles.progressDetailItem}>
                    <View style={[styles.progressDetailDot, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.progressDetailText}>{unansweredCount} Remaining</Text>
                  </View>
                  <View style={styles.progressDetailItem}>
                    <View style={[styles.progressDetailDot, { backgroundColor: '#2196F3' }]} />
                    <Text style={styles.progressDetailText}>{questions.length} Total Questions</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Time Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="time-outline" size={24} color={timeRemaining < 300 ? "#F44336" : "#FF9800"} />
                <Text style={styles.summaryCardTitle}>Time Summary</Text>
              </View>
              <View style={styles.timeSummaryContainer}>
                <View style={styles.timeSummaryItem}>
                  <Text style={[styles.timeSummaryValue, timeRemaining < 300 && { color: '#F44336' }]}>
                    {formatTime(timeRemaining)}
                  </Text>
                  <Text style={styles.timeSummaryLabel}>Time Remaining</Text>
                </View>
                <View style={styles.timeSummaryDivider} />
                <View style={styles.timeSummaryItem}>
                  <Text style={styles.timeSummaryValue}>
                    {assignment.assignmentDuration} min
                  </Text>
                  <Text style={styles.timeSummaryLabel}>Total Duration</Text>
                </View>
              </View>
              {timeRemaining < 300 && (
                <View style={styles.timeWarning}>
                  <Ionicons name="warning-outline" size={16} color="#F44336" />
                  <Text style={styles.timeWarningText}>Less than 5 minutes remaining!</Text>
                </View>
              )}
            </View>

            {/* Question Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Ionicons name="list-outline" size={24} color="#9C27B0" />
                <Text style={styles.summaryCardTitle}>Question Summary</Text>
              </View>
              <View style={styles.questionSummaryGrid}>
                {questions.map((question, index) => {
                  const submission = submissions.find(s => s.questionId === question._id);
                  const isAnswered = submission?.attemptStatus === '1';
                  const hasExplanation = submission?.explanation && submission.explanation.trim().length > 0;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.questionSummaryItem,
                        isAnswered && styles.questionSummaryItemAnswered
                      ]}
                      onPress={() => {
                        setCurrentQuestionIndex(index);
                        setShowSummary(false);
                      }}
                    >
                      <Text style={[
                        styles.questionSummaryNumber,
                        isAnswered && styles.questionSummaryNumberAnswered
                      ]}>
                        {index + 1}
                      </Text>
                      <View style={styles.questionSummaryInfo}>
                        <Text style={styles.questionSummaryType}>
                          {question.questionType.toUpperCase()}
                        </Text>
                        {hasExplanation && (
                          <Ionicons name="chatbubble-outline" size={12} color="#4CAF50" />
                        )}
                      </View>
                      {isAnswered && (
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Warning Card if incomplete */}
            {unansweredCount > 0 && (
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="warning-outline" size={24} color="#FF9800" />
                  <Text style={styles.warningTitle}>Incomplete Submission</Text>
                </View>
                <Text style={styles.warningText}>
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. 
                  You can still submit, but consider reviewing them first.
                </Text>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => {
                    // Find first unanswered question
                    const firstUnanswered = questions.findIndex((q, idx) => {
                      const sub = submissions.find(s => s.questionId === q._id);
                      return sub?.attemptStatus !== '1';
                    });
                    if (firstUnanswered >= 0) {
                      setCurrentQuestionIndex(firstUnanswered);
                    }
                    setShowSummary(false);
                  }}
                >
                  <Ionicons name="eye-outline" size={16} color="#FF9800" />
                  <Text style={styles.reviewButtonText}>Review Unanswered</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Summary Footer Actions */}
          <View style={styles.summaryFooter}>
            <TouchableOpacity
              style={[styles.summaryActionButton, styles.saveButton]}
              onPress={() => {
                setShowSummary(false);
                saveProgress();
              }}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="save-outline" size={20} color="#4CAF50" />
              )}
              <Text style={styles.saveButtonText}>Save & Continue Later</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.summaryActionButton, styles.finalSubmitButton]}
              onPress={handleFinalSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              )}
              <Text style={styles.finalSubmitButtonText}>Submit Assignment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* Header with Timer */}
        <View style={styles.testHeader}>
          <View style={styles.testHeaderTop}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.testHeaderContent}>
              <Text style={styles.testTitle} numberOfLines={1}>
                {assignment.assignmentName}
              </Text>
              <Text style={styles.testSubtitle}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
            </View>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color={timeRemaining < 300 ? "#F44336" : "#4CAF50"} />
              <Text style={[styles.timerText, timeRemaining < 300 && styles.timerTextUrgent]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {answeredCount}/{questions.length} Completed
            </Text>
          </View>
        </View>

        {questionsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        ) : (
          <ScrollView style={styles.testContent} showsVerticalScrollIndicator={false}>
            {currentQuestion && (
              <View style={styles.questionContainer}>
                {/* Question Card */}
                <View style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionBadge}>
                      <Text style={styles.questionBadgeText}>
                        {currentQuestion.questionType.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyBadgeText}>
                        {currentQuestion.questionLevel}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.questionText}>
                    {stripHtml(currentQuestion.question.text)}
                  </Text>
                  
                  {currentQuestion.question.image && (
                    <View style={styles.questionImageContainer}>
                      {/* Add image display logic here if needed */}
                    </View>
                  )}
                </View>

                {/* Answer Section */}
                <View style={styles.answerSection}>
                  <Text style={styles.answerSectionTitle}>Your Answer</Text>
                  
                  {currentQuestion.questionType === 'scq' && currentQuestion.options ? (
                    <View style={styles.optionsContainer}>
                      {currentQuestion.options.map((option, index) => {
                        const optionValue = (index + 1).toString();
                        const isSelected = currentSubmission?.answer === optionValue;
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                            onPress={() => handleAnswerChange(optionValue)}
                          >
                            <View style={[styles.optionRadio, isSelected && styles.optionRadioSelected]}>
                              {isSelected && <View style={styles.optionRadioInner} />}
                            </View>
                            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                              {stripHtml(option.text)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.textAnswerContainer}>
                      <TextInput
                        style={styles.textAnswerInput}
                        multiline
                        numberOfLines={6}
                        placeholder="Type your answer here...\n\nTip: Be detailed and provide examples where applicable."
                        value={currentSubmission?.answer || ''}
                        onChangeText={handleAnswerChange}
                        textAlignVertical="top"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}
                </View>

                {/* Explanation Section */}
                {currentQuestion.askForExplaination === 'true' && (
                  <View style={styles.explanationSection}>
                    <TouchableOpacity
                      style={styles.explanationToggle}
                      onPress={() => setShowExplanation(!showExplanation)}
                    >
                      <Text style={styles.explanationToggleText}>Explanation (Optional)</Text>
                      <Ionicons 
                        name={showExplanation ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#007AFF" 
                      />
                    </TouchableOpacity>
                    
                    {showExplanation && (
                      <TextInput
                        style={styles.explanationInput}
                        multiline
                        numberOfLines={4}
                        placeholder="Explain your reasoning (optional)..."
                        value={currentSubmission?.explanation || ''}
                        onChangeText={handleExplanationChange}
                        textAlignVertical="top"
                        placeholderTextColor="#999"
                      />
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}

        {/* Navigation Footer */}
        <View style={styles.navigationFooter}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <Ionicons name="chevron-back" size={20} color={currentQuestionIndex === 0 ? "#ccc" : "#007AFF"} />
              <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </TouchableOpacity>
            
            <View style={styles.questionIndicators}>
              {questions.map((_, index) => {
                const submission = submissions.find(s => s.questionId === questions[index]._id);
                const isAnswered = submission?.attemptStatus === '1';
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.questionIndicator,
                      isCurrent && styles.questionIndicatorCurrent,
                      isAnswered && styles.questionIndicatorAnswered
                    ]}
                    onPress={() => setCurrentQuestionIndex(index)}
                  >
                    <Text style={[
                      styles.questionIndicatorText,
                      isCurrent && styles.questionIndicatorTextCurrent,
                      isAnswered && styles.questionIndicatorTextAnswered
                    ]}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton, currentQuestionIndex === questions.length - 1 && styles.navButtonDisabled]}
              onPress={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <Text style={[styles.navButtonText, currentQuestionIndex === questions.length - 1 && styles.navButtonTextDisabled]}>
                Next
              </Text>
              <Ionicons name="chevron-forward" size={20} color={currentQuestionIndex === questions.length - 1 ? "#ccc" : "#007AFF"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={saveProgress}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Ionicons name="save-outline" size={20} color="#4CAF50" />
              )}
              <Text style={styles.saveButtonText}>Save Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={handleSubmitConfirmation}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              )}
              <Text style={styles.submitButtonText}>Submit Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {assignment.assignmentName}
          </Text>
          <Text style={styles.headerSubtitle}>
            Due: {formatDate(assignment.endTime)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Assignment Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>Assignment Overview</Text>
              <Text style={styles.overviewSubtitle}>Complete all sections to submit</Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{assignment.assignmentDuration} min</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={20} color="#FF9800" />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{assignment.totalMarks}</Text>
                <Text style={styles.statLabel}>Total Marks</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={20} color="#9C27B0" />
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{assignment.level}</Text>
                <Text style={styles.statLabel}>Difficulty</Text>
              </View>
            </View>
          </View>
          
          {/* Time Remaining */}
          <View style={styles.timeRemainingContainer}>
            <Ionicons name="alarm-outline" size={16} color="#F44336" />
            <Text style={styles.timeRemainingText}>
              Due: {formatDate(assignment.endTime)}
            </Text>
          </View>
        </View>

        {/* File Type Assignment */}
        {assignment.assignmentType === 'file' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assignment Question</Text>
            
            {/* PDF Viewer */}
            {assignment.fileType?.question && (
              <View style={styles.pdfContainer}>
                <WebView
                  source={{ uri: assignment.fileType.question }}
                  style={styles.pdfViewer}
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View style={styles.pdfLoading}>
                      <ActivityIndicator size="large" color="#007AFF" />
                      <Text style={styles.pdfLoadingText}>Loading PDF...</Text>
                    </View>
                  )}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                  }}
                />
              </View>
            )}

            {/* Fallback message if no question PDF */}
            {!assignment.fileType?.question && (
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>No assignment question available.</Text>
              </View>
            )}
          </View>
        )}

        {/* Submission Section */}
        {!isAssignmentExpired() && (
          <View style={styles.section}>
            <View style={styles.submissionHeader}>
              <View style={styles.submissionTitleContainer}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
                <Text style={styles.submissionTitle}>Your Submission</Text>
              </View>
              <Text style={styles.submissionSubtitle}>
                Choose one or both methods to submit your assignment
              </Text>
            </View>
            
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressStep}>
                <View style={[styles.progressDot, (submissionData.textResponse || submissionData.uploadedFile) && styles.progressDotActive]}>
                  <Ionicons 
                    name={(submissionData.textResponse || submissionData.uploadedFile) ? "checkmark" : "ellipse-outline"} 
                    size={12} 
                    color={(submissionData.textResponse || submissionData.uploadedFile) ? "#fff" : "#666"} 
                  />
                </View>
                <Text style={styles.progressLabel}>Add Response</Text>
              </View>
              
              <View style={styles.progressLine} />
              
              <View style={styles.progressStep}>
                <View style={[styles.progressDot, assignment.fileType?.askForExplaination !== 'yes' || submissionData.explanation ? styles.progressDotActive : null]}>
                  <Ionicons 
                    name={assignment.fileType?.askForExplaination !== 'yes' || submissionData.explanation ? "checkmark" : "ellipse-outline"} 
                    size={12} 
                    color={assignment.fileType?.askForExplaination !== 'yes' || submissionData.explanation ? "#fff" : "#666"} 
                  />
                </View>
                <Text style={styles.progressLabel}>Explanation</Text>
              </View>
              
              <View style={styles.progressLine} />
              
              <View style={styles.progressStep}>
                <View style={styles.progressDot}>
                  <Ionicons name="ellipse-outline" size={12} color="#666" />
                </View>
                <Text style={styles.progressLabel}>Submit</Text>
              </View>
            </View>
            
            {/* Response Options */}
            <View style={styles.responseOptionsContainer}>
              <Text style={styles.optionsTitle}>Choose Your Response Method</Text>
              
              {/* Text Response Option */}
              <TouchableOpacity 
                style={[styles.responseOption, submissionData.textResponse && styles.responseOptionActive]}
                onPress={() => {}}
              >
                <View style={styles.responseOptionHeader}>
                  <View style={styles.responseOptionIcon}>
                    <Ionicons name="document-text-outline" size={24} color={submissionData.textResponse ? "#007AFF" : "#666"} />
                  </View>
                  <View style={styles.responseOptionContent}>
                    <Text style={[styles.responseOptionTitle, submissionData.textResponse && styles.responseOptionTitleActive]}>
                      Written Response
                    </Text>
                    <Text style={styles.responseOptionDescription}>
                      Type your answer directly in the text box
                    </Text>
                  </View>
                  <View style={[styles.responseOptionBadge, submissionData.textResponse && styles.responseOptionBadgeActive]}>
                    <Text style={[styles.responseOptionBadgeText, submissionData.textResponse && styles.responseOptionBadgeTextActive]}>
                      {submissionData.textResponse ? 'Added' : 'Optional'}
                    </Text>
                  </View>
                </View>
                
                <TextInput
                  style={[styles.textInput, styles.textInputEnhanced]}
                  multiline
                  numberOfLines={6}
                  placeholder="Enter your detailed response here...\n\nTip: Be specific and provide examples where applicable."
                  value={submissionData.textResponse}
                  onChangeText={(text) => setSubmissionData(prev => ({ ...prev, textResponse: text }))}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </TouchableOpacity>

              {/* File Upload Option */}
              <TouchableOpacity 
                style={[styles.responseOption, submissionData.uploadedFile && styles.responseOptionActive]}
                onPress={handleFileUpload}
              >
                <View style={styles.responseOptionHeader}>
                  <View style={styles.responseOptionIcon}>
                    <Ionicons name="cloud-upload-outline" size={24} color={submissionData.uploadedFile ? "#007AFF" : "#666"} />
                  </View>
                  <View style={styles.responseOptionContent}>
                    <Text style={[styles.responseOptionTitle, submissionData.uploadedFile && styles.responseOptionTitleActive]}>
                      File Upload
                    </Text>
                    <Text style={styles.responseOptionDescription}>
                      Upload documents, images, or other files
                    </Text>
                  </View>
                  <View style={[styles.responseOptionBadge, submissionData.uploadedFile && styles.responseOptionBadgeActive]}>
                    <Text style={[styles.responseOptionBadgeText, submissionData.uploadedFile && styles.responseOptionBadgeTextActive]}>
                      {submissionData.uploadedFile ? 'Uploaded' : 'Optional'}
                    </Text>
                  </View>
                </View>
                
                {!submissionData.uploadedFile ? (
                  <View style={styles.uploadArea}>
                    <Ionicons name="cloud-upload-outline" size={32} color="#007AFF" />
                    <Text style={styles.uploadText}>Tap to select files</Text>
                    <Text style={styles.uploadSubtext}>PDF, DOC, DOCX, Images supported</Text>
                  </View>
                ) : (
                  <View style={styles.uploadedFileCard}>
                    <View style={styles.uploadedFileInfo}>
                      <Ionicons name="document-outline" size={24} color="#4CAF50" />
                      <View style={styles.uploadedFileDetails}>
                        <Text style={styles.uploadedFileName}>{submissionData.uploadedFile.name}</Text>
                        <Text style={styles.uploadedFileType}>{submissionData.uploadedFile.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeFileButton}
                      onPress={() => setSubmissionData(prev => ({ ...prev, uploadedFile: undefined }))}
                    >
                      <Ionicons name="close-circle" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Explanation Section (if required) */}
            {assignment.fileType?.askForExplaination === 'yes' && (
              <View style={styles.explanationSection}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FF9800" />
                  <Text style={styles.explanationTitle}>
                    Explanation Required
                  </Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredBadgeText}>Required</Text>
                  </View>
                </View>
                
                <Text style={styles.explanationDescription}>
                  Please provide a detailed explanation of your approach and reasoning.
                  {assignment.fileType.explainationType && (
                    ` Format: ${assignment.fileType.explainationType}`
                  )}
                </Text>
                
                <TextInput
                  style={[styles.textInput, styles.explanationInput]}
                  multiline
                  numberOfLines={5}
                  placeholder="Explain your solution approach, methodology, and key insights...\n\nExample: I chose this approach because..."
                  value={submissionData.explanation}
                  onChangeText={(text) => setSubmissionData(prev => ({ ...prev, explanation: text }))}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>
        )}

        {/* Expired Assignment Message */}
        {isAssignmentExpired() && (
          <View style={styles.expiredCard}>
            <Ionicons name="time-outline" size={24} color="#F44336" />
            <Text style={styles.expiredText}>This assignment has expired</Text>
            <Text style={styles.expiredSubtext}>
              Submission deadline was {formatDate(assignment.endTime)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      {!isAssignmentExpired() && (
        <View style={styles.submitContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
            onPress={handleSubmitAssignment}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || '#e0e0e0',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Test Attempt Page Styles
  testHeader: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  testHeaderContent: {
    flex: 1,
    marginLeft: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  testSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  timerTextUrgent: {
    color: '#F44336',
  },
  progressBarContainer: {
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  testContent: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 8,
  },
  questionImageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  answerSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  answerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#007AFF',
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  textAnswerContainer: {
    marginTop: 8,
  },
  textAnswerInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    minHeight: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  explanationSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  explanationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  explanationToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  explanationInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    minHeight: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  navigationFooter: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: '#f8f9fa',
  },
  nextButton: {
    backgroundColor: '#f8f9fa',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  questionIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: screenWidth * 0.5,
  },
  questionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  questionIndicatorCurrent: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  questionIndicatorAnswered: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  questionIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  questionIndicatorTextCurrent: {
    color: '#fff',
  },
  questionIndicatorTextAnswered: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  overviewCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    marginLeft: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  timeRemainingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  submissionHeader: {
    marginBottom: 24,
  },
  submissionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  submissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  submissionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    maxWidth: 60,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    marginBottom: 24,
  },
  responseOptionsContainer: {
    marginTop: 8,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  responseOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  responseOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F8FBFF',
  },
  responseOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  responseOptionContent: {
    flex: 1,
  },
  responseOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  responseOptionTitleActive: {
    color: '#007AFF',
  },
  responseOptionDescription: {
    fontSize: 13,
    color: '#666',
  },
  responseOptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  responseOptionBadgeActive: {
    backgroundColor: '#E3F2FD',
  },
  responseOptionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  responseOptionBadgeTextActive: {
    color: '#007AFF',
  },
  textInputEnhanced: {
    borderColor: '#007AFF',
    backgroundColor: '#FAFBFC',
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#F8FBFF',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  uploadedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  uploadedFileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  uploadedFileType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  removeFileButton: {
    padding: 4,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFE0B2',
  },
  requiredBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E65100',
  },
  explanationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  pdfContainer: {
    height: screenHeight * 0.5,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfViewer: {
    flex: 1,
  },
  pdfLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pdfLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  responseCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    minHeight: 120,
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
    backgroundColor: '#f0f8ff',
  },
  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  uploadedFileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  expiredCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expiredText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    marginTop: 8,
    marginBottom: 4,
  },
  expiredSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  submitContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  
  // Summary Page Styles
  summaryHeader: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  summaryHeaderContent: {
    flex: 1,
    marginLeft: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  summaryContent: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  summaryStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    borderWidth: 4,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressCircleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressCircleLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  progressDetails: {
    flex: 1,
  },
  progressDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDetailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressDetailText: {
    fontSize: 14,
    color: '#333',
  },
  timeSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  timeSummaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  timeSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  timeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  timeWarningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#c62828',
    fontWeight: '500',
  },
  questionSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionSummaryItem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionSummaryItemAnswered: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  questionSummaryNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  questionSummaryNumberAnswered: {
    color: '#4CAF50',
  },
  questionSummaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questionSummaryType: {
    fontSize: 8,
    fontWeight: '600',
    color: '#999',
  },
  warningCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#bf360c',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9800',
    marginLeft: 4,
  },
  summaryFooter: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    gap: 12,
  },
  summaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  finalSubmitButton: {
    backgroundColor: '#F44336',
  },
  finalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
