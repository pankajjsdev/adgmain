import { useState, useEffect, useCallback, useRef } from 'react';
import { Video } from 'expo-av';
import { VideoData, VideoProgress, VideoPlayerState } from '@/types/video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCourseStore from '@/store/courseStore';
import { useMediaTracking } from '@/hooks/useAnalytics';

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

  const videoRef = useRef<any>(null);
  const questionTimeoutsRef = useRef<number[]>([]);

  // Get course store methods
  const { updateVideoProgress, submitVideoQuestion } = useCourseStore();
  
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

  // Initialize video progress from storage
  useEffect(() => {
    if (!videoData) return;
    
    const loadProgress = async () => {
      try {
        const stored = await AsyncStorage.getItem(`video_progress_${videoData._id}`);
        if (stored) {
          const progress: VideoProgress = JSON.parse(stored);
          setPlayerState(prev => ({
            ...prev,
            progress,
            currentTime: progress.currentTime,
            canSeek: getCanSeek(videoData.videoType, progress.completed)
          }));
        } else {
          setPlayerState(prev => ({
            ...prev,
            canSeek: getCanSeek(videoData.videoType, false)
          }));
        }
      } catch (error) {
        console.error('Failed to load video progress:', error);
      }
    };
    loadProgress();
  }, [videoData]);

  // Save progress to storage
  const saveProgress = useCallback(async (progress: VideoProgress) => {
    try {
      await AsyncStorage.setItem(`video_progress_${videoData._id}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save video progress:', error);
    }
  }, [videoData._id]);





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
    let lastCorrectQuestionTime = newProgress.lastCorrectQuestionTime;

    if (!isCorrect) {
      switch (videoType) {
        case 'trackable':
        case 'trackableRandom':
          // For trackable videos, restart from beginning on wrong answer
          seekToTime = 0;
          lastCorrectQuestionTime = 0;
          break;
        case 'interactive':
          // For interactive videos, go back to last correct question or start
          const lastCorrectQuestion = newProgress.answeredQuestions
            .filter(aq => aq.correct)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
          seekToTime = lastCorrectQuestion ? lastCorrectQuestion.timestamp : 0;
          lastCorrectQuestionTime = seekToTime;
          break;
        default:
          // Basic videos continue from current position
          break;
      }
    } else {
      // Update last correct question time for correct answers
      lastCorrectQuestionTime = currentTime;
    }
    
    // Update progress with last correct question time
    newProgress.lastCorrectQuestionTime = lastCorrectQuestionTime;

    // Submit question answer to API with comprehensive data
    try {
      await submitVideoQuestion(videoData._id, questionId, answer, {
        isCorrect,
        timestamp: currentTime,
        timeToAnswer: Date.now() - (playerState.currentQuestion.meta.timeToShowQuestion || 0) * 1000,
        questionType: playerState.currentQuestion.questionType,
        videoType,
        questionTriggerTime: playerState.currentQuestion.meta.timeToShowQuestion,
        userSeekBehavior: seekToTime !== currentTime ? 'seeked' : 'continued',
        sessionId: `${videoData._id}_${Date.now()}`,
        additionalMeta: {
          seekToTime,
          originalTime: currentTime,
          videoTitle: videoData.videoTitle,
          chapterId: videoData.chapterId,
          courseId: videoData.courseId
        }
      });
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
  }, [playerState.currentQuestion, playerState.currentTime, playerState.progress, videoData.videoType, videoData._id, videoData.videoTitle, videoData.chapterId, videoData.courseId, saveProgress, onQuestionAnswer, submitVideoQuestion]);

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
    const newProgress = {
      ...playerState.progress,
      currentTime,
      duration,
      completed: isCompleted
    };

    if (isCompleted && !playerState.progress.completed) {
      // Video completed - now user can seek for restricted video types
      newProgress.completed = true;
      const canSeekNow = getCanSeek(videoData.videoType, true);
      
      setPlayerState(prev => ({
        ...prev,
        canSeek: canSeekNow,
        progress: newProgress
      }));
      
      // Update progress with completion data
      await updateVideoProgress(videoData._id, {
        ...newProgress,
        videoType: videoData.videoType,
        meta: {
          completedAt: new Date().toISOString(),
          totalWatchTime: duration,
          questionsAnswered: newProgress.answeredQuestions.length,
          correctAnswers: newProgress.answeredQuestions.filter(q => q.correct).length
        }
      });
      
      onVideoComplete?.();
    } else {
      // Regular progress update
      await updateVideoProgress(videoData._id, {
        ...newProgress,
        videoType: videoData.videoType
      });
    }

    setPlayerState(prev => ({ ...prev, progress: newProgress }));
  }, [playerState.showQuestion, playerState.progress, videoData.questions, videoData._id, videoData.videoType, saveProgress, onVideoComplete, updateVideoProgress]);

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
