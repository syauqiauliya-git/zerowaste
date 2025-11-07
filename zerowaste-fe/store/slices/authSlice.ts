import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRole } from '@/lib/auth-storage';

interface AuthState {
  role: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  role: null,
  loading: false,
  error: null,
};

// Async thunk to fetch role
export const fetchRole = createAsyncThunk(
  'auth/fetchRole',
  async () => {
    const role = await getRole();
    return role;
  }
);

// Action to set role directly
export const setRole = createAsyncThunk(
  'auth/setRole',
  async (role: string | null) => {
    return role;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearRole: (state) => {
      state.role = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch role
    builder
      .addCase(fetchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRole.fulfilled, (state, action) => {
        state.loading = false;
        state.role = action.payload;
      })
      .addCase(fetchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch role';
      })
      // Set role
      .addCase(setRole.fulfilled, (state, action) => {
        state.role = action.payload;
      });
  },
});

export const { clearRole } = authSlice.actions;
export default authSlice.reducer;

