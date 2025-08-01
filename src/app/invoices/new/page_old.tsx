'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { invoiceService } from '@/services/invoiceService';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';
import { CreateInvoiceData } from '@/types/invoice';
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

interface InvoiceItem {
  product: number;
  productName: string;
  quantity: number;
  unit_price: string;
  total: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customer: '',
    due_date: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    unit_price: '',
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

  // Extraire les tableaux des réponses paginées
  const customers = Array.isArray(customersResponse) 
    ? customersResponse 
    : (customersResponse?.results || []);
    
  const products = Array.isArray(productsResponse) 
    ? productsResponse 
    : (productsResponse?.results || []);

  // Mutation pour créer la facture
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceData) => invoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push('/invoices');
    },
  });

  const selectedProduct = products.find(p => p.id === parseInt(currentItem.product));

  const addItem = () => {
    if (!currentItem.product || !currentItem.quantity || !currentItem.unit_price) {
      return;
    }

    const product = products.find(p => p.id === parseInt(currentItem.product));
    if (!product) return;

    const newItem: InvoiceItem = {
      product: parseInt(currentItem.product),
      productName: product.name,
      quantity: currentItem.quantity,
      unit_price: currentItem.unit_price,
      total: currentItem.quantity * parseFloat(currentItem.unit_price),
    };

    setItems([...items, newItem]);
    setCurrentItem({
      product: '',
      quantity: 1,
      unit_price: '',
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateCurrentItemPrice = (productId: string) => {
    if (!productId) return;
    
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setCurrentItem({
        ...currentItem,
        product: productId,
        unit_price: product.sale_price || '',
      });
    } else {
      setCurrentItem({
        ...currentItem,
        product: productId,
        unit_price: '',
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * 0.18; // TVA 18%
  const total = subtotal + taxAmount;

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
          product: item.product.id,
          quantity: item.quantity,
          sale_price: item.sale_price
        }))
      };
      
      // Utiliser le service de stock exit au lieu du service de facture
      const response = await fetch('/api/stock-exits/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouvelle facture</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de la facture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Client *</Label>
                <Select 
                  value={formData.customer || ''} 
                  onValueChange={(value) => setFormData({...formData, customer: value || ''})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Date d'échéance</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value || ''})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes additionnelles..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value || ''})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ajout d'articles */}
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un article</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="product">Produit</Label>
                <Select 
                  value={currentItem.product || ''} 
                  onValueChange={updateCurrentItemPrice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {formatCurrency(parseFloat(product.sale_price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentItem.quantity.toString()}
                  onChange={(e) => setCurrentItem({
                    ...currentItem, 
                    quantity: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <div>
                <Label htmlFor="unit_price">Prix unitaire</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={currentItem.unit_price || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem, 
                    unit_price: e.target.value || ''
                  })}
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
              <CardTitle>Articles de la facture</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(item.unit_price))}</TableCell>
                      <TableCell>{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totaux */}
              <div className="mt-4 space-y-2 text-right">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA (18%):</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/invoices">Annuler</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={createInvoiceMutation.isPending || !formData.customer || items.length === 0}
          >
            {createInvoiceMutation.isPending ? 'Création...' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </div>
  );
}
