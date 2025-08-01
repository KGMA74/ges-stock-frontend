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
import { useCreateCustomer } from '@/hooks/useCustomers';
import type { CustomerForm } from '@/services/customerService';

// Schéma de validation avec Zod
const customerSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  onSuccess?: () => void;
}

const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const createCustomerMutation = useCreateCustomer();

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      // Nettoyer les données - supprimer les champs vides
      const cleanData: CustomerForm = {
        name: data.name,
        ...(data.phone && data.phone.trim() && { phone: data.phone.trim() }),
        ...(data.email && data.email.trim() && { email: data.email.trim() }),
        ...(data.address && data.address.trim() && { address: data.address.trim() }),
      };

      await createCustomerMutation.mutateAsync(cleanData);
      toast.success('Client créé avec succès !');
      
      // Petit délai pour permettre à l'animation de se terminer proprement
      setTimeout(() => {
        reset();
        setOpen(false);
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      toast.error('Erreur lors de la création du client');
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
          Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau client.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Nom */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du client *</Label>
              <Input
                id="name"
                placeholder="Ex: Entreprise ABC"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Téléphone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="Ex: +1 234 567 8900"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: contact@entreprise.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Adresse */}
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                placeholder="Adresse complète du client"
                {...register('address')}
                disabled={isSubmitting}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
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
              {isSubmitting ? 'Création...' : 'Créer le client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomerDialog;
