import api from './api';
const API_BASE_URL = '/historique';

// 🔹 Listes & détails

// Obtenir l'historique d'un matériel
export const getHistoriqueByMateriel = (materielId) =>
  api.get(`${API_BASE_URL}/materiel/${materielId}`);

// Obtenir l'historique d'un bénéficiaire
export const getHistoriqueByBeneficiaire = (beneficiaireId) =>
  api.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}`);

// Obtenir l'historique des libérations d'un bénéficiaire
export const getHistoriqueLibereByBeneficiaire = (beneficiaireId) =>
  api.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}/liberations`);

// Obtenir tous les historiques
export const getAllHistorique = () =>
  api.get(API_BASE_URL);

// 🔹 Statistiques

// Nombre d'opérations pour un matériel
export const getCountOperationsByMateriel = (materielId) =>
  api.get(`${API_BASE_URL}/materiel/${materielId}/count`);

// Nombre d'attributions pour un bénéficiaire
export const getCountAttributionsByBeneficiaire = (beneficiaireId) =>
  api.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}/count`);
