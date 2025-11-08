import { apiFetch } from '@/lib/api';

export interface Menu {
  _id: string;
  sppg: string | { _id: string; name: string };
  school: { _id: string; school_name: string };
  menu_date?: string;
  nama_menu: string;
  deskripsi?: string;
  rating?: number;
  harga?: number;
  protein?: number;
  lemak?: number;
  karbohidrat?: number;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateMenuData {
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
}

export interface UpdateMenuData {
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

export const fetchMenus = async (): Promise<Menu[]> => {
  const response = await apiFetch<{ data: { menus: Menu[] } }>('/api/v1/menus');
  return response.data.menus;
};

export const createMenu = async (menuData: CreateMenuData): Promise<Menu> => {
  const response = await apiFetch<{ data: { menu: Menu } }>('/api/v1/menus', {
    method: 'POST',
    body: JSON.stringify(menuData),
  });
  return response.data.menu;
};

export const updateMenu = async (menuId: string, menuData: UpdateMenuData): Promise<Menu> => {
  const response = await apiFetch<{ data: { menu: Menu } }>(`/api/v1/menus/${menuId}`, {
    method: 'PUT',
    body: JSON.stringify(menuData),
  });
  return response.data.menu;
};

export const fetchMenuDetail = async (menuId: string): Promise<Menu> => {
  const response = await apiFetch<{ data: { menu: Menu } }>(`/api/v1/menus/${menuId}`);
  return response.data.menu;
};

export const deleteMenu = async (menuId: string): Promise<void> => {
  await apiFetch(`/api/v1/menus/${menuId}`, {
    method: 'DELETE',
  });
};

