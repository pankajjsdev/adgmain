import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Dummy note details data
const noteDetailsData = {
  '1': {
    '1': {
      '1': {
        id: '1',
        title: 'React Native Environment Setup Guide',
        description: 'Complete guide for setting up React Native development environment on different operating systems including Node.js, Android Studio, and Xcode installation.',
        downloadLink: 'https://example.com/notes/rn-setup-guide.pdf',
        fileSize: '2.5 MB',
        fileType: 'PDF',
        lastUpdated: '2024-08-01',
        downloadCount: 245,
        isDownloaded: true,
        author: 'Dr. Sarah Johnson',
        pages: 24,
        language: 'English',
        tags: ['Setup', 'Environment', 'Installation', 'Beginner'],
        tableOfContents: [
          'Introduction to React Native',
          'System Requirements',
          'Installing Node.js',
          'Setting up Android Studio',
          'Configuring Xcode (macOS)',
          'Creating Your First Project',
          'Troubleshooting Common Issues',
          'Additional Resources'
        ],
        summary: 'This comprehensive guide walks you through the complete process of setting up a React Native development environment. It covers installation procedures for all major operating systems and includes troubleshooting tips for common setup issues.',
        prerequisites: [
          'Basic knowledge of JavaScript',
          'Familiarity with command line interface',
          'Understanding of mobile app development concepts'
        ],
        relatedNotes: [
          { id: '2', title: 'Component Lifecycle Cheat Sheet' },
          { id: '3', title: 'Navigation Patterns and Examples' }
        ]
      },
      '2': {
        id: '2',
        title: 'Component Lifecycle Cheat Sheet',
        description: 'Quick reference for React Native component lifecycle methods, hooks, and best practices for state management.',
        downloadLink: 'https://example.com/notes/lifecycle-cheatsheet.pdf',
        fileSize: '1.8 MB',
        fileType: 'PDF',
        lastUpdated: '2024-07-28',
        downloadCount: 189,
        isDownloaded: false,
        author: 'Prof. Michael Chen',
        pages: 12,
        language: 'English',
        tags: ['Lifecycle', 'Hooks', 'State Management', 'Intermediate'],
        tableOfContents: [
          'Component Lifecycle Overview',
          'Class Component Lifecycle Methods',
          'Functional Component Hooks',
          'useEffect Hook Deep Dive',
          'State Management Best Practices',
          'Performance Optimization Tips'
        ],
        summary: 'A concise reference guide covering React Native component lifecycle methods and modern hooks. Perfect for quick lookups during development.',
        prerequisites: [
          'Basic React Native knowledge',
          'Understanding of JavaScript ES6+',
          'Familiarity with React concepts'
        ],
        relatedNotes: [
          { id: '1', title: 'React Native Environment Setup Guide' },
          { id: '3', title: 'Navigation Patterns and Examples' }
        ]
      },
    }
  }
};

export default function NoteDetails() {
  const { courseId, chapterId, noteId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
    noteId: string; 
  }>();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const note = noteDetailsData[courseId as keyof typeof noteDetailsData]
    ?.[chapterId as keyof typeof noteDetailsData['1']]
    ?.[noteId as keyof typeof noteDetailsData['1']['1']];

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Note not found</Text>
      </SafeAreaView>
    );
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownload = async () => {
    try {
      Alert.alert(
        'Download Note',
        `Download "${note.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              // In a real app, this would trigger the actual download
              // For now, we'll just open the link
              const supported = await Linking.canOpenURL(note.downloadLink);
              if (supported) {
                await Linking.openURL(note.downloadLink);
              } else {
                Alert.alert('Error', 'Unable to open download link');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download the file');
    }
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'information-circle-outline' },
    { id: 'contents', title: 'Contents', icon: 'list-outline' },
    { id: 'details', title: 'Details', icon: 'document-text-outline' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{note.description}</Text>
            
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{note.summary}</Text>

            <Text style={styles.sectionTitle}>Prerequisites</Text>
            {note.prerequisites.map((prereq, index) => (
              <View key={index} style={styles.prerequisiteItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                <Text style={styles.prerequisiteText}>{prereq}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {note.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 'contents':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Table of Contents</Text>
            {note.tableOfContents.map((item, index) => (
              <View key={index} style={styles.contentItem}>
                <Text style={styles.contentNumber}>{index + 1}.</Text>
                <Text style={styles.contentTitle}>{item}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'details':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>File Information</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Author</Text>
                <Text style={styles.detailValue}>{note.author}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Pages</Text>
                <Text style={styles.detailValue}>{note.pages}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Language</Text>
                <Text style={styles.detailValue}>{note.language}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>File Size</Text>
                <Text style={styles.detailValue}>{note.fileSize}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Last Updated</Text>
                <Text style={styles.detailValue}>{formatDate(note.lastUpdated)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Downloads</Text>
                <Text style={styles.detailValue}>{note.downloadCount}</Text>
              </View>
            </View>

            {note.relatedNotes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Related Notes</Text>
                {note.relatedNotes.map((relatedNote, index) => (
                  <TouchableOpacity key={index} style={styles.relatedNoteItem}>
                    <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                    <Text style={styles.relatedNoteTitle}>{relatedNote.title}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.fileTypeIcon, { backgroundColor: getFileTypeColor(note.fileType) + '20' }]}>
              <Ionicons name="document-text" size={32} color={getFileTypeColor(note.fileType)} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.fileInfo}>{note.fileType} • {note.fileSize}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#007AFF' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Download Section */}
        <View style={styles.downloadSection}>
          <TouchableOpacity 
            style={[styles.downloadButton, note.isDownloaded && styles.downloadedButton]}
            onPress={handleDownload}
          >
            <Ionicons 
              name={note.isDownloaded ? "checkmark-circle" : "download"} 
              size={20} 
              color={note.isDownloaded ? "#4CAF50" : "#fff"} 
            />
            <Text style={[
              styles.downloadButtonText, 
              note.isDownloaded && { color: '#4CAF50' }
            ]}>
              {note.isDownloaded ? 'Downloaded' : 'Download Note'}
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fileTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 26,
  },
  fileInfo: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  summary: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    marginBottom: 24,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prerequisiteText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    width: 30,
  },
  contentTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  detailsGrid: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  relatedNoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  relatedNoteTitle: {
    flex: 1,
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  downloadSection: {
    padding: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
  },
  downloadedButton: {
    backgroundColor: '#4CAF5020',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
});
