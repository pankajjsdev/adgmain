import { create } from 'zustand';
import { apiGet, apiPost, ApiResponse } from '@/api';

// Course interfaces
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  image?: { uri: string };
  lessons: number;
  time: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  isCompleted: boolean;
  videosCount: number;
  assignmentsCount: number;
  testsCount: number;
  notesCount: number;
  createdAt: string;
  updatedAt: string;
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

  // Chapters
  chapters: Chapter[];
  currentChapter: Chapter | null;
  chaptersLoading: boolean;
  chaptersError: string | null;

  // Videos
  videos: Video[];
  currentVideo: Video | null;
  videosLoading: boolean;
  videosError: string | null;
  videoDetails: { [videoId: string]: any }; // Store detailed video data
  
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
  fetchCourses: () => Promise<void>;
  fetchCourse: (courseId: string) => Promise<void>;
  
  fetchChapters: (courseId: string) => Promise<void>;
  fetchChapter: (chapterId: string) => Promise<void>;
  
  fetchVideos: (chapterId: string) => Promise<void>;
  fetchVideo: (videoId: string) => Promise<void>;
  fetchVideoDetails: (videoId: string) => Promise<void>;
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
    id: '1',
    title: 'React Native Fundamentals',
    description: 'Learn the basics of React Native development',
    instructor: 'Dr. Sarah Johnson',
    image: { uri: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=RN' },
    lessons: 25,
    time: '8 hours',
    progress: 65,
    status: 'in_progress',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts',
    instructor: 'Prof. Michael Chen',
    image: { uri: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=JS' },
    lessons: 18,
    time: '6 hours',
    progress: 30,
    status: 'in_progress',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Mobile UI/UX Design',
    description: 'Design beautiful mobile interfaces',
    instructor: 'Lisa Anderson',
    image: { uri: 'https://via.placeholder.com/60x60/96CEB4/FFFFFF?text=UI' },
    lessons: 22,
    time: '7 hours',
    progress: 0,
    status: 'not_started',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const dummyChapters: Chapter[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to React Native',
    description: 'Get started with React Native basics',
    order: 1,
    duration: '2 hours',
    isCompleted: true,
    videosCount: 5,
    assignmentsCount: 2,
    testsCount: 1,
    notesCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    courseId: '1',
    title: 'Components and Props',
    description: 'Learn about React Native components',
    order: 2,
    duration: '3 hours',
    isCompleted: false,
    videosCount: 8,
    assignmentsCount: 3,
    testsCount: 2,
    notesCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Create the store
const useCourseStore = create<CourseState>((set, get) => ({
  // Initial state
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
  fetchCourses: async () => {
    set({ coursesLoading: true, coursesError: null });
    try {
      const response = await apiGet<Course[]>('/courseManagement/course/student');
      set({ 
        courses: response.data,
        coursesLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for courses:', error.message);
      set({ 
        courses: dummyCourses,
        coursesLoading: false,
        coursesError: null // Don't show error when using dummy data
      });
    }
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
  fetchChapters: async (courseId: string) => {
    set({ chaptersLoading: true, chaptersError: null });
    try {
      const response = await apiGet<Chapter[]>(`/chapter/student/chapters?courseId=${courseId}`);
      set({ 
        chapters: response.data,
        chaptersLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for chapters:', error.message);
      const courseChapters = dummyChapters.filter(c => c.courseId === courseId);
      set({ 
        chapters: courseChapters,
        chaptersLoading: false,
        chaptersError: null
      });
    }
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
  fetchVideos: async (chapterId: string) => {
    set({ videosLoading: true, videosError: null });
    try {
      const response = await apiGet<Video[]>(`/video/student/videos?chapterId=${chapterId}`);
      set({ 
        videos: response.data,
        videosLoading: false 
      });
    } catch (error: any) {
      console.log('API failed, using dummy data for videos:', error.message);
      // Create dummy videos for the chapter
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
        videos: dummyVideos,
        videosLoading: false,
        videosError: null
      });
    }
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
