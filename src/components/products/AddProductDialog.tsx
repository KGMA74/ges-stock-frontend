'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProduct } from '@/hooks/useProducts';
import type { ProductForm } from '@/lib/types';

// Schéma de validation avec Zod
const productSchema = z.object({
  reference: z.string().min(1, 'La référence est obligatoire'),
  name: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string().optional(),
  unit: z.string().min(1, 'L\'unité est obligatoire'),
  min_stock_alert: z.number().min(0, 'Le seuil d\'alerte doit être positif'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  onSuccess?: () => void;
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      reference: '',
      name: '',
      description: '',
      unit: 'pièce',
      min_stock_alert: 5,
    },
  });

  const createProductMutation = useCreateProduct();

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await createProductMutation.mutateAsync(data);
      toast.success('Produit créé avec succès !');
      
      // Petit délai pour permettre à l'animation de se terminer proprement
      setTimeout(() => {
        reset();
        setOpen(false);
      }, 100);
      
      // onSuccess?.(); // Supprimé car la mise à jour se fait automatiquement via le cache
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      toast.error('Erreur lors de la création du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!isSubmitting && !newOpen) {
      setOpen(false);
      reset();
    } else if (newOpen) {
      setOpen(true);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau produit.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Référence */}
            <div className="grid gap-2">
              <Label htmlFor="reference">Référence *</Label>
              <Input
                id="reference"
                placeholder="Ex: PROD001"
                {...register('reference')}
                disabled={isSubmitting}
              />
              {errors.reference && (
                <p className="text-sm text-red-600">{errors.reference.message}</p>
              )}
            </div>

            {/* Nom */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                placeholder="Ex: Riz Basmati 5kg"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du produit (optionnel)"
                {...register('description')}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Unité et Seuil d'alerte */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unité *</Label>
                <Input
                  id="unit"
                  placeholder="Ex: pièce, kg, litre"
                  {...register('unit')}
                  disabled={isSubmitting}
                />
                {errors.unit && (
                  <p className="text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min_stock_alert">Seuil d'alerte *</Label>
                <Input
                  id="min_stock_alert"
                  type="number"
                  min="0"
                  {...register('min_stock_alert', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.min_stock_alert && (
                  <p className="text-sm text-red-600">{errors.min_stock_alert.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le produit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
