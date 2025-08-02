import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy chapter data
const chapterData = {
  '1': {
    '1': {
      id: '1',
      title: 'Introduction to React Native',
      description: 'Getting started with React Native development',
      videoCount: 5,
      assignmentCount: 2,
      testCount: 1,
      noteCount: 3,
    },
    '2': {
      id: '2',
      title: 'Components and Props',
      description: 'Understanding React Native components and props',
      videoCount: 8,
      assignmentCount: 3,
      testCount: 2,
      noteCount: 4,
    },
    '3': {
      id: '3',
      title: 'State Management',
      description: 'Managing state in React Native applications',
      videoCount: 6,
      assignmentCount: 2,
      testCount: 1,
      noteCount: 2,
    },
  }
};

export default function ChapterDetails() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  const chapter = chapterData[courseId as keyof typeof chapterData]?.[chapterId as keyof typeof chapterData['1']];

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chapter not found</Text>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      title: 'Videos',
      icon: 'play-circle-outline',
      count: chapter.videoCount,
      route: `/courses/${courseId}/chapters/${chapterId}/videos`,
      color: '#FF6B6B',
    },
    {
      title: 'Assignments',
      icon: 'document-text-outline',
      count: chapter.assignmentCount,
      route: `/courses/${courseId}/chapters/${chapterId}/assignments`,
      color: '#4ECDC4',
    },
    {
      title: 'Tests',
      icon: 'checkmark-circle-outline',
      count: chapter.testCount,
      route: `/courses/${courseId}/chapters/${chapterId}/tests`,
      color: '#45B7D1',
    },
    {
      title: 'Notes',
      icon: 'book-outline',
      count: chapter.noteCount,
      route: `/courses/${courseId}/chapters/${chapterId}/notes`,
      color: '#96CEB4',
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuCard, { borderLeftColor: item.color }]}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.menuContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuCount}>{item.count} items</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.chapterDescription}>{chapter.description}</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Chapter Content</Text>
          {menuItems.map(renderMenuItem)}
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
  chapterTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  chapterDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuCount: {
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
