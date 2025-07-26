import api from "./api";
import { 
  StockEntry, 
  StockEntryForm, 
  StockExit, 
  StockExitForm, 
  PaginatedResponse 
} from "@/lib/types";

export const stockService = {
  // === BONS D'ENTRÉE ===
  
  // Récupérer tous les bons d'entrée
  getStockEntries: async (params?: { 
    page?: number; 
    page_size?: number;
    search?: string; 
    supplier?: number; 
    warehouse?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<StockEntry>> => {
    const { data } = await api.get("stock-entries/", { params });
    return data;
  },

  // Récupérer un bon d'entrée par ID
  getStockEntry: async (id: number): Promise<StockEntry> => {
    const { data } = await api.get(`stock-entries/${id}/`);
    return data;
  },

  // Créer un nouveau bon d'entrée
  createStockEntry: async (entryData: StockEntryForm): Promise<StockEntry> => {
    const { data } = await api.post("stock-entries/", entryData);
    return data;
  },

  // Mettre à jour un bon d'entrée
  updateStockEntry: async (id: number, entryData: Partial<StockEntryForm>): Promise<StockEntry> => {
    const { data } = await api.patch(`stock-entries/${id}/`, entryData);
    return data;
  },

  // Supprimer un bon d'entrée
  deleteStockEntry: async (id: number): Promise<void> => {
    await api.delete(`stock-entries/${id}/`);
  },

  // === BONS DE SORTIE ===
  
  // Récupérer tous les bons de sortie
  getStockExits: async (params?: { 
    page?: number; 
    page_size?: number;
    search?: string; 
    customer?: number; 
    warehouse?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<StockExit>> => {
    const { data } = await api.get("stock-exits/", { params });
    return data;
  },

  // Récupérer un bon de sortie par ID
  getStockExit: async (id: number): Promise<StockExit> => {
    const { data } = await api.get(`stock-exits/${id}/`);
    return data;
  },

  // Créer un nouveau bon de sortie
  createStockExit: async (exitData: StockExitForm): Promise<StockExit> => {
    const { data } = await api.post("stock-exits/", exitData);
    return data;
  },

  // Mettre à jour un bon de sortie
  updateStockExit: async (id: number, exitData: Partial<StockExitForm>): Promise<StockExit> => {
    const { data } = await api.patch(`stock-exits/${id}/`, exitData);
    return data;
  },

  // Supprimer un bon de sortie
  deleteStockExit: async (id: number): Promise<void> => {
    await api.delete(`stock-exits/${id}/`);
  },

  // === RAPPORTS ET STATISTIQUES ===
  
  // Mouvements de stock par période
  getStockMovements: async (params: {
    start_date: string;
    end_date: string;
    product?: number;
    warehouse?: number;
  }) => {
    const { data } = await api.get("stock-movements/", { params });
    return data;
  },

  // Statistiques de stock
  getStockStats: async () => {
    const { data } = await api.get("stock-stats/");
    return data;
  },

  // Valeur du stock
  getStockValue: async (warehouse?: number) => {
    const { data } = await api.get("stock-value/", { 
      params: warehouse ? { warehouse } : {} 
    });
    return data;
  }
};
