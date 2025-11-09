import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Menu, fetchMenus as apiFetchMenus, createMenu as apiCreateMenu, updateMenu as apiUpdateMenu, deleteMenu as apiDeleteMenu } from '@/lib/menu';

interface MenuState {
  menus: Menu[];
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};

// Helper function to map API menu to slice menu format
const mapApiMenuToSliceMenu = (apiMenu: any): Menu => ({
  _id: apiMenu._id,
  sppg: apiMenu.sppg,
  school: apiMenu.school,
  menu_date: apiMenu.menu_date || new Date().toISOString(),
  nama_menu: apiMenu.nama_menu,
  deskripsi: apiMenu.deskripsi || '',
  rating: apiMenu.rating || 0,
  harga: apiMenu.harga || 0,
  protein: apiMenu.protein || 0,
  lemak: apiMenu.lemak || 0,
  karbohidrat: apiMenu.karbohidrat || 0,
  is_active: apiMenu.is_active !== undefined ? apiMenu.is_active : true,
  created_by: apiMenu.created_by,
  created_at: apiMenu.created_at || new Date().toISOString(),
  updatedAt: apiMenu.updatedAt || new Date().toISOString(),
  __v: apiMenu.__v || 0,
});

// Async thunks for API calls
export const fetchMenus = createAsyncThunk(
  'menus/fetchMenus',
  async () => {
    const menus = await apiFetchMenus();
    return menus.map(mapApiMenuToSliceMenu);
  }
);

export const createMenu = createAsyncThunk(
  'menus/createMenu',
  async (menuData: { 
    sppg: string; 
    school: string; 
    menu_date?: string; 
    nama_menu: string; 
    deskripsi?: string; 
    rating?: number; 
    harga?: number; 
    protein?: number; 
    lemak?: number; 
    karbohidrat?: number; 
    is_active?: boolean;
  }) => {
    const menu = await apiCreateMenu(menuData);
    return mapApiMenuToSliceMenu(menu);
  }
);

export const updateMenu = createAsyncThunk(
  'menus/updateMenu',
  async ({ menuId, menuData }: { 
    menuId: string; 
    menuData: { 
      sppg?: string; 
      school?: string; 
      menu_date?: string; 
      nama_menu?: string; 
      deskripsi?: string; 
      rating?: number; 
      harga?: number; 
      protein?: number; 
      lemak?: number; 
      karbohidrat?: number; 
      is_active?: boolean;
    } 
  }) => {
    const menu = await apiUpdateMenu(menuId, menuData);
    return mapApiMenuToSliceMenu(menu);
  }
);

export const deleteMenu = createAsyncThunk(
  'menus/deleteMenu',
  async (menuId: string) => {
    await apiDeleteMenu(menuId);
    return menuId;
  }
);

const menuSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch menus
    builder
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch menus';
      })
    
    // Create menu
    .addCase(createMenu.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createMenu.fulfilled, (state, action) => {
      state.loading = false;
      state.menus.push(action.payload);
    })
    .addCase(createMenu.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create menu';
    })
    
    // Update menu
    .addCase(updateMenu.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateMenu.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.menus.findIndex(menu => menu._id === action.payload._id);
      if (index !== -1) {
        state.menus[index] = action.payload;
      }
    })
    .addCase(updateMenu.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update menu';
    })
    
    // Delete menu
    .addCase(deleteMenu.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteMenu.fulfilled, (state, action) => {
      state.loading = false;
      state.menus = state.menus.filter(menu => menu._id !== action.payload);
    })
    .addCase(deleteMenu.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete menu';
    });
  },
});

export const { clearError } = menuSlice.actions;
export default menuSlice.reducer;

