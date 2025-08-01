'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Banknote, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountTable } from '@/components/accounts/AccountTable';
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog';
import { useAccounts } from '@/hooks/useAccounts';
import { Account } from '@/services/accountService';
import MainLayout from '@/components/MainLayout';

export default function AccountsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const router = useRouter();

  const { data: accountsData, isLoading, error } = useAccounts({
    page: 1,
    page_size: 20,
  });

  const accounts = accountsData?.results || [];
  const totalAccounts = accountsData?.count || 0;

  // Calculer les statistiques
  const bankAccounts = accounts.filter(account => account.account_type === 'bank');
  const cashAccounts = accounts.filter(account => account.account_type === 'cash');
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
  const activeAccounts = accounts.filter(account => account.is_active).length;

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setIsAddDialogOpen(true);
  };

  const handleView = (account: Account) => {
    // Rediriger vers la page des transactions avec le filtre compte
    router.push(`/transactions?account_id=${account.id}`);
  };

  const handleAddNew = () => {
    setSelectedAccount(null);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedAccount(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Erreur de chargement</h3>
          <p className="text-gray-600">Impossible de charger les comptes</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Comptes</h1>
          <p className="text-muted-foreground">
            Gérez vos comptes bancaires et de caisse
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Compte
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comptes</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAccounts}</div>
            <p className="text-xs text-gray-500">comptes au total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes Actifs</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAccounts}</div>
            <p className="text-xs text-gray-500">comptes actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes Banque</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{bankAccounts.length}</div>
            <p className="text-xs text-gray-500">comptes bancaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Total</CardTitle>
            <Banknote className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalBalance.toFixed(2)} F</div>
            <p className="text-xs text-gray-500">solde global</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Comptes</CardTitle>
          <CardDescription>
            Gérez vos comptes bancaires et de caisse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AccountTable
            onEdit={handleEdit}
            onView={handleView}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Account Dialog */}
      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        account={selectedAccount}
        onClose={handleCloseDialog}
      />
    </div></MainLayout>
  );
}
