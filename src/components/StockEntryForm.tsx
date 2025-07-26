import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { X, Plus, Trash2, Package, Calendar, User, FileText } from 'lucide-react';
import { StockEntry, StockEntryItem, StockEntryForm as StockEntryFormType, Product } from '@/lib/types';
import { useStockEntryMutations } from '@/hooks/useStock';
import { useProducts } from '@/hooks/useProducts';
import Input from './Input';

interface StockEntryFormProps {
  entry?: StockEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  entry_date: string;
  supplier: string;
  reference_number: string;
  warehouse: string;
  notes: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

const StockEntryForm: React.FC<StockEntryFormProps> = ({
  entry,
  isOpen,
  onClose
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { createStockEntry, updateStockEntry } = useStockEntryMutations();
  const { data: productsData } = useProducts({ page: 1 });
  const products = productsData?.results || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    defaultValues: {
      entry_date: new Date().toISOString().split('T')[0],
      supplier: '',
      warehouse: '1',
      reference_number: '',
      notes: '',
      items: [{ product_id: 0, quantity: 1, unit_price: 0, total_price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');

  // Calculer le total automatiquement
  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const total = item.quantity * item.unit_price;
      if (item.total_price !== total) {
        setValue(`items.${index}.total_price`, total);
      }
    });
  }, [watchedItems, setValue]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (entry) {
      reset({
        entry_date: entry.created_at ? entry.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        supplier: entry.supplier?.toString() || '',
        reference_number: entry.entry_number || '',
        notes: entry.notes || '',
        warehouse: entry.warehouse?.toString() || '1',
        items: entry.items?.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.purchase_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        })) || [{ product_id: 0, quantity: 1, unit_price: 0, total_price: 0 }]
      });
    }
  }, [entry, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData: StockEntryFormType = {
        supplier: parseInt(data.supplier),
        warehouse: parseInt(data.warehouse),
        notes: data.notes,
        items: data.items
          .filter(item => item.product_id > 0)
          .map(item => ({
            product: item.product_id,
            quantity: item.quantity,
            purchase_price: item.unit_price.toString()
          }))
      };

      if (entry) {
        await updateStockEntry.mutateAsync({
          id: entry.id,
          data: formattedData
        });
      } else {
        await createStockEntry.mutateAsync(formattedData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const addItem = () => {
    append({ product_id: 0, quantity: 1, unit_price: 0, total_price: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getProductInfo = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const calculateGrandTotal = () => {
    return watchedItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {entry ? 'Modifier le Bon d\'Entrée' : 'Nouveau Bon d\'Entrée'}
              </h2>
              {entry && (
                <p className="text-sm text-gray-500">
                  {entry.entry_number}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date d'entrée *
                </label>
                <Input
                  type="date"
                  register={register('entry_date', { required: 'Date requise' })}
                  error={errors.entry_date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Fournisseur
                </label>
                <Input
                  type="text"
                  register={register('supplier')}
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrepôt
                </label>
                <Input
                  type="number"
                  register={register('warehouse', { required: 'Entrepôt requis' })}
                  error={errors.warehouse}
                  placeholder="ID de l'entrepôt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Numéro de référence
                </label>
                <Input
                  type="text"
                  register={register('reference_number')}
                  placeholder="Facture, bon de livraison..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>

            {/* Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Articles</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un article
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Produit */}
                      <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Produit *
                        </label>
                        <select
                          {...register(`items.${index}.product_id`, {
                            required: 'Produit requis',
                            valueAsNumber: true
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value={0}>Sélectionner un produit</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.unit}
                            </option>
                          ))}
                        </select>
                        {errors.items?.[index]?.product_id && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.product_id?.message}
                          </p>
                        )}
                      </div>

                      {/* Quantité */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité *
                        </label>
                        <Input
                          type="number"
                          register={register(`items.${index}.quantity`, {
                            required: 'Quantité requise',
                            min: { value: 0, message: 'Quantité invalide' },
                            valueAsNumber: true
                          })}
                          error={errors.items?.[index]?.quantity}
                        />
                      </div>

                      {/* Prix unitaire */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix unitaire
                        </label>
                        <Input
                          type="number"
                          register={register(`items.${index}.unit_price`, {
                            min: { value: 0, message: 'Prix invalide' },
                            valueAsNumber: true
                          })}
                          error={errors.items?.[index]?.unit_price}
                        />
                      </div>

                      {/* Total */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <Input
                          type="number"
                          register={register(`items.${index}.total_price`, {
                            valueAsNumber: true
                          })}
                          readOnly
                          className="bg-gray-100"
                        />
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={fields.length === 1}
                          className="w-full text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 py-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total général */}
              <div className="bg-primary-50 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total général:
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    {calculateGrandTotal().toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="stock-entry-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Enregistrement...' : (entry ? 'Modifier' : 'Créer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockEntryForm;
