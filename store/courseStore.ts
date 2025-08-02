import { apiGet, apiPost } from '@/api';
import { create } from 'zustand';

// Course interfaces
export interface Course {
  // Legacy fields (for backward compatibility)
  id?: string;
  title?: string;
  description?: string;
  image?: { uri: string } | string;
  instructor?: string;
  lessons?: number;
  time?: string;
  progress?: number;
  category?: string;
  difficulty?: string;
  rating?: number;
  price?: number;
  isEnrolled?: boolean;
  
  // New API response fields
  _id: string;
  courseName: string;
  courseCode: string;
  courseIcon: string;
  courseType: string;
  courseDisplay: string;
  communityDisplay: string;
  permanentCourse: string;
  sellPrice: number | null;
  discountPrice: number | null;
  status: number;
  vendorCode: string;
  createdAt: string;
  chapters: string[];
  courseProgress: {
    assignment: Record<string, { completedCount: number; totalCount: number }>;
    chapter: Record<string, { completedCount: number; totalCount: number }>;
    course: {
      overall: { completedCount: number; totalCount: number };
    };
    note: Record<string, any>;
    test: Record<string, { completedCount: number; totalCount: number }>;
    video: Record<string, { completedCount: number; totalCount: number }>;
  };
  updatedAt: string;
}

export interface Chapter {
  // Legacy fields (for backward compatibility)
  id?: string;
  title?: string;
  description?: string;
  order?: number;
  duration?: string;
  isCompleted?: boolean;
  videosCount?: number;
  assignmentsCount?: number;
  testsCount?: number;
  notesCount?: number;
  updatedAt?: string;
  
  // New API response fields
  _id: string;
  assignments: string[];
  chapterComponent: string[];
  chapterIcon: string;
  chapterName: string;
  courseId: string;
  createdAt: string;
  meta: {
    chapterTags: string[];
  };
  notes: string[];
  status: number;
  tests: string[];
  videos: string[];
}

export interface Video {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration: string;
  order: number;
  isWatched: boolean;
  watchedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: string;
  maxScore: number;
  submissionType: 'text' | 'file' | 'both';
  isSubmitted: boolean;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  instructions: string;
  duration: number; // in minutes
  maxScore: number;
  passingScore: number;
  questions: TestQuestion[];
  isAttempted: boolean;
  attemptedAt?: string;
  score?: number;
  isPassed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

export interface Note {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Store state interface
interface CourseState {
  // Courses
  courses: Course[];
  currentCourse: Course | null;
  coursesLoading: boolean;
  coursesError: string | null;
  coursesPage: number;
  coursesHasMore: boolean;
  coursesRefreshing: boolean;

  // Chapters
  chapters: Chapter[];
  currentChapter: Chapter | null;
  chaptersLoading: boolean;
  chaptersError: string | null;
  chaptersPage: number;
  chaptersHasMore: boolean;
  chaptersRefreshing: boolean;

  // Videos
  videos: Video[];
  currentVideo: Video | null;
  videosLoading: boolean;
  videosError: string | null;
  videosPage: number;
  videosHasMore: boolean;
  videosRefreshing: boolean;
  videoDetails: Record<string, any>; // Store detailed video data
  
  // Global loading and error states
  loading: boolean;
  error: string | null;

  // Assignments
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  assignmentsLoading: boolean;
  assignmentsError: string | null;

  // Tests
  tests: Test[];
  currentTest: Test | null;
  testsLoading: boolean;
  testsError: string | null;

  // Notes
  notes: Note[];
  currentNote: Note | null;
  notesLoading: boolean;
  notesError: string | null;

  // Actions
  fetchCourses: (refresh?: boolean) => Promise<void>;
  refreshCourses: () => Promise<void>;
  loadMoreCourses: () => Promise<void>;
  fetchCourse: (courseId: string) => Promise<void>;
  
  fetchChapters: (courseId: string, refresh?: boolean) => Promise<void>;
  refreshChapters: (courseId: string) => Promise<void>;
  loadMoreChapters: (courseId: string) => Promise<void>;
  fetchChapter: (chapterId: string) => Promise<void>;
  
  fetchVideos: (chapterId: string, refresh?: boolean) => Promise<void>;
  refreshVideos: (chapterId: string) => Promise<void>;
  loadMoreVideos: (chapterId: string) => Promise<void>;
  fetchVideo: (videoId: string) => Promise<void>;
  fetchVideoDetails: (videoId: string) => Promise<void>;
  fetchVideoQuestions: (videoId: string) => Promise<void>;
  fetchVideoProgress: (videoId: string) => Promise<void>;
  updateVideoProgress: (videoId: string, progress: any) => Promise<void>;
  submitVideoQuestion: (videoId: string, questionId: string, answer: string, questionData: any) => Promise<{ success: boolean; data: any }>;
  
  fetchAssignments: (chapterId: string) => Promise<void>;
  fetchAssignment: (assignmentId: string) => Promise<void>;
  submitAssignment: (assignmentId: string, submission: any) => Promise<void>;
  
  fetchTests: (chapterId: string) => Promise<void>;
  fetchTest: (testId: string) => Promise<void>;
  submitTest: (testId: string, answers: any) => Promise<void>;
  fetchTestSolution: (testId: string) => Promise<void>;
  
  fetchNotes: (chapterId: string) => Promise<void>;
  fetchNote: (noteId: string) => Promise<void>;
  createNote: (chapterId: string, note: Partial<Note>) => Promise<void>;
  updateNote: (noteId: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  // Utility actions
  clearError: (type: string) => void;
  resetStore: () => void;
}

// Dummy data for fallback
const dummyCourses: Course[] = [
  {
    // Legacy fields
    id: '1',
    title: 'React Native Fundamentals',
    description: 'Learn the basics of React Native development',
    instructor: 'Dr. Sarah Johnson',
    image: { uri: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=RN' },
    lessons: 25,
    time: '8 hours',
    progress: 65,
    // Required API fields
    _id: '1',
    courseName: 'React Native Fundamentals',
    courseCode: 'RN101',
    courseIcon: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=RN',
    courseType: 'video',
    courseDisplay: 'public',
    communityDisplay: 'enabled',
    permanentCourse: 'yes',
    sellPrice: null,
    discountPrice: null,
    status: 1,
    vendorCode: 'VENDOR001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    chapters: ['ch1', 'ch2', 'ch3'],
    courseProgress: {
      assignment: {},
      chapter: {},
      course: { overall: { completedCount: 16, totalCount: 25 } },
      note: {},
      test: {},
      video: {}
    }
  },
  {
    // Legacy fields
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts',
    instructor: 'Prof. Michael Chen',
    image: { uri: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=JS' },
    lessons: 18,
    time: '6 hours',
    progress: 30,
    // Required API fields
    _id: '2',
    courseName: 'Advanced JavaScript',
    courseCode: 'JS201',
    courseIcon: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=JS',
    courseType: 'video',
    courseDisplay: 'public',
    communityDisplay: 'enabled',
    permanentCourse: 'yes',
    sellPrice: null,
    discountPrice: null,
    status: 1,
    vendorCode: 'VENDOR001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    chapters: ['ch1', 'ch2'],
    courseProgress: {
      assignment: {},
      chapter: {},
      course: { overall: { completedCount: 5, totalCount: 18 } },
      note: {},
      test: {},
      video: {}
    }
  },
  {
    // Legacy fields
    id: '3',
    title: 'Mobile UI/UX Design',
    description: 'Design beautiful mobile interfaces',
    instructor: 'Lisa Anderson',
    image: { uri: 'https://via.placeholder.com/60x60/96CEB4/FFFFFF?text=UI' },
    lessons: 22,
    time: '7 hours',
    progress: 0,
    // Required API fields
    _id: '3',
    courseName: 'Mobile UI/UX Design',
    courseCode: 'UI301',
    courseIcon: 'https://via.placeholder.com/60x60/96CEB4/FFFFFF?text=UI',
    courseType: 'video',
    courseDisplay: 'public',
    communityDisplay: 'enabled',
    permanentCourse: 'yes',
    sellPrice: null,
    discountPrice: null,
    status: 0,
    vendorCode: 'VENDOR001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    chapters: ['ch1', 'ch2', 'ch3', 'ch4'],
    courseProgress: {
      assignment: {},
      chapter: {},
      course: { overall: { completedCount: 0, totalCount: 22 } },
      note: {},
      test: {},
      video: {}
    }
  },
];

const dummyChapters: Chapter[] = [
  {
    // Legacy fields
    id: '1',
    title: 'Introduction to React Native',
    description: 'Get started with React Native basics',
    order: 1,
    duration: '2 hours',
    isCompleted: true,
    videosCount: 5,
    assignmentsCount: 2,
    testsCount: 1,
    notesCount: 3,
    updatedAt: '2024-01-01T00:00:00Z',
    // Required API fields
    _id: '1',
    assignments: ['assign1', 'assign2'],
    chapterComponent: ['Video', 'Assignment', 'Test', 'Note'],
    chapterIcon: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=CH1',
    chapterName: 'Introduction to React Native',
    courseId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    meta: {
      chapterTags: ['beginner', 'intro']
    },
    notes: ['note1', 'note2', 'note3'],
    status: 1,
    tests: ['test1'],
    videos: ['vid1', 'vid2', 'vid3', 'vid4', 'vid5']
  },
  {
    // Legacy fields
    id: '2',
    title: 'Components and Props',
    description: 'Learn about React Native components',
    order: 2,
    duration: '3 hours',
    isCompleted: false,
    videosCount: 8,
    assignmentsCount: 3,
    testsCount: 2,
    notesCount: 5,
    updatedAt: '2024-01-01T00:00:00Z',
    // Required API fields
    _id: '2',
    assignments: ['assign3', 'assign4', 'assign5'],
    chapterComponent: ['Video', 'Assignment', 'Test', 'Note'],
    chapterIcon: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=CH2',
    chapterName: 'Components and Props',
    courseId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    meta: {
      chapterTags: ['components', 'props']
    },
    notes: ['note4', 'note5', 'note6', 'note7', 'note8'],
    status: 1,
    tests: ['test2', 'test3'],
    videos: ['vid6', 'vid7', 'vid8', 'vid9', 'vid10', 'vid11', 'vid12', 'vid13']
  },
];

// Create the store
const useCourseStore = create<CourseState>((set, get) => ({
  // Initial state
  courses: [],
  currentCourse: null,
  coursesLoading: false,
  coursesError: null,
  coursesPage: 0,
  coursesHasMore: true,
  coursesRefreshing: false,

  chapters: [],
  currentChapter: null,
  chaptersLoading: false,
  chaptersError: null,
  chaptersPage: 0,
  chaptersHasMore: true,
  chaptersRefreshing: false,

  videos: [],
  currentVideo: null,
  videosLoading: false,
  videosError: null,
  videosPage: 0,
  videosHasMore: true,
  videosRefreshing: false,
  videoDetails: {},
  
  // Global loading and error states
  loading: false,
  error: null,

  assignments: [],
  currentAssignment: null,
  assignmentsLoading: false,
  assignmentsError: null,

  tests: [],
  currentTest: null,
  testsLoading: false,
  testsError: null,

  notes: [],
  currentNote: null,
  notesLoading: false,
  notesError: null,

  // Course actions
  fetchCourses: async (refresh = false) => {
    const state = get();
    
    // Don't fetch if already loading or no more data (unless refreshing)
    if (!refresh && (state.coursesLoading || !state.coursesHasMore)) {
      return;
    }
    
    const page = refresh ? 0 : state.coursesPage;
    const limit = 10;
    const skip = page * limit;
    
    set({ 
      coursesLoading: true, 
      coursesError: null,
      coursesRefreshing: refresh 
    });
    
    try {
      const response = await apiGet(`/courseManagement/course/student?limit=${limit}&skip=${skip}&order=asc&status=1`);
      
      // Handle nested response structure
      const coursesData = response.data?.data || response.data || [];
      
      console.log('📚 Courses API Response:', {
        totalReceived: coursesData.length,
        page,
        skip,
        limit,
        isRefresh: refresh
      });
      
      set({ 
        courses: refresh ? coursesData : [...state.courses, ...coursesData],
        coursesPage: page + 1,
        coursesHasMore: coursesData.length === limit, // Has more if we got a full page
        coursesLoading: false,
        coursesRefreshing: false
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch courses:', error);
      set({ 
        coursesError: error.message || 'Failed to fetch courses',
        coursesLoading: false,
        coursesRefreshing: false
      });
    }
  },

  refreshCourses: async () => {
    await get().fetchCourses(true);
  },

  loadMoreCourses: async () => {
    await get().fetchCourses(false);
  },

  fetchCourse: async (courseId: string) => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const response = await apiGet<Course>(`/courseManagement/course/student/${courseId}`);
      set({ 
        currentCourse: response.data,
        coursesLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for course:', error.message);
      const dummyCourse = dummyCourses.find(c => c.id === courseId);
      set({ 
        currentCourse: dummyCourse || null,
        coursesLoading: false,
        coursesError: dummyCourse ? null : 'Course not found'
      });
    }
  },

  // Chapter actions
  fetchChapters: async (courseId: string, refresh = false) => {
    const state = get();
    
    // Don't fetch if already loading or no more data (unless refreshing)
    if (!refresh && (state.chaptersLoading || !state.chaptersHasMore)) {
      return;
    }
    
    const page = refresh ? 0 : state.chaptersPage;
    const limit = 100; // Using 100 as per your API example
    const skip = page * limit;
    
    set({ 
      chaptersLoading: true, 
      chaptersError: null,
      chaptersRefreshing: refresh 
    });
    
    try {
      const response = await apiGet(`/chapter/student/chapters?courseId=${courseId}&limit=${limit}&skip=${skip}&order=asc&status=1`);
      
      // Handle nested response structure
      const chaptersData = response.data?.data || response.data || [];
      
      console.log('📖 Chapters API Response:', {
        courseId,
        totalReceived: chaptersData.length,
        page,
        skip,
        limit,
        isRefresh: refresh
      });
      
      set({ 
        chapters: refresh ? chaptersData : [...state.chapters, ...chaptersData],
        chaptersPage: page + 1,
        chaptersHasMore: chaptersData.length === limit, // Has more if we got a full page
        chaptersLoading: false,
        chaptersRefreshing: false
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch chapters:', error);
      // Fallback to dummy data on error
      const courseChapters = dummyChapters.filter(c => c.courseId === courseId);
      set({ 
        chapters: refresh ? courseChapters : [...state.chapters, ...courseChapters],
        chaptersLoading: false,
        chaptersRefreshing: false,
        chaptersError: null // Don't show error if we have fallback data
      });
    }
  },

  refreshChapters: async (courseId: string) => {
    await get().fetchChapters(courseId, true);
  },

  loadMoreChapters: async (courseId: string) => {
    await get().fetchChapters(courseId, false);
  },

  fetchChapter: async (chapterId: string) => {
    set({ chaptersLoading: true, chaptersError: null });
    try {
      const response = await apiGet<Chapter>(`/chapter/student/chapter/${chapterId}`);
      set({ 
        currentChapter: response.data,
        chaptersLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for chapter:', error.message);
      const dummyChapter = dummyChapters.find(c => c.id === chapterId);
      set({ 
        currentChapter: dummyChapter || null,
        chaptersLoading: false,
        chaptersError: dummyChapter ? null : 'Chapter not found'
      });
    }
  },

  // Video actions
  fetchVideos: async (chapterId: string, refresh = false) => {
    const state = get();
    
    // Don't fetch if already loading or no more data (unless refreshing)
    if (!refresh && (state.videosLoading || !state.videosHasMore)) {
      return;
    }
    
    const page = refresh ? 0 : state.videosPage;
    const limit = 100; // Using 100 as per your API example
    const skip = page * limit;
    
    set({ 
      videosLoading: true, 
      videosError: null,
      videosRefreshing: refresh 
    });
    
    try {
      const response = await apiGet(`/video/student/videos?chapterId=${chapterId}&limit=${limit}&skip=${skip}&order=asc&status=1`);
      
      // Handle nested response structure
      const videosData = response.data?.data || response.data || [];
      
      console.log('🎥 Videos API Response:', {
        chapterId,
        totalReceived: videosData.length,
        page,
        skip,
        limit,
        isRefresh: refresh
      });
      
      // Map API response to Video interface
      const mappedVideos: Video[] = videosData.map((video: any) => ({
        id: video._id,
        chapterId: video.chapterId,
        title: video.videoTitle,
        description: video.videoDescription?.replace(/<[^>]*>/g, '') || '', // Remove HTML tags
        url: video.videoUrl,
        thumbnail: video.videoThumbnail,
        duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
        videoType: video.videoType,
        questions: video.questions || [],
        resources: video.videoResources || [],
        order: video.order || 0,
        isWatched: false, // This should come from progress API
        watchedDuration: 0, // This should come from progress API
        createdAt: video.createdAt,
        updatedAt: video.updatedAt || video.createdAt,
      }));
      
      set({ 
        videos: refresh ? mappedVideos : [...state.videos, ...mappedVideos],
        videosPage: page + 1,
        videosHasMore: videosData.length === limit, // Has more if we got a full page
        videosLoading: false,
        videosRefreshing: false
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch videos:', error);
      // Fallback to dummy data on error
      const dummyVideos: Video[] = [
        {
          id: '1',
          chapterId,
          title: 'Introduction Video',
          description: 'Welcome to this chapter',
          url: 'https://example.com/video1.mp4',
          duration: '10:30',
          order: 1,
          isWatched: false,
          watchedDuration: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      set({ 
        videos: refresh ? dummyVideos : [...state.videos, ...dummyVideos],
        videosLoading: false,
        videosRefreshing: false,
        videosError: null // Don't show error if we have fallback data
      });
    }
  },

  refreshVideos: async (chapterId: string) => {
    await get().fetchVideos(chapterId, true);
  },

  loadMoreVideos: async (chapterId: string) => {
    await get().fetchVideos(chapterId, false);
  },

  fetchVideo: async (videoId: string) => {
    set({ videosLoading: true, videosError: null });
    try {
      const response = await apiGet<Video>(`/video/student/video/${videoId}`);
      set({ 
        currentVideo: response.data,
        videosLoading: false 
      });
    } catch (error: any) {
      console.log('API failed for video details:', error.message);
      set({ 
        videosLoading: false,
        videosError: 'Failed to load video details'
      });
    }
  },

  fetchVideoDetails: async (videoId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiGet<any>(`/video/student/video/${videoId}`);
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: response.data
        },
        loading: false 
      }));
    } catch (error: any) {
      console.log('API failed for video details:', error.message);
      // Create dummy video data for fallback
      const dummyVideoData = {
        _id: videoId,
        chapterId: '1',
        createdAt: new Date().toISOString(),
        courseId: '1',
        duration: 600, // 10 minutes
        videoTitle: 'Sample Video',
        videoDescription: 'This is a sample video for demonstration purposes.',
        videoThumbnail: 'https://via.placeholder.com/640x360/4ECDC4/FFFFFF?text=Video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        questions: [],
        isSubmitSingleEveryTime: false,
        videoType: 'basic' as const,
        videoResources: ['Sample Resource 1', 'Sample Resource 2'],
        meta: {
          videoType: 1,
          timeToShowQuestion: '0'
        }
      };
      
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: dummyVideoData
        },
        loading: false,
        error: 'Using sample data - API unavailable'
      }));
    }
  },

  fetchVideoQuestions: async (videoId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiGet(`/question/student/questions?videoId=${videoId}&limit=10&skip=0&order=asc&status=10`);
      
      // Handle nested response structure
      const questionsData = response.data?.data || response.data || [];
      
      console.log('🎯 Video Questions API Response:', {
        videoId,
        totalQuestions: questionsData.length,
        questions: questionsData
      });
      
      // Store questions in videoDetails
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: {
            ...state.videoDetails[videoId],
            questions: questionsData
          }
        },
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ Failed to fetch video questions:', error);
      set({ loading: false, error: 'Failed to fetch video questions' });
    }
  },

  fetchVideoProgress: async (videoId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiGet(`/video/student/submit/${videoId}`);
      
      console.log('📊 Video Progress API Response:', {
        videoId,
        progress: response.data
      });
      
      // Store progress in videoDetails
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: {
            ...state.videoDetails[videoId],
            progress: response.data
          }
        },
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ Failed to fetch video progress:', error);
      set({ loading: false, error: 'Failed to fetch video progress' });
    }
  },

  updateVideoProgress: async (videoId: string, progress: any) => {
    try {
      const watchedDuration = progress.currentTime || 0;
      const progressData = {
        videoId,
        watchedDuration,
        completed: progress.completed || false,
        progress: progress.progress || 0,
        // Include additional metadata for better tracking
        lastCorrectQuestionTime: progress.lastCorrectQuestionTime,
        answeredQuestions: progress.answeredQuestions || [],
        videoType: progress.videoType,
        sessionData: {
          timestamp: new Date().toISOString(),
          deviceInfo: 'mobile', // Could be enhanced with actual device info
          ...progress.meta // Any additional metadata
        }
      };
      
      await apiPost(`/video/student/progress`, progressData);
      
      // Update local state
      const { videos } = get();
      const updatedVideos = videos.map(video => 
        video.id === videoId 
          ? { ...video, watchedDuration, isWatched: watchedDuration > 0 }
          : video
      );
      set({ videos: updatedVideos });
    } catch (error: any) {
      console.log('Failed to update video progress:', error.message);
    }
  },
  
  // Submit video question answer
  submitVideoQuestion: async (videoId: string, questionId: string, answer: string, questionData: any) => {
    try {
      const submissionData = {
        videoId,
        questionId,
        answer,
        isCorrect: questionData.isCorrect,
        timestamp: questionData.timestamp,
        timeToAnswer: questionData.timeToAnswer,
        questionType: questionData.questionType,
        // Include meta data for analytics and tracking
        meta: {
          videoType: questionData.videoType,
          questionTriggerTime: questionData.questionTriggerTime,
          userSeekBehavior: questionData.userSeekBehavior,
          attemptNumber: questionData.attemptNumber || 1,
          sessionId: questionData.sessionId,
          deviceInfo: 'mobile',
          submittedAt: new Date().toISOString(),
          ...questionData.additionalMeta
        }
      };
      
      // Submit to API - you may need to adjust the endpoint
      await apiPost('/video/student/question/submit', submissionData);
      
      return { success: true, data: submissionData };
    } catch (error: any) {
      console.log('Failed to submit video question:', error.message);
      throw new Error(`Failed to submit question: ${error.message}`);
    }
  },

  // Assignment actions
  fetchAssignments: async (chapterId: string) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      const response = await apiGet<Assignment[]>(`/assignment/student/assignments?chapterId=${chapterId}`);
      set({ 
        assignments: response.data,
        assignmentsLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for assignments:', error.message);
      const dummyAssignments: Assignment[] = [
        {
          id: '1',
          chapterId,
          title: 'Practice Assignment',
          description: 'Complete the exercises',
          instructions: 'Follow the instructions carefully',
          maxScore: 100,
          submissionType: 'text',
          isSubmitted: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      set({ 
        assignments: dummyAssignments,
        assignmentsLoading: false,
        assignmentsError: null
      });
    }
  },

  fetchAssignment: async (assignmentId: string) => {
    set({ assignmentsLoading: true, assignmentsError: null });
    try {
      const response = await apiGet<Assignment>(`/assignment/student/assignment/${assignmentId}`);
      set({ 
        currentAssignment: response.data,
        assignmentsLoading: false 
      });
    } catch (error: any) {
      console.log('API failed for assignment details:', error.message);
      set({ 
        assignmentsLoading: false,
        assignmentsError: 'Failed to load assignment details'
      });
    }
  },

  submitAssignment: async (assignmentId: string, submission: any) => {
    try {
      await apiPost('/courseManagement/studentAssignment', {
        assignmentId,
        ...submission
      });
      
      // Update local state
      const { assignments } = get();
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, isSubmitted: true, submittedAt: new Date().toISOString() }
          : assignment
      );
      set({ assignments: updatedAssignments });
    } catch (error: any) {
      throw new Error(`Failed to submit assignment: ${error.message}`);
    }
  },

  // Test actions
  fetchTests: async (chapterId: string) => {
    set({ testsLoading: true, testsError: null });
    try {
      const response = await apiGet<Test[]>(`/test/student/tests?chapterId=${chapterId}`);
      set({ 
        tests: response.data,
        testsLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for tests:', error.message);
      const dummyTests: Test[] = [
        {
          id: '1',
          chapterId,
          title: 'Chapter Quiz',
          description: 'Test your knowledge',
          instructions: 'Answer all questions',
          duration: 30,
          maxScore: 100,
          passingScore: 70,
          questions: [],
          isAttempted: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      set({ 
        tests: dummyTests,
        testsLoading: false,
        testsError: null
      });
    }
  },

  fetchTest: async (testId: string) => {
    set({ testsLoading: true, testsError: null });
    try {
      const response = await apiGet<Test>(`/test/student/test/${testId}`);
      set({ 
        currentTest: response.data,
        testsLoading: false 
      });
    } catch (error: any) {
      console.log('API failed for test details:', error.message);
      set({ 
        testsLoading: false,
        testsError: 'Failed to load test details'
      });
    }
  },

  submitTest: async (testId: string, answers: any) => {
    try {
      await apiPost('/courseManagement/studentTest', {
        testId,
        answers
      });
      
      // Update local state
      const { tests } = get();
      const updatedTests = tests.map(test => 
        test.id === testId 
          ? { ...test, isAttempted: true, attemptedAt: new Date().toISOString() }
          : test
      );
      set({ tests: updatedTests });
    } catch (error: any) {
      throw new Error(`Failed to submit test: ${error.message}`);
    }
  },

  fetchTestSolution: async (testId: string) => {
    try {
      const response = await apiGet(`/courseManagement/studentTest/solution/${testId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch test solution: ${error.message}`);
    }
  },

  // Notes actions (using dummy data since no API endpoint provided)
  fetchNotes: async (chapterId: string) => {
    set({ notesLoading: true, notesError: null });
    try {
      // Since no API endpoint is provided, use dummy data
      const dummyNotes: Note[] = [
        {
          id: '1',
          chapterId,
          title: 'Important Points',
          content: 'Key concepts to remember...',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      set({ 
        notes: dummyNotes,
        notesLoading: false,
        notesError: null
      });
    } catch (error: any) {
      set({ 
        notesLoading: false,
        notesError: 'Failed to load notes'
      });
    }
  },

  fetchNote: async (noteId: string) => {
    set({ notesLoading: true, notesError: null });
    try {
      const { notes } = get();
      const note = notes.find(n => n.id === noteId);
      set({ 
        currentNote: note || null,
        notesLoading: false,
        notesError: note ? null : 'Note not found'
      });
    } catch (error: any) {
      set({ 
        notesLoading: false,
        notesError: 'Failed to load note details'
      });
    }
  },

  createNote: async (chapterId: string, noteData: Partial<Note>) => {
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        chapterId,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const { notes } = get();
      set({ notes: [...notes, newNote] });
    } catch (error: any) {
      throw new Error(`Failed to create note: ${error.message}`);
    }
  },

  updateNote: async (noteId: string, noteData: Partial<Note>) => {
    try {
      const { notes } = get();
      const updatedNotes = notes.map(note => 
        note.id === noteId 
          ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
          : note
      );
      set({ notes: updatedNotes });
    } catch (error: any) {
      throw new Error(`Failed to update note: ${error.message}`);
    }
  },

  deleteNote: async (noteId: string) => {
    try {
      const { notes } = get();
      const updatedNotes = notes.filter(note => note.id !== noteId);
      set({ notes: updatedNotes });
    } catch (error: any) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  },

  // Utility actions
  clearError: (type: string) => {
    set({ [`${type}Error`]: null } as any);
  },

  resetStore: () => {
    set({
      courses: [],
      currentCourse: null,
      coursesLoading: false,
      coursesError: null,
      chapters: [],
      currentChapter: null,
      chaptersLoading: false,
      chaptersError: null,
      videos: [],
      currentVideo: null,
      videosLoading: false,
      videosError: null,
      assignments: [],
      currentAssignment: null,
      assignmentsLoading: false,
      assignmentsError: null,
      tests: [],
      currentTest: null,
      testsLoading: false,
      testsError: null,
      notes: [],
      currentNote: null,
      notesLoading: false,
      notesError: null,
    });
  },
}));

export default useCourseStore;
