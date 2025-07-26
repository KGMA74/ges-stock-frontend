import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Product, ProductForm } from '@/lib/types';
import { X, Save } from 'lucide-react';
import Input from '@/components/Input';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductFormComponent: React.FC<ProductFormProps> = ({ 
  product, 
  onClose, 
  onSuccess 
}) => {
  const isEditing = !!product;
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<ProductForm>({
    defaultValues: product ? {
      reference: product.reference,
      name: product.name,
      description: product.description || '',
      unit: product.unit,
      min_stock_alert: product.min_stock_alert,
    } : {
      reference: '',
      name: '',
      description: '',
      unit: 'pièce',
      min_stock_alert: 5,
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: ProductForm) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: product.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Référence */}
          <Input
            id="reference"
            type="text"
            label="Référence *"
            placeholder="REF001"
            register={register("reference", {
              required: "La référence est obligatoire",
              minLength: {
                value: 2,
                message: "La référence doit contenir au moins 2 caractères"
              }
            })}
            error={errors.reference}
            disabled={isLoading}
          />

          {/* Nom */}
          <Input
            id="name"
            type="text"
            label="Nom du produit *"
            placeholder="Nom du produit"
            register={register("name", {
              required: "Le nom est obligatoire",
              minLength: {
                value: 2,
                message: "Le nom doit contenir au moins 2 caractères"
              }
            })}
            error={errors.name}
            disabled={isLoading}
          />

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Description du produit (optionnel)"
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Unité */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unité *
            </label>
            <select
              id="unit"
              {...register("unit", { required: "L'unité est obligatoire" })}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="pièce">Pièce</option>
              <option value="kg">Kilogramme</option>
              <option value="g">Gramme</option>
              <option value="L">Litre</option>
              <option value="mL">Millilitre</option>
              <option value="m">Mètre</option>
              <option value="cm">Centimètre</option>
              <option value="m²">Mètre carré</option>
              <option value="paquet">Paquet</option>
              <option value="boîte">Boîte</option>
              <option value="carton">Carton</option>
              <option value="sac">Sac</option>
              <option value="bouteille">Bouteille</option>
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          {/* Stock minimum d'alerte */}
          <Input
            id="min_stock_alert"
            type="number"
            label="Stock minimum d'alerte *"
            placeholder="5"
            register={register("min_stock_alert", {
              required: "Le stock minimum est obligatoire",
              min: {
                value: 0,
                message: "Le stock minimum ne peut pas être négatif"
              },
              valueAsNumber: true
            })}
            error={errors.min_stock_alert}
            disabled={isLoading}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormComponent;
