// services/notificationService.js
import { getDemandesEnAttente } from './reaffectationValidationService';
import { getCurrentUser } from './authService';

// Écouter les événements de mise à jour des demandes
export const initNotificationListener = (onUpdate) => {
  const checkDemandes = async () => {
    const user = getCurrentUser();
    if (user && user.id) {
      const demandes = await getDemandesEnAttente(user.id);
      const count = Array.isArray(demandes) ? demandes.length : 0;
      if (onUpdate) onUpdate(count);
    }
  };
  
  // Vérifier immédiatement
  checkDemandes();
  
  // Vérifier toutes les 30 secondes
  const interval = setInterval(checkDemandes, 30000);
  
  // Retourner une fonction pour nettoyer
  return () => clearInterval(interval);
};