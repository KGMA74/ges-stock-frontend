'use client';

import { useState, useEffect } from 'react';
import { Building2, Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccounts';
import { Account } from '@/services/accountService';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  account_type: 'bank' | 'cash';
  account_number: string;
  balance: string;
  description: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: '',
  account_type: 'bank',
  account_number: '',
  balance: '0.00',
  description: '',
  is_active: true,
};

export function AddAccountDialog({ 
  open, 
  onOpenChange, 
  account = null,
  onClose 
}: AddAccountDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();

  const isEditing = account !== null;
  const isLoading = createAccountMutation.isPending || updateAccountMutation.isPending;

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        account_type: account.account_type as 'bank' | 'cash',
        account_number: account.account_number || '',
        balance: account.balance,
        description: account.description || '',
        is_active: account.is_active,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [account, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du compte est obligatoire';
    }

    if (!formData.account_type) {
      newErrors.account_type = 'Le type de compte est obligatoire';
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      newErrors.balance = 'Le solde doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance).toFixed(2),
      };

      if (isEditing && account) {
        await updateAccountMutation.mutateAsync({
          id: account.id,
          data: accountData,
        });
      } else {
        await createAccountMutation.mutateAsync(accountData);
      }

      handleClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Building2 className="h-5 w-5" />
                  Modifier le Compte
                </>
              ) : (
                <>
                  <Building2 className="h-5 w-5" />
                  Nouveau Compte
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifiez les informations du compte' 
                : 'Créez un nouveau compte bancaire ou de caisse'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du Compte *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Compte Courant Principal"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account_type">Type de Compte *</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => handleInputChange('account_type', value)}
              >
                <SelectTrigger className={errors.account_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Compte Bancaire
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      Caisse
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.account_type && (
                <span className="text-sm text-red-500">{errors.account_type}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account_number">Numéro de Compte</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                placeholder="Ex: 1234567890"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="balance">Solde Initial (F) *</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', e.target.value)}
                placeholder="0.00"
                className={errors.balance ? 'border-red-500' : ''}
              />
              {errors.balance && (
                <span className="text-sm text-red-500">{errors.balance}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description optionnelle du compte..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Compte Actif
                </Label>
                <p className="text-xs text-gray-500">
                  Les comptes inactifs ne peuvent pas être utilisés
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
