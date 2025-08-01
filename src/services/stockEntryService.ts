import api from './api';
import { StockEntry, StockEntryForm, PaginatedResponse } from '@/lib/types';

export interface StockEntryParams {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  supplier?: number;
  warehouse?: number;
  date_from?: string;
  date_to?: string;
}

export const stockEntryService = {
  // Récupérer tous les bons d'entrée avec pagination et recherche
  getStockEntries: async (params?: StockEntryParams): Promise<PaginatedResponse<StockEntry>> => {
    const { data } = await api.get("stock-entries/", { params });
    return data;
  },

  // Récupérer un bon d'entrée par ID
  getStockEntry: async (id: number): Promise<StockEntry> => {
    const { data } = await api.get(`stock-entries/${id}/`);
    return data;
  },

  // Créer un nouveau bon d'entrée
  createStockEntry: async (stockEntryData: StockEntryForm): Promise<StockEntry> => {
    const { data } = await api.post("stock-entries/", stockEntryData);
    return data;
  },

  // Mettre à jour un bon d'entrée
  updateStockEntry: async (id: number, stockEntryData: Partial<StockEntryForm>): Promise<StockEntry> => {
    const { data } = await api.patch(`stock-entries/${id}/`, stockEntryData);
    return data;
  },

  // Supprimer un bon d'entrée
  deleteStockEntry: async (id: number): Promise<void> => {
    await api.delete(`stock-entries/${id}/`);
  },

  // Rechercher des bons d'entrée
  searchStockEntries: async (query: string, limit: number = 20): Promise<StockEntry[]> => {
    const { data } = await api.get(`stock-entries/search/?search=${encodeURIComponent(query)}&limit=${limit}`);
    return data;
  },
};
