import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, ShoppingCart, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { StockExit, Product } from '@/lib/types';
import { useStockExitMutations } from '@/hooks/useStock';
import { useProducts } from '@/hooks/useProducts';
import Input from './Input';

interface StockExitFormProps {
  exit?: StockExit | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  exit_date: string;
  exit_type: 'sale' | 'transfer' | 'loss' | 'adjustment' | 'other';
  customer_name: string;
  destination: string;
  reference_number: string;
  notes: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    available_stock?: number;
  }[];
}

const StockExitForm: React.FC<StockExitFormProps> = ({
  exit,
  isOpen,
  onClose
}) => {
  const { createStockExit, updateStockExit } = useStockExitMutations();
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
      exit_date: new Date().toISOString().split('T')[0],
      exit_type: 'sale',
      customer_name: '',
      destination: '',
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
  const watchedExitType = watch('exit_type');

  // Calculer le total automatiquement
  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const total = item.quantity * item.unit_price;
      if (item.total_price !== total) {
        setValue(`items.${index}.total_price`, total);
      }
    });
  }, [watchedItems, setValue]);

  // Mettre à jour le stock disponible quand le produit change
  useEffect(() => {
    watchedItems.forEach((item, index) => {
      if (item.product_id > 0) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          setValue(`items.${index}.available_stock`, product.total_stock || 0);
          // Pour les ventes, définir un prix de vente par défaut
          if (watchedExitType === 'sale') {
            setValue(`items.${index}.unit_price`, 0);
          }
        }
      }
    });
  }, [watchedItems, products, setValue, watchedExitType]);

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (exit) {
      reset({
        exit_date: new Date().toISOString().split('T')[0], // Utiliser la date courante pour l'instant
        exit_type: 'sale', // Valeur par défaut
        customer_name: exit.customer_name || '',
        destination: '',
        reference_number: '',
        notes: exit.notes || '',
        items: [{ product_id: 0, quantity: 1, unit_price: 0, total_price: 0 }] // Réinitialiser les items
      });
    }
  }, [exit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      // Validation du stock disponible
      const invalidItems = data.items.filter(item => 
        item.product_id > 0 && 
        item.quantity > (item.available_stock || 0) &&
        ['sale', 'transfer'].includes(data.exit_type)
      );

      if (invalidItems.length > 0) {
        alert('Certains articles ont une quantité supérieure au stock disponible');
        return;
      }

      // Transformer les données pour correspondre au format API
      const formattedData = {
        customer_name: data.customer_name,
        warehouse: 1, // TODO: récupérer l'entrepôt depuis le contexte
        notes: data.notes,
        items: data.items.filter(item => item.product_id > 0).map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          sale_price: item.unit_price.toString()
        }))
      };

      if (exit) {
        await updateStockExit.mutateAsync({
          id: exit.id,
          data: formattedData
        });
      } else {
        await createStockExit.mutateAsync(formattedData);
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

  const calculateGrandTotal = () => {
    return watchedItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const exitTypeOptions = [
    { value: 'sale', label: 'Vente' },
    { value: 'transfer', label: 'Transfert' },
    { value: 'loss', label: 'Perte' },
    { value: 'adjustment', label: 'Ajustement' },
    { value: 'other', label: 'Autre' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {exit ? 'Modifier le Bon de Sortie' : 'Nouveau Bon de Sortie'}
              </h2>
              {exit && (
                <p className="text-sm text-gray-500">
                  {exit.exit_number}
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
                  Date de sortie *
                </label>
                <input
                  type="date"
                  {...register('exit_date', { required: 'Date requise' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.exit_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.exit_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de sortie *
                </label>
                <select
                  {...register('exit_type', { required: 'Type requis' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {exitTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.exit_type && (
                  <p className="text-red-500 text-xs mt-1">{errors.exit_type.message}</p>
                )}
              </div>

              {/* Champs conditionnels selon le type */}
              {watchedExitType === 'sale' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Client
                  </label>
                  <input
                    {...register('customer_name')}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              {watchedExitType === 'transfer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    {...register('destination')}
                    placeholder="Entrepôt de destination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Numéro de référence
                </label>
                <input
                  {...register('reference_number')}
                  placeholder="Commande, facture..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
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
                {fields.map((field, index) => {
                  const currentItem = watchedItems[index];
                  const product = products.find(p => p.id === currentItem?.product_id);
                  const availableStock = product?.total_stock || 0;
                  const isStockInsufficient = currentItem?.quantity > availableStock && ['sale', 'transfer'].includes(watchedExitType);

                  return (
                    <div key={field.id} className={`p-4 rounded-lg border-2 ${isStockInsufficient ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                      {isStockInsufficient && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          Stock insuffisant (disponible: {availableStock})
                        </div>
                      )}
                      
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
                                {product.name} - Stock: {product.total_stock || 0}
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
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`items.${index}.quantity`, {
                              required: 'Quantité requise',
                              min: { value: 0, message: 'Quantité invalide' },
                              valueAsNumber: true
                            })}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isStockInsufficient ? 'border-red-300 focus:ring-red-500' : ''}`}
                          />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.items[index]?.quantity?.message}
                            </p>
                          )}
                        </div>

                        {/* Prix unitaire */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prix unitaire
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`items.${index}.unit_price`, {
                              min: { value: 0, message: 'Prix invalide' },
                              valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {errors.items?.[index]?.unit_price && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.items[index]?.unit_price?.message}
                            </p>
                          )}
                        </div>

                        {/* Total */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            readOnly
                            {...register(`items.${index}.total_price`, {
                              valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
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
                  );
                })}
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
            form="stock-exit-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? 'Enregistrement...' : (exit ? 'Modifier' : 'Créer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockExitForm;
