import api from './api';
import { Customer } from '@/lib/types';

export interface CustomerParams {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface CustomerForm {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PaginatedCustomerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Customer[];
}

export const customerService = {
  // Récupérer tous les clients avec pagination et recherche
  getCustomers: async (params?: CustomerParams): Promise<PaginatedCustomerResponse> => {
    const { data } = await api.get("customers/", { params });
    return data;
  },

  // Récupérer un client par ID
  getCustomer: async (id: number): Promise<Customer> => {
    const { data } = await api.get(`customers/${id}/`);
    return data;
  },

  // Créer un nouveau client
  createCustomer: async (customerData: CustomerForm): Promise<Customer> => {
    const { data } = await api.post("customers/", customerData);
    return data;
  },

  // Mettre à jour un client
  updateCustomer: async (id: number, customerData: Partial<CustomerForm>): Promise<Customer> => {
    const { data } = await api.patch(`customers/${id}/`, customerData);
    return data;
  },

  // Supprimer un client
  deleteCustomer: async (id: number): Promise<void> => {
    await api.delete(`customers/${id}/`);
  },

  // Rechercher des clients
  searchCustomers: async (query: string, limit: number = 20): Promise<Customer[]> => {
    const { data } = await api.get(`customers/search/?search=${encodeURIComponent(query)}&limit=${limit}`);
    return data;
  },
};
