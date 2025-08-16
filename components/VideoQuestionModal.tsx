import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Question } from '@/types/video';
import { VideoAnalytics } from '@/utils/analytics';
import { htmlToPlainText } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface VideoQuestionModalProps {
  visible: boolean;
  questions: Question[]; // Changed to support multiple questions
  currentQuestionIndex?: number; // Current question index
  onAnswer: (questionId: string, answer: string) => void; // Include questionId
  onClose?: () => void;
  isFullscreen?: boolean;
  onQuestionAnswer?: (questionId: string, answer: string, correct: boolean) => void;
  onSubmitAll?: (submissions: any[]) => void; // For final submission
  initialAnswers?: { [questionId: string]: string }; // Pre-filled answers
}

export const VideoQuestionModal: React.FC<VideoQuestionModalProps> = ({
  visible,
  questions,
  currentQuestionIndex = 0,
  onAnswer,
  onClose,
  isFullscreen = false,
  onQuestionAnswer,
  onSubmitAll,
  initialAnswers = {}
}) => {
  const { styles, colors } = useGlobalStyles();
  
  // Multi-question state management
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [explanations, setExplanations] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  // Current question derived from questions array and current index
  const currentQuestion = questions[currentIndex] || null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // Get screen dimensions for orientation-aware layout
  const screenData = Dimensions.get('window');
  const isLandscape = screenData.width > screenData.height;

  // Use fullscreen prop or detect landscape orientation
  const shouldUseLandscapeLayout = isFullscreen || isLandscape;
  
  // Platform-specific safe area handling
  const getStatusBarHeight = () => {
    if (Platform.OS === 'ios') {
      return isLandscape ? 0 : 44; // iOS status bar height
    }
    return StatusBar.currentHeight || 0; // Android status bar height
  };
  
  // Create modal styles based on screen dimensions and platform
  const modalStyles = {
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)', // Darker overlay for better visibility
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      padding: 20,
      // Ensure modal is always on top
      zIndex: 9999,
      elevation: 9999, // For Android
    },
    modalContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      width: '100%' as const,
      maxHeight: screenData.height * 0.8,
      overflow: 'hidden' as const,
      // Platform-specific safe area handling
      marginTop: Platform.OS === 'android' && !shouldUseLandscapeLayout ? getStatusBarHeight() : 0,
      // Ensure modal is always on top
      zIndex: 10000,
      elevation: 10000, // For Android
    },
    modalContainerLandscape: {
      maxHeight: screenData.height * 0.9,
      width: screenData.width * 0.9,
      maxWidth: 800,
      // Enhanced landscape layout for better cross-platform experience
      marginTop: Platform.OS === 'android' ? getStatusBarHeight() / 2 : 0,
      // iOS specific optimizations
      ...(Platform.OS === 'ios' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }),
      // Android specific optimizations
      ...(Platform.OS === 'android' && {
        elevation: 8,
      }),
    },
  };

  // Initialize answers from props
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setSelectedAnswers(initialAnswers);
    }
  }, [initialAnswers]);
  
  // Reset timer when question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.meta.timeToCompleteQuestion || 30);
      
      // Track question shown event
      VideoAnalytics.trackVideoQuestionShown(
        currentQuestion.assignmentId || 'unknown',
        currentQuestion._id || 'unknown',
        currentQuestion.questionType || 'unknown',
        0 // videoTime - this would need to come from video player context
      );
    }
  }, [currentQuestion]);
  
  // Update current index when prop changes
  useEffect(() => {
    setCurrentIndex(currentQuestionIndex);
  }, [currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (!visible || timeLeft <= 0 || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto submit current question
          handleNextQuestion();
          
          // Track timeout event
          VideoAnalytics.trackVideoQuestionTimeout(
            currentQuestion.assignmentId || 'unknown',
            currentQuestion._id || 'unknown',
            currentQuestion.meta?.timeToCompleteQuestion || 30
          );
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, timeLeft, currentQuestion, currentIndex]);

  // Handle answer selection for current question
  const handleAnswerSelect = useCallback((questionId: string, answer: string, index?: number) => {
    setSelectedAnswers(prev => {
      const currentAnswer = prev[questionId];
      const question = questions.find(q => q._id === questionId);
      if (!question) return prev;

      if (question.questionType === 'fillInTheBlanks') {
        if (question.fill?.type === 'multiple') {
          // Handle multiple fill in the blanks
          const answers = Array.isArray(currentAnswer) ? currentAnswer.split(',') : new Array(parseInt(question.fill.box)).fill('');
          if (typeof index === 'number') {
            answers[index] = answer;
          }
          return { ...prev, [questionId]: answers.join(',') };
        } else {
          // Handle single fill in the blanks
          return { ...prev, [questionId]: answer };
        }
      } else if (question.questionType === 'mcq') {
        // Handle MCQ
        const answers = currentAnswer ? currentAnswer.split(',') : [];
        const answerIndex = answers.indexOf(answer);
        if (answerIndex === -1) {
          answers.push(answer);
        } else {
          answers.splice(answerIndex, 1);
        }
        return { ...prev, [questionId]: answers.join(',') };
      } else {
        // Handle SCQ and text
        return { ...prev, [questionId]: answer };
      }
    });
  }, [questions]);

  // Handle explanation change
  const handleExplanationChange = useCallback((questionId: string, explanation: string) => {
    setExplanations(prev => ({ ...prev, [questionId]: explanation }));
  }, []);

  // Create submission for current question
  const createQuestionSubmission = (question: Question, isSubmitted: boolean = false) => {
    const answer = selectedAnswers[question._id] || '';
    const explanation = explanations[question._id] || '';
    const isAnswered = answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : answer !== '');

    let isCorrect = 1; // Default for text questions

    if (question.questionType === 'scq' || question.questionType === 'mcq') {
      const correctAnswer = question.correct.split(',');
      const userAnswer = answer ? answer.split(',') : [];

      if (correctAnswer.length === userAnswer.length &&
        correctAnswer.every(ans => userAnswer.includes(ans))) {
        isCorrect = 1;
      } else {
        isCorrect = 0;
      }
    }

    return {
      questionId: question._id,
      answer: answer || '',
      explanation: question.askForExplaination === 'true' ? explanation : '',
      attemptStatus: isAnswered ? '1' : '0',
      isCorrect: isCorrect
    };
  };

  // Handle previous question
  const handlePrevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Handle next question or submit
  const handleNextQuestion = useCallback(() => {
    if (!currentQuestion) return;

    // Create submission for current question
    const submission = createQuestionSubmission(currentQuestion, false);
    
    // Track question answered event
    VideoAnalytics.trackVideoQuestionAnswered(
      currentQuestion.assignmentId || 'unknown',
      currentQuestion._id || 'unknown',
      submission.answer,
      submission.isCorrect === 1,
      0, // responseTime - would need to track this
      {
        question_type: currentQuestion.questionType,
        question_index: currentIndex,
        total_questions: questions.length
      }
    );

    // Call single question callback
    onQuestionAnswer?.(currentQuestion._id, submission.answer, submission.isCorrect === 1);
    onAnswer(currentQuestion._id, submission.answer);

    if (isLastQuestion) {
      // Final submission
      handleFinalSubmit();
    } else {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentQuestion, currentIndex, isLastQuestion, selectedAnswers, explanations, questions]);

  // Handle final submission of all questions
  const handleFinalSubmit = useCallback(() => {
    const allSubmissions = questions.map(question => 
      createQuestionSubmission(question, true)
    );

    setSubmissions(allSubmissions);
    
    // Call final submission callback
    onSubmitAll?.(allSubmissions);

    // Close modal
    onClose?.();
  }, [questions, selectedAnswers, explanations, onSubmitAll, onClose]);



  const renderQuestionContent = () => {
    if (!questions) return null;

    return (
      <View style={styles.questionContent}>
        {/* Question Header */}
        <View style={[styles.questionHeader, { backgroundColor: colors.interactive.primary + '20' }]}>
          <View style={styles.questionHeaderTop}>
            <Text style={[styles.questionNumber, { color: colors.interactive.primary }]}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
            <Text style={[styles.questionTypeLabel, { color: colors.text.secondary }]}>
              {currentQuestion.questionType.toUpperCase()}
            </Text>
          </View>
          
          {/* Timer Display */}
          {timeLeft > 0 && (
            <View style={[styles.timerContainer, { backgroundColor: timeLeft <= 10 ? colors.status.error : colors.interactive.primary }]}>
              <Ionicons name="time-outline" size={16} color={colors.text.inverse} />
              <Text style={[styles.timerText, { color: colors.text.inverse }]}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>

        {/* Question Image */}
        {currentQuestion.question.image && (
          <View style={styles.questionImageContainer}>
            <Image 
              source={{ uri: currentQuestion.question.image }} 
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Question Text */}
        <View style={[styles.questionTextContainer, { backgroundColor: colors.surface.primary }]}>
          <Text style={styles.questionText}>
            {htmlToPlainText(currentQuestion.question.text)}
          </Text>
        </View>

        {/* Answer Section Header */}
        <View style={styles.answerSectionHeader}>
          <Text style={[styles.answerSectionTitle, { color: colors.text.primary }]}>
            {currentQuestion.questionType === 'scq' || currentQuestion.questionType === 'mcq'
              ? 'Select Answer'
              : 'Enter Your Answer'}
          </Text>
        </View>

        {/* Answer Options based on question type */}
        {renderAnswerOptions()}
      </View>
    );
  };

  const renderAnswerOptions = () => {
    if (!currentQuestion) return null;
    
    const currentAnswer = selectedAnswers[currentQuestion._id] || '';

    switch (currentQuestion.questionType) {
      case 'scq':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const optionValue = `${index + 1}`;
              const isSelected = currentAnswer === optionValue;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, optionValue)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected
                    ]}>
                      {isSelected && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    
                    <View style={styles.optionContentText}>
                      {option.image && (
                        <View style={styles.optionImageContainer}>
                          <Image 
                            source={{ uri: option.image }} 
                            style={styles.optionImage}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText
                      ]}>
                        {htmlToPlainText(option.text)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'mcq':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const optionValue = `${index + 1}`;
              const currentAnswers = currentAnswer ? currentAnswer.split(',') : [];
              const isSelected = currentAnswers.includes(optionValue);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, optionValue)}
                >
                  <View style={styles.optionContent}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color={colors.text.inverse} />
                      )}
                    </View>
                    
                    <View style={styles.optionContentText}>
                      {option.image && (
                        <View style={styles.optionImageContainer}>
                          <Image 
                            source={{ uri: option.image }} 
                            style={styles.optionImage}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText
                      ]}>
                        {htmlToPlainText(option.text)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Enter your answer..."
            placeholderTextColor={colors.text.secondary}
            value={currentAnswer}
            onChangeText={(text) => handleAnswerSelect(currentQuestion._id, text)}
            multiline
            autoFocus
          />
        );

      case 'fillInTheBlanks':
        if (currentQuestion.fill?.type === 'multiple') {
          const boxCount = parseInt(currentQuestion.fill.box);
          const answers = currentAnswer ? currentAnswer.split(',') : new Array(boxCount).fill('');

          return (
            <View style={styles.fillContainer}>
              {Array.from({ length: boxCount }).map((_, index) => (
                <View key={index} style={styles.fillInputContainer}>
                  <Text style={[styles.fillLabel, { color: colors.text.secondary }]}>
                    Answer {index + 1}
                  </Text>
                  <TextInput
                    style={[styles.fillInput, { borderColor: colors.border.primary, color: colors.text.primary }]}
                    placeholder={`Enter answer ${index + 1}`}
                    placeholderTextColor={colors.text.secondary}
                    value={answers[index] || ''}
                    onChangeText={(value) => handleAnswerSelect(currentQuestion._id, value, index)}
                    autoFocus={index === 0}
                  />
                </View>
              ))}
            </View>
          );
        } else {
          return (
            <View style={styles.fillContainer}>
              <View style={styles.fillInputContainer}>
                <Text style={[styles.fillLabel, { color: colors.text.secondary }]}>
                  Your Answer
                </Text>
                <TextInput
                  style={[styles.fillInput, { borderColor: colors.border.primary, color: colors.text.primary }]}
                  placeholder="Enter your answer"
                  placeholderTextColor={colors.text.secondary}
                  value={currentAnswer}
                  onChangeText={(text) => handleAnswerSelect(currentQuestion._id, text)}
                  autoFocus
                />
              </View>
            </View>
          );
        }

      default:
        return null;
    }
  };

  if (!currentQuestion || questions.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={currentQuestion.closeable ? onClose : undefined}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={[
        modalStyles.modalOverlay,
        { 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          elevation: 9999,
        }
      ]}>
        <View style={[
          modalStyles.modalContainer,
          shouldUseLandscapeLayout && modalStyles.modalContainerLandscape,
          {
            zIndex: 10000,
            elevation: 10000,
          }
        ]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="help-circle" size={24} color={colors.brand.primary} />
              <Text style={styles.modalTitle}>Questions</Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            {/* Progress Indicator */}
            <View style={styles.progressIndicator}>
              {questions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index === currentIndex 
                        ? colors.interactive.primary 
                        : index < currentIndex 
                        ? colors.status.success 
                        : colors.border.primary
                    }
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderQuestionContent()}
          </ScrollView>

          {/* Footer - Navigation Buttons */}
          <View style={styles.modalFooter}>
            <View style={styles.navigationContainer}>
              {/* Previous Button */}
              {!isFirstQuestion && (
                <TouchableOpacity
                  style={[styles.navButton, styles.prevButton, { borderColor: colors.border.primary }]}
                  onPress={handlePrevQuestion}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
                  <Text style={[styles.navButtonText, { color: colors.text.primary }]}>Previous</Text>
                </TouchableOpacity>
              )}
              
              {/* Next/Submit Button */}
              <TouchableOpacity
                style={[
                  styles.navButton, 
                  styles.nextButton, 
                  { backgroundColor: colors.interactive.primary },
                  !isFirstQuestion && styles.nextButtonWithPrev
                ]}
                onPress={handleNextQuestion}
              >
                <Text style={[styles.navButtonText, { color: colors.text.inverse }]}>
                  {isLastQuestion ? 'Submit All' : 'Next'}
                </Text>
                {!isLastQuestion && (
                  <Ionicons name="chevron-forward" size={20} color={colors.text.inverse} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VideoQuestionModal;
