import api from '@/services/api';

export interface StockExitItem {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  sale_price: number;
  total_price: number;
}

export interface StockExit {
  id: number;
  exit_number: string;
  customer: number;
  customer_name: string;
  warehouse: number;
  warehouse_name: string;
  account?: number;
  account_name?: string;
  account_type?: 'bank' | 'cash';
  total_amount: string;
  notes?: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  items: StockExitItem[];
}

export interface CreateStockExitData {
  customer: number;
  warehouse: number;
  account?: number;
  notes?: string;
  items: Omit<StockExitItem, 'id' | 'product_name' | 'total_price'>[];
}

export interface UpdateStockExitData extends Partial<CreateStockExitData> {
  id: number;
}

export interface StockExitListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockExit[];
}

export interface StockExitParams {
  page?: number;
  page_size?: number;
  search?: string;
  customer?: number;
  warehouse?: number;
  ordering?: string;
}

class StockExitService {
  private basePath = '/stock-exits';

  async getStockExits(params: StockExitParams = {}): Promise<StockExitListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.customer) searchParams.append('customer', params.customer.toString());
    if (params.warehouse) searchParams.append('warehouse', params.warehouse.toString());
    if (params.ordering) searchParams.append('ordering', params.ordering);

    const url = `${this.basePath}/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<StockExitListResponse>(url);
    return response.data;
  }

  async getStockExit(id: number): Promise<StockExit> {
    const response = await api.get<StockExit>(`${this.basePath}/${id}/`);
    return response.data;
  }

  async createStockExit(data: CreateStockExitData): Promise<StockExit> {
    const response = await api.post<StockExit>(`${this.basePath}/`, data);
    return response.data;
  }

  async updateStockExit(id: number, data: Partial<CreateStockExitData>): Promise<StockExit> {
    const response = await api.patch<StockExit>(`${this.basePath}/${id}/`, data);
    return response.data;
  }

  async deleteStockExit(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}/`);
  }

  async searchStockExits(query: string): Promise<StockExit[]> {
    const response = await this.getStockExits({ search: query, page_size: 50 });
    return response.results;
  }
}

export const stockExitService = new StockExitService();
