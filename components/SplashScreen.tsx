import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { getClientConfig } from '@/utils/clientConfig';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const clientConfig = getClientConfig();
  const splashConfig = clientConfig.splash;

  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Memoize animation completion callback
  const handleAnimationComplete = useCallback(() => {
    setTimeout(() => {
      onAnimationComplete();
    }, 500);
  }, [onAnimationComplete]);

  useEffect(() => {
    // If splash config is not available, skip it
    if (!splashConfig) {
      handleAnimationComplete();
      return;
    }
    
    const animationDuration = splashConfig.duration || 2000;
    
    // Create animation sequence based on client configuration
    const createAnimation = () => {
      switch (splashConfig.animationType) {
        case 'bounce':
          return Animated.sequence([
            Animated.spring(logoScale, {
              toValue: 1.2,
              useNativeDriver: true,
              tension: 100,
              friction: 3,
            }),
            Animated.parallel([
              Animated.spring(logoScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
              }),
              Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: animationDuration * 0.3,
              useNativeDriver: true,
            }),
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: animationDuration * 0.3,
              useNativeDriver: true,
            }),
          ]);
        case 'fade':
        default:
          return Animated.sequence([
            // Logo animation
            Animated.parallel([
              Animated.timing(logoScale, {
                toValue: 1,
                duration: animationDuration * 0.4,
                useNativeDriver: true,
              }),
              Animated.timing(logoOpacity, {
                toValue: 1,
                duration: animationDuration * 0.4,
                useNativeDriver: true,
              }),
            ]),
            // Brand text animation
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: animationDuration * 0.3,
              useNativeDriver: true,
            }),
            // Tagline animation
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: animationDuration * 0.3,
              useNativeDriver: true,
            }),
          ]);
      }
    };

    // Start animation
    const animation = createAnimation();
    animation.start(() => {
      handleAnimationComplete();
    });

    // Cleanup
    return () => {
      animation.stop();
    };
  }, [splashConfig, logoScale, logoOpacity, textOpacity, taglineOpacity, handleAnimationComplete]);

  // If splash config is not available, skip it
  if (!splashConfig) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: splashConfig.backgroundColor || clientConfig.colors.primary }]}>
      <StatusBar backgroundColor={splashConfig.backgroundColor || clientConfig.colors.primary} barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={{ uri: splashConfig.logoImage }}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Text */}
        {splashConfig?.showBrandText && (
          <Animated.Text
            style={[
              styles.brandText,
              {
                opacity: textOpacity,
                color: splashConfig?.textColor || '#FFFFFF',
              },
            ]}
          >
            {splashConfig.brandText || clientConfig.displayName}
          </Animated.Text>
        )}

        {/* Tagline */}
        {splashConfig?.showTagline && splashConfig?.tagline && (
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
                color: splashConfig?.textColor || '#FFFFFF',
              },
            ]}
          >
            {splashConfig.tagline}
          </Animated.Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Urbanist-Bold',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: 'Urbanist-Regular',
  },
});
