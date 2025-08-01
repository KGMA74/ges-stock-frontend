'use client';

import React, { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { Customer } from '@/lib/types';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuthStore } from '@/store/authStore';
import AddCustomerDialog from './AddCustomerDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const columnHelper = createColumnHelper<Customer>();

const CustomerTable: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(1);
  
  const { user } = useAuthStore();
  
  const { data: customersData, isLoading, error } = useCustomers({ 
    search: globalFilter || undefined, 
    page 
  });

  // Mémoriser les données pour éviter les re-rendus
  const memoizedData = useMemo(() => customersData?.results || [], [customersData?.results]);

  // Callback mémorisé pour éviter la recréation à chaque render
  const handleCustomerAdded = useMemo(() => () => {
    // Plus besoin de refetch, la mise à jour se fait automatiquement
    console.log('Client ajouté avec succès');
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nom du Client',
        cell: (info) => (
          <div className="font-medium">
            {info.getValue()}
          </div>
        ),
        filterFn: 'includesString',
      }),
      columnHelper.accessor('phone', {
        header: 'Téléphone',
        cell: (info) => {
          const phone = info.getValue();
          return phone ? (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-gray-400" />
              {phone}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
        filterFn: 'includesString',
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => {
          const email = info.getValue();
          return email ? (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-gray-400" />
              <a 
                href={`mailto:${email}`} 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {email}
              </a>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
        filterFn: 'includesString',
      }),
      columnHelper.accessor('address', {
        header: 'Adresse',
        cell: (info) => {
          const address = info.getValue();
          return address ? (
            <div className="flex items-start gap-2 text-sm max-w-xs">
              <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
              <span className="line-clamp-2">{address}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
        filterFn: 'includesString',
      }),
      columnHelper.accessor('is_active', {
        header: 'Statut',
        cell: (info) => (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            info.getValue() 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {info.getValue() ? 'Actif' : 'Inactif'}
          </span>
        ),
        filterFn: 'equals',
      }),
      columnHelper.accessor('created_at', {
        header: 'Créé le',
        cell: (info) => (
          <div className="text-sm text-gray-500">
            {new Date(info.getValue()).toLocaleDateString('fr-FR')}
          </div>
        ),
        filterFn: 'includesString',
      }),
    ],
    []
  );

  const table = useReactTable({
    data: memoizedData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Chargement des clients...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Clients ({customersData?.count || 0})
          </h1>
          <AddCustomerDialog onSuccess={handleCustomerAdded} />
        </div>
      </div>

      {/* Contrôles du tableau */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border">
        {/* Recherche globale */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Boutons de visibilité des colonnes */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Colonnes:</span>
            {table.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <Button
                  key={column.id}
                  variant="outline"
                  size="sm"
                  onClick={() => column.toggleVisibility()}
                  className={`h-8 ${column.getIsVisible() ? '' : 'opacity-50'}`}
                >
                  {column.getIsVisible() ? (
                    <Eye className="h-3 w-3 mr-1" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-1" />
                  )}
                  {typeof column.columnDef.header === 'string' 
                    ? column.columnDef.header 
                    : column.id}
                </Button>
              ))}
          </div>
        </div>

        {/* Filtres par colonne */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {table.getHeaderGroups()[0]?.headers
            .filter((header) => header.column.getCanFilter() && header.column.getIsVisible())
            .slice(0, 4) // Limiter à 4 filtres visibles
            .map((header) => (
              <div key={header.id} className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">
                  {typeof header.column.columnDef.header === 'string' 
                    ? header.column.columnDef.header 
                    : header.id}
                </label>
                <Input
                  placeholder={`Filtrer...`}
                  value={(header.column.getFilterValue() as string) ?? ''}
                  onChange={(e) => header.column.setFilterValue(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <div className="h-4 w-4 opacity-50">
                              <ChevronUp className="h-2 w-4" />
                              <ChevronDown className="h-2 w-4 -mt-1" />
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-500">
          Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} à{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            customersData?.count || 0
          )}{' '}
          sur {customersData?.count || 0} clients
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!customersData?.previous}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <span className="text-sm px-3 py-1 bg-gray-100 rounded">
            Page {page}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!customersData?.next}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Informations de débogage */}
      <details className="bg-gray-50 p-4 rounded-lg">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Informations de débogage
        </summary>
        <div className="mt-2 text-sm space-y-1 text-gray-600">
          <p><strong>Utilisateur:</strong> {user?.fullname || 'Non connecté'}</p>
          <p><strong>Store:</strong> {user?.store?.name || 'Aucun'}</p>
          <p><strong>Résultats visibles:</strong> {table.getRowModel().rows.length}</p>
          <p><strong>Total BD:</strong> {customersData?.count || 0}</p>
          <p><strong>Filtres actifs:</strong> {columnFilters.length + (globalFilter ? 1 : 0)}</p>
          <p><strong>Tri:</strong> {sorting.length > 0 ? JSON.stringify(sorting) : 'Aucun'}</p>
        </div>
      </details>
    </div>
  );
};

export default CustomerTable;
