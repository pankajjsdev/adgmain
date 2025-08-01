import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText'; // Adjust import based on your project structure
import { apiGet } from '@/api'; // Import your API helper

interface Course {
  id: string;
  title: string;
  lessons: number;
  time: string;
  image: { uri: string };
}

function renderCourse({ item }: { item: Course }) {
  return (
    <View style={styles.card}>
      {item.image && <Image source={item.image} style={styles.image} />}
      <View style={styles.cardTextContainer}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText type="secondary">{item.lessons + ' Lessons • ' + item.time}</ThemedText>
      </View>
    </View>
  );
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await apiGet<Course[]>('/student-courses');
        if (response.ok) {
          setCourses(response.data);
        } else {
          setError(response.error?.message || 'Error fetching courses');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Available Courses' }} />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Loading Courses...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <ThemedText type="error">{error}</ThemedText>
        </View>
      )}

      {!loading && !error && courses.length > 0 && (
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!loading && !error && courses.length === 0 && (
        <View style={styles.centered}>
          <ThemedText>No courses available.</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // White background for cards
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    resizeMode: 'cover', // Ensure image covers the area
  },
  cardTextContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});