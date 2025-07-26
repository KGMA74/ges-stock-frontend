'use client';

import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import AddProductDialog from './AddProductDialog';

const SimpleProductList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  
  // Test avec paramètres simples
  const { data: productsData, isLoading, error, refetch } = useProducts({ 
    search: search || undefined, 
    page 
  });

  const handleProductAdded = () => {
    // Rafraîchir la liste des produits après ajout
    refetch();
  };

  console.log('Produits - État:', { productsData, isLoading, error, user });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur lors du chargement</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-red-700">Détails techniques</summary>
            <pre className="text-xs mt-2 bg-red-100 p-2 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const products = productsData?.results || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Produits ({productsData?.count || 0})
          </h1>
          <AddProductDialog onSuccess={handleProductAdded} />
        </div>
        
        {/* Barre de recherche simple */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Informations de debug */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm space-y-2">
        <p><strong>Utilisateur:</strong> {user?.fullname || 'Non connecté'}</p>
        <p><strong>Store:</strong> {user?.store?.name || 'Aucun'}</p>
        <p><strong>Résultats:</strong> {products.length}</p>
        <p><strong>Total:</strong> {productsData?.count || 0}</p>
        <p><strong>Page:</strong> {page}</p>
        <p><strong>Recherche:</strong> {search || 'Aucune'}</p>
        <p><strong>Pagination:</strong> {productsData?.next ? 'Page suivante disponible' : 'Dernière page'}</p>
        <p><strong>URL API:</strong> http://localhost:8000/api/products/</p>
      </div>

      {/* Liste simple des produits */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucun produit trouvé</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">Référence: {product.reference}</p>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Stock: {product.total_stock || 0} {product.unit}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination simple */}
      {productsData && productsData.count > 20 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!productsData.previous}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          
          <span className="px-4 py-2">
            Page {page}
          </span>
          
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!productsData.next}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleProductList;
