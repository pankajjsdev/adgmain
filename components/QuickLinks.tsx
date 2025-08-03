import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useRouter, type Href } from 'expo-router';

// Allow both remote (uri) and local (require) images:
interface QuickLinkProps {
  title: string;
  description: string;
  imageSource: { uri: string } | number;
  href: Href;
}

const QuickLink: React.FC<QuickLinkProps> = ({ title, description, imageSource, href }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.linkContainer} onPress={() => router.push(href)}>
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
        href="/(tabs)/courses"
      />
      <QuickLink
        title="Analytics"
        description="View all the analytics related stats."
        imageSource={require('../assets/images/myimages/analytics.png')}
        href="/(root)/analytics"
      />
      <QuickLink
        title="Forum"
        description="Coming Soon."
        imageSource={require('../assets/images/myimages/form.png')}
        href="/(root)/forum"
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