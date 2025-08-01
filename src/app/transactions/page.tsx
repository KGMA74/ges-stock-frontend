'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CalendarIcon,
  FilterIcon,
  RefreshCwIcon,
  CreditCardIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/services/api';

interface FinancialTransaction {
  id: number;
  transaction_number: string;
  transaction_type: string;
  transaction_type_display: string;
  amount: string;
  description: string;
  from_account_name?: string;
  to_account_name?: string;
  stock_entry_number?: string;
  stock_exit_number?: string;
  created_by_name: string;
  created_at: string;
}

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: string;
  is_active: boolean;
}

interface TransactionStats {
  total_transactions: number;
  total_sales: number;
  total_purchases: number;
  total_transfers_in: number;
  total_transfers_out: number;
  net_balance: number;
  sales_count: number;
  purchases_count: number;
  transfers_in_count: number;
  transfers_out_count: number;
}

const transactionTypeColors = {
  sale: 'bg-green-100 text-green-800',
  purchase: 'bg-red-100 text-red-800',
  transfer_in: 'bg-blue-100 text-blue-800',
  transfer_out: 'bg-orange-100 text-orange-800',
  deposit: 'bg-emerald-100 text-emerald-800',
  withdrawal: 'bg-rose-100 text-rose-800',
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return <TrendingUpIcon className="h-4 w-4" />;
    case 'purchase':
      return <TrendingDownIcon className="h-4 w-4" />;
    case 'transfer_in':
      return <ArrowDownIcon className="h-4 w-4" />;
    case 'transfer_out':
      return <ArrowUpIcon className="h-4 w-4" />;
    default:
      return <CreditCardIcon className="h-4 w-4" />;
  }
};

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Récupérer le paramètre account_id depuis l'URL
  const accountIdFromUrl = searchParams.get('account_id');
  
  const [filters, setFilters] = useState({
    account_id: accountIdFromUrl || 'all',
    transaction_type: 'all',
    date_from: '',
    date_to: '',
    search: '',
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Mettre à jour le filtre si l'URL change
  useEffect(() => {
    if (accountIdFromUrl) {
      setFilters(prev => ({ ...prev, account_id: accountIdFromUrl }));
    }
  }, [accountIdFromUrl]);

  const columnHelper = createColumnHelper<FinancialTransaction>();

  const columns = useMemo(() => [
    columnHelper.accessor('transaction_number', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            N° Transaction
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: (info) => (
        <div className="font-medium">
          {info.getValue()}
        </div>
      ),
    }),

    columnHelper.accessor('transaction_type', {
      header: 'Type',
      cell: (info) => {
        const type = info.getValue();
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {getTransactionIcon(type)}
            <Badge className={transactionTypeColors[type as keyof typeof transactionTypeColors] || 'bg-gray-100 text-gray-800'}>
              {row.transaction_type_display}
            </Badge>
          </div>
        );
      },
    }),

    columnHelper.accessor('amount', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Montant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: (info) => (
        <div className="text-right font-semibold">
          {formatAmount(info.getValue())}
        </div>
      ),
    }),

    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => (
        <div className="max-w-xs truncate">
          {info.getValue()}
        </div>
      ),
    }),

    columnHelper.display({
      id: 'accounts',
      header: 'Comptes',
      cell: (info) => {
        const transaction = info.row.original;
        return (
          <div className="text-sm">
            {transaction.from_account_name && (
              <div>De: <span className="font-medium">{transaction.from_account_name}</span></div>
            )}
            {transaction.to_account_name && (
              <div>Vers: <span className="font-medium">{transaction.to_account_name}</span></div>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: 'stock_operations',
      header: 'Opération Stock',
      cell: (info) => {
        const transaction = info.row.original;
        return (
          <div className="text-sm">
            {transaction.stock_entry_number && (
              <div className="text-green-600">Entrée: {transaction.stock_entry_number}</div>
            )}
            {transaction.stock_exit_number && (
              <div className="text-blue-600">Sortie: {transaction.stock_exit_number}</div>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor('created_at', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 h-auto font-medium"
          >
            Date & Heure
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: (info) => (
        <div className="text-sm">
          <div>{format(new Date(info.getValue()), 'dd/MM/yyyy', { locale: fr })}</div>
          <div className="text-muted-foreground">
            {format(new Date(info.getValue()), 'HH:mm', { locale: fr })}
          </div>
        </div>
      ),
    }),

    columnHelper.accessor('created_by_name', {
      header: 'Créé par',
      cell: (info) => (
        <div className="text-sm font-medium">
          {info.getValue()}
        </div>
      ),
    }),
  ], [columnHelper]);

  // Récupération des comptes
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get('/accounts/');
      return data.results || data;
    },
  });

  // Récupération des transactions avec filtres
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page_size: '1000', // Récupérer plus de données pour le tableau
      });
      
      // Ajouter les filtres seulement s'ils ne sont pas 'all' ou vides
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 'all') {
          params.append(key, value);
        }
      });
      
      const { data } = await api.get(`/financial-transactions/?${params}`);
      return data.results || [];
    },
  });

  const table = useReactTable({
    data: transactionsData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Récupération des statistiques
  const { data: stats } = useQuery<TransactionStats>({
    queryKey: ['transaction-stats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Ajouter les filtres seulement s'ils ne sont pas 'all' ou vides
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 'all') {
          params.append(key, value);
        }
      });
      
      const { data } = await api.get(`/financial-transactions/stats/?${params}`);
      return data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      account_id: 'all',
      transaction_type: 'all',
      date_from: '',
      date_to: '',
      search: '',
    });
    setGlobalFilter('');
    table.resetColumnFilters();
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(parseFloat(amount));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions Financières</h1>
          <p className="text-muted-foreground">
            Historique complet des mouvements financiers
          </p>
          {/* Indicateur de filtre actif par compte */}
          {accountIdFromUrl && accounts && (
            <div className="mt-2">
              {(() => {
                const selectedAccount = accounts.find((acc: Account) => acc.id.toString() === accountIdFromUrl);
                return selectedAccount ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                    <CreditCardIcon className="h-4 w-4" />
                    Filtré par compte: <strong>{selectedAccount.name}</strong>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Bouton retour vers les comptes si on vient de là */}
          {accountIdFromUrl && (
            <Button
              onClick={() => router.push('/accounts')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux comptes
            </Button>
          )}
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_transactions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventes</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(stats.total_sales.toString())}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.sales_count} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achats</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(stats.total_purchases.toString())}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.purchases_count} transactions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solde Net</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.net_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(stats.net_balance.toString())}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="account">Compte</Label>
              <Select
                value={filters.account_id}
                onValueChange={(value) => handleFilterChange('account_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les comptes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les comptes</SelectItem>
                  {accounts?.map((account: Account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name} ({account.account_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de transaction</Label>
              <Select
                value={filters.transaction_type}
                onValueChange={(value) => handleFilterChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="sale">Vente</SelectItem>
                  <SelectItem value="purchase">Achat</SelectItem>
                  <SelectItem value="transfer_in">Transfert entrant</SelectItem>
                  <SelectItem value="transfer_out">Transfert sortant</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from">Date de début</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_to">Date de fin</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Recherche globale</Label>
              <Input
                placeholder="Rechercher dans toutes les colonnes..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} transaction(s) trouvée(s)
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              size="sm"
            >
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
          <CardDescription>
            Tableau interactif avec tri et pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tableau */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-left">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Aucune transaction trouvée.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} sur{" "}
                  {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Lignes par page</p>
                    <Select
                      value={`${table.getState().pagination.pageSize}`}
                      onValueChange={(value) => {
                        table.setPageSize(Number(value));
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} sur{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Aller à la première page</span>
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <span className="sr-only">Aller à la page précédente</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Aller à la page suivante</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <span className="sr-only">Aller à la dernière page</span>
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
