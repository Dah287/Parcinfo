import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.80:8080/api/materiels';

// 🔹 CRUD & listes
export const getAllMateriels = () => axios.get(API_BASE_URL);
export const getMaterielsDisponibles = () => axios.get(`${API_BASE_URL}/disponibles`);
export const getMaterielsAttribues = () => axios.get(`${API_BASE_URL}/attribues`);
export const searchMateriels = (keyword) =>
  axios.get(`${API_BASE_URL}/search`, { params: { keyword } });

export const createMaterial = (materialData) =>
  axios.post(API_BASE_URL, materialData);

export const updateMaterial = (id, materialData) =>
  axios.put(`${API_BASE_URL}/${id}`, materialData);

export const deleteMaterial = (id) =>
  axios.delete(`${API_BASE_URL}/${id}`);

// 🔹 Relations
export const getMaterielsByBeneficiaire = (beneficiaireId) =>
  axios.get(`${API_BASE_URL}/beneficiaire/${beneficiaireId}`);

export const getMaterielsByAchat = (achatId) =>
  axios.get(`${API_BASE_URL}/achat/${achatId}`);

// ===============================
// 🔹 GESTION D’ATTRIBUTION
// ===============================

// Attribution d’un matériel
export const attribuerMateriel = (dto) =>
  axios.post(`${API_BASE_URL}/attribuer`, dto);

// Réaffectation d’un matériel
export const reaffecterMateriel = (dto) =>
  axios.post(`${API_BASE_URL}/reaffecter`, dto);

// Libération d’un matériel
export const libererMateriel = (id) =>
  axios.post(`${API_BASE_URL}/${id}/liberer`);


// ✅ Version corrigée si l'endpoint utilise prixId
// ✅ NOUVELLE VERSION - Utilise le nouvel endpoint avec prixId
export const getMaterielsDisponiblesParPrix = (prixId) => {
  if (!prixId) {
    console.error('prixId est undefined!');
    return Promise.reject(new Error('prixId requis'));
  }
  
  return axios.get(`${API_BASE_URL}/prix/${prixId}/disponibles`)
    .then(response => {
      console.log('Matériaux pour prix', prixId, ':', response.data);
      return response;
    });
};

// ✅ NOUVELLES FONCTIONS POUR PRISE EN CHARGE

// Récupérer les matériels attribués par achat et bénéficiaire
export const getMaterielsAttribuesParAchatEtBeneficiaire = (achatId, beneficiaireId) => {
  return axios.get(`${API_BASE_URL}/achat/${achatId}/beneficiaire/${beneficiaireId}/attribues`);
};

// Récupérer tous les bénéficiaires avec leurs matériels pour un achat
export const getPriseEnChargeByAchat = (achatId) => {
  return axios.get(`${API_BASE_URL}/achat/${achatId}/prise-en-charge`);
};

// ===============================
// 🔹 NOUVEAUX ENDPOINTS POUR PRÉPARATION
// ===============================

/**
 * ✅ Préparer les matériels (assigner N° série et inventaire)
 * @param {number} prixId - ID du prix
 * @param {Array} preparationData - Liste des objets {numeroSerie, numeroInventaire, observations}
 * @returns {Promise}
 */
export const preparerMateriels = (prixId, preparationData) => {
  if (!prixId) {
    return Promise.reject(new Error('prixId requis'));
  }
  
  console.log(`Préparation de ${preparationData.length} matériels pour le prix ${prixId}`);
  
  return axios.post(`${API_BASE_URL}/preparation/${prixId}`, preparationData)
    .then(response => {
      console.log('Matériels préparés avec succès:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Erreur lors de la préparation:', error);
      throw error;
    });
};

/**
 * ✅ Récupérer les matériels par ID de prix
 * @param {number} prixId - ID du prix
 * @returns {Promise}
 */
export const getMaterielsByPrix = (prixId) => {
  if (!prixId) {
    return Promise.reject(new Error('prixId requis'));
  }
  
  return axios.get(`${API_BASE_URL}/prix/${prixId}`)
    .then(response => {
      console.log('Matériels pour prix', prixId, ':', response.data);
      return response;
    });
};