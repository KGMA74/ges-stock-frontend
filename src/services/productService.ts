import api from "./api";
import { 
  Product, 
  ProductForm, 
  ProductStock, 
  PaginatedResponse,
  StockFilter 
} from "@/lib/types";

export const productService = {
  // Récupérer tous les produits
  getProducts: async (params?: { search?: string; page?: number }): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get("products/", { params });
    return data;
  },

  // Récupérer un produit par ID
  getProduct: async (id: number): Promise<Product> => {
    const { data } = await api.get(`products/${id}/`);
    return data;
  },

  // Créer un nouveau produit
  createProduct: async (productData: ProductForm): Promise<Product> => {
    const { data } = await api.post("products/", productData);
    return data;
  },

  // Mettre à jour un produit
  updateProduct: async (id: number, productData: Partial<ProductForm>): Promise<Product> => {
    const { data } = await api.patch(`products/${id}/`, productData);
    return data;
  },

  // Supprimer un produit
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`products/${id}/`);
  },

  // Récupérer le stock des produits
  getProductStock: async (filters?: StockFilter): Promise<ProductStock[]> => {
    const { data } = await api.get("product-stocks/", { params: filters });
    return data.results || data;
  },

  // Récupérer le stock d'un produit spécifique
  getProductStockByProduct: async (productId: number): Promise<ProductStock[]> => {
    const { data } = await api.get(`products/${productId}/stock/`);
    return data;
  },

  // Rechercher des produits (pour autocomplete)
  searchProducts: async (query: string): Promise<Product[]> => {
    const { data } = await api.get("products/search/", { 
      params: { search: query, limit: 20 } 
    });
    return data.results || data;
  },

  // Produits avec stock faible
  getLowStockProducts: async (): Promise<Product[]> => {
    const { data } = await api.get("products/low-stock/");
    return data.results || data;
  }
};
