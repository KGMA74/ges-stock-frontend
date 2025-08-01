'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';
import { warehouseService } from '@/services/warehouseService';
import { accountService } from '@/services/accountService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import ProductSearchDialog from '@/components/ProductSearchDialog';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Product {
  id: number;
  name: string;
  reference: string;
  description?: string;
  price: string;  // Prix d'achat
  sale_price: string;  // Prix de vente
}

interface Warehouse {
  id: number;
  name: string;
  address?: string;
}

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: string;
}

interface StockExitItem {
  product: number;
  productName: string;
  quantity: number;
  sale_price: string;
  total: number;
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customer: '',
    customer_name: '',
    warehouse: '',
    account: '',
    notes: '',
  });

  const [items, setItems] = useState<StockExitItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    sale_price: '',
  });

  // Récupération des données
  const { data: customersResponse } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  });

  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  const { data: warehousesResponse } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseService.getWarehouses(),
  });

  const { data: accountsResponse } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountService.getAccounts(),
  });

  // Extraire les tableaux des réponses paginées avec valeurs par défaut
  const customers = Array.isArray(customersResponse) 
    ? customersResponse 
    : (customersResponse?.results || []);
    
  const products = Array.isArray(productsResponse) 
    ? productsResponse 
    : (productsResponse?.results || []);

  console.log('État des produits:', {
    productsResponse,
    products,
    productsLength: products.length
  });

  const warehouses = Array.isArray(warehousesResponse) 
    ? warehousesResponse 
    : (warehousesResponse?.results || []);

  const accounts = Array.isArray(accountsResponse) 
    ? accountsResponse 
    : (accountsResponse?.results || []);

  const selectedProduct = products.find(p => p.id === parseInt(currentItem.product));
  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer));

  const addItem = () => {
    console.log('Tentative d\'ajout d\'item:', currentItem);
    
    if (!currentItem.product || !currentItem.quantity || !currentItem.sale_price) {
      console.log('Validation échouée:', {
        product: currentItem.product,
        quantity: currentItem.quantity,
        sale_price: currentItem.sale_price
      });
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const product = products.find(p => p.id === parseInt(currentItem.product));
    if (!product) {
      console.log('Produit non trouvé:', currentItem.product);
      alert('Produit non trouvé');
      return;
    }

    const newItem: StockExitItem = {
      product: parseInt(currentItem.product),
      productName: product.name,
      quantity: currentItem.quantity,
      sale_price: currentItem.sale_price,
      total: currentItem.quantity * parseFloat(currentItem.sale_price),
    };

    console.log('Nouvel item créé:', newItem);
    console.log('Items actuels:', items);
    
    setItems([...items, newItem]);
    setCurrentItem({
      product: '',
      quantity: 1,
      sale_price: '',
    });
    
    console.log('Item ajouté avec succès');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateCurrentItemPrice = (productId: string) => {
    console.log('Sélection du produit:', productId);
    
    if (!productId) return;
    
    const product = products.find(p => p.id === parseInt(productId));
    console.log('Produit trouvé:', product);
    
    if (product && product.sale_price) {
      const newCurrentItem = {
        ...currentItem,
        product: productId,
        sale_price: product.sale_price,
      };
      console.log('Mise à jour de currentItem:', newCurrentItem);
      setCurrentItem(newCurrentItem);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('Produit sélectionné via dialog:', product);
    setCurrentItem({
      ...currentItem,
      product: product.id.toString(),
      sale_price: product.sale_price,
    });
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Veuillez sélectionner un client');
      return;
    }
    
    if (items.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }
    
    if (!formData.warehouse) {
      alert('Veuillez sélectionner un entrepôt');
      return;
    }
    
    try {
      // Créer un stock exit qui générera automatiquement une facture
      const stockExitData = {
        customer: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        warehouse: parseInt(formData.warehouse),
        account: formData.account ? parseInt(formData.account) : null,
        notes: formData.notes || '',
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          sale_price: item.sale_price
        }))
      };
      
      // Utiliser l'API directement pour créer un stock exit
      const response = await fetch('http://localhost:8000/api/stock-exits/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajouter les headers d'authentification si nécessaire
        },
        credentials: 'include', // Pour inclure les cookies d'authentification
        body: JSON.stringify(stockExitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
      
      alert('Facture créée avec succès !');
      router.push('/invoices');
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      alert('Erreur lors de la création de la facture');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Nouvelle Facture</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sélection du client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Client *</Label>
                <Select
                  value={formData.customer || ''}
                  onValueChange={(value) => setFormData({ ...formData, customer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sélection de l'entrepôt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entrepôt *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.warehouse || ''}
                onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Sélection du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compte de réception</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.account || ''}
                onValueChange={(value) => setFormData({ ...formData, account: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compte (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-gray-500">
                          Solde: {formatCurrency(parseFloat(account.balance))}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Ajout d'articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ajouter un article</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="product">Produit sélectionné</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    {currentItem.product ? (
                      <div className="p-2 border rounded-lg bg-gray-50">
                        <div className="font-medium">
                          {products.find(p => p.id === parseInt(currentItem.product))?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Réf: {products.find(p => p.id === parseInt(currentItem.product))?.reference}
                        </div>
                        <div className="text-xs text-gray-400 flex gap-3">
                          <span>Prix achat: {formatCurrency(parseFloat(products.find(p => p.id === parseInt(currentItem.product))?.price || '0'))}</span>
                          <span>Prix vente: {formatCurrency(parseFloat(products.find(p => p.id === parseInt(currentItem.product))?.sale_price || '0'))}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 border rounded-lg border-dashed text-gray-500 text-center">
                        Aucun produit sélectionné
                      </div>
                    )}
                  </div>
                  <ProductSearchDialog
                    products={products}
                    onSelectProduct={handleProductSelect}
                  />
                  {currentItem.product && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentItem({ ...currentItem, product: '', sale_price: '' })}
                      className="px-2"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity?.toString() || '1'}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="sale_price">Prix de vente</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.sale_price || ''}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      sale_price: e.target.value,
                    })
                  }
                />
              </div>

              <Button type="button" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des articles */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles de la facture</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(item.sale_price))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold text-right">
                      Total:
                    </TableCell>
                    <TableCell className="font-bold text-right">
                      {formatCurrency(totalAmount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Notes additionnelles..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Link href="/invoices">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={items.length === 0}>
            Créer la facture
          </Button>
        </div>
      </form>
    </div>
  );
}
