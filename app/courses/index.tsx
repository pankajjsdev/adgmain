import { ThemedText } from '@/components/ThemedText'; // Adjust import based on your project structure
import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

// Dummy data for courses with placeholder image URIs
const courses = [
  {
    id: '1',
    title: 'Frontend Development Beginner Course...',
    lessons: 10,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course1/60/60' } // Placeholder image URI
  },
  {
    id: '2',
    title: 'Backend Development Beginner Course...',
    lessons: 12,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course2/60/60' } // Placeholder image URI
  },
  {
    id: '3',
    title: 'Design Basics Fundamentals',
    lessons: 10,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course3/60/60' } // Placeholder image URI
  },
  {
    id: '4',
    title: 'MongoDB Intermediate Course Level - 1',
    lessons: 10,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course4/60/60' } // Placeholder image URI
  },
  {
    id: '5',
    title: 'Frontend Development Advance Course...',
    lessons: 10,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course5/60/60' } // Placeholder image URI
  },
  {
    id: '6',
    title: 'Backend Development Beginner Course...',
    lessons: 12,
    time: '8h 20min',
    image: { uri: 'https://picsum.photos/seed/course6/60/60' } // Placeholder image URI
  },
];

function renderCourse({ item }: { item: any }) {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardTextContainer}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText type="secondary">{item.lessons + ' Lessons • ' + item.time}</ThemedText>
      </View>
    </View>
  );
}

export default function CoursesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Available Courses' }} />
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
});