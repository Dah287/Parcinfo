// services/materialService.js
import api from './api';

const API_BASE_URL = '/materiels';

export const getAllMateriels = () => api.get(API_BASE_URL);
export const getMaterielsDisponibles = () => api.get(`${API_BASE_URL}/disponibles`);
export const getMaterielsAttribues = () => api.get(`${API_BASE_URL}/attribues`);
export const searchMateriels = (keyword) =>
  api.get(`${API_BASE_URL}/search`, { params: { keyword } });

export const createMaterial = (materialData) =>
  api.post(API_BASE_URL, materialData);

export const updateMaterial = (id, materialData) =>
  api.put(`${API_BASE_URL}/${id}`, materialData);

export const deleteMaterial = (id) =>
  api.delete(`${API_BASE_URL}/${id}`);

export const getMaterielsByBeneficiaire = (beneficiaireId) =>
  api.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}`);

export const getMaterielsByAchat = (achatId) =>
  api.get(`${API_BASE_URL}/achat/${achatId}`);

export const attribuerMateriel = (dto) =>
  api.post(`${API_BASE_URL}/attribuer`, dto);

export const reaffecterMateriel = (dto) =>
  api.post(`${API_BASE_URL}/reaffecter`, dto);

export const libererMateriel = (id) =>
  api.post(`${API_BASE_URL}/${id}/liberer`);

export const getMaterielsDisponiblesParPrix = (prixId) => {
  if (!prixId) {
    console.error('prixId est undefined!');
    return Promise.reject(new Error('prixId requis'));
  }
  return api.get(`${API_BASE_URL}/prix/${prixId}/disponibles`);
};

export const getMaterielsAttribuesParAchatEtBeneficiaire = (achatId, beneficiaireId) => {
  return api.get(`${API_BASE_URL}/achat/${achatId}/beneficiaire/${beneficiaireId}/attribues`);
};

export const getPriseEnChargeByAchat = (achatId) => {
  return api.get(`${API_BASE_URL}/achat/${achatId}/prise-en-charge`);
};

export const getMaterielsSansInventaireByPrix = (prixId) => {
  if (!prixId) return Promise.reject(new Error('prixId requis'));
  return api.get(`${API_BASE_URL}/prix/${prixId}/sans-inventaire`);
};

export const getMaterielsByPrix = (prixId) => {
  if (!prixId) return Promise.reject(new Error('prixId requis'));
  return api.get(`${API_BASE_URL}/prix/${prixId}`);
};

export const preparerMateriels = (prixId, data) => {
  if (!prixId) return Promise.reject(new Error('prixId requis'));
  return api.post(`${API_BASE_URL}/preparation/${prixId}`, data);
};

export const updateNumerosInventaire = (prixId, updates) => {
  return api.put(`${API_BASE_URL}/prix/${prixId}/inventaire`, updates);
};

export const exportTemplateInventaireByAchat = (achatId) => {
  return api.get(`${API_BASE_URL}/achat/${achatId}/template-inventaire`, {
    responseType: 'blob'
  });
};

export const affecterConfigurationComplete = (dto) =>
  api.post(`${API_BASE_URL}/affectation-complete`, dto);

/**
 * Récupère les matériels d'un achat + bénéficiaire, avec N° Série uniquement
 */
export const getMaterielsByAchatAndBeneficiaireWithSerial = (achatId, beneficiaireId) => {
  if (!achatId || !beneficiaireId) {
    return Promise.reject(new Error('achatId et beneficiaireId sont requis'));
  }
  
  return api.get(`${API_BASE_URL}/achat/${achatId}/beneficiaire/${beneficiaireId}/avec-serie`)
    .then(response => {
      console.log(`Matériels pour achat ${achatId} et bénéficiaire ${beneficiaireId}:`, response.data);
      return response;
    })
    .catch(error => {
      console.error('Erreur getMaterielsByAchatAndBeneficiaireWithSerial:', error);
      throw error;
    });
};

/**
 * Met à jour les numéros d'inventaire pour un lot de matériels
 * @param {number} achatId 
 * @param {number} beneficiaireId 
 * @param {Array} updates - [{ numeroSerie, numeroInventaire }, ...]
 */
export const updateNumerosInventaireBatch = (achatId, beneficiaireId, updates) => {
  if (!achatId || !beneficiaireId) {
    return Promise.reject(new Error('achatId et beneficiaireId sont requis'));
  }
  
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return Promise.reject(new Error('updates doit être un tableau non vide'));
  }
  
  return api.put(`${API_BASE_URL}/achat/${achatId}/beneficiaire/${beneficiaireId}/inventaire`, updates)
    .then(response => {
      console.log(`${updates.length} numéros d'inventaire mis à jour avec succès`);
      return response;
    })
    .catch(error => {
      console.error('Erreur updateNumerosInventaireBatch:', error);
      throw error;
    });
};