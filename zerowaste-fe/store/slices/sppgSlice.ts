import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SPPG, fetchAllSPPG, createSPPG as apiCreateSPPG, updateSPPG as apiUpdateSPPG, deleteSPPG as apiDeleteSPPG } from '@/lib/sppg';

interface SPPGState {
  sppgList: SPPG[];
  loading: boolean;
  error: string | null;
}

const initialState: SPPGState = {
  sppgList: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchSPPGList = createAsyncThunk(
  'sppg/fetchSPPGList',
  async () => {
    const sppgList = await fetchAllSPPG();
    return sppgList;
  }
);

export const createSPPG = createAsyncThunk(
  'sppg/createSPPG',
  async (sppgData: { name: string; address: string }) => {
    const sppg = await apiCreateSPPG(sppgData);
    return sppg;
  }
);

export const updateSPPG = createAsyncThunk(
  'sppg/updateSPPG',
  async ({ sppgId, sppgData }: { sppgId: string; sppgData: { name: string; address: string } }) => {
    const sppg = await apiUpdateSPPG(sppgId, sppgData);
    return sppg;
  }
);

export const deleteSPPG = createAsyncThunk(
  'sppg/deleteSPPG',
  async (sppgId: string) => {
    await apiDeleteSPPG(sppgId);
    return sppgId;
  }
);

const sppgSlice = createSlice({
  name: 'sppg',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch SPPG list
    builder
      .addCase(fetchSPPGList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSPPGList.fulfilled, (state, action) => {
        state.loading = false;
        state.sppgList = action.payload;
      })
      .addCase(fetchSPPGList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch SPPG list';
      })

    // Create SPPG
    .addCase(createSPPG.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createSPPG.fulfilled, (state, action) => {
      state.loading = false;
      state.sppgList.push(action.payload);
    })
    .addCase(createSPPG.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create SPPG';
    })

    // Update SPPG
    .addCase(updateSPPG.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateSPPG.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.sppgList.findIndex(sppg => sppg._id === action.payload._id);
      if (index !== -1) {
        state.sppgList[index] = action.payload;
      }
    })
    .addCase(updateSPPG.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update SPPG';
    })

    // Delete SPPG
    .addCase(deleteSPPG.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteSPPG.fulfilled, (state, action) => {
      state.loading = false;
      state.sppgList = state.sppgList.filter(sppg => sppg._id !== action.payload);
    })
    .addCase(deleteSPPG.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete SPPG';
    });
  },
});

export const { clearError } = sppgSlice.actions;

export default sppgSlice.reducer;
