import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/historique';

// 🔹 Listes & détails

// Obtenir l'historique d'un matériel
export const getHistoriqueByMateriel = (materielId) =>
  axios.get(`${API_BASE_URL}/materiel/${materielId}`);

// Obtenir l'historique d'un bénéficiaire
export const getHistoriqueByBeneficiaire = (beneficiaireId) =>
  axios.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}`);

// Obtenir l'historique des libérations d'un bénéficiaire
export const getHistoriqueLibereByBeneficiaire = (beneficiaireId) =>
  axios.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}/liberations`);

// Obtenir tous les historiques
export const getAllHistorique = () =>
  axios.get(API_BASE_URL);

// 🔹 Statistiques

// Nombre d'opérations pour un matériel
export const getCountOperationsByMateriel = (materielId) =>
  axios.get(`${API_BASE_URL}/materiel/${materielId}/count`);

// Nombre d'attributions pour un bénéficiaire
export const getCountAttributionsByBeneficiaire = (beneficiaireId) =>
  axios.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}/count`);
