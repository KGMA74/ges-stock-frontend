"use client";

import React, { useState } from 'react';
import  MainLayout  from '@/components/MainLayout';
import { StockEntryTable } from '@/components/StockEntryTable';
import { AddStockEntryDialog } from '@/components/AddStockEntryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStockEntries } from '@/hooks/useStockEntries';
import { StockEntry } from '@/lib/types';
import { Plus, Package, TrendingUp, Calendar, Banknote } from 'lucide-react';

export default function StockEntriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStockEntry, setSelectedStockEntry] = useState<StockEntry | null>(null);

  // Récupérer les statistiques des bons d'entrée
  const { data: stockEntriesData } = useStockEntries({ page_size: 1 });
  const totalEntries = stockEntriesData?.count || 0;

  const handleEdit = (stockEntry: StockEntry) => {
    setSelectedStockEntry(stockEntry);
    // TODO: Ouvrir un dialog d'édition
    console.log('Éditer le bon d\'entrée:', stockEntry);
  };

  const handleView = (stockEntry: StockEntry) => {
    // TODO: Ouvrir un dialog de visualisation détaillée
    console.log('Voir les détails du bon d\'entrée:', stockEntry);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Bons d'Entrée
            </h1>
            <p className="text-gray-500 mt-1">
              Gérez les entrées de stock de votre entreprise
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Bon d'Entrée
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des Bons</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalEntries}</div>
              <p className="text-xs text-gray-500">bons d'entrée créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-xs text-gray-500">nouveaux bons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
              <Banknote className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0,00 F</div>
              <p className="text-xs text-gray-500">valeur des entrées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">+0%</div>
              <p className="text-xs text-gray-500">vs mois dernier</p>
            </CardContent>
          </Card>
        </div>

        {/* Table des bons d'entrée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Liste des Bons d'Entrée
            </CardTitle>
            <CardDescription>
              Consultez et gérez tous vos bons d'entrée de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockEntryTable
              onEdit={handleEdit}
              onView={handleView}
            />
          </CardContent>
        </Card>

        {/* Dialog d'ajout */}
        <AddStockEntryDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
