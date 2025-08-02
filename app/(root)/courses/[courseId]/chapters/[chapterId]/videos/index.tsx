import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy video data
const videoData = {
  '1': {
    '1': [
      {
        id: '1',
        title: 'Setting up React Native Environment',
        duration: '12:34',
        description: 'Learn how to set up your development environment for React Native',
        thumbnail: 'https://via.placeholder.com/320x180/FF6B6B/FFFFFF?text=Video+1',
        videoUrl: 'https://example.com/video1.mp4',
        isWatched: true,
      },
      {
        id: '2',
        title: 'Creating Your First App',
        duration: '18:45',
        description: 'Build your first React Native application from scratch',
        thumbnail: 'https://via.placeholder.com/320x180/4ECDC4/FFFFFF?text=Video+2',
        videoUrl: 'https://example.com/video2.mp4',
        isWatched: false,
      },
      {
        id: '3',
        title: 'Understanding Project Structure',
        duration: '15:20',
        description: 'Explore the React Native project structure and important files',
        thumbnail: 'https://via.placeholder.com/320x180/45B7D1/FFFFFF?text=Video+3',
        videoUrl: 'https://example.com/video3.mp4',
        isWatched: false,
      },
      {
        id: '4',
        title: 'Running on iOS and Android',
        duration: '22:10',
        description: 'Learn how to run your app on both iOS and Android devices',
        thumbnail: 'https://via.placeholder.com/320x180/96CEB4/FFFFFF?text=Video+4',
        videoUrl: 'https://example.com/video4.mp4',
        isWatched: false,
      },
      {
        id: '5',
        title: 'Debugging React Native Apps',
        duration: '16:55',
        description: 'Master debugging techniques for React Native development',
        thumbnail: 'https://via.placeholder.com/320x180/FFEAA7/FFFFFF?text=Video+5',
        videoUrl: 'https://example.com/video5.mp4',
        isWatched: false,
      },
    ]
  }
};

export default function VideoList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  const videos = videoData[courseId as keyof typeof videoData]?.[chapterId as keyof typeof videoData['1']] || [];

  const renderVideo = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/videos/${item.id}`)}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
        {item.isWatched && (
          <View style={styles.watchedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        )}
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.videoDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.videoMeta}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.metaText}>{item.duration}</Text>
          {item.isWatched && (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.watchedIcon} />
              <Text style={[styles.metaText, { color: '#4CAF50' }]}>Watched</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Videos</Text>
        <Text style={styles.headerSubtitle}>{videos.length} videos available</Text>
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
  watchedIcon: {
    marginLeft: 8,
  },
});
