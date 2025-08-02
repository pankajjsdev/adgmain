import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy course data
const courseData = {
  '1': {
    id: '1',
    title: 'React Native Fundamentals',
    description: 'Learn the basics of React Native development',
    chapters: [
      { id: '1', title: 'Introduction to React Native', description: 'Getting started with React Native' },
      { id: '2', title: 'Components and Props', description: 'Understanding React Native components' },
      { id: '3', title: 'State Management', description: 'Managing state in React Native apps' },
    ]
  },
  '2': {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts',
    chapters: [
      { id: '1', title: 'Async Programming', description: 'Promises, async/await, and callbacks' },
      { id: '2', title: 'ES6+ Features', description: 'Modern JavaScript features' },
    ]
  }
};

export default function CourseDetails() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  
  const course = courseData[courseId as keyof typeof courseData];

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Course not found</Text>
      </SafeAreaView>
    );
  }

  const renderChapter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chapterCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${item.id}`)}
    >
      <Text style={styles.chapterTitle}>{item.title}</Text>
      <Text style={styles.chapterDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>

        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          <FlatList
            data={course.chapters}
            renderItem={renderChapter}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  chaptersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  chapterCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
});
