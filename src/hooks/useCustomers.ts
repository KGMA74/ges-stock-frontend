import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService, CustomerParams, CustomerForm } from "@/services/customerService";
import { Customer } from "@/lib/types";

// Clés de requête
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: any) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
};

// Hook pour récupérer les clients
export const useCustomers = (params?: CustomerParams) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
    staleTime: 5 * 60 * 1000, // 5 minutes - considère les données comme fraîches
    gcTime: 10 * 60 * 1000, // 10 minutes - garde en cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook pour récupérer un client spécifique
export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
};

// Hook pour créer un client
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: (newCustomer) => {
      // Mise à jour optimiste du cache au lieu d'invalidation complète
      queryClient.setQueryData(
        customerKeys.detail(newCustomer.id),
        newCustomer
      );
      
      // Mise à jour optimiste de la liste des clients
      const queryKeys = queryClient.getQueryCache().findAll({
        queryKey: customerKeys.lists(),
      });
      
      queryKeys.forEach((query) => {
        const oldData = query.state.data as any;
        if (oldData?.results) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            results: [newCustomer, ...oldData.results],
            count: (oldData.count || 0) + 1,
          });
        }
      });
      
      // Note: Pas de toast ici, il sera géré dans le composant
    },
    onError: (error: any) => {
      console.error("Erreur création client:", error);
      // Note: Pas de toast ici, il sera géré dans le composant
    },
  });
};

// Hook pour mettre à jour un client
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomerForm> }) =>
      customerService.updateCustomer(id, data),
    onSuccess: (updatedCustomer) => {
      // Mettre à jour le cache du client spécifique
      queryClient.setQueryData(
        customerKeys.detail(updatedCustomer.id),
        updatedCustomer
      );
      
      // Invalider la liste pour la rafraîchir
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Erreur mise à jour client:", error);
    },
  });
};

// Hook pour supprimer un client
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: customerKeys.detail(deletedId) });
      
      // Invalider la liste pour la rafraîchir
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Erreur suppression client:", error);
    },
  });
};

// Hook pour rechercher des clients
export const useSearchCustomers = (query: string, limit?: number) => {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => customerService.searchCustomers(query, limit),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les recherches
  });
};
