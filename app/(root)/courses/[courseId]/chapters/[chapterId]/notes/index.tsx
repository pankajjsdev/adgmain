import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy notes data
const notesData = {
  '1': {
    '1': [
      {
        id: '1',
        title: 'React Native Environment Setup Guide',
        description: 'Complete guide for setting up React Native development environment on different operating systems including Node.js, Android Studio, and Xcode installation.',
        downloadLink: 'https://example.com/notes/rn-setup-guide.pdf',
        fileSize: '2.5 MB',
        fileType: 'PDF',
        lastUpdated: '2024-08-01',
        downloadCount: 245,
        isDownloaded: true,
      },
      {
        id: '2',
        title: 'Component Lifecycle Cheat Sheet',
        description: 'Quick reference for React Native component lifecycle methods, hooks, and best practices for state management.',
        downloadLink: 'https://example.com/notes/lifecycle-cheatsheet.pdf',
        fileSize: '1.8 MB',
        fileType: 'PDF',
        lastUpdated: '2024-07-28',
        downloadCount: 189,
        isDownloaded: false,
      },
      {
        id: '3',
        title: 'Navigation Patterns and Examples',
        description: 'Comprehensive notes on React Navigation including stack, tab, and drawer navigation with practical examples and code snippets.',
        downloadLink: 'https://example.com/notes/navigation-guide.pdf',
        fileSize: '3.2 MB',
        fileType: 'PDF',
        lastUpdated: '2024-07-25',
        downloadCount: 156,
        isDownloaded: false,
      },
    ]
  }
};

export default function NotesList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  const notes = notesData[courseId as keyof typeof notesData]?.[chapterId as keyof typeof notesData['1']] || [];

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '#FF5722';
      case 'doc':
      case 'docx':
        return '#2196F3';
      case 'ppt':
      case 'pptx':
        return '#FF9800';
      case 'txt':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'document-text';
      case 'doc':
      case 'docx':
        return 'document';
      case 'ppt':
      case 'pptx':
        return 'easel';
      case 'txt':
        return 'document-outline';
      default:
        return 'document';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (sizeString: string) => {
    return sizeString;
  };

  const handleDownload = (note: any) => {
    // In a real app, this would trigger the download
    console.log('Downloading:', note.title);
  };

  const renderNote = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/notes/${item.id}`)}
    >
      <View style={styles.noteHeader}>
        <View style={[styles.fileTypeIcon, { backgroundColor: getFileTypeColor(item.fileType) + '20' }]}>
          <Ionicons 
            name={getFileTypeIcon(item.fileType) as any} 
            size={24} 
            color={getFileTypeColor(item.fileType)} 
          />
        </View>
        
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.noteDescription} numberOfLines={3}>{item.description}</Text>
        </View>

        {item.isDownloaded && (
          <View style={styles.downloadedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        )}
      </View>

      <View style={styles.noteMeta}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="document-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{item.fileType}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="archive-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{formatFileSize(item.fileSize)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.metaText}>{formatDate(item.lastUpdated)}</Text>
          </View>
        </View>

        <View style={styles.downloadInfo}>
          <Ionicons name="download-outline" size={16} color="#666" />
          <Text style={styles.downloadText}>{item.downloadCount} downloads</Text>
        </View>
      </View>

      <View style={styles.noteFooter}>
        <TouchableOpacity 
          style={[styles.downloadButton, item.isDownloaded && styles.downloadedButton]}
          onPress={() => handleDownload(item)}
        >
          <Ionicons 
            name={item.isDownloaded ? "checkmark-circle" : "download"} 
            size={16} 
            color={item.isDownloaded ? "#4CAF50" : "#007AFF"} 
          />
          <Text style={[
            styles.downloadButtonText, 
            item.isDownloaded && { color: '#4CAF50' }
          ]}>
            {item.isDownloaded ? 'Downloaded' : 'Download'}
          </Text>
        </TouchableOpacity>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes</Text>
        <Text style={styles.headerSubtitle}>{notes.length} study materials available</Text>
      </View>

      <FlatList
        data={notes}
        renderItem={renderNote}
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
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  fileTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  noteDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  downloadedBadge: {
    padding: 4,
  },
  noteMeta: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  downloadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF20',
    borderRadius: 20,
  },
  downloadedButton: {
    backgroundColor: '#4CAF5020',
  },
  downloadButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
});
