"use client";

import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, TrendingUp, TrendingDown, FileText, ShoppingCart } from 'lucide-react';
import { useAccountTransactions } from '@/hooks/useAccounts';
import { Account, AccountTransaction } from '@/services/accountService';

interface AccountTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export const AccountTransactionsDialog: React.FC<AccountTransactionsDialogProps> = ({
  open,
  onOpenChange,
  account,
}) => {
  const { data: transactionsData, isLoading, error } = useAccountTransactions(
    account?.id || 0,
    { page: 1, page_size: 50 }
  );

  const transactions = transactionsData?.results || [];

  const getTransactionIcon = (transaction: AccountTransaction) => {
    if (transaction.stock_exit_number) return ShoppingCart;
    if (transaction.stock_entry_number) return FileText;
    return transaction.movement_type === 'credit' ? TrendingUp : TrendingDown;
  };

  const getMovementBadge = (transaction: AccountTransaction) => {
    if (transaction.movement_type === 'credit') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{transaction.amount} F
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          <TrendingDown className="h-3 w-3 mr-1" />
          -{transaction.amount} F
        </Badge>
      );
    }
  };

  const getSourceLink = (transaction: AccountTransaction) => {
    if (transaction.stock_exit_number) {
      return (
        <span className="text-sm text-blue-600 font-mono">
          📤 {transaction.stock_exit_number}
        </span>
      );
    }
    if (transaction.stock_entry_number) {
      return (
        <span className="text-sm text-purple-600 font-mono">
          📥 {transaction.stock_entry_number}
        </span>
      );
    }
    return null;
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💳 Historique des transactions - {account.name}
            <Badge variant="outline" className="ml-2">
              Solde: {account.balance} F
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Chargement des transactions...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Erreur lors du chargement des transactions
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune transaction trouvée pour ce compte
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>N° Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mouvement</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Créé par</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const IconComponent = getTransactionIcon(transaction);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.transaction_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="text-sm">{transaction.transaction_type_display}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getMovementBadge(transaction)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSourceLink(transaction)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.created_by_name}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {transactionsData && transactionsData.count > 0 && (
          <div className="text-sm text-gray-500 text-center mt-4">
            {transactions.length} transaction(s) sur {transactionsData.count} au total
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
