import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService, Account, AccountTransaction, CreateAccountData, UpdateAccountData } from '../services/accountService';
import { toast } from 'sonner';

// Hook pour récupérer la liste des comptes
export function useAccounts(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountService.getAccounts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// Hook pour récupérer un compte spécifique
export function useAccount(id: number) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountService.getAccount(id),
    enabled: !!id,
  });
}

// Hook pour créer un compte
export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountData) => accountService.createAccount(data),
    onMutate: async (newAccount) => {
      // Snapshot de l'ancienne valeur
      await queryClient.cancelQueries({ queryKey: ['accounts'] });
      const previousAccounts = queryClient.getQueryData(['accounts']);

      // Mise à jour optimiste
      queryClient.setQueryData(['accounts'], (old: any) => {
        if (!old) return old;
        
        const optimisticAccount = {
          id: Date.now(), // ID temporaire
          name: newAccount.name,
          account_type: newAccount.account_type,
          balance: newAccount.balance || '0.00',
          is_active: newAccount.is_active ?? true,
          created_at: new Date().toISOString(),
        };

        return {
          ...old,
          results: [optimisticAccount, ...old.results],
          count: old.count + 1,
        };
      });

      return { previousAccounts };
    },
    onError: (err, variables, context) => {
      // Restaurer l'ancienne valeur en cas d'erreur
      if (context?.previousAccounts) {
        queryClient.setQueryData(['accounts'], context.previousAccounts);
      }
      toast.error('Erreur lors de la création du compte');
      console.error('Erreur création compte:', err);
    },
    onSuccess: (newAccount) => {
      toast.success(`Compte "${newAccount.name}" créé avec succès`);
    },
    onSettled: () => {
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook pour mettre à jour un compte
export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountData }) =>
      accountService.updateAccount(id, data),
    onSuccess: (updatedAccount) => {
      // Mise à jour du cache
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.setQueryData(['accounts', updatedAccount.id], updatedAccount);
      toast.success(`Compte "${updatedAccount.name}" mis à jour avec succès`);
    },
    onError: (err) => {
      toast.error('Erreur lors de la modification du compte');
      console.error('Erreur modification compte:', err);
    },
  });
}

// Hook pour supprimer un compte
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => accountService.deleteAccount(id),
    onMutate: async (accountId) => {
      // Snapshot de l'ancienne valeur
      await queryClient.cancelQueries({ queryKey: ['accounts'] });
      const previousAccounts = queryClient.getQueryData(['accounts']);

      // Mise à jour optimiste
      queryClient.setQueryData(['accounts'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          results: old.results.filter((account: Account) => account.id !== accountId),
          count: old.count - 1,
        };
      });

      return { previousAccounts };
    },
    onError: (err, variables, context) => {
      // Restaurer l'ancienne valeur en cas d'erreur
      if (context?.previousAccounts) {
        queryClient.setQueryData(['accounts'], context.previousAccounts);
      }
      toast.error('Erreur lors de la suppression du compte');
      console.error('Erreur suppression compte:', err);
    },
    onSuccess: () => {
      toast.success('Compte supprimé avec succès');
    },
    onSettled: () => {
      // Refetch pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// Hook pour rechercher des comptes
export function useSearchAccounts(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['accounts', 'search', query],
    queryFn: () => accountService.searchAccounts(query),
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000, // 30 secondes
  });
}

// Hook pour récupérer les transactions d'un compte
export function useAccountTransactions(
  accountId: number, 
  params?: {
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: ['accounts', accountId, 'transactions', params],
    queryFn: () => accountService.getAccountTransactions(accountId, params),
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
