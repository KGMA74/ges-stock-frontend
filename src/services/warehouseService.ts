import api from '@/services/api';

export interface Warehouse {
  id: number;
  name: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehouseData {
  name: string;
  address?: string;
}

export interface UpdateWarehouseData {
  name?: string;
  address?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const warehouseService = {
  async getWarehouses(): Promise<PaginatedResponse<Warehouse>> {
    const response = await api.get<PaginatedResponse<Warehouse>>('/warehouses/');
    return response.data;
  },

  async getWarehouse(id: number): Promise<Warehouse> {
    const response = await api.get<Warehouse>(`/warehouses/${id}/`);
    return response.data;
  },

  async createWarehouse(data: CreateWarehouseData): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/warehouses/', data);
    return response.data;
  },

  async updateWarehouse(id: number, data: UpdateWarehouseData): Promise<Warehouse> {
    const response = await api.patch<Warehouse>(`/warehouses/${id}/`, data);
    return response.data;
  },

  async deleteWarehouse(id: number): Promise<void> {
    await api.delete(`/warehouses/${id}/`);
  },

  async searchWarehouses(query: string): Promise<Warehouse[]> {
    const response = await api.get<Warehouse[]>(`/warehouses/search/?search=${encodeURIComponent(query)}`);
    return response.data;
  },
};
