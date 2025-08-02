import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '@/types/video';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

interface VideoQuestionModalProps {
  visible: boolean;
  question: Question | null;
  onAnswer: (answer: string) => void;
  onClose?: () => void;
}

export const VideoQuestionModal: React.FC<VideoQuestionModalProps> = ({
  visible,
  question,
  onAnswer,
  onClose
}) => {
  const { styles, colors } = useGlobalStyles();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [fillAnswers, setFillAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

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
          {question.question.text}
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
                    {option.text}
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
                      {option.text}
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
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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

// Styles will be added to GlobalStyles.ts, but for now using inline styles
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  closeButton: {
    padding: 4,
    marginRight: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginLeft: 4,
  },
  modalContent: {
    flex: 1,
  },
  questionContent: {
    padding: 20,
  },
  questionImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 4,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fillContainer: {
    gap: 16,
  },
  fillBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  fillLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  fillInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};
