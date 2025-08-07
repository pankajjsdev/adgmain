import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useCourseStore from '@/store/courseStore';
import { useGlobalStyles } from '@/hooks/useGlobalStyles';
import useThemeStore from '@/store/themeStore';

export default function AssignmentList() {
  const router = useRouter();
  const { courseId, chapterId } = useLocalSearchParams<{ 
    courseId: string; 
    chapterId: string; 
  }>();
  
  // Store hooks
  const { 
    assignments, 
    assignmentsLoading, 
    assignmentsError, 
    assignmentsRefreshing,
    assignmentsHasMore,
    fetchAssignments,
    refreshAssignments,
    loadMoreAssignments 
  } = useCourseStore();
  
  const { getCurrentTheme } = useThemeStore();
  const currentTheme = getCurrentTheme();
  const globalStyles = useGlobalStyles();
  
  // Local state for pagination
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Fetch assignments on component mount
  useEffect(() => {
    if (chapterId) {
      fetchAssignments(chapterId, true); // Refresh on mount
    }
  }, [chapterId, fetchAssignments]);
  
  // Handle refresh
  const handleRefresh = async () => {
    if (chapterId) {
      await refreshAssignments(chapterId);
    }
  };
  
  // Handle load more
  const handleLoadMore = async () => {
    if (assignmentsHasMore && !assignmentsLoading && !isLoadingMore && chapterId) {
      setIsLoadingMore(true);
      try {
        await loadMoreAssignments(chapterId);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'overdue':
        return 'alert-circle';
      default:
        return 'document-text';
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

  const getAssignmentStatus = (assignment: any) => {
    if (assignment.isSubmitted) return 'submitted';
    const dueDate = new Date(assignment.endTime || assignment.dueDate);
    const now = new Date();
    if (now > dueDate) return 'overdue';
    return 'pending';
  };

  const renderAssignment = ({ item }: { item: any }) => {
    const status = getAssignmentStatus(item);
    const title = item.assignmentName || item.title || 'Untitled Assignment';
    const description = item.description || 'No description available';
    const dueDate = item.endTime || item.dueDate;
    
    return (
      <TouchableOpacity
        style={styles.assignmentCard}
        onPress={() => router.push(`/courses/${courseId}/chapters/${chapterId}/assignments/${item._id || item.id}`)}
      >
        <View style={styles.assignmentHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.assignmentTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
              <Ionicons 
                name={getStatusIcon(status) as any} 
                size={16} 
                color={getStatusColor(status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.assignmentDescription} numberOfLines={3}>
          {description}
        </Text>

        <View style={styles.assignmentMeta}>
          {dueDate && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>Due: {formatDate(dueDate)}</Text>
            </View>
          )}
          
          {item.submissionDate && (
            <View style={styles.metaRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.metaText}>Submitted: {formatDate(item.submissionDate)}</Text>
            </View>
          )}

          {item.totalMarks && (
            <View style={styles.metaRow}>
              <Ionicons name="trophy-outline" size={16} color="#FF9800" />
              <Text style={styles.metaText}>Max Score: {item.totalMarks}</Text>
            </View>
          )}
        </View>

        <View style={styles.assignmentFooter}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="document-attach-outline" size={16} color="#007AFF" />
            <Text style={styles.attachmentText}>View Assignment</Text>
          </TouchableOpacity>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (assignmentsLoading && assignments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assignments</Text>
          <Text style={styles.headerSubtitle}>Loading assignments...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (assignmentsError && assignments.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assignments</Text>
          <Text style={styles.headerSubtitle}>Error loading assignments</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{assignmentsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <Text style={styles.headerSubtitle}>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderAssignment}
        keyExtractor={(item) => item._id || item.id || `assignment-${Math.random()}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={assignmentsRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No assignments available</Text>
            <Text style={styles.emptySubtext}>Check back later for new assignments</Text>
          </View>
        }
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
  assignmentCard: {
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
  assignmentHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  assignmentTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  assignmentMeta: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
