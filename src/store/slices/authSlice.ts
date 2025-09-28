import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  userType: 'candidate' | 'interviewer' | null;
  email?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userType: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ userType: 'candidate' | 'interviewer'; email?: string }>) => {
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
      state.email = action.payload.email;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userType = null;
      state.email = undefined;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;