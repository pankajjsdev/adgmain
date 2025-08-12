import { apiGet, apiPatch, apiPost, ApiResponse } from '@/api';
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
  // API response fields
  _id: string;
  assignmentDuration: string;
  assignmentGrading: string;
  assignmentName: string;
  assignmentSolution: string;
  assignmentType: string;
  assignmentUIType: string;
  chapterId: string;
  courseId: string;
  endTime: string;
  fileType?: {
    askForExplaination: string;
    explainationType: string;
    isQuestionDownloadable: string;
    question: string;
    solution: string;
  };
  level: string;
  questions: string[];
  startTime: string;
  status: number;
  totalMarks: string;
  createdAt: string;
  updatedAt: string;
  
  // Legacy fields (for backward compatibility)
  id?: string;
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxScore?: number;
  submissionType?: 'text' | 'file' | 'both';
  isSubmitted?: boolean;
  score?: number;
  feedback?: string;
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
  assignmentsPage: number;
  assignmentsHasMore: boolean;
  assignmentsRefreshing: boolean;

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
  
  fetchAssignments: (chapterId: string, refresh?: boolean) => Promise<void>;
  refreshAssignments: (chapterId: string) => Promise<void>;
  loadMoreAssignments: (chapterId: string) => Promise<void>;
  fetchAssignment: (assignmentId: string) => Promise<void>;
  submitAssignment: (assignmentId: string, submissionData: any) => Promise<void>;
  
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
  assignmentsPage: 0,
  assignmentsHasMore: true,
  assignmentsRefreshing: false,

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
      
      console.log('🎥 Video Details API Response:', {
        videoId,
        hasQuestions: !!response.data?.questions,
        questionsCount: response.data?.questions?.length || 0,
        videoType: response.data?.videoType,
        videoTitle: response.data?.videoTitle,
        responseKeys: Object.keys(response.data || {})
      });
      
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: response.data
        },
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ API Error - Failed to fetch video details:', {
        videoId,
        errorMessage: error.message,
        errorCode: error.code || 'UNKNOWN',
        apiEndpoint: `/video/student/video/${videoId}`,
        timestamp: new Date().toISOString(),
        stack: error.stack
      });
      
      set({ 
        loading: false,
        error: `Failed to load video: ${error.message}. Please check your connection and try again.`
      });
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
        questions: questionsData.map((q: any) => ({
          id: q._id,
          timeToShowQuestion: q.meta?.timeToShowQuestion,
          questionType: q.questionType,
          questionText: q.question?.text?.substring(0, 50) + '...'
        }))
      });
      
      // Store questions in videoDetails
      set(state => {
        const existingVideoData = state.videoDetails[videoId] || {};
        console.log('🔄 Merging questions into videoDetails:', {
          videoId,
          existingVideoDataKeys: Object.keys(existingVideoData),
          hasExistingVideoData: !!existingVideoData,
          questionsBeingAdded: questionsData.length
        });
        
        return {
          videoDetails: {
            ...state.videoDetails,
            [videoId]: {
              ...existingVideoData,
              questions: questionsData
            }
          },
          loading: false 
        };
      });
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
      
      // Store progress in videoDetails with proper structure
      set(state => ({ 
        videoDetails: {
          ...state.videoDetails,
          [videoId]: {
            ...state.videoDetails[videoId],
            progress: response.data,
            // Extract key fields for easier access
            currentDuration: response.data?.currentDuration || 0,
            totalDuration: response.data?.totalDuration || 0,
            isCompleted: response.data?.isCompleted === "true",
            correctlyAnsweredQuestions: response.data?.meta?.correctlyAnsweredQuestions || [],
            lastCorrectCheckpoint: response.data?.meta?.lastCorrectCheckpoint || 0,
            submission: response.data?.meta?.submission || [],
            videoType: response.data?.meta?.videoType
          }
        },
        loading: false 
      }));
    } catch (error: any) {
      console.error('❌ Failed to fetch video progress:', error);
      set({ loading: false, error: 'Failed to fetch video progress' });
    }
  },

  updateVideoProgress: async (videoId: string, progressData: any) => {
    try {
      const { 
        courseId, 
        chapterId,
        currentTime, 
        totalDuration, 
        completed, 
        videoType,
        correctlyAnsweredQuestions = [],
        lastCorrectCheckpoint,
        submission = [],
        alreadySubmit = false
      } = progressData;

      // Prepare payload matching the API structure
      const payload = {
        videoId,
        courseId,
        chapterId,
        currentDuration: currentTime,
        totalDuration,
        isCompleted: completed ? "true" : "false",
        meta: {
          submission: submission,
          videoType: videoType,
          lastCorrectCheckpoint: videoType === "interactive" ? lastCorrectCheckpoint : undefined,
          correctlyAnsweredQuestions: Array.from(correctlyAnsweredQuestions),
          // Add timestamp for tracking
          submittedAt: new Date().toISOString()
        }
      };

      // Use POST for new submissions, PATCH for updates
      const method = alreadySubmit ? 'PATCH' : 'POST';
      const endpoint = alreadySubmit ? `/video/student/submit/${videoId}` : '/video/student/submit';
      
      let response;
      if (method === 'POST') {
        response = await apiPost(endpoint, payload);
      } else {
        response = await apiPatch(endpoint, payload);
      }
      
      console.log('📊 Video Progress Updated:', {
        videoId,
        method,
        currentTime,
        completed,
        response: response.data
      });
      
      // Update local state
      const { videos } = get();
      const updatedVideos = videos.map(video => 
        video.id === videoId 
          ? { ...video, watchedDuration: currentTime, isWatched: currentTime > 0 }
          : video
      );
      set({ videos: updatedVideos });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to update video progress:', error);
      throw error;
    }
  },
  
  // Submit video question answer - now integrated with video progress
  submitVideoQuestion: async (videoId: string, questionId: string, answer: string, questionData: any) => {
    try {
      // Create submission entry for the meta.submission array
      const submissionEntry = {
        questionId,
        answer,
        isCorrect: questionData.isCorrect,
        attemptStatus: questionData.isCorrect ? "1" : "0",
        points: questionData.isCorrect ? "1" : "0",
        explanation: questionData.explanation || "",
        // Add timing and metadata
        timestamp: questionData.timestamp || new Date().toISOString(),
        timeToAnswer: questionData.timeToAnswer,
        questionType: questionData.questionType
      };
      
      console.log('📝 Video Question Submitted:', {
        videoId,
        questionId,
        answer,
        isCorrect: questionData.isCorrect,
        submissionEntry
      });
      
      return { 
        success: true, 
        data: submissionEntry,
        // Return the submission entry to be added to the video progress meta
        submissionEntry
      };
    } catch (error: any) {
      console.error('❌ Failed to submit video question:', error);
      throw new Error(`Failed to submit question: ${error.message}`);
    }
  },

  // Assignment actions
  fetchAssignments: async (chapterId: string, refresh = false) => {
    const state = get();
    
    // Don't fetch if already loading (unless refreshing)
    if (state.assignmentsLoading && !refresh) {
      return;
    }
    
    const page = refresh ? 0 : state.assignmentsPage || 0;
    const limit = 100; // Using 100 as per your API example
    const skip = page * limit;
    
    set({ 
      assignmentsLoading: true, 
      assignmentsError: null,
      assignmentsRefreshing: refresh 
    });
    
    try {
      const response = await apiGet<ApiResponse<Assignment[]>>(`/assignment/student/assignments?chapterId=${chapterId}&limit=${limit}&skip=${skip}&order=asc&status=1`);
      
      // Handle nested response structure
      const assignmentsData = response.data?.data || response.data || [];
      
      console.log('📝 Assignments API Response:', {
        chapterId,
        totalReceived: assignmentsData.length,
        page,
        skip,
        limit,
        isRefresh: refresh
      });
      
      // Map API response to Assignment interface
      const mappedAssignments: Assignment[] = assignmentsData.map((assignment: any) => ({
        // API fields
        _id: assignment._id,
        assignmentDuration: assignment.assignmentDuration,
        assignmentGrading: assignment.assignmentGrading,
        assignmentName: assignment.assignmentName,
        assignmentSolution: assignment.assignmentSolution,
        assignmentType: assignment.assignmentType,
        assignmentUIType: assignment.assignmentUIType,
        chapterId: assignment.chapterId,
        courseId: assignment.courseId,
        endTime: assignment.endTime,
        fileType: assignment.fileType,
        level: assignment.level,
        questions: assignment.questions,
        startTime: assignment.startTime,
        status: assignment.status,
        totalMarks: assignment.totalMarks,
        createdAt: assignment.createdAt,
        
        // Legacy fields for backward compatibility
        id: assignment._id,
        title: assignment.assignmentName,
        description: assignment.assignmentDescription || '',
        instructions: assignment.assignmentInstructions || '',
        dueDate: assignment.endTime,
        maxScore: parseInt(assignment.totalMarks) || 0,
        submissionType: 'text', // Default value
        isSubmitted: false, // This should come from submission API
        updatedAt: assignment.updatedAt || assignment.createdAt,
      }));
      
      set({ 
        assignments: refresh ? mappedAssignments : [...state.assignments, ...mappedAssignments],
        assignmentsPage: page + 1,
        assignmentsHasMore: assignmentsData.length === limit, // Has more if we got a full page
        assignmentsLoading: false,
        assignmentsRefreshing: false
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch assignments:', error);
      // Fallback to dummy data on error
      const dummyAssignments: Assignment[] = [
        {
          _id: '1',
          id: '1',
          chapterId,
          courseId: 'course1',
          assignmentName: 'Practice Assignment',
          assignmentType: 'practice',
          assignmentUIType: 'default',
          assignmentDuration: '60',
          assignmentGrading: 'manual',
          assignmentSolution: '',
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-12-31T23:59:59Z',
          level: 'beginner',
          questions: [],
          status: 1,
          totalMarks: '100',
          createdAt: '2024-01-01T00:00:00Z',
          title: 'Practice Assignment',
          description: 'Complete the exercises',
          instructions: 'Follow the instructions carefully',
          dueDate: '2024-12-31T23:59:59Z',
          maxScore: 100,
          submissionType: 'text',
          isSubmitted: false,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      set({ 
        assignments: refresh ? dummyAssignments : [...state.assignments, ...dummyAssignments],
        assignmentsLoading: false,
        assignmentsRefreshing: false,
        assignmentsError: null // Don't show error if we have fallback data
      });
    }
  },

  refreshAssignments: async (chapterId: string) => {
    await get().fetchAssignments(chapterId, true);
  },

  loadMoreAssignments: async (chapterId: string) => {
    await get().fetchAssignments(chapterId, false);
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
      assignmentsPage: 0,
      assignmentsHasMore: true,
      assignmentsRefreshing: false,
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
