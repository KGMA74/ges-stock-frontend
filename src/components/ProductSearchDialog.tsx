'use client';

import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  reference: string;
  description?: string;
  price: string;  // Prix d'achat
  sale_price: string;  // Prix de vente
}

interface ProductSearchDialogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  trigger?: React.ReactNode;
}

export default function ProductSearchDialog({ 
  products, 
  onSelectProduct, 
  trigger 
}: ProductSearchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setIsOpen(false);
    setSearchTerm('');
  };

  const defaultTrigger = (
    <Button type="button" variant="outline">
      <Search className="h-4 w-4 mr-2" />
      Rechercher un produit
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner un produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par référence ou nom..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value || '')}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredProducts.length} produit(s) trouvé(s)
            </div>
          </div>

          {/* Tableau des produits */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Prix d'achat</TableHead>
                  <TableHead className="text-right">Prix de vente</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <TableCell className="font-medium">
                        {product.reference}
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">
                        {product.description || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {formatCurrency(parseFloat(product.price))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(parseFloat(product.sale_price))}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Informations d'aide */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p><strong>Astuce :</strong> Vous pouvez rechercher par référence ou par nom de produit. Cliquez sur une ligne ou utilisez le bouton pour sélectionner.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
