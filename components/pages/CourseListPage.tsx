import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import CommonList from '../CommonList'; // The component above
import { ThemedText } from '../ThemedText';


const courses = [
  {
    id: '1',
    title: 'Frontend Development Beginner',
    lessons: 10,
    time: '8h 20min',
    image: require('../assets/images/course1.png')
  },
  // Add more courses
];

function renderCourse({ item }) {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={{ flex: 1 }}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText type="subtitle">{item.lessons + ' Lessons • ' + item.time}</ThemedText>
      </View>
    </View>
  );
}

export default function CourseListPage() {
  return (
    <CommonList
      title="Available Courses"
      items={courses}
      renderItem={renderCourse}
      keyExtractor={item => item.id}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  }
});
