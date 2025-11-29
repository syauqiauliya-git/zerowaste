import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  Class, 
  fetchClasses as apiFetchClasses, 
  fetchClassesBySchoolId as apiFetchClassesBySchoolId,
  createClass as apiCreateClass, 
  updateClass as apiUpdateClass, 
  deleteClass as apiDeleteClass 
} from '@/lib/class';

interface ClassState {
  classes: Class[];
  loading: boolean;
  error: string | null;
}

const initialState: ClassState = {
  classes: [],
  loading: false,
  error: null,
};

// Helper function to map API class to slice class format
const mapApiClassToSliceClass = (apiClass: any): Class => ({
  _id: apiClass._id,
  school_id: apiClass.school_id ? {
    _id: apiClass.school_id._id,
    school_name: apiClass.school_id.school_name
  } : {
    _id: '',
    school_name: 'Unknown School'
  },
  class_name: apiClass.class_name,
  grade_level: apiClass.grade_level,
  createdAt: apiClass.createdAt,
  updatedAt: apiClass.updatedAt,
  __v: apiClass.__v || 0,
});

// Async thunks for API calls
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async () => {
    console.log("Fetching classes");
    const response = await apiFetchClasses();
    console.log("fetchClasses raw response:", response);
    console.log("Testinggg");
    const mappedData = response.data.map(mapApiClassToSliceClass);
    console.log("Mapped class data!!!!!!!!!!!!:", mappedData);
    console.log("Testinggg222");
    return mappedData;
  }
);

export const fetchClassesBySchoolId = createAsyncThunk(
  'classes/fetchClassesBySchoolId',
  async (schoolId: string) => {
    try {
      console.log("Fetching classes for school ID:", schoolId);
      const response = await apiFetchClassesBySchoolId(schoolId);
      console.log("Classes by school ID raw response:", response);
      if (!response || !response.data) {
        throw new Error('Invalid response format from API');
      }
      const mappedData = response.data.map(mapApiClassToSliceClass);
      console.log("Mapped class data:", mappedData);
      return mappedData;
    } catch (error) {
      console.error("Error fetching classes by school ID:", error);
      throw error;
    }
  }
);

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData: { school_id: string; class_name: string; grade_level: string }) => {
    const newClass = await apiCreateClass(classData);
    return mapApiClassToSliceClass(newClass.data);
  }
);

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ classId, classData }: { classId: string; classData: { class_name?: string; grade_level?: string } }) => {
    const updatedClass = await apiUpdateClass(classId, classData);
    console.log('Updated class data: ', updatedClass);
    return mapApiClassToSliceClass(updatedClass.data);
  }
);

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (classId: string) => {
    await apiDeleteClass(classId);
    return classId;
  }
);

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch classes
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch classes';
      })
      
      // Fetch classes by school ID
      .addCase(fetchClassesBySchoolId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassesBySchoolId.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = action.payload;
      })
      .addCase(fetchClassesBySchoolId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch classes for this school';
      })
    
    // Create class
    .addCase(createClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createClass.fulfilled, (state, action) => {
      state.loading = false;
      state.classes.push(action.payload);
    })
    .addCase(createClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create class';
    })

    // Update class
    .addCase(updateClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateClass.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.classes.findIndex((cls) => cls._id === action.payload._id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      }
    })
    .addCase(updateClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update class';
    })

    // Delete class
    .addCase(deleteClass.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteClass.fulfilled, (state, action) => {
      state.loading = false;
      state.classes = state.classes.filter((cls) => cls._id !== action.payload);
    })
    .addCase(deleteClass.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete class';
    });
  },
});

export const { clearError } = classSlice.actions;
export default classSlice.reducer;
