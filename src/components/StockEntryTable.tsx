"use client";

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStockEntries, useDeleteStockEntry } from '@/hooks/useStockEntries';
import { StockEntry } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Package,
  Building2,
  User,
  Calendar,
  Banknote,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const columnHelper = createColumnHelper<StockEntry>();

interface StockEntryTableProps {
  onEdit?: (stockEntry: StockEntry) => void;
  onView?: (stockEntry: StockEntry) => void;
}

export const StockEntryTable: React.FC<StockEntryTableProps> = ({
  onEdit,
  onView,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: stockEntriesData, isLoading, error } = useStockEntries({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
  });

  const deleteStockEntryMutation = useDeleteStockEntry();

  const stockEntries = useMemo(() => {
    return stockEntriesData?.results || [];
  }, [stockEntriesData]);

  const totalCount = stockEntriesData?.count || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const columns = useMemo(
    () => [
      columnHelper.accessor('entry_number', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:bg-transparent p-0"
          >
            <Package className="h-4 w-4" />
            N° Bon d'entrée
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <div className="font-mono font-medium text-blue-600">
            {getValue()}
          </div>
        ),
      }),

      columnHelper.accessor('supplier_name', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:bg-transparent p-0"
          >
            <User className="h-4 w-4" />
            Fournisseur
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{getValue()}</span>
          </div>
        ),
      }),

      columnHelper.accessor('warehouse_name', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:bg-transparent p-0"
          >
            <Building2 className="h-4 w-4" />
            Entrepôt
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <Badge variant="outline" className="font-normal">
            {getValue()}
          </Badge>
        ),
      }),

      columnHelper.accessor('total_amount', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:bg-transparent p-0"
          >
            <Banknote className="h-4 w-4" />
            Montant Total
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <div className="font-semibold text-green-600">
            {parseFloat(getValue()).toFixed(2)} F
          </div>
        ),
      }),

      columnHelper.accessor('created_by_name', {
        header: 'Créé par',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-sm">{getValue()}</span>
          </div>
        ),
      }),

      columnHelper.accessor('created_at', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-2 hover:bg-transparent p-0"
          >
            <Calendar className="h-4 w-4" />
            Date de création
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return (
            <div className="text-sm">
              <div>{format(date, 'dd MMM yyyy', { locale: fr })}</div>
              <div className="text-gray-500">{format(date, 'HH:mm')}</div>
            </div>
          );
        },
      }),

      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const stockEntry = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onView?.(stockEntry)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit?.(stockEntry)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteStockEntryMutation.mutate(stockEntry.id)}
                  className="flex items-center gap-2 text-red-600"
                  disabled={deleteStockEntryMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [onEdit, onView, deleteStockEntryMutation]
  );

  const table = useReactTable({
    data: stockEntries,
    columns,
    pageCount,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="border rounded-md">
          <div className="h-12 bg-gray-100 border-b" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b bg-gray-50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des bons d'entrée</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des bons d'entrée..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {totalCount} bon{totalCount > 1 ? 's' : ''} d'entrée au total
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3">
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
                  className="hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun bon d'entrée trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Affichage de {pagination.pageIndex * pagination.pageSize + 1} à{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)} sur {totalCount} résultats
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">Page</span>
            <strong className="text-sm">
              {pagination.pageIndex + 1} sur {pageCount || 1}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
