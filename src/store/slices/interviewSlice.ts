import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  answer?: string;
  score?: number;
  aiAnalysis?: string;
}

export interface InterviewState {
  candidateInfo: {
    name?: string;
    email?: string;
    phone?: string;
    resumeText?: string;
  };
  currentQuestionIndex: number;
  questions: Question[];
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  finalScore?: number;
  aiSummary?: string;
  sessionId: string;
  startTime?: number;
}

const initialState: InterviewState = {
  candidateInfo: {},
  currentQuestionIndex: 0,
  questions: [],
  timeRemaining: 0,
  isActive: false,
  isPaused: false,
  isCompleted: false,
  sessionId: '',
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateInfo: (state, action: PayloadAction<Partial<InterviewState['candidateInfo']>>) => {
      state.candidateInfo = { ...state.candidateInfo, ...action.payload };
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    startInterview: (state, action: PayloadAction<string>) => {
      state.isActive = true;
      state.isPaused = false;
      state.sessionId = action.payload;
      state.startTime = Date.now();
      state.currentQuestionIndex = 0;
      if (state.questions.length > 0) {
        state.timeRemaining = state.questions[0].timeLimit;
      }
    },
    pauseInterview: (state) => {
      state.isPaused = true;
    },
    resumeInterview: (state) => {
      state.isPaused = false;
    },
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    submitAnswer: (state, action: PayloadAction<{ answer: string; score?: number; aiAnalysis?: string }>) => {
      if (state.questions[state.currentQuestionIndex]) {
        state.questions[state.currentQuestionIndex].answer = action.payload.answer;
        state.questions[state.currentQuestionIndex].score = action.payload.score;
        state.questions[state.currentQuestionIndex].aiAnalysis = action.payload.aiAnalysis;
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
        state.timeRemaining = state.questions[state.currentQuestionIndex].timeLimit;
      } else {
        state.isCompleted = true;
        state.isActive = false;
      }
    },
    completeInterview: (state, action: PayloadAction<{ finalScore: number; aiSummary: string }>) => {
      state.isCompleted = true;
      state.isActive = false;
      state.finalScore = action.payload.finalScore;
      state.aiSummary = action.payload.aiSummary;
    },
    resetInterview: () => initialState,
  },
});

export const {
  setCandidateInfo,
  setQuestions,
  startInterview,
  pauseInterview,
  resumeInterview,
  setTimeRemaining,
  submitAnswer,
  nextQuestion,
  completeInterview,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;