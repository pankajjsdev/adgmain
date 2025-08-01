import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import useAuthStore from '@/store/authStore'; // Adjust import path

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Add confirm password
  // Add other fields as needed (e.g., username, name)
  const signup = useAuthStore((state) => state.signup);
  const { loading, error, isAuthenticated } = useAuthStore(); // Check isAuthenticated
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match'); // Basic password match check
      return;
    }
    // Include other necessary fields in the signup data
    await signup({ email, password /* , other fields */ });
  };

  // Redirect to main app if authenticated after signup
  if (isAuthenticated) {
    router.replace('/'); // Replace with your main app route
    return null; // Don't render anything while redirecting
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sign Up', headerShown: false }} /> {/* Hide header */}
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
       <TextInput
        style={styles.input}
        placeholder="Confirm Password"n        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {/* Add other input fields for signup */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title={loading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignup} disabled={loading} />
      <Button title="Go to Login" onPress={() => router.push('/login')} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});