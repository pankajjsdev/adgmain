import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import useAuthStore from '@/store/authStore';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginScreen() {
  const { styles, colors, spacing } = useGlobalStyles();
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Handle redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to main app after successful login
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      // Error is handled by the store
      console.error('Login error:', err);
    }
  };

  const handleGoogleLoginSuccess = (result: any) => {
    console.log('Google login successful:', result.user?.email);
    // Navigation will be handled by the auth store
  };

  const handleGoogleLoginError = (error: string) => {
    console.error('Google login error:', error);
    Alert.alert('Google Login Failed', error);
  };

  const handleSignUpPress = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={getLocalStyles(colors, spacing).content}>
        <View style={getLocalStyles(colors, spacing).header}>
          <Text style={styles.heading2}>Welcome Back</Text>
          <Text style={styles.textSecondary}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={getLocalStyles(colors, spacing).form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[
              styles.inputWrapper,
              validationErrors.email && styles.inputWrapperError
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={colors.icon.secondary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationErrors.email) {
                    setValidationErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email input"
                accessibilityHint="Enter your email address"
              />
            </View>
            {validationErrors.email && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.status.error} />
                <Text style={styles.errorText}>{validationErrors.email}</Text>
              </View>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.icon.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                accessibilityLabel="Password input"
                accessibilityHint="Enter your password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={getLocalStyles(colors, spacing).eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.icon.secondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Global Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <Pressable
            style={[
              styles.buttonPrimary,
              (loading || !email || !password) && styles.buttonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
            accessibilityLabel="Login button"
            accessibilityHint="Tap to sign in to your account"
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonTextPrimary}>Sign In</Text>
            )}
          </Pressable>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            mode="login"
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            style={{ marginTop: 16 }}
          />

          {/* Sign Up Link */}
          <View style={getLocalStyles(colors, spacing).signupContainer}>
            <Text style={styles.textSecondary}>Don&apos;t have an account? </Text>
            <Pressable
              onPress={handleSignUpPress}
              accessibilityLabel="Sign up link"
              accessibilityHint="Tap to go to sign up screen"
            >
              <Text style={getLocalStyles(colors, spacing).signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Local styles for specific layout needs
const localStyles = (colors: any, spacing: any) => ({
  content: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  signupContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: spacing.xl,
  },
  signupLink: {
    fontSize: 16,
    color: colors.brand.primary,
    fontWeight: '600' as const,
  },
});

// Apply local styles
const getLocalStyles = (colors: any, spacing: any) => localStyles(colors, spacing);