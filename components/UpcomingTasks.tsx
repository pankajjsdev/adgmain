import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TaskProps {
  title: string;
  description: string;
  imageSource: { uri: string }; // Use URI for placeholder images
  trending?: boolean;
  completed?: string;
  duration?: string;
  onPress: () => void;
}

const Task: React.FC<TaskProps> = ({ title, description, imageSource, trending, completed, duration, onPress }) => {
  return (
    <TouchableOpacity style={styles.taskContainer} onPress={onPress}>
      <Image source={imageSource} style={styles.taskImage} />
      <View style={styles.taskContent}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText type="secondary">{description}</ThemedText>
        <View style={styles.taskDetails}>
          {trending && (
            <View style={styles.detailItem}>
              <Ionicons name="trending-up-outline" size={14} color="#007bff" />{/* Adjust color */}
              <ThemedText type="secondary" style={styles.detailText}>Trending</ThemedText>
            </View>
          )}
          {completed && (
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#28a745" />{/* Adjust color */}
              <ThemedText type="secondary" style={styles.detailText}>{completed} Completed</ThemedText>
            </View>
          )}
          {duration && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color="#6c757d" />{/* Adjust color */}
              <ThemedText type="secondary" style={styles.detailText}>Total Duration: {duration}</ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UpcomingTasks = () => {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Upcoming Tasks</ThemedText>
        <TouchableOpacity>
          <ThemedText type="link">View All</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.tasksList}>
        <Task 
          title="Frontend Development"
          description="Start Learning basics of frontend development."
          imageSource={{ uri: 'https://picsum.photos/300/200' }} // Placeholder image
          trending={true}
          completed="30%"
          duration="40 hrs"
          onPress={() => { /* Handle navigation */ }}
        />
         <Task 
          title="Backend Development"
          description="Start Learning basics of backend development."
          imageSource={{ uri: 'https://picsum.photos/300/200' }} // Placeholder image
          completed="50%"
          duration="60 hrs"
          onPress={() => { /* Handle navigation */ }}
        />
        {/* Add more Task components as needed */}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Added the missing quote
  },
  tasksList: {
    flexDirection: 'row', // Arrange tasks horizontally
    overflowX: 'scroll', // Enable horizontal scrolling if needed
    paddingVertical: 10,
  },
  taskContainer: {
    width: 250, // Adjust width as needed
    backgroundColor: '#f0f0f0', // Adjust background color
    borderRadius: 8,
    padding: 12,
    marginRight: 12, // Add spacing between tasks
  },
  taskImage: {
    width: '100%',
    height: 100, // Adjust height as needed
    borderRadius: 4,
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskDetails: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap', // Allow details to wrap to the next line
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

export default UpcomingTasks;