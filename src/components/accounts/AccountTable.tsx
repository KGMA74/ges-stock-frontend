'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, Building2, Wallet, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { Account } from '@/services/accountService';
import { formatCurrency } from '@/lib/utils';

interface AccountTableProps {
  onEdit: (account: Account) => void;
  onView: (account: Account) => void;
}

export function AccountTable({ onEdit, onView }: AccountTableProps) {
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  const { data: accountsData, isLoading, error } = useAccounts({
    page: 1,
    page_size: 20,
  });

  const deleteAccountMutation = useDeleteAccount();

  const accounts = accountsData?.results || [];

  const handleDelete = async () => {
    if (deleteAccountId) {
      try {
        await deleteAccountMutation.mutateAsync(deleteAccountId);
        setDeleteAccountId(null);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'cash':
        return <Wallet className="h-4 w-4 text-green-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'Banque';
      case 'cash':
        return 'Caisse';
      default:
        return 'Autre';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Erreur</h3>
          <p className="text-gray-600">Impossible de charger les comptes</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucun compte</h3>
          <p className="text-gray-600">Commencez par créer votre premier compte</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Nom du Compte</TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Solde</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de Création</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getAccountTypeIcon(account.account_type)}
                    <span className="font-medium">
                      {getAccountTypeLabel(account.account_type)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell className="text-gray-600">
                  {account.account_number || '-'}
                </TableCell>
                <TableCell>
                  <span 
                    className={`font-medium ${
                      parseFloat(account.balance) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(parseFloat(account.balance))}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={account.is_active ? 'default' : 'secondary'}
                    className={account.is_active ? 'bg-green-100 text-green-800' : ''}
                  >
                    {account.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {new Date(account.created_at).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onView(account)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(account)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteAccountId(account.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteAccountId !== null} 
        onOpenChange={(open) => !open && setDeleteAccountId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible
              et supprimera également toutes les transactions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
