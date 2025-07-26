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
export const useProducts = (params?: { search?: string; page?: number }) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // Invalider la liste des produits
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Ajouter le nouveau produit au cache
      queryClient.setQueryData(
        productKeys.detail(newProduct.id),
        newProduct
      );
      
      toast.success("Produit créé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création du produit");
      console.error("Erreur création produit:", error);
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
