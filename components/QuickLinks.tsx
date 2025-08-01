import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Allow both remote (uri) and local (require) images:
interface QuickLinkProps {
  title: string;
  description: string;
  imageSource: { uri: string } | number;
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
      <Ionicons name="chevron-forward-outline" size={24} color="#000" />
    </TouchableOpacity>
  );
};

// No prop needed, so leave QuickLinks as a regular const:
const QuickLinks: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Quick Links</ThemedText>
      <QuickLink
        title="Courses"
        description="View all the active courses."
        imageSource={require('../assets/images/myimages/course.png')} // Change to PNG or JPG, not SVG
        onPress={() => { /* Handle navigation */ }}
      />
      <QuickLink
        title="Analytics"
        description="View all the analytics related stats."
        imageSource={require('../assets/images/myimages/analytics.png')}
        onPress={() => { /* Handle navigation */ }}
      />
      <QuickLink
        title="Forum"
        description="Coming Soon."
        imageSource={require('../assets/images/myimages/form.png')}
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
