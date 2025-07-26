import { toast } from "sonner";

/**
 * Types pour la gestion des erreurs
 */
export interface AppError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Logger centralisé pour remplacer console.log/error
 */
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data ? data : '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data ? data : '');
    }
  },
  
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const errorData = {
      message,
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, errorData);
    }
    
    // En production, envoyer à un service de monitoring (Sentry, etc.)
    // sendToMonitoringService(errorData);
  }
};

/**
 * Gestionnaire d'erreurs API amélioré
 */
export const handleApiError = (error: any, customMessage?: string) => {
  logger.error('API Error occurred', error, { customMessage });
  
  // Messages d'erreur plus user-friendly
  const errorMessage = getErrorMessage(error, customMessage);
  
  toast.error(errorMessage);
  
  return {
    message: errorMessage,
    code: error?.response?.status,
    details: error?.response?.data,
    timestamp: new Date()
  };
};

/**
 * Extrait un message d'erreur user-friendly
 */
const getErrorMessage = (error: any, customMessage?: string): string => {
  if (customMessage) return customMessage;
  
  // Erreurs réseau
  if (!error?.response) {
    return "Erreur de connexion. Vérifiez votre connexion internet.";
  }
  
  const status = error.response?.status;
  const data = error.response?.data;
  
  // Messages basés sur le code de statut
  switch (status) {
    case 400:
      return data?.message || "Données invalides. Vérifiez votre saisie.";
    case 401:
      return "Session expirée. Veuillez vous reconnecter.";
    case 403:
      return "Vous n'avez pas les permissions nécessaires.";
    case 404:
      return "Ressource non trouvée.";
    case 422:
      return data?.message || "Erreur de validation des données.";
    case 500:
      return "Erreur serveur. Veuillez réessayer plus tard.";
    default:
      return data?.message || "Une erreur inattendue s'est produite.";
  }
};

/**
 * Wrapper pour les opérations asynchrones avec gestion d'erreurs
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = handleApiError(error, errorMessage);
    return { error: appError };
  }
};

/**
 * Hook pour la gestion d'erreurs dans les composants
 */
export const useErrorHandler = () => {
  const handleError = (error: any, customMessage?: string) => {
    return handleApiError(error, customMessage);
  };
  
  const showError = (message: string) => {
    toast.error(message);
    logger.error('Manual error display', { message });
  };
  
  const showSuccess = (message: string) => {
    toast.success(message);
    logger.info('Success message displayed', { message });
  };
  
  return { handleError, showError, showSuccess };
};
