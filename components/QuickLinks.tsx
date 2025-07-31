import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons'; // Using @expo/vector-icons

interface QuickLinkProps {
  title: string;
  description: string;
  imageSource: { uri: string }; // Use URI for placeholder images
  onPress: () => void;
}

const QuickLink: React.FC<QuickLinkProps> = ({ title, description, imageSource, onPress }) => {
  return (
    <TouchableOpacity style={styles.linkContainer} onPress={onPress}>
      <Image source={imageSource} style={styles.linkImage} />
      <View style={styles.linkTextContainer}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText type="secondary">{description}</ThemedText>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color="#000" />{/* Adjust color as needed */}
    </TouchableOpacity>
  );
};

const QuickLinks = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Quick Links</ThemedText>
      <QuickLink 
        title="Courses"
        description="View all the active courses."
        imageSource={{ uri: 'https://picsum.photos/100/100' }} // Placeholder image
        onPress={() => { /* Handle navigation */ }}
      />
      <QuickLink 
        title="Analytics"
        description="View all the analytics related stats."
        imageSource={{ uri: 'https://picsum.photos/100/100' }} // Placeholder image
        onPress={() => { /* Handle navigation */ }}
      />
      <QuickLink 
        title="Forum"
        description="Coming Soon."
        imageSource={{ uri: 'https://picsum.photos/100/100' }} // Placeholder image
        onPress={() => { /* Handle navigation */ }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Adjust background color as needed
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  linkImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
  },
  linkTextContainer: {
    flex: 1,
  },
});

export default QuickLinks;