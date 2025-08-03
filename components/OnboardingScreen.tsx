import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getClientConfig } from '@/utils/clientConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const clientConfig = getClientConfig();
  const onboardingConfig = clientConfig.onboarding;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  // Use effect to handle onboarding completion
  React.useEffect(() => {
    if (!onboardingConfig?.enabled) {
      onComplete();
    }
  }, [onboardingConfig?.enabled, onComplete]);

  // If onboarding is disabled for this client, return null
  if (!onboardingConfig?.enabled) {
    return null;
  }

  const screens: OnboardingScreenData[] = onboardingConfig.screens || [];

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (onboardingConfig.skipEnabled) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Mark onboarding as completed
    await AsyncStorage.setItem(`onboarding_completed_${clientConfig.name}`, 'true');
    onComplete();
  };

  const renderOnboardingScreen = ({ item, index }: { item: OnboardingScreenData; index: number }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <StatusBar backgroundColor={item.backgroundColor} barStyle="light-content" />
        
        {/* Skip Button */}
        {onboardingConfig.skipEnabled && index < screens.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: item.textColor }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `asset:/assets/clients/${clientConfig.name}/onboarding/${item.image}` }}
              style={styles.image}
              defaultSource={require('@/assets/images/placeholder.png')}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: item.textColor }]}>
              {item.title}
            </Text>
            <Text style={[styles.subtitle, { color: item.textColor }]}>
              {item.subtitle}
            </Text>
            <Text style={[styles.description, { color: item.textColor }]}>
              {item.description}
            </Text>
          </View>
        </View>

        {/* Progress Indicators */}
        {onboardingConfig.showProgress && (
          <View style={styles.progressContainer}>
            {screens.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i === index ? item.textColor : `${item.textColor}50`,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          {index > 0 && (
            <TouchableOpacity
              style={[styles.navButton, { borderColor: item.textColor }]}
              onPress={() => {
                setCurrentIndex(index - 1);
                slidesRef.current?.scrollToIndex({ index: index - 1 });
              }}
            >
              <Ionicons name="chevron-back" size={24} color={item.textColor} />
            </TouchableOpacity>
          )}

          <View style={styles.navSpacer} />

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, { backgroundColor: item.textColor }]}
            onPress={handleNext}
          >
            {index === screens.length - 1 ? (
              <Text style={[styles.nextButtonText, { color: item.backgroundColor }]}>
                Get Started
              </Text>
            ) : (
              <Ionicons name="chevron-forward" size={24} color={item.backgroundColor} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.FlatList
        ref={slidesRef}
        data={screens}
        renderItem={renderOnboardingScreen}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Urbanist-Bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Urbanist-SemiBold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Urbanist-Regular',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  nextButton: {
    borderWidth: 0,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Urbanist-SemiBold',
  },
  navSpacer: {
    flex: 1,
  },
});
