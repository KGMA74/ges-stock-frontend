import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Warehouse } from '@/lib/types';
import { toast } from 'sonner';

interface WarehouseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Warehouse[];
}

interface WarehouseParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

interface CreateWarehouseData {
  name: string;
  address?: string;
}

class WarehouseService {
  private basePath = '/warehouses';

  async getWarehouses(params: WarehouseParams = {}): Promise<WarehouseListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.page_size) searchParams.append('page_size', params.page_size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.ordering) searchParams.append('ordering', params.ordering);

    const url = `${this.basePath}/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<WarehouseListResponse>(url);
    return response.data;
  }

  async getWarehouse(id: number): Promise<Warehouse> {
    const response = await api.get<Warehouse>(`${this.basePath}/${id}/`);
    return response.data;
  }

  async createWarehouse(data: CreateWarehouseData): Promise<Warehouse> {
    const response = await api.post<Warehouse>(`${this.basePath}/`, data);
    return response.data;
  }

  async updateWarehouse(id: number, data: Partial<CreateWarehouseData>): Promise<Warehouse> {
    const response = await api.patch<Warehouse>(`${this.basePath}/${id}/`, data);
    return response.data;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await api.delete(`${this.basePath}/${id}/`);
  }
}

const warehouseService = new WarehouseService();

// Query keys
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (params: WarehouseParams) => [...warehouseKeys.lists(), params] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: number) => [...warehouseKeys.details(), id] as const,
};

// Hook pour récupérer la liste des entrepôts
export function useWarehouses(params: WarehouseParams = {}) {
  return useQuery({
    queryKey: warehouseKeys.list(params),
    queryFn: () => warehouseService.getWarehouses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook pour récupérer un entrepôt spécifique
export function useWarehouse(id: number) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour créer un entrepôt
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehouseData) => warehouseService.createWarehouse(data),
    onSuccess: (data) => {
      // Mettre à jour les listes
      queryClient.setQueriesData<WarehouseListResponse>(
        { queryKey: warehouseKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            count: old.count + 1,
            results: [data, ...old.results],
          };
        }
      );

      toast.success('Entrepôt créé avec succès');
    },
    onError: (err) => {
      toast.error('Erreur lors de la création de l\'entrepôt');
      console.error('Erreur création entrepôt:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

// Hook pour mettre à jour un entrepôt
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<CreateWarehouseData>) => 
      warehouseService.updateWarehouse(id, data),
    onSuccess: (data) => {
      // Mettre à jour le cache de l'entrepôt spécifique
      queryClient.setQueryData(warehouseKeys.detail(data.id), data);
      
      // Mettre à jour les listes qui pourraient contenir cet entrepôt
      queryClient.setQueriesData<WarehouseListResponse>(
        { queryKey: warehouseKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            results: old.results.map((warehouse) =>
              warehouse.id === data.id ? data : warehouse
            ),
          };
        }
      );

      toast.success('Entrepôt modifié avec succès');
    },
    onError: (err) => {
      toast.error('Erreur lors de la modification de l\'entrepôt');
      console.error('Erreur modification entrepôt:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

// Hook pour supprimer un entrepôt
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warehouseService.deleteWarehouse(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: warehouseKeys.lists() });

      const previousWarehouses = queryClient.getQueriesData({ queryKey: warehouseKeys.lists() });

      // Suppression optimiste
      queryClient.setQueriesData<WarehouseListResponse>(
        { queryKey: warehouseKeys.lists() },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            count: old.count - 1,
            results: old.results.filter((warehouse) => warehouse.id !== id),
          };
        }
      );

      return { previousWarehouses };
    },
    onError: (err, id, context) => {
      if (context?.previousWarehouses) {
        context.previousWarehouses.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Erreur lors de la suppression de l\'entrepôt');
      console.error('Erreur suppression entrepôt:', err);
    },
    onSuccess: () => {
      toast.success('Entrepôt supprimé avec succès');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}
