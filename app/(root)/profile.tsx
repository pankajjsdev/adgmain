import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText'; // Adjust import path
import { apiGet } from '@/api'; // Import your API helper
import useAuthStore from '@/store/authStore'; // Import your auth store to potentially use user data from store

interface UserProfile { // Define a type for your user profile data
  id: string;
  email: string;
  name?: string; // Optional fields
  // Add other profile fields here
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: userFromStore } = useAuthStore(); // Get user data from auth store (optional)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Fetch user profile from the API endpoint
        const response = await apiGet<UserProfile>('/profile'); // Use your /profile endpoint
        if (response.success) {
          setUserProfile(response.data); // Adjust based on your API response structure
          // Optionally update the user data in the auth store here if it's more complete than the initial login data
          // useAuthStore.getState().setUser(response.data);
        } else {
          setError(response.message || 'Error fetching profile');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    // Fetch profile if not already available in the auth store or if you always want fresh data
    // if (!userFromStore) { // Uncomment this if you want to fetch only if user data is not in store
       fetchUserProfile();
    // }
     // If you rely on user data from the store, you might set it directly here
     // if (userFromStore) {
     //   setUserProfile(userFromStore);
     //   setLoading(false);
     // }

  }, []); // Dependency array - fetch only once on component mount

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profile' }} /> {/* Set header title */}

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Loading Profile...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <ThemedText type="error">{error}</ThemedText>
        </View>
      )}

      {!loading && !error && userProfile && (
        <View style={styles.profileInfo}>
          <ThemedText type="title">User Profile</ThemedText>
          <ThemedText>Email: {userProfile.email}</ThemedText>
          {userProfile.name && <ThemedText>Name: {userProfile.name}</ThemedText>}
          {/* Display other profile fields here */}
        </View>
      )}

       {!loading && !error && !userProfile && (
         <View style={styles.centered}>
           <ThemedText>No profile data available.</ThemedText>
         </View>
       )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    // Styles for displaying profile information
  },
});