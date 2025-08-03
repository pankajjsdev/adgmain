import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useCourseStore from '@/store/courseStore';



// Progress Circle Component
const ProgressCircle = ({ progress, size = 60, strokeWidth = 6, color }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) => {
  const [animatedProgress] = useState(new Animated.Value(0));
  const { colors } = useGlobalStyles();
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);



  return (
    <View style={{ width: size, height: size, position: 'relative' as const }}>
      {/* Background Circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.border.secondary,
          position: 'absolute' as const,
        }}
      />
      {/* Progress Circle */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: progress > 25 ? color : 'transparent',
          borderBottomColor: progress > 50 ? color : 'transparent',
          borderLeftColor: progress > 75 ? color : 'transparent',
          position: 'absolute' as const,
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Progress Text */}
      <View
        style={{
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        }}
      >
        <Text style={{ fontSize: size * 0.2, fontWeight: 'bold' as const, color }}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

export default function ChapterDetails() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  const { styles, colors } = useGlobalStyles();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const {
    currentChapter,
    chaptersLoading,
    chaptersError,
    fetchChapter,
    clearError,
  } = useCourseStore();

  const loadChapterData = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      await fetchChapter(chapterId as string);
    } catch {
      Alert.alert(
        'Error',
        'Failed to load chapter details. Please try again.',
        [
          { text: 'OK', onPress: () => clearError('chapters') }
        ]
      );
    }
  }, [chapterId, fetchChapter, clearError]);

  useEffect(() => {
    loadChapterData();
  }, [loadChapterData]);

  if (chaptersLoading && !currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={styles.loadingText}>Loading chapter details...</Text>
        </View>
      </View>
    );
  }

  if (chaptersError && !currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.heading3}>Failed to load chapter</Text>
          <Text style={styles.textSecondary}>{chaptersError}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={loadChapterData}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!currentChapter) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Chapter Details' }} />
        <View style={styles.centeredContainer}>
          <Ionicons name="library-outline" size={64} color={colors.icon.secondary} />
          <Text style={styles.heading3}>Chapter not found</Text>
          <Text style={styles.textSecondary}>The requested chapter could not be found.</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate counts from API response arrays
  const videosCount = currentChapter?.videos?.length || 0;
  const assignmentsCount = currentChapter?.assignments?.length || 0;
  const testsCount = currentChapter?.tests?.length || 0;
  const notesCount = currentChapter?.notes?.length || 0;

  // Calculate overall progress
  const calculateProgress = () => {
    if (!currentChapter) return 0;
    const total = videosCount + assignmentsCount + testsCount + notesCount;
    if (total === 0) return 0;
    // Mock completed items - in real app, this would come from API
    const completed = Math.floor(total * 0.65); // 65% completion for demo
    return (completed / total) * 100;
  };

  const contentTypes = [
    {
      id: 'videos',
      title: 'Videos',
      icon: 'play-circle',
      count: videosCount,
      completed: Math.floor(videosCount * 0.7),
      route: `/courses/${courseId}/chapters/${chapterId}/videos`,
      color: colors.brand.primary,
      gradient: [colors.brand.primary + '20', colors.brand.primary + '10'],
      description: 'Interactive video lessons',
      duration: `${videosCount * 15} min`, // Estimated duration
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: 'document-text',
      count: assignmentsCount,
      completed: Math.floor(assignmentsCount * 0.5),
      route: `/courses/${courseId}/chapters/${chapterId}/assignments`,
      color: colors.status.info,
      gradient: [colors.status.info + '20', colors.status.info + '10'],
      description: 'Practice exercises',
      duration: `${assignmentsCount * 30} min`, // Estimated duration
    },
    {
      id: 'tests',
      title: 'Tests',
      icon: 'school',
      count: testsCount,
      completed: Math.floor(testsCount * 0.3),
      route: `/courses/${courseId}/chapters/${chapterId}/tests`,
      color: colors.status.warning,
      gradient: [colors.status.warning + '20', colors.status.warning + '10'],
      description: 'Knowledge assessments',
      duration: `${testsCount * 45} min`, // Estimated duration
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: 'book',
      count: notesCount,
      completed: Math.floor(notesCount * 0.8),
      route: `/courses/${courseId}/chapters/${chapterId}/notes`,
      color: colors.status.success,
      gradient: [colors.status.success + '20', colors.status.success + '10'],
      description: 'Study materials',
      duration: `${notesCount * 10} min`, // Estimated duration
    },
  ];

  const filterOptions = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'videos', label: 'Videos', icon: 'play-circle-outline' },
    { id: 'assignments', label: 'Tasks', icon: 'document-text-outline' },
    { id: 'tests', label: 'Tests', icon: 'school-outline' },
  ];

  // Enhanced Content Card Component
  const renderContentCard = (item: any) => {
    const progress = item.count > 0 ? (item.completed / item.count) * 100 : 0;
    const isFiltered = selectedFilter === 'all' || selectedFilter === item.id;
    
    if (!isFiltered) return null;

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.contentCard}
        onPress={() => {
          if (item.count > 0) {
            console.log('Navigating to:', item.route);
            router.push(item.route);
          } else {
            console.log('No content available for:', item.title);
          }
        }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.cardProgress}>
            <ProgressCircle 
              progress={progress} 
              size={40} 
              strokeWidth={4}
              color={item.color} 
            />
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          
          <View style={styles.cardStats}>
            <View style={styles.statRow}>
              <Ionicons name="time-outline" size={14} color={colors.icon.secondary} />
              <Text style={styles.textSecondary}>{item.duration}</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="list-outline" size={14} color={colors.icon.secondary} />
              <Text style={styles.textSecondary}>{item.count} items</Text>
            </View>
          </View>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.chapterProgressBar}>
            <View 
              style={[
                styles.chapterProgressFill, 
                { width: `${Math.round(progress)}%` }
              ]} 
            />
          </View>
          <Text style={styles.chapterProgressText}>{Math.round(progress)}% Complete</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Filter Button Component
  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Ionicons 
        name={filter.icon as any} 
        size={16} 
        color={selectedFilter === filter.id ? colors.brand.primary : colors.text.secondary} 
      />
      <Text 
        style={[
          styles.filterButtonText,
          selectedFilter === filter.id && styles.filterButtonTextActive
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const overallProgress = calculateProgress();
  const filteredContent = contentTypes.filter(item => 
    selectedFilter === 'all' || selectedFilter === item.id
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: currentChapter?.title || 'Chapter Details',
        headerTitleStyle: { fontSize: 16 }
      }} />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={chaptersLoading}
            onRefresh={loadChapterData}
            colors={[colors.brand.primary]}
            tintColor={colors.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{currentChapter?.title}</Text>
              <Text style={styles.heroDescription}>{currentChapter?.description}</Text>
              
              {/* Chapter Stats */}
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Ionicons name="time" size={16} color={colors.brand.primary} />
                  <Text style={styles.heroStatText}>{currentChapter?.duration}</Text>
                </View>
                <View style={styles.heroStat}>
                  <Ionicons name="list" size={16} color={colors.brand.primary} />
                  <Text style={styles.heroStatText}>Chapter {currentChapter?.order}</Text>
                </View>
                {currentChapter?.isCompleted && (
                  <View style={styles.heroStat}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
                    <Text style={[styles.heroStatText, { color: colors.status.success }]}>Completed</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Overall Progress */}
            <View style={styles.heroProgress}>
              <ProgressCircle 
                progress={overallProgress} 
                size={80} 
                strokeWidth={8}
                color={colors.brand.primary} 
              />
              <Text style={styles.overallProgressText}>Overall Progress</Text>
            </View>
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.chapterSectionTitle}>Content Types</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map(renderFilterButton)}
          </ScrollView>
        </View>

        {/* Content Grid */}
        <View style={styles.contentGrid}>
          {filteredContent.map(renderContentCard)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.chapterSectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bookmark-outline" size={20} color={colors.brand.primary} />
              <Text style={styles.actionButtonText}>Bookmark Chapter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={colors.brand.primary} />
              <Text style={styles.actionButtonText}>Share Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

