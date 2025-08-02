export type QuestionType = "scq" | "mcq" | "fillInTheBlanks" | "text";

export interface Option {
  text: string;
  image?: string | null;
}

export interface Fill {
  box: string;
  type: "single" | "multiple";
}

export interface Question {
  id: number;
  closeable: boolean;
  meta: {
    timeToShowQuestion?: number;
    timeToCompleteQuestion: number;
    [key: string]: any;
  };
  _id: string;
  questionType: QuestionType;
  question: {
    image?: string | null;
    text: string;
  };
  options: Option[];
  answer: string; // This contains the correct answer
  correct: string; // Points for correct answer
  incorrect: string; // Points for incorrect answer
  askForExplaination: string;
  explainationType: string;
  assignmentId: string;
  fill?: Fill;
}

export interface VideoData {
  _id: string;
  chapterId: string;
  createdAt: string;
  courseId: string;
  duration: number;
  videoTitle: string;
  videoDescription: string;
  videoThumbnail: string;
  videoUrl: string;
  questions: Question[];
  isSubmitSingleEveryTime: boolean;
  videoType: "basic" | "trackable" | "trackableRandom" | "interactive";
  videoResources: string[];
  meta?: {
    videoType?: number;
    timeToShowQuestion: string; // Time in seconds when the question should be shown
  };
}

export interface VideoProgress {
  videoId: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastCorrectQuestionTime?: number;
  answeredQuestions: {
    questionId: string;
    timestamp: number;
    correct: boolean;
  }[];
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  showQuestion: boolean;
  currentQuestion: Question | null;
  canSeek: boolean;
  progress: VideoProgress;
}
