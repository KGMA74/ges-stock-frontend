import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { Product, ProductForm, ProductStock, StockFilter } from "@/lib/types";
import { toast } from "sonner";

// Clés de requête
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: any) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  stock: () => [...productKeys.all, 'stock'] as const,
  stockFiltered: (filters: StockFilter) => [...productKeys.stock(), { filters }] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
};

// Hook pour récupérer les produits
export const useProducts = (params?: { 
  search?: string; 
  page?: number; 
  page_size?: number;
  ordering?: string;
  category?: string;
  supplier?: number;
}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
    staleTime: 5 * 60 * 1000, // 5 minutes - considère les données comme fraîches
    gcTime: 10 * 60 * 1000, // 10 minutes - garde en cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook pour récupérer un produit spécifique
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

// Hook pour créer un produit
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (newProduct) => {
      // Mise à jour optimiste du cache au lieu d'invalidation complète
      queryClient.setQueryData(
        productKeys.detail(newProduct.id),
        newProduct
      );
      
      // Mise à jour optimiste de la liste des produits
      const queryKeys = queryClient.getQueryCache().findAll({
        queryKey: productKeys.lists(),
      });
      
      queryKeys.forEach((query) => {
        const oldData = query.state.data as any;
        if (oldData?.results) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            results: [newProduct, ...oldData.results],
            count: (oldData.count || 0) + 1,
          });
        }
      });
      
      // Note: Pas de toast ici, il sera géré dans le composant
    },
    onError: (error: any) => {
      console.error("Erreur création produit:", error);
      // Note: Pas de toast ici, il sera géré dans le composant
    },
  });
};

// Hook pour mettre à jour un produit
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductForm> }) =>
      productService.updateProduct(id, data),
    onSuccess: (updatedProduct) => {
      // Mettre à jour le cache du produit spécifique
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct
      );
      
      // Invalider la liste des produits
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success("Produit mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la mise à jour du produit");
      console.error("Erreur mise à jour produit:", error);
    },
  });
};

// Hook pour supprimer un produit
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (_, deletedId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
      
      // Invalider la liste des produits
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      toast.success("Produit supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression du produit");
      console.error("Erreur suppression produit:", error);
    },
  });
};

// Hook pour récupérer le stock des produits
export const useProductStock = (filters?: StockFilter) => {
  return useQuery({
    queryKey: productKeys.stockFiltered(filters || {}),
    queryFn: () => productService.getProductStock(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (le stock change plus souvent)
  });
};

// Hook pour rechercher des produits (pour autocomplete)
export const useSearchProducts = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productService.searchProducts(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook pour les produits avec stock faible
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: productService.getLowStockProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
