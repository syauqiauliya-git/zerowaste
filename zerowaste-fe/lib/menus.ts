import { apiFetch } from "@/lib/api";

export type DailyMenu = {
  _id: string;
  nama_menu: string;
  deskripsi?: string;
  menu_date?: string;
  rating?: number;
  harga?: number;
  protein?: number;
  lemak?: number;
  karbohidrat?: number;
  sppg?: string | { _id: string; name?: string };
  school?: string | { _id: string; school_name?: string };
  created_by?: { _id: string; email?: string };
  is_active?: boolean;
};

export type GetMenusResponse = {
  status: "success";
  results: number;
  data: {
    menus: DailyMenu[];
  };
};

export type GetMenuResponse = {
  status: "success";
  data: {
    menu: DailyMenu;
  };
};

export async function getAllMenus() {
  return apiFetch<GetMenusResponse>("/api/v1/menus");
}

export async function getMenu(id: string) {
  return apiFetch<GetMenuResponse>(`/api/v1/menus/${id}`);
}

export async function createMenu(
  payload: Partial<DailyMenu> & {
    nama_menu: string;
    sppg: string;
    school: string;
  }
) {
  return apiFetch<{ status: string; data: { menu: DailyMenu } }>(
    `/api/v1/menus`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateMenu(id: string, payload: Partial<DailyMenu>) {
  return apiFetch<{ status: string; data: { menu: DailyMenu } }>(
    `/api/v1/menus/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteMenu(id: string) {
  return apiFetch<{ status: string; data: null }>(`/api/v1/menus/${id}`, {
    method: "DELETE",
  });
}
