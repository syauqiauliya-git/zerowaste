import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import API_BASE_URL from '@/constants/api';

export interface School {
  _id: string;
  school_name: string;
  address: string;
  jml_murid: number;
  jml_kelas: number;
  is_active: boolean;
  created_at: string;
  updatedAt: string;
  __v: number;
}

interface SchoolState {
  schools: School[];
  loading: boolean;
  error: string | null;
}

const initialState: SchoolState = {
  schools: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchSchools = createAsyncThunk(
  'schools/fetchSchools',
  async () => {
    const response = await fetch(`${API_BASE_URL}/schools`);
    const data = await response.json();
    return data.data.schools;
  }
);

export const createSchool = createAsyncThunk(
  'schools/createSchool',
  async (schoolData: { school_name: string; address: string; jml_murid: number; jml_kelas: number }) => {
    const response = await fetch(`${API_BASE_URL}/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schoolData),
    });
    const data = await response.json();
    return data.data.school;
  }
);

export const updateSchool = createAsyncThunk(
  'schools/updateSchool',
  async ({ schoolId, schoolData }: { schoolId: string; schoolData: { school_name: string; address: string; jml_murid: number; jml_kelas: number } }) => {
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schoolData),
    });
    const data = await response.json();
    return data.data.school;
  }
);

export const deleteSchool = createAsyncThunk(
  'schools/deleteSchool',
  async (schoolId: string) => {
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`, {
      method: 'DELETE',
    });
    return schoolId;
  }
);

const schoolSlice = createSlice({
  name: 'schools',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch schools
    builder
      .addCase(fetchSchools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.loading = false;
        state.schools = action.payload;
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch schools';
      })
    
    // Create school
    .addCase(createSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.schools.push(action.payload);
    })
    .addCase(createSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create school';
    })
    
    // Update school
    .addCase(updateSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateSchool.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.schools.findIndex(school => school._id === action.payload._id);
      if (index !== -1) {
        state.schools[index] = action.payload;
      }
    })
    .addCase(updateSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update school';
    })
    
    // Delete school
    .addCase(deleteSchool.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteSchool.fulfilled, (state, action) => {
      state.loading = false;
      state.schools = state.schools.filter(school => school._id !== action.payload);
    })
    .addCase(deleteSchool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete school';
    });
  },
});

export const { clearError } = schoolSlice.actions;
export default schoolSlice.reducer;
