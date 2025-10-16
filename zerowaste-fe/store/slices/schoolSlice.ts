import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSchools as apiFetchSchools, createSchool as apiCreateSchool, updateSchool as apiUpdateSchool, deleteSchool as apiDeleteSchool } from '@/lib/school';

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

// Helper function to map API school to slice school format
const mapApiSchoolToSliceSchool = (apiSchool: any): School => ({
  _id: apiSchool._id, // MongoDB uses _id, not id
  school_name: apiSchool.school_name,
  address: apiSchool.address,
  jml_murid: apiSchool.jml_murid,
  jml_kelas: apiSchool.jml_kelas,
  is_active: apiSchool.is_active || true, // Use API value or default
  created_at: apiSchool.created_at || new Date().toISOString(), // Use API value or default
  updatedAt: apiSchool.updatedAt || new Date().toISOString(), // Use API value or default
  __v: apiSchool.__v || 0, // Use API value or default
});

// Async thunks for API calls
export const fetchSchools = createAsyncThunk(
  'schools/fetchSchools',
  async () => {
    const schools = await apiFetchSchools();
    return schools.map(mapApiSchoolToSliceSchool);
  }
);

export const createSchool = createAsyncThunk(
  'schools/createSchool',
  async (schoolData: { school_name: string; address: string; jml_murid: number; jml_kelas: number }) => {
    const school = await apiCreateSchool(schoolData);
    return mapApiSchoolToSliceSchool(school);
  }
);

export const updateSchool = createAsyncThunk(
  'schools/updateSchool',
  async ({ schoolId, schoolData }: { schoolId: string; schoolData: { school_name: string; address: string; jml_murid: number; jml_kelas: number } }) => {
    const school = await apiUpdateSchool(schoolId, schoolData);
    return mapApiSchoolToSliceSchool(school);
  }
);

export const deleteSchool = createAsyncThunk(
  'schools/deleteSchool',
  async (schoolId: string) => {
    await apiDeleteSchool(schoolId);
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
