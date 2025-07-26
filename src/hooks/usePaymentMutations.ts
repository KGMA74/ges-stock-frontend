import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/services/api";
import { queryClient } from "@/components/provider";
import { handleApiError } from "@/lib/utils/errorHandling";

/**
 * Hook pour l'initiation de paiements
 */
export const usePaymentInitiation = (id: number) => {
  return useMutation({
    mutationFn: () => api.post(`payments-lists/${id}/initiate/`),
    onSuccess: () => {
      toast.success("Paiement initié avec succès");
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "transactions" || query.queryKey[0] === "payments_lists"
      });
    },
    onError: (error) => handleApiError(error, "Erreur lors de l'initiation du paiement")
  });
};

/**
 * Hook pour la validation de paiements
 */
export const usePaymentValidation = (id: number) => {
  return useMutation({
    mutationFn: ({ decision, comment }: { decision: 'APPROVED' | 'REJECTED', comment?: string }) => 
      api.post(`payments-lists/${id}/validate/`, { decision, comment }),
    onSuccess: (_, variables) => {
      const message = variables.decision === 'APPROVED' 
        ? "Paiement approuvé avec succès" 
        : "Paiement rejeté";
      toast.success(message);
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "transactions" || query.queryKey[0] === "payments_lists"
      });
    },
    onError: (error) => handleApiError(error, "Erreur lors de la validation du paiement")
  });
};

/**
 * Hook pour l'exportation de paiements
 */
export const usePaymentExport = (id: number) => {
  return useMutation({
    mutationFn: () => api.post(`payments-lists/${id}/export/`, null, {
      responseType: "blob"
    }),
    onSuccess: (blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment_list_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Rapport exporté avec succès");
    },
    onError: (error) => handleApiError(error, "Erreur lors de l'exportation du rapport")
  });
};

/**
 * Hook pour la suppression de paiements
 */
export const usePaymentDeletion = () => {
  return useMutation({
    mutationFn: (id: number) => api.delete(`payments-lists/${id}/`),
    onSuccess: () => {
      toast.success("Paiement supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["payments_lists"] });
    },
    onError: (error) => handleApiError(error, "Erreur lors de la suppression du paiement")
  });
};

/**
 * Hook pour les actions en lot sur les paiements
 */
export const useBulkPaymentActions = () => {
  return useMutation({
    mutationFn: async ({ action, ids }: { action: 'DELETE' | 'INITIATE' | 'VALIDATE', ids: number[] }) => {
      const promises = ids.map(id => {
        switch (action) {
          case 'DELETE':
            return api.delete(`payments-lists/${id}/`);
          case 'INITIATE':
            return api.post(`payments-lists/${id}/initiate/`);
          case 'VALIDATE':
            return api.post(`payments-lists/${id}/validate/`, { decision: 'APPROVED' });
          default:
            throw new Error(`Action non supportée: ${action}`);
        }
      });
      
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      const actionLabels = {
        DELETE: "supprimés",
        INITIATE: "initiés", 
        VALIDATE: "validés"
      };
      
      toast.success(`${variables.ids.length} paiement(s) ${actionLabels[variables.action]} avec succès`);
      queryClient.invalidateQueries({ queryKey: ["payments_lists"] });
    },
    onError: (error) => handleApiError(error, "Erreur lors de l'action en lot")
  });
};
