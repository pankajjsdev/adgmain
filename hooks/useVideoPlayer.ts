import useCourseStore from '@/store/courseStore';
import { VideoData, VideoPlayerState, VideoProgress } from '@/types/video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseVideoPlayerProps {
  videoData: VideoData;
  onVideoComplete?: () => void;
  onQuestionAnswer?: (questionId: string, answer: string, correct: boolean) => void;
}

export const useVideoPlayer = ({ 
  videoData, 
  onVideoComplete, 
  onQuestionAnswer 
}: UseVideoPlayerProps) => {
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: videoData?.duration || 0,
    isLoading: false,
    showQuestion: false,
    currentQuestion: null,
    canSeek: getCanSeek(videoData?.videoType || 'basic', false),
    progress: {
      videoId: videoData?._id || '',
      currentTime: 0,
      duration: videoData?.duration || 0,
      completed: false,
      answeredQuestions: []
    }
  });

  // New state variables for the updated API structure
  const [videoStatusData, setVideoStatusData] = useState<any>(null);
  const [alreadySubmit, setAlreadySubmit] = useState(false);
  const [correctlyAnsweredQuestions, setCorrectlyAnsweredQuestions] = useState<Set<string>>(new Set());
  const [lastCorrectCheckpoint, setLastCorrectCheckpoint] = useState(0);
  const [videoInitialPosition, setVideoInitialPosition] = useState(0);
  const [initialVideoSetup, setInitialVideoSetup] = useState(false);
  const [submission, setSubmission] = useState<any[]>([]);

  const videoRef = useRef<any>(null);
  const questionTimeoutsRef = useRef<number[]>([]);

  // Get course store methods
  const { updateVideoProgress, submitVideoQuestion, fetchVideoProgress } = useCourseStore();
  
  // Determine if user can seek based on video type and completion status
  function getCanSeek(videoType: VideoData['videoType'], completed: boolean): boolean {
    switch (videoType) {
      case 'basic':
        return true; // Basic videos allow skipping always
      case 'trackable':
      case 'trackableRandom':
      case 'interactive':
        return completed; // These types only allow skipping after completion
      default:
        return false;
    }
  }

  // Initialize video progress from API
  useEffect(() => {
    if (!videoData?._id || initialVideoSetup) return;
    
    const loadProgress = async () => {
      try {
        console.log(`[VIDEO PLAYER] Initializing video: ${videoData._id}`);
        
        // Fetch video status from API using GET /video/student/submit/{videoId}
        await fetchVideoProgress(videoData._id);
        
        // Get the fetched data from course store
        const courseStore = useCourseStore.getState();
        const videoStatus = courseStore.videoDetails[videoData._id];
        
        if (videoStatus?.progress) {
          console.log(`[VIDEO PLAYER] Found existing submission:`, videoStatus.progress);
          setVideoStatusData(videoStatus.progress);
          setAlreadySubmit(true); // Mark as already submitted for PATCH requests

          if (videoStatus.correctlyAnsweredQuestions) {
            setCorrectlyAnsweredQuestions(new Set(videoStatus.correctlyAnsweredQuestions));
          }

          if (videoStatus.lastCorrectCheckpoint) {
            setLastCorrectCheckpoint(videoStatus.lastCorrectCheckpoint);
          }

          // Calculate initial position based on video type and completion status
          let initialPosition = 0;

          if (videoData.videoType === "basic") {
            initialPosition = videoStatus.currentDuration || 0;
          } else if (videoStatus.isCompleted) {
            initialPosition = videoStatus.currentDuration || 0;
          } else if (videoData.videoType === "trackable" || videoData.videoType === "trackableRandom") {
            initialPosition = 0;
          } else if (videoData.videoType === "interactive") {
            initialPosition = videoStatus.lastCorrectCheckpoint || 0;
          }

          setVideoInitialPosition(initialPosition);
          setPlayerState(prev => ({
            ...prev,
            currentTime: initialPosition,
            canSeek: getCanSeek(videoData.videoType, videoStatus.isCompleted)
          }));

          console.log(
            `[BUSINESS LOGIC] Video loaded - Type: ${videoData.videoType}, Initial Position: ${initialPosition}s, Completed: ${videoStatus.isCompleted}`,
          );
        } else {
          console.log(`[VIDEO PLAYER] No existing submission found - will use POST for new submission`);
          // No previous progress - start from beginning, will use POST for first submission
          setAlreadySubmit(false);
          setVideoInitialPosition(0);
          setPlayerState(prev => ({
            ...prev,
            currentTime: 0,
            canSeek: getCanSeek(videoData.videoType, false)
          }));
          console.log(`[BUSINESS LOGIC] New video - Type: ${videoData.videoType}, Starting from beginning`);
        }

        setInitialVideoSetup(true);
      } catch (error) {
        console.error('[VIDEO PLAYER] Failed to load video progress:', error);
        // Fallback to starting from beginning - will use POST for new submission
        setAlreadySubmit(false);
        setVideoInitialPosition(0);
        setPlayerState(prev => ({
          ...prev,
          currentTime: 0,
          canSeek: getCanSeek(videoData?.videoType || 'basic', false)
        }));
        setInitialVideoSetup(true);
      }
    };

    loadProgress();
  }, [videoData?._id, videoData?.videoType, initialVideoSetup, fetchVideoProgress]);

  // Save progress to storage
  const saveProgress = useCallback(async (progress: VideoProgress) => {
    try {
      await AsyncStorage.setItem(`video_progress_${videoData._id}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save video progress:', error);
    }
  }, [videoData?._id]);





  // Handle question answer with proper video type logic
  const handleQuestionAnswer = useCallback(async (answer: string) => {
    if (!playerState.currentQuestion) return;

    const isCorrect = answer === playerState.currentQuestion.answer;
    const questionId = playerState.currentQuestion._id;
    const currentTime = playerState.currentTime;
    const videoType = videoData.videoType;
    
    // Update answered questions
    const newAnsweredQuestion = {
      questionId,
      timestamp: currentTime,
      correct: isCorrect
    };

    let newProgress = {
      ...playerState.progress,
      answeredQuestions: [
        ...playerState.progress.answeredQuestions.filter(q => q.questionId !== questionId),
        newAnsweredQuestion
      ]
    };

    // Handle different video types based on answer correctness
    let seekToTime = currentTime;

    if (!isCorrect) {
      switch (videoType) {
        case 'trackable':
        case 'trackableRandom':
          // For trackable videos, restart from beginning on wrong answer
          seekToTime = 0;
          break;
        case 'interactive':
          // For interactive videos, go back to last correct question or start
          seekToTime = lastCorrectCheckpoint || 0;
          break;
        default:
          // Basic videos continue from current position
          break;
      }
    } else {
      // Update last correct checkpoint for correct answers
      if (videoType === 'interactive') {
        setLastCorrectCheckpoint(currentTime);
      }
      // Add to correctly answered questions
      const newCorrectlyAnswered = new Set(correctlyAnsweredQuestions);
      newCorrectlyAnswered.add(questionId);
      setCorrectlyAnsweredQuestions(newCorrectlyAnswered);
    }

    // Submit question answer to API and get submission entry
    try {
      const questionResult = await submitVideoQuestion(videoData._id, questionId, answer, {
        isCorrect,
        timestamp: currentTime,
        timeToAnswer: Date.now() - (playerState.currentQuestion.meta.timeToShowQuestion || 0) * 1000,
        questionType: playerState.currentQuestion.questionType,
        videoType,
        questionTriggerTime: playerState.currentQuestion.meta.timeToShowQuestion,
        explanation: (playerState.currentQuestion as any).explanation || ""
      });
      
      // Add submission entry to the submission array
      if (questionResult && questionResult.data) {
        setSubmission(prev => [
          ...prev.filter(s => s.questionId !== questionId),
          questionResult.data
        ]);
      }
    } catch (error) {
      console.error('Failed to submit question answer:', error);
    }

    // Save progress
    await saveProgress(newProgress);

    // Update state
    setPlayerState(prev => ({
      ...prev,
      progress: newProgress,
      currentTime: seekToTime,
      showQuestion: false,
      currentQuestion: null,
      isPlaying: true
    }));

    // Seek video to appropriate time
    if (videoRef.current && seekToTime !== currentTime) {
      await videoRef.current.setPositionAsync?.(seekToTime * 1000);
    }

    // Resume playback
    if (videoRef.current) {
      await videoRef.current.playAsync?.();
    }

    // Call callback
    onQuestionAnswer?.(questionId, answer, isCorrect);
  }, [playerState.currentQuestion, playerState.currentTime, playerState.progress, videoData.videoType, videoData._id, correctlyAnsweredQuestions, lastCorrectCheckpoint, saveProgress, onQuestionAnswer, submitVideoQuestion]);

  // Handle video time update
  const handleTimeUpdate = useCallback(async (status: any) => {
    const currentTime = status.positionMillis / 1000;
    const duration = status.durationMillis / 1000;

    setPlayerState(prev => ({
      ...prev,
      currentTime,
      duration,
      isLoading: false
    }));

    // Check for question triggers
    if (!playerState.showQuestion) {
      const questionToShow = videoData.questions?.find(q => {
        const triggerTime = q.meta.timeToShowQuestion || 0;
        return currentTime >= triggerTime && 
               currentTime < triggerTime + 1 && // 1 second window
               !playerState.progress.answeredQuestions.some(aq => aq.questionId === q._id);
      });

      if (questionToShow) {
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
          showQuestion: true,
          currentQuestion: questionToShow
        }));
        if (videoRef.current) {
          await videoRef.current.pauseAsync?.();
        }
      }
    }

    // Save progress periodically with enhanced tracking
    const isCompleted = currentTime >= duration * 0.95; // Consider 95% as completed
    const videoCompleted = isCompleted;
    
    // Prepare submission data for API
    const currentCheckpoint = videoData.videoType === "interactive" ? lastCorrectCheckpoint : undefined;
    
    const progressData = {
      courseId: videoData.courseId,
      chapterId: videoData.chapterId,
      currentTime,
      totalDuration: duration,
      completed: videoCompleted,
      videoType: videoData.videoType,
      correctlyAnsweredQuestions,
      lastCorrectCheckpoint: currentCheckpoint,
      submission,
      alreadySubmit
    };
    
    const newProgress = {
      ...playerState.progress,
      currentTime,
      duration,
      completed: isCompleted
    };

    // Submit progress using new API structure
    try {
      await updateVideoProgress(videoData._id, progressData);
      
      if (isCompleted && !playerState.progress.completed) {
        // Video completed - now user can seek for restricted video types
        newProgress.completed = true;
        const canSeekNow = getCanSeek(videoData.videoType, true);
        
        setPlayerState(prev => ({
          ...prev,
          canSeek: canSeekNow,
          progress: newProgress
        }));
        
        // Update local state to reflect completion
        setAlreadySubmit(true);
        setVideoStatusData((prev: any) => ({
          ...prev,
          currentDuration: currentTime,
          isCompleted: "true",
          lastCorrectCheckpoint: videoData.videoType === "interactive" ? lastCorrectCheckpoint : prev?.lastCorrectCheckpoint,
          correctlyAnsweredQuestions: Array.from(correctlyAnsweredQuestions),
        }));
        
        onVideoComplete?.();
      } else {
        // Regular progress update - update local state
        setVideoStatusData((prev: any) => ({
          ...prev,
          currentDuration: currentTime,
          isCompleted: videoCompleted ? "true" : "false",
          lastCorrectCheckpoint: videoData.videoType === "interactive" ? lastCorrectCheckpoint : prev?.lastCorrectCheckpoint,
          correctlyAnsweredQuestions: Array.from(correctlyAnsweredQuestions),
        }));
      }
    } catch (error) {
      console.error('Failed to update video progress:', error);
    }

    setPlayerState(prev => ({ ...prev, progress: newProgress }));
  }, [playerState.showQuestion, playerState.progress, videoData.questions, videoData._id, videoData.videoType, videoData.chapterId, videoData.courseId, alreadySubmit, correctlyAnsweredQuestions, lastCorrectCheckpoint, submission, onVideoComplete, updateVideoProgress]);

  // Play/Pause controls
  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (playerState.isPlaying) {
        await videoRef.current.pauseAsync?.();
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      } else {
        await videoRef.current.playAsync?.();
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }, [playerState.isPlaying]);

  // Seek to specific time (only if allowed)
  const seekTo = useCallback(async (time: number) => {
    if (!videoRef.current || !playerState.canSeek) return;

    try {
      await videoRef.current.setPositionAsync?.(time * 1000);
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [playerState.canSeek]);

  // Close question modal (only if closeable)
  const closeQuestion = useCallback(() => {
    if (!playerState.currentQuestion?.closeable) return;

    setPlayerState(prev => ({
      ...prev,
      showQuestion: false,
      currentQuestion: null,
      isPlaying: true
    }));

    if (videoRef.current) {
      videoRef.current.playAsync?.();
    }
  }, [playerState.currentQuestion]);

  // Cleanup
  useEffect(() => {
    return () => {
      questionTimeoutsRef.current.forEach(timeout => window.clearTimeout(timeout));
    };
  }, []);

  return {
    playerState,
    videoRef,
    handleTimeUpdate,
    handleQuestionAnswer,
    togglePlayPause,
    seekTo,
    closeQuestion,
    canSeek: playerState.canSeek,
    isVideoCompleted: playerState.progress.completed
  };
};
