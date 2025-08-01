import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockExitService, StockExitParams, CreateStockExitData, StockExit } from '@/services/stockExitService';
import { toast } from 'sonner';

// Query keys
export const stockExitKeys = {
  all: ['stockExits'] as const,
  lists: () => [...stockExitKeys.all, 'list'] as const,
  list: (params: StockExitParams) => [...stockExitKeys.lists(), params] as const,
  details: () => [...stockExitKeys.all, 'detail'] as const,
  detail: (id: number) => [...stockExitKeys.details(), id] as const,
};

// Hook pour récupérer la liste des bons de sortie
export function useStockExits(params: StockExitParams = {}) {
  return useQuery({
    queryKey: stockExitKeys.list(params),
    queryFn: () => stockExitService.getStockExits(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook pour récupérer un bon de sortie spécifique
export function useStockExit(id: number) {
  return useQuery({
    queryKey: stockExitKeys.detail(id),
    queryFn: () => stockExitService.getStockExit(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour créer un bon de sortie
export function useCreateStockExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockExitData) => stockExitService.createStockExit(data),
    onMutate: async (newStockExit) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: stockExitKeys.lists() });

      // Sauvegarder les données précédentes pour le rollback
      const previousStockExits = queryClient.getQueriesData({ queryKey: stockExitKeys.lists() });

      // Mise à jour optimiste
      queryClient.setQueriesData<any>(
        { queryKey: stockExitKeys.lists() },
        (old) => {
          if (!old) return old;
          
          const optimisticStockExit: StockExit = {
            id: Date.now(), // ID temporaire
            exit_number: `TMP-${Date.now()}`,
            customer: newStockExit.customer,
            customer_name: 'Chargement...',
            warehouse: newStockExit.warehouse,
            warehouse_name: 'Chargement...',
            total_amount: newStockExit.items.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0).toString(),
            notes: newStockExit.notes || '',
            created_by: 1, // Sera remplacé par l'utilisateur actuel
            created_by_name: 'Vous',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            items: newStockExit.items.map(item => ({
              ...item,
              id: Date.now() + Math.random(),
              total_price: item.quantity * item.sale_price,
            })),
          };

          return {
            ...old,
            count: old.count + 1,
            results: [optimisticStockExit, ...old.results],
          };
        }
      );

      return { previousStockExits };
    },
    onError: (err: any, newStockExit, context) => {
      // Rollback en cas d'erreur
      if (context?.previousStockExits) {
        context.previousStockExits.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      // Gestion spécifique des erreurs de stock
      if (err?.response?.data?.stock_errors) {
        const stockErrors = err.response.data.stock_errors;
        const errorMessage = stockErrors.map((error: any) => 
          `${error.product} (${error.product_name}): ${error.error} - Disponible: ${error.available_quantity}, Demandé: ${error.requested_quantity}`
        ).join('\n');
        
        toast.error(`Erreurs de stock:\n${errorMessage}`, {
          duration: 8000,
          style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
          }
        });
      } else if (err?.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Erreur lors de la création du bon de sortie');
      }
      
      console.error('Erreur création bon de sortie:', err);
    },
    onSuccess: (data) => {
      toast.success('Bon de sortie créé avec succès');
    },
    onSettled: () => {
      // Rafraîchir les données après mutation
      queryClient.invalidateQueries({ queryKey: stockExitKeys.lists() });
    },
  });
}

// Hook pour mettre à jour un bon de sortie
export function useUpdateStockExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateStockExitData>) => 
      stockExitService.updateStockExit(id, data),
    onSuccess: (data) => {
      // Mettre à jour le cache du bon de sortie spécifique
      queryClient.setQueryData(stockExitKeys.detail(data.id), data);
      
      // Mettre à jour les listes qui pourraient contenir ce bon de sortie
      queryClient.setQueriesData<any>(
        { queryKey: stockExitKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            results: old.results.map((stockExit: StockExit) =>
              stockExit.id === data.id ? data : stockExit
            ),
          };
        }
      );

      toast.success('Bon de sortie modifié avec succès');
    },
    onError: (err) => {
      toast.error('Erreur lors de la modification du bon de sortie');
      console.error('Erreur modification bon de sortie:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: stockExitKeys.lists() });
    },
  });
}

// Hook pour supprimer un bon de sortie
export function useDeleteStockExit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stockExitService.deleteStockExit(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: stockExitKeys.lists() });

      const previousStockExits = queryClient.getQueriesData({ queryKey: stockExitKeys.lists() });

      // Suppression optimiste
      queryClient.setQueriesData<any>(
        { queryKey: stockExitKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            count: old.count - 1,
            results: old.results.filter((stockExit: StockExit) => stockExit.id !== id),
          };
        }
      );

      return { previousStockExits };
    },
    onError: (err, id, context) => {
      if (context?.previousStockExits) {
        context.previousStockExits.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Erreur lors de la suppression du bon de sortie');
      console.error('Erreur suppression bon de sortie:', err);
    },
    onSuccess: () => {
      toast.success('Bon de sortie supprimé avec succès');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: stockExitKeys.lists() });
    },
  });
}

// Hook pour rechercher des bons de sortie
export function useSearchStockExits(query: string) {
  return useQuery({
    queryKey: [...stockExitKeys.all, 'search', query],
    queryFn: () => stockExitService.searchStockExits(query),
    enabled: query.length > 2,
    staleTime: 30 * 1000, // 30 secondes
  });
}
