import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

export type VideoQuality = 'auto' | 'high' | 'data_saver';

interface VideoQualityModalProps {
  visible: boolean;
  selectedQuality: VideoQuality;
  onQualitySelect: (quality: VideoQuality) => void;
  onClose: () => void;
}

export const VideoQualityModal: React.FC<VideoQualityModalProps> = ({
  visible,
  selectedQuality,
  onQualitySelect,
  onClose,
}) => {
  const { colors, spacing, typography } = useGlobalStyles();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const qualityOptions = [
    {
      id: 'auto' as VideoQuality,
      title: 'Auto (Recommended)',
      description: 'Let us optimize video quality based on your internet bandwidth',
    },
    {
      id: 'high' as VideoQuality,
      title: 'Higher quality',
      description: 'Enjoy the best video quality, with higher data usage',
    },
    {
      id: 'data_saver' as VideoQuality,
      title: 'Data saver',
      description: 'Save data with a lower video quality',
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            }
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.surface.card,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Choose Your Preferred Video Quality
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Quality Options */}
        <View style={styles.optionsContainer}>
          {qualityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                { borderBottomColor: colors.border.primary },
              ]}
              onPress={() => {
                onQualitySelect(option.id);
                setTimeout(onClose, 150); // Brief delay for visual feedback
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.text.secondary }]}>
                    {option.description}
                  </Text>
                </View>
                {selectedQuality === option.id && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={24} color={colors.brand.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Note */}
        <View style={[styles.footer, { borderTopColor: colors.border.primary }]}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            Note: Selected quality will apply to all the videos. You can change it anytime from the settings icon on the player screen.
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkmark: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'left',
  },
});