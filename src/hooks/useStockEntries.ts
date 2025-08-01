import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockEntryService, StockEntryParams } from '@/services/stockEntryService';
import { StockEntry, StockEntryForm } from '@/lib/types';
import { toast } from 'sonner';

// Hook pour récupérer les bons d'entrée avec pagination
export const useStockEntries = (params?: StockEntryParams) => {
  return useQuery({
    queryKey: ['stock-entries', params],
    queryFn: () => stockEntryService.getStockEntries(params),
    staleTime: 30 * 1000, // 30 secondes
    placeholderData: (previousData) => previousData,
  });
};

// Hook pour récupérer un bon d'entrée par ID
export const useStockEntry = (id: number) => {
  return useQuery({
    queryKey: ['stock-entries', id],
    queryFn: () => stockEntryService.getStockEntry(id),
    enabled: !!id,
  });
};

// Hook pour créer un bon d'entrée
export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockEntryForm) => stockEntryService.createStockEntry(data),
    onMutate: async (newStockEntry) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['stock-entries'] });

      // Snapshot de l'ancienne valeur
      const previousStockEntries = queryClient.getQueryData(['stock-entries']);

      // Mise à jour optimiste du cache
      queryClient.setQueryData(['stock-entries'], (old: any) => {
        if (!old) return old;
        
        // Créer un bon d'entrée temporaire pour l'affichage optimiste
        const tempStockEntry: StockEntry = {
          id: Date.now(), // ID temporaire
          entry_number: `EN-${Date.now()}`,
          supplier: newStockEntry.supplier,
          supplier_name: 'Chargement...',
          warehouse: newStockEntry.warehouse,
          warehouse_name: 'Chargement...',
          total_amount: '0.00',
          notes: newStockEntry.notes || '',
          created_by: 0,
          created_by_name: 'Vous',
          created_at: new Date().toISOString(),
          items: []
        };

        return {
          ...old,
          results: [tempStockEntry, ...old.results],
          count: old.count + 1,
        };
      });

      return { previousStockEntries };
    },
    onError: (err, newStockEntry, context) => {
      // Restaurer l'ancienne valeur en cas d'erreur
      if (context?.previousStockEntries) {
        queryClient.setQueryData(['stock-entries'], context.previousStockEntries);
      }
      toast.error('Erreur lors de la création du bon d\'entrée');
    },
    onSuccess: (data) => {
      toast.success('Bon d\'entrée créé avec succès');
    },
    onSettled: () => {
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['stock-entries'] });
    },
  });
};

// Hook pour mettre à jour un bon d'entrée
export const useUpdateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StockEntryForm> }) =>
      stockEntryService.updateStockEntry(id, data),
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(['stock-entries', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['stock-entries'] });
      toast.success('Bon d\'entrée mis à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du bon d\'entrée');
    },
  });
};

// Hook pour supprimer un bon d'entrée
export const useDeleteStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stockEntryService.deleteStockEntry(id),
    onMutate: async (deletedId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ['stock-entries'] });

      // Snapshot de l'ancienne valeur
      const previousStockEntries = queryClient.getQueryData(['stock-entries']);

      // Mise à jour optimiste du cache
      queryClient.setQueryData(['stock-entries'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.filter((entry: StockEntry) => entry.id !== deletedId),
          count: old.count - 1,
        };
      });

      return { previousStockEntries };
    },
    onError: (err, deletedId, context) => {
      // Restaurer l'ancienne valeur en cas d'erreur
      if (context?.previousStockEntries) {
        queryClient.setQueryData(['stock-entries'], context.previousStockEntries);
      }
      toast.error('Erreur lors de la suppression du bon d\'entrée');
    },
    onSuccess: () => {
      toast.success('Bon d\'entrée supprimé avec succès');
    },
    onSettled: () => {
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['stock-entries'] });
    },
  });
};

// Hook pour rechercher des bons d'entrée
export const useSearchStockEntries = (query: string, limit?: number) => {
  return useQuery({
    queryKey: ['stock-entries', 'search', query, limit],
    queryFn: () => stockEntryService.searchStockEntries(query, limit),
    enabled: !!query && query.length > 0,
    staleTime: 30 * 1000,
  });
};
