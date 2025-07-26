import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockService } from "@/services/stockService";
import { StockEntry, StockEntryForm, StockExit, StockExitForm } from "@/lib/types";
import { toast } from "sonner";

// Clés de requête pour les stocks
export const stockKeys = {
  all: ['stock'] as const,
  entries: () => [...stockKeys.all, 'entries'] as const,
  entriesList: (filters: any) => [...stockKeys.entries(), 'list', { filters }] as const,
  entryDetail: (id: number) => [...stockKeys.entries(), 'detail', id] as const,
  exits: () => [...stockKeys.all, 'exits'] as const,
  exitsList: (filters: any) => [...stockKeys.exits(), 'list', { filters }] as const,
  exitDetail: (id: number) => [...stockKeys.exits(), 'detail', id] as const,
  movements: (filters: any) => [...stockKeys.all, 'movements', { filters }] as const,
  stats: () => [...stockKeys.all, 'stats'] as const,
  value: (warehouse?: number) => [...stockKeys.all, 'value', { warehouse }] as const,
};

// === HOOKS POUR LES BONS D'ENTRÉE ===

export const useStockEntries = (params?: { 
  page?: number; 
  page_size?: number;
  search?: string; 
  supplier?: number; 
  warehouse?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: stockKeys.entriesList(params),
    queryFn: () => stockService.getStockEntries(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStockEntry = (id: number) => {
  return useQuery({
    queryKey: stockKeys.entryDetail(id),
    queryFn: () => stockService.getStockEntry(id),
    enabled: !!id,
  });
};

export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockService.createStockEntry,
    onSuccess: (newEntry) => {
      // Invalider la liste des bons d'entrée
      queryClient.invalidateQueries({ queryKey: stockKeys.entries() });
      
      // Invalider le stock des produits (car il a changé)
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      // Ajouter au cache
      queryClient.setQueryData(
        stockKeys.entryDetail(newEntry.id),
        newEntry
      );
      
      toast.success(`Bon d'entrée ${newEntry.entry_number} créé avec succès`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du bon d'entrée");
      console.error("Erreur création bon d'entrée:", error);
    },
  });
};

export const useUpdateStockEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StockEntryForm> }) =>
      stockService.updateStockEntry(id, data),
    onSuccess: (updatedEntry) => {
      // Mettre à jour le cache
      queryClient.setQueryData(
        stockKeys.entryDetail(updatedEntry.id),
        updatedEntry
      );
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: stockKeys.entries() });
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      toast.success(`Bon d'entrée ${updatedEntry.entry_number} mis à jour`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour du bon d'entrée");
      console.error("Erreur mise à jour bon d'entrée:", error);
    },
  });
};

export const useDeleteStockEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockService.deleteStockEntry,
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: stockKeys.entryDetail(deletedId) });
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: stockKeys.entries() });
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      toast.success("Bon d'entrée supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression du bon d'entrée");
      console.error("Erreur suppression bon d'entrée:", error);
    },
  });
};

// Hook combiné pour les mutations de stock entry
export const useStockEntryMutations = () => {
  const createStockEntry = useCreateStockEntry();
  const updateStockEntry = useUpdateStockEntry();
  const deleteStockEntry = useDeleteStockEntry();

  return {
    createStockEntry,
    updateStockEntry,
    deleteStockEntry
  };
};

// === HOOKS POUR LES BONS DE SORTIE ===

export const useStockExits = (params?: { 
  page?: number; 
  page_size?: number;
  search?: string; 
  customer?: number; 
  warehouse?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: stockKeys.exitsList(params),
    queryFn: () => stockService.getStockExits(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useStockExit = (id: number) => {
  return useQuery({
    queryKey: stockKeys.exitDetail(id),
    queryFn: () => stockService.getStockExit(id),
    enabled: !!id,
  });
};

export const useCreateStockExit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockService.createStockExit,
    onSuccess: (newExit) => {
      // Invalider la liste des bons de sortie
      queryClient.invalidateQueries({ queryKey: stockKeys.exits() });
      
      // Invalider le stock des produits (car il a changé)
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      // Ajouter au cache
      queryClient.setQueryData(
        stockKeys.exitDetail(newExit.id),
        newExit
      );
      
      toast.success(`Bon de sortie ${newExit.exit_number} créé avec succès`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du bon de sortie");
      console.error("Erreur création bon de sortie:", error);
    },
  });
};

export const useUpdateStockExit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StockExitForm> }) =>
      stockService.updateStockExit(id, data),
    onSuccess: (updatedExit) => {
      // Mettre à jour le cache
      queryClient.setQueryData(
        stockKeys.exitDetail(updatedExit.id),
        updatedExit
      );
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: stockKeys.exits() });
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      toast.success(`Bon de sortie ${updatedExit.exit_number} mis à jour`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour du bon de sortie");
      console.error("Erreur mise à jour bon de sortie:", error);
    },
  });
};

export const useDeleteStockExit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: stockService.deleteStockExit,
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: stockKeys.exitDetail(deletedId) });
      
      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: stockKeys.exits() });
      queryClient.invalidateQueries({ queryKey: ['products', 'stock'] });
      
      toast.success("Bon de sortie supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression du bon de sortie");
      console.error("Erreur suppression bon de sortie:", error);
    },
  });
};

// Hook combiné pour les mutations de stock exit
export const useStockExitMutations = () => {
  const createStockExit = useCreateStockExit();
  const updateStockExit = useUpdateStockExit();
  const deleteStockExit = useDeleteStockExit();

  return {
    createStockExit,
    updateStockExit,
    deleteStockExit
  };
};

// === HOOKS POUR LES RAPPORTS ===

export const useStockMovements = (params: {
  start_date: string;
  end_date: string;
  product?: number;
  warehouse?: number;
}) => {
  return useQuery({
    queryKey: stockKeys.movements(params),
    queryFn: () => stockService.getStockMovements(params),
    enabled: !!(params.start_date && params.end_date),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStockStats = () => {
  return useQuery({
    queryKey: stockKeys.stats(),
    queryFn: stockService.getStockStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStockValue = (warehouse?: number) => {
  return useQuery({
    queryKey: stockKeys.value(warehouse),
    queryFn: () => stockService.getStockValue(warehouse),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
