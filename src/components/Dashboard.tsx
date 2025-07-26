import React from 'react';
import { useStockStats } from '@/hooks/useStock';
import { useLowStockProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Users,
  ShoppingCart,
  Warehouse
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: stockStats, isLoading: statsLoading } = useStockStats();
  const { data: lowStockProducts, isLoading: lowStockLoading } = useLowStockProducts();

  // Données mockées pour la démo (remplacer par de vraies données de votre API)
  const mockStats = {
    totalProducts: 156,
    totalStock: 2847,
    lowStockCount: 12,
    totalValue: 45850.75,
    monthlyEntries: 28,
    monthlyExits: 45,
    topProducts: [
      { name: 'Riz Basmati 5kg', sales: 120 },
      { name: 'Huile d\'Olive 1L', sales: 98 },
      { name: 'Pâtes Italiennes 500g', sales: 87 }
    ]
  };

  return (
    <div className="space-y-6 h-full w-full">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenue {user?.fullname} - {user?.store.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Dernière mise à jour</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total des produits */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : mockStats.totalProducts}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </div>

        {/* Stock total */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : mockStats.totalStock.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Warehouse className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">-3%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </div>

        {/* Produits en rupture */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-red-600">
                {lowStockLoading ? '...' : (lowStockProducts?.length || mockStats.lowStockCount)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">Attention requise</span>
          </div>
        </div>

        {/* Valeur du stock */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : `${mockStats.totalValue.toLocaleString()} €`}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">ce mois</span>
          </div>
        </div>
      </div>

      {/* Activité récente et Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Entrée de stock - BON ENT-001-00003
                  </p>
                  <p className="text-sm text-gray-500">
                    50 unités de Riz Basmati ajoutées
                  </p>
                  <p className="text-xs text-gray-400">Il y a 2 heures</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Vente - BON SOR-001-00015
                  </p>
                  <p className="text-sm text-gray-500">
                    Commande Restaurant Le Bon Goût
                  </p>
                  <p className="text-xs text-gray-400">Il y a 4 heures</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Nouveau client ajouté
                  </p>
                  <p className="text-sm text-gray-500">
                    Épicerie du Quartier
                  </p>
                  <p className="text-xs text-gray-400">Hier</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes et Produits populaires */}
        <div className="space-y-6">
          {/* Alertes Stock */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Alertes Stock
              </h3>
            </div>
            <div className="p-6">
              {lowStockLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(lowStockProducts?.slice(0, 3) || []).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {product.total_stock || 0} (Min: {product.min_stock_alert})
                        </p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Critique
                      </span>
                    </div>
                  ))}
                  
                  {(!lowStockProducts || lowStockProducts.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        ✅ Aucune alerte stock
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Produits populaires */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Produits Populaires
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {mockStats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.sales} ventes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
