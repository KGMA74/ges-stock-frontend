"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCreateStockExit } from '@/hooks/useStockExits';
import { useCustomers } from '@/hooks/useCustomers';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { useAccounts } from '@/hooks/useAccounts';
import { Account } from '@/lib/types';
import { Plus, Trash2, Package, User, Building2, ShoppingCart } from 'lucide-react';

const stockExitItemSchema = z.object({
  product: z.number().min(1, 'Veuillez sélectionner un produit'),
  quantity: z.number().min(0.01, 'La quantité doit être supérieure à 0'),
  sale_price: z.number().min(0, 'Le prix de vente doit être positif'),
});

const stockExitSchema = z.object({
  customer: z.number().min(1, 'Veuillez sélectionner un client'),
  warehouse: z.number().min(1, 'Veuillez sélectionner un entrepôt'),
  account: z.number().optional(),
  notes: z.string().optional(),
  items: z.array(stockExitItemSchema).min(1, 'Au moins un article est requis'),
});

type StockExitFormData = z.infer<typeof stockExitSchema>;

interface AddStockExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddStockExitDialog: React.FC<AddStockExitDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<StockExitFormData>({
    resolver: zodResolver(stockExitSchema),
    defaultValues: {
      customer: 0,
      warehouse: 0,
      account: undefined, // Changé pour undefined au lieu de 0
      notes: '',
      items: [{ product: 0, quantity: 1, sale_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const createStockExitMutation = useCreateStockExit();
  const { data: customersData } = useCustomers();
  const { data: warehousesData } = useWarehouses();
  const { data: productsData } = useProducts();
  const { data: accountsData } = useAccounts({ page: 1, page_size: 50 });

  const customers = customersData?.results || [];
  const warehouses = warehousesData?.results || [];
  const products = productsData?.results || [];
  const accounts = accountsData?.results || [];

  // Calculer le montant total
  useEffect(() => {
    const items = form.watch('items');
    const total = items.reduce((sum, item) => {
      return sum + (item.quantity * item.sale_price);
    }, 0);
    setTotalAmount(total);
  }, [form.watch('items')]);

  const onSubmit = async (data: StockExitFormData) => {
    try {
      await createStockExitMutation.mutateAsync(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la création du bon de sortie:', error);
    }
  };

  const addItem = () => {
    append({ product: 0, quantity: 1, sale_price: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit non trouvé';
  };

  const getProductPrice = (productId: number) => {
    const product = products.find(p => p.id === productId);
    // Pour l'instant, on retourne 0 car le prix n'est pas défini dans le modèle Product
    // Il faudrait récupérer le prix depuis une autre source (prix de vente du stock, etc.)
    return 0;
  };

  // Mettre à jour le prix automatiquement quand on sélectionne un produit
  const handleProductChange = (productId: number, index: number) => {
    const price = getProductPrice(productId);
    form.setValue(`items.${index}.sale_price`, price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-red-600" />
            Nouveau Bon de Sortie
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau bon de sortie pour enregistrer les sorties de stock
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Entrepôt
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un entrepôt" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Compte de destination
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte (optionnel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucun compte spécifique</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name} ({account.account_type === 'bank' ? 'Banque' : 'Caisse'}) - {account.balance}F
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Articles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Articles à sortir
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un article
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.product`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produit</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const productId = parseInt(value);
                                field.onChange(productId);
                                handleProductChange(productId, index);
                              }}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.sale_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix de vente (F)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-col justify-center">
                        <span className="text-sm font-medium mb-2">Total</span>
                        <Badge variant="secondary" className="text-center">
                          {(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.sale_price`)).toFixed(2)} F
                        </Badge>
                      </div>
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Montant total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <span className="text-sm text-gray-500">Montant total</span>
                  <div className="text-2xl font-bold text-red-600">
                    {totalAmount.toFixed(2)} F
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajoutez des notes ou commentaires..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createStockExitMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createStockExitMutation.isPending ? 'Création...' : 'Créer le bon de sortie'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
