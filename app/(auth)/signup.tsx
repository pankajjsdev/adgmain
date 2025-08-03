import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/store/authStore';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { GoogleAuthResult } from '@/utils/googleAuth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { styles, colors, spacing } = useGlobalStyles();
  const { signup, loading, error, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    
    await signup({ email, password });
  };

  const handleGoogleSignupSuccess = (result: GoogleAuthResult) => {
    console.log('Google signup successful:', result.user?.email);
    // Navigation will be handled by the auth store
  };

  const handleGoogleSignupError = (error: string) => {
    console.error('Google signup error:', error);
    Alert.alert('Google Signup Failed', error);
  };

  // Redirect to main app if authenticated after signup
  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  const localStyles = getLocalStyles(colors, spacing);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Sign Up', headerShown: false }} />
      <ScrollView style={styles.container} contentContainerStyle={localStyles.content}>
        <View style={localStyles.header}>
          <Text style={styles.heading2}>Create Account</Text>
          <Text style={styles.textSecondary}>Join ADG Classes today</Text>
        </View>

        <View style={localStyles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
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
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={colors.icon.secondary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={localStyles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.icon.secondary}
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={colors.icon.secondary} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.text.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={localStyles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.icon.secondary}
                />
              </Pressable>
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Sign Up Button */}
          <Pressable
            style={[
              styles.buttonPrimary,
              (loading || !email || !password || !confirmPassword) && styles.buttonDisabled
            ]}
            onPress={handleSignup}
            disabled={loading || !email || !password || !confirmPassword}
          >
            <Text style={styles.buttonTextPrimary}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </Pressable>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            mode="signup"
            onSuccess={handleGoogleSignupSuccess}
            onError={handleGoogleSignupError}
            style={{ marginTop: 16 }}
          />

          {/* Login Link */}
          <View style={localStyles.loginContainer}>
            <Text style={styles.textSecondary}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={localStyles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Local styles for specific layout needs
const getLocalStyles = (colors: any, spacing: any) => ({
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
  loginContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: spacing.xl,
  },
  loginLink: {
    fontSize: 16,
    color: colors.brand.primary,
    fontWeight: '600' as const,
  },
});