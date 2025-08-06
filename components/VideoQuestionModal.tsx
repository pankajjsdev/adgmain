import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Question } from '@/types/video';
import { htmlToPlainText } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  question: Question | null;
  onAnswer: (answer: string) => void;
  onClose?: () => void;
  isFullscreen?: boolean;
}

export const VideoQuestionModal: React.FC<VideoQuestionModalProps> = ({
  visible,
  question,
  onAnswer,
  onClose,
  isFullscreen = false
}) => {
  const { styles, colors } = useGlobalStyles();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [fillAnswers, setFillAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

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

  // Reset state when question changes
  useEffect(() => {
    if (question) {
      setSelectedAnswer('');
      setTextAnswer('');
      setFillAnswers({});
      setTimeLeft(question.meta.timeToCompleteQuestion || 30);
    }
  }, [question]);

  // Timer countdown
  useEffect(() => {
    if (!visible || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto submit with current answer
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, timeLeft]);

  const handleSubmit = () => {
    if (!question) return;

    let answer = '';
    
    switch (question.questionType) {
      case 'scq':
      case 'mcq':
        answer = selectedAnswer;
        break;
      case 'text':
        answer = textAnswer.trim();
        break;
      case 'fillInTheBlanks':
        answer = JSON.stringify(fillAnswers);
        break;
    }

    if (!answer && question.questionType !== 'fillInTheBlanks') {
      Alert.alert('Please select or enter an answer');
      return;
    }

    onAnswer(answer);
  };

  const handleFillChange = (key: string, value: string) => {
    setFillAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderQuestionContent = () => {
    if (!question) return null;

    return (
      <View style={styles.questionContent}>
        {/* Question Image */}
        {question.question.image && (
          <Image 
            source={{ uri: question.question.image }} 
            style={styles.questionImage}
            resizeMode="contain"
          />
        )}

        {/* Question Text */}
        <Text style={styles.questionText}>
          {htmlToPlainText(question.question.text)}
        </Text>

        {/* Answer Options based on question type */}
        {renderAnswerOptions()}
      </View>
    );
  };

  const renderAnswerOptions = () => {
    if (!question) return null;

    switch (question.questionType) {
      case 'scq':
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option.text && styles.selectedOption
                ]}
                onPress={() => setSelectedAnswer(option.text)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.radioButton,
                    selectedAnswer === option.text && styles.radioButtonSelected
                  ]}>
                    {selectedAnswer === option.text && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  {option.image && (
                    <Image 
                      source={{ uri: option.image }} 
                      style={styles.optionImage}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={[
                    styles.optionText,
                    selectedAnswer === option.text && styles.selectedOptionText
                  ]}>
                    {htmlToPlainText(option.text)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'mcq':
        return (
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer.includes(option.text);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOption
                  ]}
                  onPress={() => {
                    const currentAnswers = selectedAnswer ? selectedAnswer.split(',') : [];
                    if (isSelected) {
                      const newAnswers = currentAnswers.filter(a => a !== option.text);
                      setSelectedAnswer(newAnswers.join(','));
                    } else {
                      setSelectedAnswer([...currentAnswers, option.text].join(','));
                    }
                  }}
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
                    {option.image && (
                      <Image 
                        source={{ uri: option.image }} 
                        style={styles.optionImage}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {htmlToPlainText(option.text)}
                    </Text>
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
            value={textAnswer}
            onChangeText={setTextAnswer}
            multiline
            autoFocus
          />
        );

      case 'fillInTheBlanks':
        return (
          <View style={styles.fillContainer}>
            {question.fill && (
              <View style={styles.fillBox}>
                <Text style={styles.fillLabel}>Fill in the blank:</Text>
                <TextInput
                  style={styles.fillInput}
                  placeholder={`Enter ${question.fill.type} answer(s)`}
                  placeholderTextColor={colors.text.secondary}
                  value={fillAnswers[question.fill.box] || ''}
                  onChangeText={(value) => handleFillChange(question.fill!.box, value)}
                  autoFocus
                />
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!question) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={question.closeable ? onClose : undefined}
      // Ensure modal is always on top
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={[
        modalStyles.modalOverlay,
        { 
          // Ensure modal is always on top of video player
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
            // Ensure modal container is always on top
            zIndex: 10000,
            elevation: 10000,
          }
        ]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="help-circle" size={24} color={colors.brand.primary} />
              <Text style={styles.modalTitle}>Question</Text>
            </View>
            <View style={styles.headerRight}>
              {question.closeable && onClose && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text.secondary} />
                </TouchableOpacity>
              )}
              <View style={styles.timerContainer}>
                <Ionicons name="time" size={16} color={colors.status.warning} />
                <Text style={styles.timerText}>{timeLeft}s</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderQuestionContent()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedAnswer && !textAnswer && Object.keys(fillAnswers).length === 0) && 
                styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedAnswer && !textAnswer && Object.keys(fillAnswers).length === 0}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
