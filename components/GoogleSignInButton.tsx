/**
 * Google Sign-In Button Component
 * Reusable button for Google authentication with multi-tenant support
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogle, GoogleAuthResult } from '@/utils/googleAuth';
import { isFeatureEnabled } from '@/utils/clientConfig';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useAuthStore from '@/store/authStore';

interface GoogleSignInButtonProps {
  onSuccess: (result: GoogleAuthResult) => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'signup';
  disabled?: boolean;
  style?: any;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  mode = 'login',
  disabled = false,
  style
}: GoogleSignInButtonProps) {
  const { colors } = useGlobalStyles();
  const { loginWithGoogle, signupWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Check if Google login is enabled for this client
  if (!isFeatureEnabled('socialLogin')) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        // For now, we'll use a placeholder idToken since the GoogleAuthResult interface doesn't include it
        // In a real implementation, you'd get the idToken from the Google Sign-In result
        const idToken = 'placeholder_token'; // This should be the actual idToken from Google
        
        // Call the appropriate auth store method based on mode
        if (mode === 'login') {
          await loginWithGoogle(result.user, idToken);
        } else {
          await signupWithGoogle(result.user, idToken);
        }
        onSuccess(result);
      } else {
        const errorMessage = result.error || 'Google sign-in failed';
        Alert.alert('Error', errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonText = mode === 'login' ? 'Sign in with Google' : 'Sign up with Google';

  return (
    <TouchableOpacity
      style={[
        localStyles.button,
        {
          backgroundColor: colors.surface.elevated,
          borderColor: colors.border.primary,
        },
        disabled && localStyles.buttonDisabled,
        style
      ]}
      onPress={handleGoogleSignIn}
      disabled={loading || disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={colors.text.secondary} 
          style={localStyles.loadingIndicator}
        />
      ) : (
        <View style={localStyles.buttonContent}>
          {/* Google Logo */}
          <View style={localStyles.iconContainer}>
            <Ionicons 
              name="logo-google" 
              size={20} 
              color="#4285F4" 
            />
          </View>
          
          <Text style={[
            localStyles.buttonText,
            { color: colors.text.primary }
          ]}>
            {buttonText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const localStyles = {
  button: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconContainer: {
    marginRight: 12,
    width: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  loadingIndicator: {
    marginHorizontal: 12,
  },
};
