import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from './interviewSlice';

export interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeText?: string;
  questions: Question[];
  finalScore: number;
  aiSummary: string;
  completedAt: number;
  duration: number; // in minutes
}

interface CandidatesState {
  candidates: CandidateRecord[];
  searchQuery: string;
  sortBy: 'score' | 'name' | 'date';
  sortOrder: 'asc' | 'desc';
}

const initialState: CandidatesState = {
  candidates: [],
  searchQuery: '',
  sortBy: 'score',
  sortOrder: 'desc',
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<CandidateRecord>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<CandidateRecord> }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload.updates };
      }
    },
    deleteCandidate: (state, action: PayloadAction<string>) => {
      state.candidates = state.candidates.filter(c => c.id !== action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'score' | 'name' | 'date'>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  deleteCandidate,
  setSearchQuery,
  setSortBy,
  setSortOrder,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;