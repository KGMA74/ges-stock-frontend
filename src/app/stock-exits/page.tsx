"use client";

import React, { useState } from 'react';
import  MainLayout  from '@/components/MainLayout';
import { StockExitTable } from '@/components/StockExitTable';
import { AddStockExitDialog } from '@/components/AddStockExitDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStockExits } from '@/hooks/useStockExits';
import { StockExit } from '@/services/stockExitService';
import { Plus, ShoppingCart, TrendingDown, Calendar, Banknote } from 'lucide-react';

export default function StockExitsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStockExit, setSelectedStockExit] = useState<StockExit | null>(null);

  // Récupérer les statistiques des bons de sortie
  const { data: stockExitsData } = useStockExits({ page_size: 1 });
  const totalExits = stockExitsData?.count || 0;

  const handleEdit = (stockExit: StockExit) => {
    setSelectedStockExit(stockExit);
    // TODO: Ouvrir un dialog d'édition
    console.log('Éditer le bon de sortie:', stockExit);
  };

  const handleView = (stockExit: StockExit) => {
    // TODO: Ouvrir un dialog de visualisation détaillée
    console.log('Voir les détails du bon de sortie:', stockExit);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-red-600" />
              Bons de Sortie
            </h1>
            <p className="text-gray-500 mt-1">
              Gérez les sorties de stock de votre entreprise
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            Nouveau Bon de Sortie
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total des Bons</CardTitle>
              <ShoppingCart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalExits}</div>
              <p className="text-xs text-gray-500">bons de sortie créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
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
              <p className="text-xs text-gray-500">valeur des sorties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance</CardTitle>
              <TrendingDown className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">+0%</div>
              <p className="text-xs text-gray-500">vs mois dernier</p>
            </CardContent>
          </Card>
        </div>

        {/* Table des bons de sortie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Liste des Bons de Sortie
            </CardTitle>
            <CardDescription>
              Consultez et gérez tous vos bons de sortie de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockExitTable
              onEdit={handleEdit}
              onView={handleView}
            />
          </CardContent>
        </Card>

        {/* Dialog d'ajout */}
        <AddStockExitDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    </MainLayout>
  );
}
