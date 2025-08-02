import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useOnboardingStore from '@/store/onboardingStore';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to ADG Classes',
    subtitle: 'Your journey to excellence starts here',
    description: 'Access high-quality courses, interactive lessons, and comprehensive study materials all in one place.',
    image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Welcome',
    backgroundColor: '#4ECDC4',
  },
  {
    id: 2,
    title: 'Learn at Your Own Pace',
    subtitle: 'Flexible learning experience',
    description: 'Watch videos, complete assignments, take tests, and download notes whenever and wherever you want.',
    image: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Learn',
    backgroundColor: '#45B7D1',
  },
  {
    id: 3,
    title: 'Track Your Progress',
    subtitle: 'Stay motivated and organized',
    description: 'Monitor your learning progress, view grades, and get insights into your performance across all courses.',
    image: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Progress',
    backgroundColor: '#96CEB4',
  },
  {
    id: 4,
    title: 'Ready to Get Started?',
    subtitle: 'Join thousands of successful students',
    description: 'Create your account and start your learning journey with ADG Classes today.',
    image: 'https://via.placeholder.com/300x200/FFEAA7/FFFFFF?text=Start',
    backgroundColor: '#FFEAA7',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();
  const { colors, spacing, typography, borderRadius, shadows } = useGlobalStyles();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const currentSlide = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const localStyles = getLocalStyles(colors, spacing, typography, borderRadius, shadows, width, height);

  return (
    <SafeAreaView style={[localStyles.container, { backgroundColor: currentSlide.backgroundColor }]}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={localStyles.skipButton} onPress={handleSkip}>
          <Text style={localStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Main Content */}
      <View style={localStyles.content}>
        {/* Image */}
        <View style={localStyles.imageContainer}>
          <Image source={{ uri: currentSlide.image }} style={localStyles.image} />
        </View>

        {/* Text Content */}
        <View style={localStyles.textContainer}>
          <Text style={localStyles.title}>{currentSlide.title}</Text>
          <Text style={localStyles.subtitle}>{currentSlide.subtitle}</Text>
          <Text style={localStyles.description}>{currentSlide.description}</Text>
        </View>

        {/* Pagination Dots */}
        <View style={localStyles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                localStyles.dot,
                index === currentIndex ? localStyles.activeDot : localStyles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={localStyles.navigation}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[localStyles.navButton, currentIndex === 0 && localStyles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentIndex === 0 ? colors.text.disabled : colors.text.inverse} 
          />
        </TouchableOpacity>

        {/* Next/Get Started Button */}
        <TouchableOpacity style={localStyles.primaryButton} onPress={handleNext}>
          <Text style={localStyles.primaryButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          {!isLastSlide && (
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} style={localStyles.buttonIcon} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Local styles using global design tokens
const getLocalStyles = (colors: any, spacing: any, typography: any, borderRadius: any, shadows: any, width: number, height: number) => ({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute' as const,
    top: 60,
    right: spacing.lg,
    zIndex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
  },
  skipText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.3,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing['3xl'],
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: borderRadius.lg,
    resizeMode: 'cover' as const,
  },
  textContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center' as const,
    marginBottom: spacing.base,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: colors.text.inverse,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  navigation: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  primaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center' as const,
    ...shadows.md,
  },
  primaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
});
